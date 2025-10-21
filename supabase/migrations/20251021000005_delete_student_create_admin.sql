-- Migration: Delete student account and create admin account for bukassi@gmail.com
-- This migration will completely remove the existing student account and create a fresh admin account

BEGIN;

-- Step 1: Check if user exists and get user_id
DO $$
DECLARE
    existing_user_id uuid;
    existing_auth_user_id uuid;
    user_exists boolean;
    auth_user_exists boolean;
BEGIN
    -- Check if user exists in user_profiles
    SELECT id INTO existing_user_id
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    -- Check if user exists in auth.users
    SELECT id INTO existing_auth_user_id
    FROM auth.users 
    WHERE email = 'bukassi@gmail.com';
    
    user_exists := (existing_user_id IS NOT NULL);
    auth_user_exists := (existing_auth_user_id IS NOT NULL);
    
    RAISE NOTICE 'User profile exists: %, ID: %', user_exists, existing_user_id;
    RAISE NOTICE 'Auth user exists: %, ID: %', auth_user_exists, existing_auth_user_id;
    
    -- Step 2: Delete related data from all tables if user exists
    IF user_exists THEN
        RAISE NOTICE 'Deleting related data for user: %', existing_user_id;
        
        -- Delete from related tables (only if they exist)
        -- Check and delete from memberships table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memberships') THEN
            DELETE FROM public.memberships WHERE user_id = existing_user_id;
            RAISE NOTICE 'Deleted memberships data';
        END IF;
        
        -- Check and delete from payments table
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
            DELETE FROM public.payments WHERE user_id = existing_user_id;
            RAISE NOTICE 'Deleted payments data';
        END IF;
        
        -- Check and delete from reviews table (if exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reviews') THEN
            DELETE FROM public.reviews WHERE user_id = existing_user_id;
            RAISE NOTICE 'Deleted reviews data';
        END IF;
        
        -- Check and delete from referrals table (if exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referrals') THEN
            DELETE FROM public.referrals WHERE referrer_id = existing_user_id OR referred_id = existing_user_id;
            RAISE NOTICE 'Deleted referrals data';
        END IF;
        
        -- Check and delete from notifications table (if exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
            DELETE FROM public.notifications WHERE user_id = existing_user_id;
            RAISE NOTICE 'Deleted notifications data';
        END IF;
        
        -- Delete from user_profiles table
        DELETE FROM public.user_profiles WHERE id = existing_user_id;
        RAISE NOTICE 'Deleted user profile';
    END IF;
    
    -- Step 3: Delete auth user if exists
    IF auth_user_exists THEN
        RAISE NOTICE 'Deleting auth user: %', existing_auth_user_id;
        
        -- Delete from auth.users (this requires proper RLS policies or service role)
        DELETE FROM auth.users WHERE id = existing_auth_user_id;
        RAISE NOTICE 'Deleted auth user';
    END IF;
    
    -- Step 4: Create new admin user in auth.users
    RAISE NOTICE 'Creating new admin user in auth.users...';
    
    -- Insert into auth.users (this requires service role access)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- instance_id
        gen_random_uuid(), -- id
        'authenticated', -- aud
        'authenticated', -- role
        'bukassi@gmail.com', -- email
        crypt('12345678', gen_salt('bf')), -- encrypted_password
        now(), -- email_confirmed_at
        NULL, -- invited_at
        '', -- confirmation_token
        NULL, -- confirmation_sent_at
        '', -- recovery_token
        NULL, -- recovery_sent_at
        '', -- email_change_token_new
        '', -- email_change
        NULL, -- email_change_sent_at
        NULL, -- last_sign_in_at
        '{"provider": "email", "providers": ["email"]}', -- raw_app_meta_data
        '{}', -- raw_user_meta_data
        false, -- is_super_admin
        now(), -- created_at
        now(), -- updated_at
        NULL, -- phone
        NULL, -- phone_confirmed_at
        '', -- phone_change
        '', -- phone_change_token
        NULL, -- phone_change_sent_at
        '', -- email_change_token_current
        0, -- email_change_confirm_status
        NULL, -- banned_until
        '', -- reauthentication_token
        NULL, -- reauthentication_sent_at
        false, -- is_sso_user
        NULL -- deleted_at
    );
    
    RAISE NOTICE 'Created new auth user';
    
    -- Step 5: Get the new auth user ID
    SELECT id INTO existing_auth_user_id
    FROM auth.users 
    WHERE email = 'bukassi@gmail.com';
    
    RAISE NOTICE 'New auth user ID: %', existing_auth_user_id;
    
    -- Step 6: Create admin user profile
    RAISE NOTICE 'Creating admin user profile...';
    
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        role,
        membership_status,
        membership_tier,
        member_id,
        phone,
        created_at,
        updated_at
    ) VALUES (
        existing_auth_user_id, -- id (same as auth user)
        'bukassi@gmail.com', -- email
        'Admin User', -- full_name
        'admin', -- role
        'active', -- membership_status
        'elite', -- membership_tier
        'ADMIN001', -- member_id
        NULL, -- phone
        now(), -- created_at
        now() -- updated_at
    );
    
    RAISE NOTICE 'Created admin user profile';
    
    -- Step 7: Create admin membership record
    RAISE NOTICE 'Creating admin membership record...';
    
    INSERT INTO public.memberships (
        user_id,
        tier,
        status,
        start_date,
        end_date,
        created_at,
        updated_at
    ) VALUES (
        existing_auth_user_id, -- user_id
        'elite', -- tier
        'active', -- status
        now(), -- start_date
        NULL, -- end_date (no expiration for admin)
        now(), -- created_at
        now() -- updated_at
    );
    
    RAISE NOTICE 'Created admin membership record';
    
    -- Step 8: Final verification
    RAISE NOTICE 'Verifying admin account creation...';
    
    -- Verify user profile
    SELECT role INTO existing_user_id
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    IF existing_user_id = 'admin' THEN
        RAISE NOTICE '✅ SUCCESS: Admin account created successfully with role: %', existing_user_id;
    ELSE
        RAISE NOTICE '❌ ERROR: Admin account creation failed. Role: %', existing_user_id;
    END IF;
    
END $$;

COMMIT;

-- Additional verification after transaction
DO $$
DECLARE
    final_role text;
    final_email text;
BEGIN
    SELECT role, email INTO final_role, final_email
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    IF final_role = 'admin' AND final_email = 'bukassi@gmail.com' THEN
        RAISE NOTICE '✅ FINAL VERIFICATION: Admin account is ready with email: % and role: %', final_email, final_role;
    ELSE
        RAISE NOTICE '❌ FINAL VERIFICATION FAILED: Account has email: % and role: %', final_email, final_role;
    END IF;
END $$;
