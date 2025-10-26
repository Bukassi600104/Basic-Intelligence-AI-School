-- PHASE 2: NUCLEAR FIX
-- This script will fix EVERYTHING regardless of current state
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click RUN

-- Use a transaction to ensure all-or-nothing execution
BEGIN;

-- ============================================================
-- STEP 1: Add Missing Columns (Safe - won't error if exists)
-- ============================================================

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
        ADD COLUMN password_changed_at TIMESTAMPTZ;
        RAISE NOTICE '✅ Added password_changed_at column';
    ELSE
        RAISE NOTICE '✅ password_changed_at column already exists';
    END IF;
END $$;

-- ============================================================
-- STEP 2: Drop and Recreate Trigger Function with Error Handling
-- ============================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
    user_status public.membership_status;
    user_tier TEXT;
    created_by_admin BOOLEAN;
    profile_exists BOOLEAN;
BEGIN
    -- Log trigger execution for debugging
    RAISE NOTICE '[TRIGGER] Creating profile for user: % (ID: %)', NEW.email, NEW.id;
    
    -- Check if profile already exists (prevent duplicates)
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles WHERE id = NEW.id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE NOTICE '[TRIGGER] ⚠️ Profile already exists for: %, skipping', NEW.email;
        RETURN NEW;
    END IF;
    
    -- Determine role from metadata
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        user_role := 'admin'::public.user_role;
        RAISE NOTICE '[TRIGGER] User role: admin';
    ELSE
        user_role := 'student'::public.user_role;
        RAISE NOTICE '[TRIGGER] User role: student';
    END IF;

    -- Determine membership status from metadata
    IF NEW.raw_user_meta_data->>'membership_status' IS NOT NULL THEN
        user_status := (NEW.raw_user_meta_data->>'membership_status')::public.membership_status;
    ELSE
        IF user_role = 'admin'::public.user_role THEN
            user_status := 'active'::public.membership_status;
        ELSE
            user_status := 'pending'::public.membership_status;
        END IF;
    END IF;
    
    RAISE NOTICE '[TRIGGER] Membership status: %', user_status;

    -- Get membership tier from metadata
    user_tier := COALESCE(NEW.raw_user_meta_data->>'membership_tier', 'starter');
    RAISE NOTICE '[TRIGGER] Membership tier: %', user_tier;
    
    -- Check if created by admin (determines password change requirement)
    created_by_admin := COALESCE((NEW.raw_user_meta_data->>'created_by_admin')::BOOLEAN, FALSE);
    RAISE NOTICE '[TRIGGER] Created by admin: %', created_by_admin;

    -- Insert user profile with full error handling
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
            created_by_admin,  -- Force password change if created by admin
            CASE WHEN created_by_admin THEN NULL ELSE NOW() END,  -- NULL if needs to change password
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '[TRIGGER] ✅ Profile created successfully for: %', NEW.email;
        
    EXCEPTION
        WHEN unique_violation THEN
            -- Another process already created this profile
            RAISE NOTICE '[TRIGGER] ⚠️ Profile already exists for: % (race condition)', NEW.email;
            
        WHEN not_null_violation THEN
            -- Missing required field
            RAISE WARNING '[TRIGGER] ❌ Not null violation for %: %. Check required fields.', 
                NEW.email, SQLERRM;
            RAISE;
            
        WHEN foreign_key_violation THEN
            -- FK constraint failed
            RAISE WARNING '[TRIGGER] ❌ Foreign key violation for %: %', 
                NEW.email, SQLERRM;
            RAISE;
            
        WHEN OTHERS THEN
            -- Any other error
            RAISE WARNING '[TRIGGER] ❌ Unexpected error creating profile for %: % (SQLSTATE: %)', 
                NEW.email, SQLERRM, SQLSTATE;
            RAISE;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

RAISE NOTICE '✅ Trigger function recreated with error handling';

-- ============================================================
-- STEP 3: Ensure Trigger Exists on auth.users
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE '✅ Trigger recreated on auth.users table';

-- ============================================================
-- STEP 4: Fix RLS Policies (Remove conflicts, add proper ones)
-- ============================================================

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;

-- Policy 1: Allow trigger to insert profiles (via service role)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'trigger_can_insert_profiles'
    ) THEN
        CREATE POLICY "trigger_can_insert_profiles" 
        ON public.user_profiles
        FOR INSERT
        TO authenticated
        WITH CHECK (id = auth.uid());
        
        RAISE NOTICE '✅ Created trigger_can_insert_profiles policy';
    ELSE
        RAISE NOTICE '✅ trigger_can_insert_profiles policy already exists';
    END IF;
END $$;

-- Policy 2: Allow admins full access to all profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'admin_full_access_user_profiles'
    ) THEN
        CREATE POLICY "admin_full_access_user_profiles" 
        ON public.user_profiles
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.user_profiles up
                WHERE up.id = auth.uid() 
                AND up.role = 'admin'::public.user_role
            )
        );
        
        RAISE NOTICE '✅ Created admin_full_access_user_profiles policy';
    ELSE
        RAISE NOTICE '✅ admin_full_access_user_profiles policy already exists';
    END IF;
END $$;

-- Policy 3: Allow users to read their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'users_read_own_profile'
    ) THEN
        CREATE POLICY "users_read_own_profile" 
        ON public.user_profiles
        FOR SELECT
        TO authenticated
        USING (id = auth.uid());
        
        RAISE NOTICE '✅ Created users_read_own_profile policy';
    ELSE
        RAISE NOTICE '✅ users_read_own_profile policy already exists';
    END IF;
END $$;

-- Policy 4: Allow users to update their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles' 
        AND policyname = 'users_update_own_profile'
    ) THEN
        CREATE POLICY "users_update_own_profile" 
        ON public.user_profiles
        FOR UPDATE
        TO authenticated
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
        
        RAISE NOTICE '✅ Created users_update_own_profile policy';
    ELSE
        RAISE NOTICE '✅ users_update_own_profile policy already exists';
    END IF;
END $$;

RAISE NOTICE '✅ RLS policies configured';

-- ============================================================
-- STEP 5: Clean up orphaned auth users (optional but recommended)
-- ============================================================

DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL;
    
    IF orphan_count > 0 THEN
        RAISE NOTICE '⚠️ Found % orphaned auth users (users without profiles)', orphan_count;
        RAISE NOTICE '⚠️ These may be from failed previous attempts';
        RAISE NOTICE '⚠️ Consider running cleanup if needed (manual step)';
    ELSE
        RAISE NOTICE '✅ No orphaned users found';
    END IF;
END $$;

-- ============================================================
-- STEP 6: Comprehensive Verification
-- ============================================================

DO $$
DECLARE
    col_count INTEGER;
    trigger_exists BOOLEAN;
    function_updated BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check columns
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name IN ('must_change_password', 'password_changed_at');
    
    -- Check trigger
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) INTO trigger_exists;
    
    -- Check function
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user'
        AND routine_definition LIKE '%must_change_password%'
    ) INTO function_updated;
    
    -- Check RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles';
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE '           NUCLEAR FIX VERIFICATION';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Password Columns: %/2 %', col_count, CASE WHEN col_count = 2 THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Trigger Exists: % %', trigger_exists, CASE WHEN trigger_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Function Updated: % %', function_updated, CASE WHEN function_updated THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'RLS Policies: % %', policy_count, CASE WHEN policy_count >= 4 THEN '✅' ELSE '⚠️' END;
    RAISE NOTICE '==================================================';
    
    IF col_count = 2 AND trigger_exists AND function_updated AND policy_count >= 4 THEN
        RAISE NOTICE '🎉🎉🎉 NUCLEAR FIX SUCCESSFUL! 🎉🎉🎉';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '1. Hard refresh your browser (Ctrl+Shift+R)';
        RAISE NOTICE '2. Try creating a user';
        RAISE NOTICE '3. Check browser console for any errors';
        RAISE NOTICE '';
    ELSE
        RAISE WARNING '⚠️ Some checks failed - review logs above';
    END IF;
    RAISE NOTICE '==================================================';
END $$;

-- Commit all changes
COMMIT;

-- Final status message
SELECT 
    'NUCLEAR FIX APPLIED' as status,
    'Database is ready for user creation' as message,
    'Try creating a user now' as next_action;
