-- ⚠️ WARNING: This script will DELETE ALL USERS from your database
-- Run this ONLY if you want to reset your entire user database
-- This script must be run in Supabase SQL Editor with service role privileges

-- Step 1: Delete all related data first (to avoid foreign key constraints)

-- Delete subscription requests
DELETE FROM public.subscription_requests;

-- Delete automated notifications
DELETE FROM public.automated_notifications;

-- Delete notification logs
DELETE FROM public.notification_logs;

-- Delete email logs (if exists)
DELETE FROM public.email_logs WHERE true;

-- Delete memberships
DELETE FROM public.memberships;

-- Delete member reviews
DELETE FROM public.member_reviews;

-- Delete course enrollments (if exists)
DELETE FROM public.course_enrollments WHERE true;

-- Delete user progress (if exists)
DELETE FROM public.user_progress WHERE true;

-- Step 2: Delete all user profiles
DELETE FROM public.user_profiles;

-- Step 3: Delete all auth users (requires service role)
-- Note: This uses a function that requires admin privileges
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users and delete them
    FOR user_record IN 
        SELECT id FROM auth.users
    LOOP
        -- Delete user from auth.users
        DELETE FROM auth.users WHERE id = user_record.id;
    END LOOP;
    
    RAISE NOTICE 'All users have been deleted successfully';
END $$;

-- Step 4: Reset any sequences (optional)
-- ALTER SEQUENCE IF EXISTS user_profiles_id_seq RESTART WITH 1;

-- Step 5: Verify deletion
SELECT COUNT(*) as remaining_auth_users FROM auth.users;
SELECT COUNT(*) as remaining_user_profiles FROM public.user_profiles;

-- Display success message
SELECT '✅ All users deleted successfully. Database is now clean.' as status;
