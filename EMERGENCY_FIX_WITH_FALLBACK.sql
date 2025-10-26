-- EMERGENCY FIX: Completely rebuild the trigger
-- Run this if COMPLETE_FIX.sql didn't work

-- Step 1: Drop and recreate the trigger function with proper error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
    user_status public.membership_status;
    user_tier TEXT;
    created_by_admin BOOLEAN;
    must_change_pwd BOOLEAN;
BEGIN
    -- Log that trigger is firing
    RAISE NOTICE 'Trigger fired for user: %', NEW.email;
    
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
    must_change_pwd := created_by_admin;
    
    RAISE NOTICE 'Inserting user profile for: % (role: %, status: %, must_change: %)', 
        NEW.email, user_role, user_status, must_change_pwd;

    -- First, ensure the columns exist
    BEGIN
        -- Try to insert with password columns
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
            must_change_pwd,
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ User profile created successfully for: %', NEW.email;
        
    EXCEPTION
        WHEN undefined_column THEN
            -- If columns don't exist, insert without them
            RAISE WARNING '⚠️ Password columns missing, inserting without them for: %', NEW.email;
            
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
                NOW(),
                NOW()
            );
            
            RAISE WARNING '⚠️ User created but password change feature disabled - run COMPLETE_FIX.sql';
            
        WHEN OTHERS THEN
            -- Log any other errors
            RAISE WARNING 'Error inserting user profile for %: % (SQLSTATE: %)', 
                NEW.email, SQLERRM, SQLSTATE;
            RAISE;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Verify the trigger exists on auth.users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        -- Recreate the trigger
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_new_user();
        
        RAISE NOTICE '✅ Trigger created';
    ELSE
        RAISE NOTICE '✅ Trigger already exists';
    END IF;
END $$;

-- Step 3: Add the columns if they don't exist
DO $$ 
BEGIN
    -- Add must_change_password column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'must_change_password'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
        RAISE NOTICE '✅ Added must_change_password column';
    ELSE
        RAISE NOTICE '✅ must_change_password column already exists';
    END IF;

    -- Add password_changed_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'password_changed_at'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN password_changed_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Added password_changed_at column';
    ELSE
        RAISE NOTICE '✅ password_changed_at column already exists';
    END IF;
END $$;

-- Step 4: Show what we have
SELECT 
    '=== EMERGENCY FIX APPLIED ===' as status,
    'Trigger rebuilt with error handling' as note_1,
    'If columns exist, password change will work' as note_2,
    'If columns missing, users can still be created (fallback mode)' as note_3,
    'Try creating a user now' as action;

-- Show current columns
SELECT 
    'Current user_profiles columns:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
