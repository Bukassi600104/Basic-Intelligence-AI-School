-- DIAGNOSTIC SCRIPT FOR USER CREATION ISSUE
-- Run this in Supabase SQL Editor to diagnose the problem

-- ============================================================
-- STEP 1: Check if columns exist
-- ============================================================
SELECT 
    'Column Check' as test_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles' 
AND column_name IN ('must_change_password', 'password_changed_at')
ORDER BY column_name;

-- ============================================================
-- STEP 2: Check if trigger exists
-- ============================================================
SELECT 
    'Trigger Check' as test_name,
    tgname as trigger_name,
    tgenabled as enabled,
    tgtype as trigger_type
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- ============================================================
-- STEP 3: Check trigger function
-- ============================================================
SELECT 
    'Function Check' as test_name,
    routine_name,
    routine_type,
    CASE 
        WHEN routine_definition LIKE '%must_change_password%' THEN '✅ Contains must_change_password'
        ELSE '❌ Missing must_change_password'
    END as password_field_check
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- ============================================================
-- STEP 4: Check RLS policies on user_profiles
-- ============================================================
SELECT 
    'RLS Policy Check' as test_name,
    schemaname,
    tablename,
    policyname,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================================
-- STEP 5: Check if RLS is enabled
-- ============================================================
SELECT 
    'RLS Status' as test_name,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_profiles';

-- ============================================================
-- STEP 6: Check for orphaned auth users
-- ============================================================
SELECT 
    'Orphaned Users Check' as test_name,
    COUNT(*) as orphaned_count
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- ============================================================
-- STEP 7: Check database logs for recent errors
-- ============================================================
-- Note: You may need to check the Logs section in Supabase Dashboard
-- Look for errors related to handle_new_user() trigger

-- ============================================================
-- STEP 8: Test trigger function manually
-- ============================================================
-- This will show if the trigger function works correctly
DO $$
DECLARE
    test_email TEXT := 'diagnostic-test@example.com';
    test_id UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'DIAGNOSTIC TEST: Simulating user creation';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Test Email: %', test_email;
    RAISE NOTICE 'Test ID: %', test_id;
    RAISE NOTICE '';
    
    -- Check if function exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        RAISE NOTICE '✅ Trigger function exists';
    ELSE
        RAISE WARNING '❌ Trigger function does NOT exist!';
    END IF;
    
    -- Check trigger
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        RAISE NOTICE '✅ Trigger exists on auth.users';
    ELSE
        RAISE WARNING '❌ Trigger does NOT exist on auth.users!';
    END IF;
    
    RAISE NOTICE '==================================================';
END $$;

-- ============================================================
-- STEP 9: Check if service role can insert into user_profiles
-- ============================================================
-- This tests if the RLS policies allow the trigger to insert

SELECT 
    'RLS INSERT Test' as test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'user_profiles' 
            AND cmd = 'INSERT'
        ) THEN '✅ INSERT policy exists'
        ELSE '⚠️ No INSERT policy found'
    END as result;

-- ============================================================
-- FINAL RECOMMENDATIONS
-- ============================================================
SELECT 
    '==============================================' as divider
UNION ALL
SELECT 
    'DIAGNOSTIC COMPLETE' as divider
UNION ALL
SELECT 
    '==============================================' as divider
UNION ALL
SELECT 
    '' as divider
UNION ALL
SELECT 
    'If you see any ❌ or ⚠️ above, please:' as divider
UNION ALL
SELECT 
    '1. Copy this output and share with support' as divider
UNION ALL
SELECT 
    '2. Check Supabase Dashboard → Database → Logs' as divider
UNION ALL
SELECT 
    '3. Look for errors when creating a user' as divider
UNION ALL
SELECT 
    '4. Try creating user again after reviewing output' as divider
UNION ALL
SELECT 
    '==============================================' as divider;
