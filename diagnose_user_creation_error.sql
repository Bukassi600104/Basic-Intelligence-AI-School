-- Diagnostic Query: Check if migration was applied correctly
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check if columns exist
SELECT 
    'Column Check' as test_name,
    COUNT(*) as columns_found,
    STRING_AGG(column_name, ', ') as column_names
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles' 
AND column_name IN ('must_change_password', 'password_changed_at');

-- 2. Check current trigger function definition
SELECT 
    'Trigger Function' as test_name,
    routine_name,
    CASE 
        WHEN routine_definition LIKE '%must_change_password%' THEN 'HAS password columns'
        ELSE 'MISSING password columns'
    END as status
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 3. Check recent auth users (to see if auth creation works)
SELECT 
    'Recent Auth Users' as test_name,
    COUNT(*) as total_auth_users,
    MAX(created_at) as last_created
FROM auth.users;

-- 4. Check if there are any orphaned auth users (created but no profile)
SELECT 
    'Orphaned Users' as test_name,
    COUNT(*) as orphaned_count
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 5. Test if we can manually insert into user_profiles with new columns
DO $$
BEGIN
    -- Try to verify the columns are usable
    PERFORM must_change_password, password_changed_at
    FROM user_profiles
    LIMIT 1;
    
    RAISE NOTICE 'SUCCESS: Columns are queryable';
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'ERROR: Columns do not exist yet!';
    WHEN OTHERS THEN
        RAISE NOTICE 'WARNING: Other error occurred';
END $$;

-- 6. Show the actual column definitions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
AND column_name IN ('must_change_password', 'password_changed_at', 'phone', 'location', 'role');
