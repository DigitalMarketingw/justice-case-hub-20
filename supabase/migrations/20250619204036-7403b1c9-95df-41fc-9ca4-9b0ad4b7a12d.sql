
-- Add new statuses to support the workflow
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'pending_case_manager';
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'case_manager_approved';
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'firm_admin_approved';
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'compliance_review';
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'rejected';

-- Create referral approvals table for workflow tracking
CREATE TABLE public.referral_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.case_referrals(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.profiles(id),
  approval_type TEXT NOT NULL, -- 'case_manager', 'firm_admin', 'compliance'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral comments table for communication
CREATE TABLE public.referral_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.case_referrals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral notifications table
CREATE TABLE public.referral_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id UUID NOT NULL REFERENCES public.case_referrals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  notification_type TEXT NOT NULL, -- 'approval_needed', 'status_change', 'deadline_approaching'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add workflow fields to case_referrals table
ALTER TABLE public.case_referrals 
ADD COLUMN workflow_stage TEXT DEFAULT 'attorney_initiated',
ADD COLUMN requires_case_manager_approval BOOLEAN DEFAULT true,
ADD COLUMN requires_firm_admin_approval BOOLEAN DEFAULT false,
ADD COLUMN requires_compliance_review BOOLEAN DEFAULT false,
ADD COLUMN deadline_date DATE,
ADD COLUMN priority_level TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
ADD COLUMN compliance_notes TEXT,
ADD COLUMN risk_assessment_score INTEGER,
ADD COLUMN auto_approved BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.referral_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_approvals
CREATE POLICY "Users can view approvals for their referrals" ON public.referral_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.case_referrals cr
      WHERE cr.id = referral_id
      AND (cr.referring_attorney_id = auth.uid() OR cr.referred_to_attorney_id = auth.uid())
    ) OR
    approver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin', 'case_manager')
    )
  );

CREATE POLICY "Authorized users can manage approvals" ON public.referral_approvals
  FOR ALL USING (
    approver_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin')
    )
  );

-- RLS Policies for referral_comments
CREATE POLICY "Users can view comments for their referrals" ON public.referral_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.case_referrals cr
      WHERE cr.id = referral_id
      AND (cr.referring_attorney_id = auth.uid() OR cr.referred_to_attorney_id = auth.uid())
    ) OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'firm_admin', 'case_manager')
    )
  );

CREATE POLICY "Users can add comments to referrals they're involved in" ON public.referral_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM public.case_referrals cr
        WHERE cr.id = referral_id
        AND (cr.referring_attorney_id = auth.uid() OR cr.referred_to_attorney_id = auth.uid())
      ) OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() 
        AND role IN ('super_admin', 'firm_admin', 'case_manager')
      )
    )
  );

-- RLS Policies for referral_notifications
CREATE POLICY "Users can view their own notifications" ON public.referral_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.referral_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their notification read status" ON public.referral_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_referral_approvals_referral_id ON public.referral_approvals(referral_id);
CREATE INDEX idx_referral_approvals_approver_id ON public.referral_approvals(approver_id);
CREATE INDEX idx_referral_comments_referral_id ON public.referral_comments(referral_id);
CREATE INDEX idx_referral_notifications_user_id ON public.referral_notifications(user_id);
CREATE INDEX idx_referral_notifications_is_read ON public.referral_notifications(is_read);

-- Create function to determine required approvals based on referral criteria
CREATE OR REPLACE FUNCTION public.determine_approval_requirements(
  p_referral_fee NUMERIC,
  p_case_value NUMERIC DEFAULT 0,
  p_referral_source TEXT DEFAULT 'internal'
)
RETURNS TABLE(
  requires_case_manager BOOLEAN,
  requires_firm_admin BOOLEAN,
  requires_compliance BOOLEAN,
  risk_score INTEGER
) AS $$
BEGIN
  -- Default requirements
  requires_case_manager := true;
  requires_firm_admin := false;
  requires_compliance := false;
  risk_score := 1;
  
  -- Firm admin approval required for high-value referrals
  IF p_referral_fee > 5000 OR p_case_value > 50000 THEN
    requires_firm_admin := true;
    risk_score := risk_score + 2;
  END IF;
  
  -- Compliance review for external referrals or high fees
  IF p_referral_source = 'external' OR p_referral_fee > 10000 THEN
    requires_compliance := true;
    risk_score := risk_score + 1;
  END IF;
  
  -- Additional risk factors
  IF p_referral_source = 'client' THEN
    risk_score := risk_score + 1;
  END IF;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-create approval records
CREATE OR REPLACE FUNCTION public.create_referral_approvals()
RETURNS TRIGGER AS $$
DECLARE
  approval_reqs RECORD;
BEGIN
  -- Determine approval requirements
  SELECT * INTO approval_reqs 
  FROM public.determine_approval_requirements(
    NEW.referral_fee, 
    0, -- We don't have case value in referrals table
    NEW.referral_source
  );
  
  -- Update referral with requirements
  UPDATE public.case_referrals
  SET 
    requires_case_manager_approval = approval_reqs.requires_case_manager,
    requires_firm_admin_approval = approval_reqs.requires_firm_admin,
    requires_compliance_review = approval_reqs.requires_compliance,
    risk_assessment_score = approval_reqs.risk_score,
    deadline_date = CURRENT_DATE + INTERVAL '7 days' -- Default 7-day deadline
  WHERE id = NEW.id;
  
  -- Create case manager approval if required
  IF approval_reqs.requires_case_manager THEN
    INSERT INTO public.referral_approvals (referral_id, approver_id, approval_type)
    SELECT NEW.id, p.id, 'case_manager'
    FROM public.profiles p
    WHERE p.role = 'case_manager' 
    AND (p.firm_id IS NULL OR p.firm_id = (
      SELECT firm_id FROM public.profiles WHERE id = NEW.referring_attorney_id
    ))
    LIMIT 1;
  END IF;
  
  -- Create firm admin approval if required
  IF approval_reqs.requires_firm_admin THEN
    INSERT INTO public.referral_approvals (referral_id, approver_id, approval_type)
    SELECT NEW.id, p.id, 'firm_admin'
    FROM public.profiles p
    WHERE p.role = 'firm_admin' 
    AND (p.firm_id IS NULL OR p.firm_id = (
      SELECT firm_id FROM public.profiles WHERE id = NEW.referring_attorney_id
    ))
    LIMIT 1;
  END IF;
  
  -- Create compliance approval if required
  IF approval_reqs.requires_compliance THEN
    INSERT INTO public.referral_approvals (referral_id, approver_id, approval_type)
    SELECT NEW.id, p.id, 'compliance'
    FROM public.profiles p
    WHERE p.role IN ('super_admin', 'firm_admin')
    AND (p.firm_id IS NULL OR p.firm_id = (
      SELECT firm_id FROM public.profiles WHERE id = NEW.referring_attorney_id
    ))
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create approvals
CREATE TRIGGER create_referral_approvals_trigger
  AFTER INSERT ON public.case_referrals
  FOR EACH ROW EXECUTE FUNCTION public.create_referral_approvals();

-- Create function to update workflow stage
CREATE OR REPLACE FUNCTION public.update_referral_workflow_stage()
RETURNS TRIGGER AS $$
DECLARE
  pending_approvals INTEGER;
  total_required INTEGER;
BEGIN
  -- Count pending approvals
  SELECT COUNT(*) INTO pending_approvals
  FROM public.referral_approvals
  WHERE referral_id = NEW.referral_id AND status = 'pending';
  
  -- Count total required approvals
  SELECT COUNT(*) INTO total_required
  FROM public.referral_approvals
  WHERE referral_id = NEW.referral_id;
  
  -- Update workflow stage based on approvals
  IF pending_approvals = 0 AND total_required > 0 THEN
    -- All approvals completed
    UPDATE public.case_referrals
    SET 
      workflow_stage = 'fully_approved',
      status = 'accepted'
    WHERE id = NEW.referral_id;
  ELSIF NEW.status = 'rejected' THEN
    -- Any rejection stops the workflow
    UPDATE public.case_referrals
    SET 
      workflow_stage = 'rejected',
      status = 'declined'
    WHERE id = NEW.referral_id;
  ELSE
    -- Update to current approval stage
    UPDATE public.case_referrals
    SET workflow_stage = CASE
      WHEN EXISTS (
        SELECT 1 FROM public.referral_approvals 
        WHERE referral_id = NEW.referral_id 
        AND approval_type = 'case_manager' 
        AND status = 'pending'
      ) THEN 'pending_case_manager'
      WHEN EXISTS (
        SELECT 1 FROM public.referral_approvals 
        WHERE referral_id = NEW.referral_id 
        AND approval_type = 'firm_admin' 
        AND status = 'pending'
      ) THEN 'pending_firm_admin'
      WHEN EXISTS (
        SELECT 1 FROM public.referral_approvals 
        WHERE referral_id = NEW.referral_id 
        AND approval_type = 'compliance' 
        AND status = 'pending'
      ) THEN 'pending_compliance'
      ELSE 'in_progress'
    END
    WHERE id = NEW.referral_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update workflow stage
CREATE TRIGGER update_referral_workflow_stage_trigger
  AFTER UPDATE ON public.referral_approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_referral_workflow_stage();
