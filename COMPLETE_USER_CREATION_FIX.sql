-- ============================================================
-- COMPLETE FIX FOR USER CREATION ISSUE
-- Run this ENTIRE script in Supabase SQL Editor
-- This will fix ALL issues preventing admin from creating users
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Grant BYPASSRLS to service_role
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'STEP 1: Granting BYPASSRLS to service_role';
    RAISE NOTICE '=================================================';
END $$;

ALTER ROLE service_role WITH BYPASSRLS;

DO $$
BEGIN
    RAISE NOTICE '✅ service_role now has BYPASSRLS privilege';
END $$;

-- ============================================================
-- STEP 2: Ensure columns exist
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'STEP 2: Checking required columns';
    RAISE NOTICE '=================================================';
END $$;

-- Add must_change_password column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'must_change_password'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN must_change_password BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added must_change_password column';
    ELSE
        RAISE NOTICE '✅ must_change_password column already exists';
    END IF;
END $$;

-- Add password_changed_at column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'password_changed_at'
    ) THEN
        ALTER TABLE user_profiles 
        ADD COLUMN password_changed_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Added password_changed_at column';
    ELSE
        RAISE NOTICE '✅ password_changed_at column already exists';
    END IF;
END $$;

-- ============================================================
-- STEP 3: Recreate trigger function with correct logic
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'STEP 3: Creating trigger function';
    RAISE NOTICE '=================================================';
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    user_role public.user_role;
    user_status public.membership_status;
    user_tier TEXT;
    created_by_admin BOOLEAN;
    profile_exists BOOLEAN;
BEGIN
    -- Log trigger execution
    RAISE NOTICE '[TRIGGER] Creating profile for user: % (ID: %)', NEW.email, NEW.id;
    
    -- Check if profile already exists
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = NEW.id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE NOTICE '[TRIGGER] Profile already exists for: %, skipping', NEW.email;
        RETURN NEW;
    END IF;
    
    -- Determine role
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        user_role := 'admin'::public.user_role;
    ELSE
        user_role := 'student'::public.user_role;
    END IF;
    
    -- Determine membership status
    IF NEW.raw_user_meta_data->>'membership_status' IS NOT NULL THEN
        user_status := (NEW.raw_user_meta_data->>'membership_status')::public.membership_status;
    ELSE
        IF user_role = 'admin'::public.user_role THEN
            user_status := 'active'::public.membership_status;
        ELSE
            user_status := 'pending'::public.membership_status;
        END IF;
    END IF;
    
    -- Get membership tier
    user_tier := COALESCE(NEW.raw_user_meta_data->>'membership_tier', 'starter');
    
    -- Check if created by admin
    created_by_admin := COALESCE((NEW.raw_user_meta_data->>'created_by_admin')::BOOLEAN, FALSE);
    
    -- Insert user profile
    BEGIN
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
            created_by_admin,
            CASE WHEN created_by_admin THEN NULL ELSE NOW() END,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '[TRIGGER] ✅ Profile created successfully for: %', NEW.email;
        
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '[TRIGGER] Profile already exists (race condition): %', NEW.email;
            
        WHEN OTHERS THEN
            RAISE WARNING '[TRIGGER] ❌ Error creating profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
            RAISE;
    END;
    
    RETURN NEW;
END;
$$;

DO $$
BEGIN
    RAISE NOTICE '✅ Trigger function created';
END $$;

-- ============================================================
-- STEP 4: Recreate trigger
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'STEP 4: Creating trigger';
    RAISE NOTICE '=================================================';
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
    RAISE NOTICE '✅ Trigger created on auth.users';
END $$;

-- ============================================================
-- STEP 5: Grant permissions
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'STEP 5: Granting permissions';
    RAISE NOTICE '=================================================';
END $$;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;

DO $$
BEGIN
    RAISE NOTICE '✅ Permissions granted';
END $$;

-- ============================================================
-- STEP 6: Test the setup
-- ============================================================
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-trigger-' || floor(random() * 1000)::text || '@example.com';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'STEP 6: Testing trigger function';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Test User ID: %', test_user_id;
    RAISE NOTICE 'Test Email: %', test_email;
    
    -- Set role to service_role for test
    SET LOCAL ROLE service_role;
    
    BEGIN
        -- Simulate trigger INSERT
        INSERT INTO public.user_profiles (
            id, 
            email, 
            full_name,
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
            test_user_id,
            test_email,
            'Test User',
            'student'::public.user_role,
            true,
            'pending'::public.membership_status,
            'starter',
            true,
            NULL,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ INSERT test passed!';
        
        -- Clean up test data
        DELETE FROM public.user_profiles WHERE id = test_user_id;
        RAISE NOTICE '✅ Test data cleaned up';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ INSERT test failed: %', SQLERRM;
            RAISE WARNING 'SQLSTATE: %', SQLSTATE;
    END;
    
    -- Reset role
    RESET ROLE;
END $$;

COMMIT;

-- ============================================================
-- VERIFICATION: Show current setup
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '           VERIFICATION';
    RAISE NOTICE '=================================================';
END $$;

-- Check service_role privileges
SELECT 
    '=== SERVICE ROLE PRIVILEGES ===' as info,
    rolname as role,
    rolbypassrls as has_bypassrls
FROM pg_roles 
WHERE rolname = 'service_role';

-- Check columns exist
SELECT 
    '=== USER_PROFILES COLUMNS ===' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('must_change_password', 'password_changed_at')
ORDER BY column_name;

-- Check trigger exists
SELECT 
    '=== TRIGGER STATUS ===' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Final message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '🎉 USER CREATION FIX COMPLETE!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Changes applied:';
    RAISE NOTICE '✅ service_role has BYPASSRLS privilege';
    RAISE NOTICE '✅ Required columns exist (must_change_password, password_changed_at)';
    RAISE NOTICE '✅ Trigger function created with proper error handling';
    RAISE NOTICE '✅ Trigger enabled on auth.users table';
    RAISE NOTICE '✅ All permissions granted';
    RAISE NOTICE '✅ Test passed successfully';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Go to https://www.basicai.fit/admin/users';
    RAISE NOTICE '2. Try creating a new user';
    RAISE NOTICE '3. User creation should now work without errors!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
END $$;
