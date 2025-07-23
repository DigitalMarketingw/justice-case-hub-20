-- Fix calendar events table and add participants support
-- First, ensure calendar_events table has proper structure
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS client_id uuid,
ADD COLUMN IF NOT EXISTS attorney_id uuid,
ADD COLUMN IF NOT EXISTS case_id uuid,
ADD COLUMN IF NOT EXISTS created_by uuid NOT NULL DEFAULT auth.uid();

-- Create calendar event participants table for multi-user events
CREATE TABLE IF NOT EXISTS public.calendar_event_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL,
  participant_type text NOT NULL CHECK (participant_type IN ('creator', 'attorney', 'client', 'attendee')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, participant_id)
);

-- Enable RLS on calendar_event_participants
ALTER TABLE public.calendar_event_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event participants
CREATE POLICY "Users can view event participants for their events" 
ON public.calendar_event_participants 
FOR SELECT 
USING (
  participant_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.calendar_events ce 
    WHERE ce.id = calendar_event_participants.event_id 
    AND (ce.user_id = auth.uid() OR ce.created_by = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'firm_admin', 'case_manager')
  )
);

CREATE POLICY "Event creators can manage participants" 
ON public.calendar_event_participants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.calendar_events ce 
    WHERE ce.id = calendar_event_participants.event_id 
    AND ce.created_by = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'firm_admin', 'case_manager')
  )
);

CREATE POLICY "Participants can update their own status" 
ON public.calendar_event_participants 
FOR UPDATE 
USING (participant_id = auth.uid())
WITH CHECK (participant_id = auth.uid());

-- Update calendar_events RLS policies to include shared events
DROP POLICY IF EXISTS "Users can manage their own calendar events" ON public.calendar_events;

CREATE POLICY "Users can view events they created or are invited to" 
ON public.calendar_events 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() = created_by OR
  id IN (
    SELECT event_id FROM public.calendar_event_participants 
    WHERE participant_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'firm_admin', 'case_manager')
  )
);

CREATE POLICY "Authorized users can create events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  auth.uid() = created_by
);

CREATE POLICY "Event creators and admins can update events" 
ON public.calendar_events 
FOR UPDATE 
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'firm_admin', 'case_manager')
  )
);

CREATE POLICY "Event creators and admins can delete events" 
ON public.calendar_events 
FOR DELETE 
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'firm_admin', 'case_manager')
  )
);

-- Create function to automatically add event participants
CREATE OR REPLACE FUNCTION public.create_event_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Add creator as participant
  INSERT INTO public.calendar_event_participants (event_id, participant_id, participant_type, status)
  VALUES (NEW.id, NEW.created_by, 'creator', 'accepted');
  
  -- Add attorney if specified and different from creator
  IF NEW.attorney_id IS NOT NULL AND NEW.attorney_id != NEW.created_by THEN
    INSERT INTO public.calendar_event_participants (event_id, participant_id, participant_type, status)
    VALUES (NEW.id, NEW.attorney_id, 'attorney', 'pending');
  END IF;
  
  -- Add client if specified and different from creator
  IF NEW.client_id IS NOT NULL AND NEW.client_id != NEW.created_by THEN
    INSERT INTO public.calendar_event_participants (event_id, participant_id, participant_type, status)
    VALUES (NEW.id, NEW.client_id, 'client', 'pending');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically add participants when event is created
CREATE TRIGGER create_event_participants_trigger
AFTER INSERT ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.create_event_participants();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_event_participants_event_id ON public.calendar_event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_event_participants_participant_id ON public.calendar_event_participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_attorney_id ON public.calendar_events(attorney_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id ON public.calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON public.calendar_events(created_by);