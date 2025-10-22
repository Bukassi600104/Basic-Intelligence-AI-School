-- Ensure has_admin_role function exists and works correctly
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'::public.user_role
  );
$$;

-- Ensure the admin user exists in user_profiles
INSERT INTO public.user_profiles (id, email, full_name, role, is_active, membership_status, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin'::public.user_role,
  true,
  'active'::public.membership_status,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'bukassi@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin'::public.user_role,
    is_active = true,
    membership_status = 'active'::public.membership_status,
    updated_at = NOW();

-- Verify admin user exists
SELECT id, email, role, membership_status FROM public.user_profiles 
WHERE email = 'bukassi@gmail.com';

-- Add metadata to auth.users if needed
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'bukassi@gmail.com';