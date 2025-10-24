-- Verification Script: Content Management System Fixes
-- Date: 2025-10-24
-- Description: Verifies all changes from migration 20251024000003 were applied correctly

-- =====================================================
-- VERIFICATION TESTS
-- =====================================================

DO $$
DECLARE
    v_test_passed BOOLEAN;
    v_test_count INTEGER := 0;
    v_passed_count INTEGER := 0;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CONTENT MANAGEMENT SYSTEM VERIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- TEST 1: Featured description constraint updated to 120 chars
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.check_constraints cc
            JOIN information_schema.constraint_column_usage ccu
                ON cc.constraint_name = ccu.constraint_name
            WHERE cc.constraint_name = 'featured_description_length'
                AND ccu.table_name = 'content_library'
                AND cc.check_clause LIKE '%120%'
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 1: Featured description limit is 120 characters';
        ELSE
            RAISE WARNING '❌ TEST 1 FAILED: Featured description constraint not updated';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 1 ERROR: %', SQLERRM;
    END;

    -- TEST 2: access_levels column exists and is JSONB
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'content_library'
                AND column_name = 'access_levels'
                AND data_type = 'jsonb'
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 2: access_levels column exists and is JSONB type';
        ELSE
            RAISE WARNING '❌ TEST 2 FAILED: access_levels column missing or wrong type';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 2 ERROR: %', SQLERRM;
    END;

    -- TEST 3: All content has valid access_levels arrays
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT NOT EXISTS (
            SELECT 1 FROM public.content_library
            WHERE access_levels IS NULL 
                OR jsonb_array_length(access_levels) = 0
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 3: All content has valid access_levels arrays';
        ELSE
            RAISE WARNING '❌ TEST 3 FAILED: Some content has invalid access_levels';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 3 ERROR: %', SQLERRM;
    END;

    -- TEST 4: access_levels constraint exists
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'valid_access_levels'
                AND table_name = 'content_library'
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 4: valid_access_levels constraint exists';
        ELSE
            RAISE WARNING '❌ TEST 4 FAILED: valid_access_levels constraint missing';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 4 ERROR: %', SQLERRM;
    END;

    -- TEST 5: GIN index created for access_levels
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'content_library'
                AND indexname = 'idx_content_library_access_levels'
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 5: GIN index created for access_levels';
        ELSE
            RAISE WARNING '❌ TEST 5 FAILED: GIN index missing for access_levels';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 5 ERROR: %', SQLERRM;
    END;

    -- TEST 6: user_has_access_to_content function exists
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM pg_proc
            WHERE proname = 'user_has_access_to_content'
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 6: user_has_access_to_content function exists';
        ELSE
            RAISE WARNING '❌ TEST 6 FAILED: user_has_access_to_content function missing';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 6 ERROR: %', SQLERRM;
    END;

    -- TEST 7: get_user_accessible_content function exists
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM pg_proc
            WHERE proname = 'get_user_accessible_content'
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 7: get_user_accessible_content function exists';
        ELSE
            RAISE WARNING '❌ TEST 7 FAILED: get_user_accessible_content function missing';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 7 ERROR: %', SQLERRM;
    END;

    -- TEST 8: New RLS policy exists
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE tablename = 'content_library'
                AND policyname = 'users_view_accessible_content_v2'
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 8: New RLS policy users_view_accessible_content_v2 exists';
        ELSE
            RAISE WARNING '❌ TEST 8 FAILED: New RLS policy missing';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 8 ERROR: %', SQLERRM;
    END;

    -- TEST 9: Featured content view exists
    v_test_count := v_test_count + 1;
    BEGIN
        SELECT EXISTS (
            SELECT 1 FROM pg_views
            WHERE viewname = 'featured_content'
        ) INTO v_test_passed;

        IF v_test_passed THEN
            v_passed_count := v_passed_count + 1;
            RAISE NOTICE '✅ TEST 9: featured_content view exists';
        ELSE
            RAISE WARNING '❌ TEST 9 FAILED: featured_content view missing';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 9 ERROR: %', SQLERRM;
    END;

    -- TEST 10: Test JSONB query on sample data
    v_test_count := v_test_count + 1;
    BEGIN
        -- Test if JSONB @> operator works
        PERFORM 1 FROM public.content_library
        WHERE access_levels @> '["starter"]'::jsonb
        LIMIT 1;

        v_test_passed := TRUE;
        v_passed_count := v_passed_count + 1;
        RAISE NOTICE '✅ TEST 10: JSONB containment operator (@>) works correctly';
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '❌ TEST 10 ERROR: JSONB queries failing: %', SQLERRM;
    END;

    -- SUMMARY
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICATION SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tests Passed: % / %', v_passed_count, v_test_count;
    
    IF v_passed_count = v_test_count THEN
        RAISE NOTICE '✅ ALL TESTS PASSED - Migration successful!';
    ELSE
        RAISE WARNING '⚠️  SOME TESTS FAILED - Please review warnings above';
    END IF;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';

    -- Additional Information
    RAISE NOTICE 'CONTENT STATISTICS:';
    RAISE NOTICE '- Total content items: %', (SELECT COUNT(*) FROM public.content_library);
    RAISE NOTICE '- Featured content: %', (SELECT COUNT(*) FROM public.content_library WHERE is_featured = TRUE);
    RAISE NOTICE '- Content with multi-tier access: %', (SELECT COUNT(*) FROM public.content_library WHERE jsonb_array_length(access_levels) > 1);
    RAISE NOTICE '';

END $$;

-- =====================================================
-- SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Show sample content with access_levels
COMMENT ON COLUMN public.content_library.access_levels IS 
'Sample queries:
-- Find content accessible to starter tier:
SELECT * FROM content_library WHERE access_levels @> ''["starter"]''::jsonb;

-- Find content accessible to multiple tiers:
SELECT * FROM content_library WHERE jsonb_array_length(access_levels) > 1;

-- Find content accessible to ALL tiers:
SELECT * FROM content_library WHERE access_levels @> ''["elite", "pro", "starter"]''::jsonb;
';

-- Create helpful query examples
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'SAMPLE QUERIES YOU CAN RUN:';
    RAISE NOTICE '';
    RAISE NOTICE '1. View all content accessible to Starter tier:';
    RAISE NOTICE '   SELECT title, access_levels FROM content_library WHERE access_levels @> ''["starter"]''::jsonb;';
    RAISE NOTICE '';
    RAISE NOTICE '2. View content available to multiple tiers:';
    RAISE NOTICE '   SELECT title, access_levels FROM content_library WHERE jsonb_array_length(access_levels) > 1;';
    RAISE NOTICE '';
    RAISE NOTICE '3. View featured content:';
    RAISE NOTICE '   SELECT * FROM featured_content;';
    RAISE NOTICE '';
    RAISE NOTICE '4. Test user access (replace UUID with actual user ID):';
    RAISE NOTICE '   SELECT user_has_access_to_content(''<content-id>''::uuid, ''<user-id>''::uuid);';
    RAISE NOTICE '';
END $$;
