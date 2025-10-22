-- Admin Account Setup Instructions
-- After deleting all users, follow these steps to create the admin account

-- STEP 1: Create the user account in Supabase Dashboard
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Authentication -> Users
-- 3. Click "Add User" or "Invite User"
-- 4. Enter:
--    - Email: bukassi@gmail.com
--    - Password: 12345678
--    - Auto-confirm user: YES (check this box)
-- 5. Click "Create User"

-- STEP 2: Run this SQL script to set up the admin profile
-- Copy the user ID from the created user and use it below

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the user ID for bukassi@gmail.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'bukassi@gmail.com';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User bukassi@gmail.com not found. Please create the user first in Authentication -> Users.';
  END IF;
  
  -- Create/Update user profile with admin role
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role,
    is_active,
    membership_status,
    created_at,
    updated_at
  )
  VALUES (
    admin_user_id,
    'bukassi@gmail.com',
    'Administrator',
    'admin'::public.user_role,
    true,
    'active'::public.membership_status,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'admin'::public.user_role,
    is_active = true,
    membership_status = 'active'::public.membership_status,
    updated_at = NOW();
  
  -- Update auth.users metadata
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE id = admin_user_id;
  
  RAISE NOTICE '✅ Admin account setup complete for user ID: %', admin_user_id;
END $$;

-- STEP 3: Verify the admin account
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.membership_status,
  up.is_active,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'role' as metadata_role
FROM public.user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'bukassi@gmail.com';

-- You should see one row with:
-- - role: admin
-- - membership_status: active
-- - is_active: true
-- - email_confirmed_at: (current timestamp)
-- - metadata_role: admin

-- STEP 4: Test login
-- Go to your application and login with:
-- Email: bukassi@gmail.com
-- Password: 12345678
-- You should be redirected to /admin-dashboard
