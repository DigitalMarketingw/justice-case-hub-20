-- Update the existing superadmin@demo.com profile to have the correct role
UPDATE public.profiles 
SET role = 'super_admin' 
WHERE email = 'superadmin@demo.com' AND role != 'super_admin';