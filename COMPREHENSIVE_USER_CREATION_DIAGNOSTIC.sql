-- COMPREHENSIVE DIAGNOSTIC FOR USER CREATION ISSUE
-- Run this to find the exact problem
-- Copy ALL output and share it

-- ============================================================
-- TEST 1: Check if columns exist
-- ============================================================
SELECT '========== COLUMN CHECK ==========' as test;

SELECT 
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
-- TEST 2: Check trigger function source code
-- ============================================================
SELECT '========== TRIGGER FUNCTION CHECK ==========' as test;

SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ============================================================
-- TEST 3: Check if trigger exists and is enabled
-- ============================================================
SELECT '========== TRIGGER CHECK ==========' as test;

SELECT 
    tgname as trigger_name,
    tgenabled as enabled,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- ============================================================
-- TEST 4: Check RLS policies
-- ============================================================
SELECT '========== RLS POLICIES CHECK ==========' as test;

SELECT 
    policyname,
    cmd as command,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================================
-- TEST 5: Manually test the trigger function logic
-- ============================================================
SELECT '========== MANUAL TRIGGER TEST ==========' as test;

DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'diagnostic-test@example.com';
    test_metadata JSONB := '{"full_name": "Test User", "role": "student", "membership_tier": "starter", "created_by_admin": true}'::jsonb;
BEGIN
    RAISE NOTICE 'Test User ID: %', test_user_id;
    RAISE NOTICE 'Test Email: %', test_email;
    RAISE NOTICE 'Test Metadata: %', test_metadata;
    
    -- Simulate what the trigger does
    BEGIN
        -- Try to INSERT directly (this will show if there's a column mismatch)
        INSERT INTO public.user_profiles (
            id, 
            email, 
            full_name,
            role, 
            is_active,
            membership_status,
            membership_tier,
            must_change_password,
            password_changed_at,
            created_at,
            updated_at
        )
        VALUES (
            test_user_id,
            test_email,
            'Test User',
            'student'::public.user_role,
            true,
            'pending'::public.membership_status,
            'starter',
            true,
            NULL,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Manual INSERT succeeded!';
        RAISE NOTICE 'This means the trigger SHOULD work.';
        
        -- Clean up test data
        DELETE FROM public.user_profiles WHERE id = test_user_id;
        RAISE NOTICE '✅ Test data cleaned up';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Manual INSERT failed!';
            RAISE NOTICE 'Error: %', SQLERRM;
            RAISE NOTICE 'Error Code: %', SQLSTATE;
            RAISE NOTICE 'This is likely the problem with user creation.';
    END;
END $$;

-- ============================================================
-- TEST 6: Check for orphaned auth users
-- ============================================================
SELECT '========== ORPHANED USERS CHECK ==========' as test;

SELECT 
    COUNT(*) as orphaned_count
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- ============================================================
-- TEST 7: Check table permissions
-- ============================================================
SELECT '========== PERMISSIONS CHECK ==========' as test;

SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY grantee, privilege_type;

-- ============================================================
-- TEST 8: Try creating a simple profile directly
-- ============================================================
SELECT '========== DIRECT PROFILE CREATION TEST ==========' as test;

DO $$
DECLARE
    current_user_id UUID := auth.uid();
BEGIN
    RAISE NOTICE 'Current auth.uid(): %', current_user_id;
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE '⚠️ You are not authenticated. This test requires authentication.';
    ELSE
        RAISE NOTICE '✅ You are authenticated as: %', current_user_id;
    END IF;
END $$;

-- ============================================================
-- FINAL SUMMARY
-- ============================================================
SELECT '========================================' as summary
UNION ALL SELECT '         DIAGNOSTIC COMPLETE'
UNION ALL SELECT '========================================'
UNION ALL SELECT ''
UNION ALL SELECT 'Review the output above and look for:'
UNION ALL SELECT '1. ❌ Missing columns (must_change_password, password_changed_at)'
UNION ALL SELECT '2. ❌ Trigger function errors or missing'
UNION ALL SELECT '3. ❌ Trigger not enabled'
UNION ALL SELECT '4. ❌ Manual INSERT failures'
UNION ALL SELECT ''
UNION ALL SELECT 'Copy ALL output above and share it!'
UNION ALL SELECT '========================================';
