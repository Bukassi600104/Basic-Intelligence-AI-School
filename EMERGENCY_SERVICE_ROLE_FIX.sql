-- EMERGENCY FIX: Allow service_role to bypass RLS completely
-- This is the PROPER way to let triggers work
-- Run this if COMPREHENSIVE_USER_CREATION_DIAGNOSTIC.sql shows trigger INSERT fails

BEGIN;

-- ============================================================
-- CRITICAL FIX: Grant service_role BYPASSRLS privilege
-- ============================================================

-- This is the recommended approach for triggers
-- Service role should ALWAYS bypass RLS

DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'GRANTING BYPASSRLS TO service_role';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'This allows triggers to insert into user_profiles';
    RAISE NOTICE 'without being blocked by RLS policies.';
    RAISE NOTICE '';
END $$;

-- Grant BYPASSRLS to service_role
ALTER ROLE service_role WITH BYPASSRLS;

DO $$
BEGIN
    RAISE NOTICE '✅ service_role now has BYPASSRLS privilege';
END $$;

-- ============================================================
-- Verify service_role has correct privileges
-- ============================================================
SELECT 
    rolname as role_name,
    rolsuper as is_superuser,
    rolinherit as can_inherit,
    rolcreaterole as can_create_roles,
    rolcreatedb as can_create_db,
    rolcanlogin as can_login,
    rolbypassrls as bypass_rls
FROM pg_roles
WHERE rolname = 'service_role';

-- ============================================================
-- Also ensure service_role has table permissions
-- ============================================================
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

DO $$
BEGIN
    RAISE NOTICE '✅ All permissions granted to service_role';
END $$;

-- ============================================================
-- Test: Verify trigger can now insert
-- ============================================================
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'service-role-test@example.com';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'TESTING SERVICE ROLE INSERT';
    RAISE NOTICE '=================================================';
    
    -- Set role to service_role for testing
    SET LOCAL ROLE service_role;
    
    BEGIN
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
            'Service Role Test',
            'student'::public.user_role,
            true,
            'pending'::public.membership_status,
            'starter',
            true,
            NULL,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ INSERT successful as service_role';
        
        -- Clean up test data
        DELETE FROM public.user_profiles WHERE id = test_user_id;
        RAISE NOTICE '✅ Test data cleaned up';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '❌ INSERT failed: %', SQLERRM;
            RAISE WARNING 'SQLSTATE: %', SQLSTATE;
    END;
    
    -- Reset role
    RESET ROLE;
END $$;

COMMIT;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '🎉 SERVICE ROLE FIX COMPLETE!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'service_role can now bypass RLS policies';
    RAISE NOTICE 'Triggers should work properly now';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Hard refresh browser (Ctrl+Shift+R)';
    RAISE NOTICE '2. Try creating a user from admin dashboard';
    RAISE NOTICE '3. Check for success!';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
END $$;
