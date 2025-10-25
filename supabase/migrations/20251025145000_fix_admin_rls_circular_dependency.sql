-- Fix Admin Users RLS Circular Dependency
-- The previous policy had a circular dependency issue
-- Date: 2025-10-25

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'FIXING ADMIN_USERS RLS CIRCULAR DEPENDENCY';
  RAISE NOTICE '====================================================';
END $$;

-- Drop ALL existing policies on admin_users
DROP POLICY IF EXISTS "admins_can_view_all_admins" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_view_own_and_all" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_insert" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_update" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_delete" ON public.admin_users;

-- Create simple, non-circular SELECT policy
-- Allow users to view their own admin record without checking admin_users table
CREATE POLICY "admins_can_view_own" ON public.admin_users
FOR SELECT USING (
  auth.uid() = auth_user_id
);

-- For INSERT, UPDATE, DELETE - these should only be done via service role key
-- So we create restrictive policies (no one can do these via anon key)
CREATE POLICY "service_role_can_insert" ON public.admin_users
FOR INSERT WITH CHECK (
  false  -- Only service role can insert
);

CREATE POLICY "service_role_can_update" ON public.admin_users
FOR UPDATE USING (
  false  -- Only service role can update
);

CREATE POLICY "service_role_can_delete" ON public.admin_users
FOR DELETE USING (
  false  -- Only service role can delete
);

DO $$
BEGIN
  RAISE NOTICE 'Updated admin_users policies to remove circular dependency';
  RAISE NOTICE 'Admins can now view ONLY their own record';
  RAISE NOTICE 'All mutations require service role key';
END $$;

-- Verify the policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'admin_users';
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'POLICY UPDATE COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Total policies on admin_users: %', policy_count;
  RAISE NOTICE '====================================================';
END $$;

COMMIT;
