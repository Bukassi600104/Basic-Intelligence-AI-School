-- Verify admin_users table exists and check its structure
-- Run this in Supabase SQL Editor

-- Check if admin_users table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name = 'admin_users';

-- Check admin_users columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- Check RLS policies on admin_users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'admin_users';

-- Check if the admin record exists
SELECT 
  id,
  auth_user_id,
  admin_id,
  email,
  full_name,
  is_active,
  created_at
FROM admin_users
WHERE auth_user_id = 'aad258af-e1af-4b9b-bbb2-cea5757c2fd6';

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'admin_users';
