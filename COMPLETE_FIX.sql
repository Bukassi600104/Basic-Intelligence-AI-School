-- COMPLETE FIX: Adds password change columns AND updates trigger
-- Run this ONCE in Supabase SQL Editor to fix everything

-- Step 1: Add the password change columns to user_profiles
DO $$ 
BEGIN
    -- Add must_change_password column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'must_change_password'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added must_change_password column';
    ELSE
        RAISE NOTICE 'must_change_password column already exists';
    END IF;

    -- Add password_changed_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'password_changed_at'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN password_changed_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Added password_changed_at column';
    ELSE
        RAISE NOTICE 'password_changed_at column already exists';
    END IF;
END $$;

-- Step 2: Update the trigger to use the new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
    user_status public.membership_status;
    user_tier TEXT;
    created_by_admin BOOLEAN;
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
    
    -- Check if created by admin (determines if password change is required)
    created_by_admin := COALESCE((NEW.raw_user_meta_data->>'created_by_admin')::BOOLEAN, FALSE);

    -- Insert user profile WITH password change columns
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
        must_change_password,  -- NEW: Force password change for admin-created users
        password_changed_at,   -- NEW: Track when password was last changed
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
        created_by_admin,  -- If created by admin, must change password
        NOW(),
        NOW(),
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Verify the fix
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name IN ('must_change_password', 'password_changed_at');
    
    IF col_count = 2 THEN
        RAISE NOTICE '✅ SUCCESS: Both columns exist and trigger is updated!';
        RAISE NOTICE '✅ Admin can now create users with forced password change';
    ELSE
        RAISE WARNING '⚠️ WARNING: Expected 2 columns, found %', col_count;
    END IF;
END $$;

-- Show final status
SELECT 
    'Complete Fix Applied' as status,
    'Admin user creation should now work with forced password change' as message;
