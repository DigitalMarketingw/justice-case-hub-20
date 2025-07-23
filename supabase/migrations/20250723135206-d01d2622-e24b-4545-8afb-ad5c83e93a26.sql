-- Fix infinite recursion in calendar_events RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view events they created or are invited to" ON public.calendar_events;
DROP POLICY IF EXISTS "Authorized users can create events" ON public.calendar_events;
DROP POLICY IF EXISTS "Event creators and admins can update events" ON public.calendar_events;
DROP POLICY IF EXISTS "Event creators and admins can delete events" ON public.calendar_events;

-- Create simplified, non-recursive policies for calendar_events
CREATE POLICY "Users can view their own events" 
ON public.calendar_events 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'firm_admin', 'case_manager')
  )
);

CREATE POLICY "Users can create their own events" 
ON public.calendar_events 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  auth.uid() = created_by
);

CREATE POLICY "Event creators can update their events" 
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

CREATE POLICY "Event creators can delete their events" 
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

-- Update calendar_event_participants policies to be standalone
DROP POLICY IF EXISTS "Users can view event participants for their events" ON public.calendar_event_participants;
DROP POLICY IF EXISTS "Event creators can manage participants" ON public.calendar_event_participants;

CREATE POLICY "Users can view participants for accessible events" 
ON public.calendar_event_participants 
FOR SELECT 
USING (
  participant_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'firm_admin', 'case_manager')
  ) OR
  event_id IN (
    SELECT id FROM public.calendar_events 
    WHERE created_by = auth.uid() OR user_id = auth.uid()
  )
);

CREATE POLICY "Event creators can manage participants" 
ON public.calendar_event_participants 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('super_admin', 'firm_admin', 'case_manager')
  ) OR
  event_id IN (
    SELECT id FROM public.calendar_events 
    WHERE created_by = auth.uid()
  )
);