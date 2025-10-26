-- DIAGNOSTIC SCRIPT: Check current database state
-- Run this in Supabase SQL Editor to see what's wrong

-- Check 1: Do the password columns exist?
SELECT 
    'Password Columns Check' as check_name,
    CASE 
        WHEN COUNT(*) = 2 THEN '✅ Both columns exist'
        WHEN COUNT(*) = 1 THEN '⚠️ Only one column exists'
        ELSE '❌ Columns are missing - COMPLETE_FIX.sql NOT applied'
    END as status,
    COUNT(*) as columns_found
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles' 
AND column_name IN ('must_change_password', 'password_changed_at');

-- Check 2: What columns exist in user_profiles?
SELECT 
    'All user_profiles columns' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check 3: Does the trigger exist and is it correct?
SELECT 
    'Trigger Check' as check_name,
    trigger_name,
    event_manipulation,
    action_timing,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'auth'
AND trigger_name = 'on_auth_user_created';

-- Check 4: Show the current trigger function code
SELECT 
    'Trigger Function Code' as info,
    pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check 5: Are there any orphaned auth users (users in auth but not in user_profiles)?
SELECT 
    'Orphaned Users Check' as check_name,
    COUNT(*) as orphaned_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No orphaned users'
        ELSE '⚠️ Found orphaned auth users - trigger failed during creation'
    END as status
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = au.id
);

-- Check 6: Show orphaned users if any exist
SELECT 
    'Orphaned User Details' as info,
    au.id,
    au.email,
    au.created_at as auth_created_at,
    'User in auth.users but not in user_profiles' as issue
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up 
    WHERE up.id = au.id
)
LIMIT 10;

-- Check 7: Database version info
SELECT version() as postgres_version;

-- Summary
SELECT 
    '=== SUMMARY ===' as section,
    'If "Password Columns Check" shows ❌, you MUST run COMPLETE_FIX.sql' as instruction_1,
    'If "Orphaned Users Check" shows users, the trigger failed and needs fixing' as instruction_2,
    'After running COMPLETE_FIX.sql, hard refresh your browser (Ctrl+Shift+R)' as instruction_3;
