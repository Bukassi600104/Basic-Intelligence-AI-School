-- QUICK CHECK: What's actually in the database right now?
-- Run this and send me the results

-- Check 1: Do the columns exist?
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check 2: Can we see the trigger function?
SELECT pg_get_functiondef('public.handle_new_user'::regprocedure);

-- Check 3: Are there orphaned users?
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE 
        WHEN up.id IS NULL THEN '❌ NO PROFILE - TRIGGER FAILED'
        ELSE '✅ HAS PROFILE'
    END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC
LIMIT 10;
