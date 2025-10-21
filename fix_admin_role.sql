-- Fix admin user role for bukassi@gmail.com
-- Check current role
SELECT id, email, role, membership_status 
FROM public.user_profiles 
WHERE email = 'bukassi@gmail.com';

-- Update to admin role if needed
UPDATE public.user_profiles 
SET role = 'admin'::public.user_role,
    membership_status = 'active'::public.membership_status,
    updated_at = NOW()
WHERE email = 'bukassi@gmail.com';

-- Verify the update
SELECT id, email, role, membership_status 
FROM public.user_profiles 
WHERE email = 'bukassi@gmail.com';

-- Check if user exists in auth.users
SELECT id, email, role, raw_user_meta_data->>'role' as meta_role
FROM auth.users 
WHERE email = 'bukassi@gmail.com';
