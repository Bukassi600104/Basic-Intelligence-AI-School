-- FIX FOR USER CREATION RLS ISSUE
-- This script fixes RLS policies that might be blocking the trigger
-- Run this in Supabase SQL Editor

BEGIN;

-- ============================================================
-- STEP 1: Drop ALL existing policies on user_profiles
-- ============================================================
DO $$
DECLARE
    pol record;
BEGIN
    RAISE NOTICE 'Dropping all existing policies on user_profiles...';
    
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', pol.policyname);
        RAISE NOTICE '✅ Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- ============================================================
-- STEP 2: Create CORRECT RLS Policies
-- ============================================================

-- Policy 1: Allow service role (trigger) to insert profiles
-- This is CRITICAL for the trigger to work
CREATE POLICY "service_role_insert_profiles"
ON public.user_profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy 2: Allow authenticated users to insert their own profile
-- This allows the trigger (running as the new user) to create profile
CREATE POLICY "users_insert_own_profile"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Policy 3: Allow users to read their own profile
CREATE POLICY "users_read_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 4: Allow users to update their own profile
CREATE POLICY "users_update_own_profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 5: Allow admins full access
CREATE POLICY "admins_all_access"
ON public.user_profiles
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    )
);

-- ============================================================
-- STEP 3: Ensure RLS is enabled
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: Grant necessary permissions
-- ============================================================
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.user_profiles TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE '✅ All policies created successfully';
    RAISE NOTICE '✅ RLS enabled on user_profiles';
    RAISE NOTICE '✅ Permissions granted';
END $$;

-- ============================================================
-- STEP 5: Verify setup
-- ============================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles';
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'RLS FIX VERIFICATION';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Total policies: % (should be 5)', policy_count;
    
    IF policy_count >= 5 THEN
        RAISE NOTICE '✅ All policies created successfully';
    ELSE
        RAISE WARNING '⚠️ Expected 5 policies, found %', policy_count;
    END IF;
    RAISE NOTICE '==================================================';
END $$;

COMMIT;

-- ============================================================
-- STEP 6: Show current policies
-- ============================================================
SELECT 
    policyname as "Policy Name",
    cmd as "Command",
    CASE 
        WHEN roles::text LIKE '%service_role%' THEN 'Service Role'
        WHEN roles::text LIKE '%authenticated%' THEN 'Authenticated'
        ELSE roles::text
    END as "Role"
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles'
ORDER BY policyname;

-- Final message
SELECT 
    '🎉 RLS FIX COMPLETE!' as status,
    'Try creating a user now' as next_action,
    'Hard refresh browser (Ctrl+Shift+R) first' as important;
