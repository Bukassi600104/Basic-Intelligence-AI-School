-- Admin Account Fix Script - FINAL VERSION
-- This script will properly delete the existing student account and create a fresh admin account
-- Run this in your Supabase SQL Editor with service role access

-- Step 1: Check current state
SELECT 
    'Current user state:' as info,
    up.id as user_profile_id,
    up.email,
    up.role,
    up.membership_status,
    au.id as auth_user_id,
    au.email as auth_email
FROM public.user_profiles up
FULL JOIN auth.users au ON up.id = au.id
WHERE up.email = 'bukassi@gmail.com' OR au.email = 'bukassi@gmail.com';

-- Step 2: Delete related data (if user exists) - FIXED VERSION
DO $$
DECLARE
    user_id_to_delete uuid;
    auth_user_id_to_delete uuid;
BEGIN
    -- Get the user ID if it exists
    SELECT id INTO user_id_to_delete 
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    -- Get the auth user ID if it exists
    SELECT id INTO auth_user_id_to_delete 
    FROM auth.users 
    WHERE email = 'bukassi@gmail.com';
    
    RAISE NOTICE 'User profile ID to delete: %', user_id_to_delete;
    RAISE NOTICE 'Auth user ID to delete: %', auth_user_id_to_delete;
    
    -- Delete from related tables (only if they exist)
    IF user_id_to_delete IS NOT NULL THEN
        RAISE NOTICE 'Deleting data for user: %', user_id_to_delete;
        
        -- Check and delete from memberships table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memberships') THEN
            DELETE FROM public.memberships WHERE user_id = user_id_to_delete;
            RAISE NOTICE 'Deleted memberships data';
        END IF;
        
        -- Check and delete from payments table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
            DELETE FROM public.payments WHERE user_id = user_id_to_delete;
            RAISE NOTICE 'Deleted payments data';
        END IF;
        
        -- Check and delete from reviews table (if exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
            DELETE FROM public.reviews WHERE user_id = user_id_to_delete;
            RAISE NOTICE 'Deleted reviews data';
        END IF;
        
        -- Check and delete from referrals table (if exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referrals') THEN
            DELETE FROM public.referrals WHERE referrer_id = user_id_to_delete OR referred_id = user_id_to_delete;
            RAISE NOTICE 'Deleted referrals data';
        END IF;
        
        -- Check and delete from notifications table (if exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
            DELETE FROM public.notifications WHERE user_id = user_id_to_delete;
            RAISE NOTICE 'Deleted notifications data';
        END IF;
        
        -- Delete user profile
        DELETE FROM public.user_profiles WHERE id = user_id_to_delete;
        RAISE NOTICE 'Deleted user profile';
    ELSE
        RAISE NOTICE 'No user profile found to delete';
    END IF;
    
    -- Delete auth user if exists
    IF auth_user_id_to_delete IS NOT NULL THEN
        RAISE NOTICE 'Deleting auth user: %', auth_user_id_to_delete;
        
        -- Delete auth user (requires service role)
        DELETE FROM auth.users WHERE id = auth_user_id_to_delete;
        
        RAISE NOTICE 'Deleted auth user: %', auth_user_id_to_delete;
    ELSE
        RAISE NOTICE 'No auth user found to delete';
    END IF;
END $$;

-- Step 3: Verify deletion was successful
SELECT 
    'Verification after deletion:' as info,
    up.id as user_profile_id,
    up.email,
    au.id as auth_user_id,
    au.email as auth_email
FROM public.user_profiles up
FULL JOIN auth.users au ON up.id = au.id
WHERE up.email = 'bukassi@gmail.com' OR au.email = 'bukassi@gmail.com';

-- Step 4: Create new admin user through application signup
-- IMPORTANT: You need to do this manually through your application
/*
To create the admin user through the application:

1. Go to your application's signup page
2. Use these credentials:
   - Email: bukassi@gmail.com
   - Password: 12345678

3. After signup, run the SQL below to update the user to admin role
*/

-- Step 5: Update user to admin role (run this after user is created through app signup)
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Get the newly created user ID
    SELECT id INTO new_user_id 
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    IF new_user_id IS NOT NULL THEN
        -- Update to admin role
        UPDATE public.user_profiles 
        SET 
            role = 'admin',
            membership_status = 'active',
            membership_tier = 'elite',
            member_id = 'ADMIN001',
            full_name = 'Admin User',
            updated_at = NOW()
        WHERE id = new_user_id;
        
        RAISE NOTICE 'Updated user to admin role: %', new_user_id;
        
        -- Create membership record
        INSERT INTO public.memberships (
            user_id,
            tier,
            status,
            start_date,
            end_date,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            'elite',
            'active',
            NOW(),
            NULL,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created admin membership record';
    ELSE
        RAISE NOTICE 'No user found to update to admin role - please create the user through application signup first';
    END IF;
END $$;

-- Step 6: Verify the admin account
SELECT 
    'Final verification:' as info,
    up.id,
    up.email,
    up.role,
    up.membership_status,
    up.membership_tier,
    up.member_id,
    m.status as membership_record_status
FROM public.user_profiles up
LEFT JOIN public.memberships m ON up.id = m.user_id
WHERE up.email = 'bukassi@gmail.com';
