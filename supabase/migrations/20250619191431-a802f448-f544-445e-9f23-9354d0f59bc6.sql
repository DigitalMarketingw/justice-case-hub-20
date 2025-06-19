
-- Create attorney bonuses table
CREATE TABLE public.attorney_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  attorney_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  bonus_amount NUMERIC NOT NULL CHECK (bonus_amount >= 0),
  bonus_type TEXT NOT NULL DEFAULT 'performance',
  criteria_met TEXT,
  description TEXT,
  awarded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  awarded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bonus criteria table for configurable rules
CREATE TABLE public.bonus_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria_type TEXT NOT NULL, -- 'case_completion', 'billing_target', 'client_satisfaction'
  target_value NUMERIC,
  bonus_amount NUMERIC NOT NULL CHECK (bonus_amount >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case referrals table
CREATE TABLE public.case_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  referring_attorney_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referred_to_attorney_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_source TEXT, -- 'internal', 'external', 'client', 'court'
  external_source_name TEXT, -- name of external firm/attorney
  referral_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  referral_reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed'
  referral_fee NUMERIC DEFAULT 0,
  client_consent_obtained BOOLEAN DEFAULT false,
  notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  processed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral sources tracking table
CREATE TABLE public.referral_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'law_firm', 'attorney', 'organization', 'client'
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_referrals INTEGER DEFAULT 0,
  firm_id UUID REFERENCES public.firms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message attachments table for chat images
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'document'
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add referral tracking to cases table
ALTER TABLE public.cases 
ADD COLUMN is_referral BOOLEAN DEFAULT false,
ADD COLUMN original_attorney_id UUID REFERENCES public.profiles(id),
ADD COLUMN referral_count INTEGER DEFAULT 0;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
);

-- Enable RLS on all new tables
ALTER TABLE public.attorney_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attorney_bonuses
CREATE POLICY "Users can view bonuses within their firm" ON public.attorney_bonuses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.id = auth.uid() 
      AND p2.id = attorney_id
      AND (p1.role IN ('super_admin', 'firm_admin') OR p1.firm_id = p2.firm_id)
    )
  );

CREATE POLICY "Firm admins can manage bonuses" ON public.attorney_bonuses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin')
    )
  );

-- RLS Policies for bonus_criteria
CREATE POLICY "Users can view bonus criteria within their firm" ON public.bonus_criteria
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role IN ('super_admin', 'firm_admin') OR firm_id = bonus_criteria.firm_id)
    )
  );

CREATE POLICY "Firm admins can manage bonus criteria" ON public.bonus_criteria
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin')
    )
  );

-- RLS Policies for case_referrals
CREATE POLICY "Users can view referrals within their firm" ON public.case_referrals
  FOR SELECT USING (
    auth.uid() = referring_attorney_id OR
    auth.uid() = referred_to_attorney_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin', 'case_manager')
    )
  );

CREATE POLICY "Attorneys and admins can manage referrals" ON public.case_referrals
  FOR ALL USING (
    auth.uid() = referring_attorney_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin', 'case_manager')
    )
  );

-- RLS Policies for referral_sources
CREATE POLICY "Users can view referral sources within their firm" ON public.referral_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND (role IN ('super_admin', 'firm_admin') OR firm_id = referral_sources.firm_id)
    )
  );

CREATE POLICY "Firm admins can manage referral sources" ON public.referral_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin')
    )
  );

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON m.conversation_id = c.id
      WHERE m.id = message_attachments.message_id
      AND (c.attorney_id = auth.uid() OR c.client_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin')
    )
  );

CREATE POLICY "Users can upload attachments to their messages" ON public.message_attachments
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Storage policies for chat attachments
CREATE POLICY "Users can upload chat attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view chat attachments in their conversations" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-attachments' AND (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'firm_admin')
      )
    )
  );

-- Create indexes for performance
CREATE INDEX idx_attorney_bonuses_attorney_id ON public.attorney_bonuses(attorney_id);
CREATE INDEX idx_attorney_bonuses_case_id ON public.attorney_bonuses(case_id);
CREATE INDEX idx_case_referrals_case_id ON public.case_referrals(case_id);
CREATE INDEX idx_case_referrals_referring_attorney ON public.case_referrals(referring_attorney_id);
CREATE INDEX idx_case_referrals_referred_to_attorney ON public.case_referrals(referred_to_attorney_id);
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);

-- Create function to prevent circular referrals
CREATE OR REPLACE FUNCTION public.prevent_circular_referral()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if case was originally handled by the attorney we're referring to
  IF NEW.referred_to_attorney_id = (
    SELECT original_attorney_id FROM public.cases WHERE id = NEW.case_id
  ) THEN
    RAISE EXCEPTION 'Cannot refer case back to original attorney';
  END IF;
  
  -- Check if case was previously referred by the attorney we're referring to
  IF EXISTS (
    SELECT 1 FROM public.case_referrals 
    WHERE case_id = NEW.case_id 
    AND referring_attorney_id = NEW.referred_to_attorney_id
  ) THEN
    RAISE EXCEPTION 'Cannot create circular referral - case was previously referred by this attorney';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent circular referrals
CREATE TRIGGER prevent_circular_referral_trigger
  BEFORE INSERT OR UPDATE ON public.case_referrals
  FOR EACH ROW EXECUTE FUNCTION public.prevent_circular_referral();

-- Function to update referral counts
CREATE OR REPLACE FUNCTION public.update_referral_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update case referral count
  UPDATE public.cases 
  SET referral_count = referral_count + 1,
      is_referral = true
  WHERE id = NEW.case_id;
  
  -- Update referral source total if external
  IF NEW.external_source_name IS NOT NULL THEN
    UPDATE public.referral_sources 
    SET total_referrals = total_referrals + 1
    WHERE source_name = NEW.external_source_name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update referral counts
CREATE TRIGGER update_referral_counts_trigger
  AFTER INSERT ON public.case_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_counts();
