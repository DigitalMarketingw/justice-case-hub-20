
-- Update the can_access_profile function to include case_manager permissions
CREATE OR REPLACE FUNCTION public.can_access_profile(profile_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
    SELECT 
        profile_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles p1, profiles p2
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
$function$;

-- Update the is_firm_admin function to include case_manager for relevant permissions
CREATE OR REPLACE FUNCTION public.is_firm_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('super_admin', 'firm_admin', 'case_manager')
  );
$function$;
