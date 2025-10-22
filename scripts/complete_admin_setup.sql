-- Complete Admin Setup Script
-- This script ensures the admin account is properly configured
-- Run this in Supabase SQL Editor

-- Step 1: Ensure has_admin_role function exists
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'::public.user_role
  );
$$;

-- Step 2: Check if admin user exists in auth.users
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Try to find the user in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'bukassi@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    RAISE NOTICE 'Found admin user with ID: %', admin_user_id;
    
    -- Ensure profile exists with admin role
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
    
    RAISE NOTICE '✅ Admin profile updated successfully';
  ELSE
    RAISE NOTICE '⚠️ No user found with email bukassi@gmail.com in auth.users';
    RAISE NOTICE 'Please run the create_admin.js script first to create the user account';
  END IF;
END $$;

-- Step 3: Verify admin setup
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
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.email = 'bukassi@gmail.com';

-- Step 4: Show success message
SELECT '✅ Admin setup complete. If you see a result above, the admin account is properly configured.' as status;
