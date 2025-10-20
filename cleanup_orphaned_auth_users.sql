-- SQL Script to Clean Up Orphaned Auth Users
-- This script will identify and delete auth users that don't have corresponding user_profiles
-- Run this in your Supabase SQL Editor to resolve email conflicts

-- Step 1: Check for orphaned auth users
SELECT 
    au.id as auth_user_id,
    au.email,
    au.created_at as auth_created,
    up.id as profile_id,
    up.created_at as profile_created
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Step 2: Count orphaned users (optional - for verification)
SELECT COUNT(*) as orphaned_users_count
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Step 3: Delete orphaned auth users (UNCOMMENT AND RUN ONLY IF YOU'RE SURE)
-- WARNING: This will permanently delete users from the auth system
-- Make sure you have backups and understand the consequences

/*
DELETE FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);
*/

-- Step 4: Verify deletion worked (run after step 3)
-- This should return 0 rows if all orphaned users were deleted
SELECT COUNT(*) as remaining_orphaned_users
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Alternative: Delete specific users by email (safer approach)
-- Replace 'user@example.com' with the actual email causing conflicts
/*
DELETE FROM auth.users 
WHERE email = 'user@example.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = auth.users.id
);
*/

-- Step 5: Test user creation after cleanup
-- Try creating a user with the previously conflicting email
-- This should now work without the "email already registered" error

-- Additional: Check if the database functions are working
-- Run these to verify the enhanced user deletion system is active
/*
SELECT * FROM get_user_deletion_stats();
SELECT * FROM cleanup_orphaned_auth_users();
*/

-- Important Notes:
-- 1. Only run the DELETE statements if you're absolutely sure
-- 2. Make sure you have proper backups
-- 3. Test with a single email first before bulk deletion
-- 4. The CASCADE DELETE foreign keys should prevent this issue in the future
