-- ================================================================
-- SET ADMIN ROLE FOR BUKASSI@GMAIL.COM
-- ================================================================
-- Run this AFTER:
-- 1. Running fix_rls_policies_clean.sql
-- 2. Creating user bukassi@gmail.com in Supabase Dashboard
-- ================================================================

-- Set admin role for bukassi@gmail.com using email
UPDATE public.user_profiles
SET 
  role = 'admin'::public.user_role,
  membership_status = 'active'::public.membership_status,
  is_active = true,
  full_name = 'Administrator',
  updated_at = NOW()
WHERE email = 'bukassi@gmail.com';

-- Verify the update worked
SELECT 
  id,
  email,
  role,
  membership_status,
  is_active,
  full_name,
  created_at
FROM public.user_profiles
WHERE email = 'bukassi@gmail.com';

-- Check if user exists in both auth and profiles tables
SELECT 
  au.id AS auth_id,
  au.email AS auth_email,
  au.email_confirmed_at,
  up.id AS profile_id,
  up.email AS profile_email,
  up.role,
  up.membership_status,
  up.is_active
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'bukassi@gmail.com';
