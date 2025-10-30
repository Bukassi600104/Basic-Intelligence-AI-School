-- EMERGENCY FIX: Remove Circular RLS Policy
-- This fixes the "infinite recursion detected in policy" error
-- Run this IMMEDIATELY in Supabase SQL Editor

BEGIN;

-- Step 1: Drop the problematic policy causing infinite recursion
DROP POLICY IF EXISTS "admin_full_access_user_profiles" ON public.user_profiles;

-- Step 2: Create a NON-RECURSIVE admin policy
-- This uses a direct role check WITHOUT querying the same table
CREATE POLICY "admin_full_access_user_profiles" 
ON public.user_profiles
FOR ALL
TO authenticated
USING (
    -- Direct check: is the current user's ID in admin_users table?
    -- This avoids querying user_profiles (which would cause recursion)
    EXISTS (
        SELECT 1 FROM public.admin_users au
        WHERE au.auth_user_id = auth.uid()
        AND au.is_active = true
    )
    OR
    -- OR check: is this the user's own profile?
    id = auth.uid()
);

-- Step 3: Ensure trigger_can_insert_profiles policy exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'trigger_can_insert_profiles'
    ) THEN
        CREATE POLICY "trigger_can_insert_profiles" 
        ON public.user_profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (id = auth.uid());
        
        RAISE NOTICE '✅ Created trigger_can_insert_profiles policy';
    ELSE
        RAISE NOTICE '✅ trigger_can_insert_profiles policy already exists';
    END IF;
END $$;

-- Step 4: Ensure users can read their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'users_read_own_profile'
    ) THEN
        CREATE POLICY "users_read_own_profile" 
        ON public.user_profiles
        FOR SELECT
        TO authenticated
        USING (id = auth.uid());
        
        RAISE NOTICE '✅ Created users_read_own_profile policy';
    ELSE
        RAISE NOTICE '✅ users_read_own_profile policy already exists';
    END IF;
END $$;

-- Step 5: Ensure users can update their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'users_update_own_profile'
    ) THEN
        CREATE POLICY "users_update_own_profile" 
        ON public.user_profiles
        FOR UPDATE
        TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
        
        RAISE NOTICE '✅ Created users_update_own_profile policy';
    ELSE
        RAISE NOTICE '✅ users_update_own_profile policy already exists';
    END IF;
END $$;

COMMIT;

-- Verification
SELECT 
    '✅ EMERGENCY FIX APPLIED' as status,
    'RLS circular dependency removed' as message,
    'Hard refresh your browser (Ctrl+Shift+R) and try again' as next_action;

-- Show current policies
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles'
ORDER BY policyname;
