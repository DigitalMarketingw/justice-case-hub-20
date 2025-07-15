-- Fix database functions security by adding SET search_path
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT 
        profile_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles p1, public.profiles p2
            WHERE p1.id = auth.uid() 
            AND p2.id = profile_id
            AND (
                p1.role = 'super_admin' OR
                (p1.role IN ('firm_admin', 'case_manager') AND p1.firm_id = p2.firm_id) OR
                (p1.role = 'attorney' AND (
                    (p2.role = 'client' AND p2.assigned_attorney_id = p1.id) OR
                    (p2.role = 'attorney' AND p2.firm_id = p1.firm_id)
                ))
            )
        );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_firm_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('super_admin', 'firm_admin', 'case_manager')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_firm_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role IN ('super_admin', 'firm_admin') FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_firm_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT firm_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'super_admin'
  );
$$;

-- Add indexes for better performance on role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_firm_id ON public.profiles(firm_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_firm_id ON public.profiles(role, firm_id);