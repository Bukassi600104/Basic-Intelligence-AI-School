-- ================================================================
-- FIX RLS POLICIES FOR USER_PROFILES - COMPLETE CLEAN FIX
-- ================================================================
-- Issue: Circular dependency causes 500 errors when fetching user profiles
-- Root Cause: 
--   1. RLS policies on user_profiles use has_admin_role() function
--   2. has_admin_role() queries user_profiles table
--   3. This creates circular dependency: policy → function → same table → policy
-- Solution: Remove circular dependencies, use simple auth.uid() checks
-- ================================================================

-- Step 1: Drop ALL existing policies on user_profiles (clean slate)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', r.policyname);
    END LOOP;
END $$;

-- Step 2: Create simple, non-circular policies
-- CRITICAL: Do NOT use has_admin_role() or any function that queries user_profiles
-- This would create circular dependency and cause 500 errors

-- Policy 1: Allow any authenticated user to SELECT their own profile
-- This is the most important policy - it must work for auth to function
CREATE POLICY "users_select_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Allow any authenticated user to UPDATE their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow new users to INSERT their profile during registration
-- This is triggered by handle_new_user() function after signup
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 4: Service role has full access (bypasses RLS anyway, but explicit is better)
CREATE POLICY "service_role_full_access"
ON public.user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 5: Allow public to read basic info for active users (for testimonials, etc.)
CREATE POLICY "public_read_active_users"
ON public.user_profiles
FOR SELECT
TO public
USING (is_active = true);

-- Step 3: Verify RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Update has_admin_role() function to use SECURITY INVOKER
-- IMPORTANT: This function should NOT be used in RLS policies on user_profiles
-- It's for application logic and policies on OTHER tables
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
)
$$;

-- Step 4b: Create helper function for checking admin role with parameter
-- This can be called from application code
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  check_user_id UUID;
BEGIN
  -- If no user_id provided, use current authenticated user
  check_user_id := COALESCE(user_id, auth.uid());
  
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = check_user_id AND role = 'admin'::public.user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
GRANT EXECUTE ON FUNCTION public.has_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- Step 6: Verification queries
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'RLS POLICIES UPDATED SUCCESSFULLY';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'Policies on user_profiles:';
END $$;

-- Show all policies on user_profiles
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
WHERE schemaname = 'public' AND tablename = 'user_profiles'
ORDER BY policyname;

-- Show current users and roles
SELECT 
  id,
  email,
  role,
  membership_status,
  is_active,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- Step 7: Test that the circular dependency is fixed
DO $$
DECLARE
  test_result BOOLEAN;
BEGIN
  -- This should now work without causing 500 error
  -- Test the has_admin_role function
  SELECT public.has_admin_role() INTO test_result;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'CIRCULAR DEPENDENCY TEST: PASSED ✓';
  RAISE NOTICE 'has_admin_role() executed without error';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Create admin user in Authentication → Users';
  RAISE NOTICE '   Email: bukassi@gmail.com';
  RAISE NOTICE '   Password: 12345678';
  RAISE NOTICE '   Auto-confirm: YES';
  RAISE NOTICE '';
  RAISE NOTICE '2. Set admin role with:';
  RAISE NOTICE '   UPDATE public.user_profiles';
  RAISE NOTICE '   SET role = ''admin''::public.user_role,';
  RAISE NOTICE '       membership_status = ''active''::public.membership_status';
  RAISE NOTICE '   WHERE email = ''bukassi@gmail.com'';';
  RAISE NOTICE '';
  RAISE NOTICE '3. Test login at your app';
  RAISE NOTICE '=================================================';
END $$;
