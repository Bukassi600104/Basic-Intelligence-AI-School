-- PHASE 1: DIAGNOSTIC SCRIPT
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click RUN
-- This will show you the current state of your database

-- 1. Check if password columns exist
SELECT 
    '========== COLUMN CHECK ==========' as test;

SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default,
    CASE WHEN column_name IN ('must_change_password', 'password_changed_at') 
        THEN '✅ PASSWORD COLUMN EXISTS' 
        ELSE '📝 Standard Column' 
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Check if trigger exists
SELECT 
    '========== TRIGGER CHECK ==========' as test;

SELECT 
    tgname as trigger_name,
    tgenabled as is_enabled,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- If trigger doesn't exist, show message
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        RAISE WARNING '❌ TRIGGER DOES NOT EXIST - This is a problem!';
    ELSE
        RAISE NOTICE '✅ Trigger exists';
    END IF;
END $$;

-- 3. Check trigger function definition
SELECT 
    '========== FUNCTION CHECK ==========' as test;

SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_definition LIKE '%must_change_password%' 
        THEN '✅ UPDATED VERSION (has password columns)' 
        ELSE '❌ OLD VERSION (missing password columns)' 
    END as status,
    LEFT(routine_definition, 500) as function_start
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'handle_new_user';

-- 4. Check RLS policies on user_profiles
SELECT 
    '========== RLS POLICY CHECK ==========' as test;

SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN policyname LIKE '%insert%' THEN '🔍 INSERT POLICY'
        WHEN policyname LIKE '%admin%' THEN '👑 ADMIN POLICY'
        ELSE '📝 OTHER'
    END as policy_type,
    qual as using_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- 5. Check recent users
SELECT 
    '========== RECENT USERS ==========' as test;

SELECT 
    id,
    email,
    role,
    membership_status,
    membership_tier,
    COALESCE(must_change_password::text, 'COLUMN MISSING') as must_change_pwd,
    created_at,
    '✅ CREATED' as status
FROM public.user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check for orphaned auth users (critical issue)
SELECT 
    '========== ORPHANED USERS CHECK ==========' as test;

SELECT 
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data->>'full_name' as metadata_name,
    au.raw_user_meta_data->>'role' as metadata_role,
    '⚠️ NO PROFILE - ORPHANED USER' as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- Count orphaned users
SELECT 
    COUNT(*) as orphaned_user_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No orphaned users'
        WHEN COUNT(*) > 0 THEN '⚠️ Found orphaned users - trigger may be failing'
    END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 7. Final summary
DO $$
DECLARE
    col_count INTEGER;
    trigger_exists BOOLEAN;
    function_updated BOOLEAN;
    orphaned_count INTEGER;
BEGIN
    -- Check columns
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name IN ('must_change_password', 'password_changed_at');
    
    -- Check trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) INTO trigger_exists;
    
    -- Check function
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user'
        AND routine_definition LIKE '%must_change_password%'
    ) INTO function_updated;
    
    -- Check orphaned users
    SELECT COUNT(*) INTO orphaned_count
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL;
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE '           DIAGNOSTIC SUMMARY';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Password Columns: % of 2 (should be 2)', col_count;
    RAISE NOTICE 'Trigger Exists: % (should be true)', trigger_exists;
    RAISE NOTICE 'Function Updated: % (should be true)', function_updated;
    RAISE NOTICE 'Orphaned Users: % (should be 0)', orphaned_count;
    RAISE NOTICE '==================================================';
    
    IF col_count = 2 AND trigger_exists AND function_updated AND orphaned_count = 0 THEN
        RAISE NOTICE '✅✅✅ EVERYTHING LOOKS GOOD! ✅✅✅';
        RAISE NOTICE 'If user creation still fails, check:';
        RAISE NOTICE '1. Supabase service role key in environment variables';
        RAISE NOTICE '2. Browser console for detailed error messages';
        RAISE NOTICE '3. Supabase Dashboard Logs for trigger errors';
    ELSE
        RAISE WARNING '⚠️⚠️⚠️ ISSUES FOUND - RUN PHASE_2_NUCLEAR_FIX.sql ⚠️⚠️⚠️';
    END IF;
    RAISE NOTICE '==================================================';
END $$;

SELECT 'DIAGNOSTIC COMPLETE - Review results above' as final_message;
