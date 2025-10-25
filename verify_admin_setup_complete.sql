-- Comprehensive Admin Setup Verification
-- Run this to verify the entire admin setup is correct

-- 1. Check if admin exists in admin_users
SELECT 
  'Admin User Check' as check_name,
  admin_id,
  email,
  full_name,
  is_active,
  auth_user_id,
  created_at
FROM admin_users
WHERE email = 'bukassi@gmail.com';

-- 2. Check if admin exists in auth.users
SELECT 
  'Auth User Check' as check_name,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'bukassi@gmail.com';

-- 3. Check RLS policies on admin_users
SELECT 
  'RLS Policies Check' as check_name,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- 4. Check if RLS is enabled
SELECT 
  'RLS Enabled Check' as check_name,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'admin_users';

-- 5. Verify the auth_user_id matches
SELECT 
  'ID Match Check' as check_name,
  au.admin_id,
  au.email as admin_email,
  au.auth_user_id as admin_auth_id,
  u.id as auth_user_id,
  CASE 
    WHEN au.auth_user_id = u.id THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as match_status
FROM admin_users au
JOIN auth.users u ON u.email = au.email
WHERE au.email = 'bukassi@gmail.com';
