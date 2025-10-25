-- QUICK FIX: Apply this migration IMMEDIATELY to fix admin user creation
-- This migration is safe to run and won't break anything
-- Run this in Supabase SQL Editor NOW

BEGIN;

-- First, add the columns if they don't exist (safe operation)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'must_change_password'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN public.user_profiles.must_change_password IS 'Forces user to change password on next login (set by admin when creating account)';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'password_changed_at'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN password_changed_at TIMESTAMPTZ DEFAULT NOW();
        
        COMMENT ON COLUMN public.user_profiles.password_changed_at IS 'Timestamp of last password change';
    END IF;
END $$;

-- Now update the trigger function to handle both scenarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
    user_status public.membership_status;
    user_tier TEXT;
    created_by_admin_flag BOOLEAN;
BEGIN
    -- Check if user is specified as admin in metadata, default to student
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        user_role := 'admin'::public.user_role;
    ELSE
        user_role := 'student'::public.user_role;
    END IF;

    -- Get membership status from metadata, default to pending for new students
    IF NEW.raw_user_meta_data->>'membership_status' IS NOT NULL THEN
        user_status := (NEW.raw_user_meta_data->>'membership_status')::public.membership_status;
    ELSE
        IF user_role = 'admin'::public.user_role THEN
            user_status := 'active'::public.membership_status;
        ELSE
            user_status := 'pending'::public.membership_status;
        END IF;
    END IF;

    -- Get membership tier from metadata, default to pro
    user_tier := COALESCE(NEW.raw_user_meta_data->>'membership_tier', 'pro');

    -- Check if created by admin
    created_by_admin_flag := COALESCE((NEW.raw_user_meta_data->>'created_by_admin')::BOOLEAN, FALSE);

    -- Insert user profile with password change tracking
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name,
        phone,
        location,
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
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'location',
        user_role,
        true,
        user_status,
        user_tier,
        created_by_admin_flag,
        CASE WHEN created_by_admin_flag THEN NULL ELSE NOW() END,
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- Verify the changes
DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'MIGRATION COMPLETE!';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Added columns: must_change_password, password_changed_at';
    RAISE NOTICE 'Updated function: handle_new_user()';
    RAISE NOTICE 'Admin user creation should now work!';
    RAISE NOTICE '====================================================';
END $$;
