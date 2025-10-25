-- Fix Admin Users RLS Policy for Login
-- Allow admins to view their own record during login
-- Date: 2025-10-25

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'FIXING ADMIN_USERS RLS POLICY FOR LOGIN';
  RAISE NOTICE '====================================================';
END $$;

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "admins_can_view_all_admins" ON public.admin_users;

-- Create new policy that allows admins to view their own record
-- This is needed for the login flow where admin needs to load their profile
CREATE POLICY "admins_can_view_own_and_all" ON public.admin_users
FOR SELECT USING (
  -- Allow viewing own record (for login)
  auth.uid() = auth_user_id
  OR
  -- Allow viewing all records if already authenticated as admin
  EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND is_active = true)
);

DO $$
BEGIN
  RAISE NOTICE 'Updated admin_users SELECT policy to allow self-view during login';
END $$;

-- Verify the policy
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'admin_users' AND policyname = 'admins_can_view_own_and_all';
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'POLICY UPDATE COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Policy "admins_can_view_own_and_all" exists: %', (policy_count > 0);
  RAISE NOTICE 'Admins can now view their own record during login';
  RAISE NOTICE '====================================================';
END $$;

COMMIT;
