-- Location: supabase/migrations/20250116000003_create_admin_user.sql
-- Purpose: Create primary admin user for Basic Intelligence Community School
-- Target: Create admin user with full admin privileges

DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
BEGIN
    -- Create admin user in auth.users table
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        admin_uuid, 
        '00000000-0000-0000-0000-000000000000', 
        'authenticated', 
        'authenticated',
        'bukassi@gmail.com', 
        crypt('$Arianna600104#', gen_salt('bf', 10)), 
        now(), 
        now(), 
        now(),
        '{"full_name": "Admin User", "role": "admin"}'::jsonb, 
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        false, 
        false, 
        '', 
        null, 
        '', 
        null, 
        '', 
        '', 
        null, 
        '', 
        0, 
        '', 
        null, 
        null, 
        '', 
        '', 
        null
    );

    -- Create admin profile in user_profiles table
    INSERT INTO public.user_profiles (
        id, email, full_name, role, membership_status, 
        avatar_url, bio, location, phone, member_id, 
        joined_at, last_active_at, is_active, created_at, updated_at
    ) VALUES (
        admin_uuid,
        'bukassi@gmail.com',
        'Admin User',
        'admin'::public.user_role,
        'active'::public.membership_status,
        null,
        'Primary Administrator for Basic Intelligence Community School',
        'Lagos, Nigeria',
        null,
        'BASIC-' || UPPER(SUBSTRING(admin_uuid::text, 1, 8)),
        now(),
        now(),
        true,
        now(),
        now()
    );

    -- Update system settings to use the new admin email
    UPDATE public.system_settings 
    SET 
        value = '"bukassi@gmail.com"'::jsonb,
        description = 'Primary admin contact email',
        updated_by = admin_uuid
    WHERE key = 'admin_email';

    RAISE NOTICE 'Admin user created successfully with ID: %', admin_uuid;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Admin user already exists with email: bukassi@gmail.com';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating admin user: %', SQLERRM;
END $$;

-- Verify admin user was created
DO $$
DECLARE
    admin_exists BOOLEAN;
    profile_exists BOOLEAN;
BEGIN
    -- Check if admin user exists in auth.users
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'bukassi@gmail.com'
    ) INTO admin_exists;
    
    -- Check if admin profile exists in user_profiles
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles up
        JOIN auth.users au ON up.id = au.id
        WHERE au.email = 'bukassi@gmail.com' AND up.role = 'admin'
    ) INTO profile_exists;
    
    RAISE NOTICE 'Admin creation verification - Auth user exists: %, Profile exists with admin role: %', 
        admin_exists, profile_exists;
END $$;
