-- Verification Script for Enhanced Content System Migration
-- Run this after applying 20251024000001_enhanced_content_system.sql

DO $$
DECLARE
    v_result BOOLEAN;
    v_count INTEGER;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'VERIFYING ENHANCED CONTENT SYSTEM MIGRATION';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';

    -- 1. Check if prompt type was added to content_type enum
    SELECT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'prompt'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'content_type')
    ) INTO v_result;
    
    IF v_result THEN
        RAISE NOTICE '✅ content_type enum includes ''prompt''';
    ELSE
        RAISE WARNING '❌ content_type enum missing ''prompt''';
    END IF;

    -- 2. Check new columns in content_library
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'content_library'
    AND column_name IN ('is_featured', 'featured_order', 'featured_description', 'thumbnail_url', 'prompt_type', 'use_case_tags');
    
    IF v_count = 6 THEN
        RAISE NOTICE '✅ All 6 new columns added to content_library';
    ELSE
        RAISE WARNING '❌ Expected 6 new columns in content_library, found %', v_count;
    END IF;

    -- 3. Check featured_content_clicks table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'featured_content_clicks'
    ) INTO v_result;
    
    IF v_result THEN
        RAISE NOTICE '✅ featured_content_clicks table created';
    ELSE
        RAISE WARNING '❌ featured_content_clicks table not found';
    END IF;

    -- 4. Check indexes were created
    SELECT COUNT(*) INTO v_count
    FROM pg_indexes
    WHERE tablename = 'content_library'
    AND indexname IN ('idx_content_library_featured', 'idx_content_library_prompt_type');
    
    IF v_count = 2 THEN
        RAISE NOTICE '✅ Featured content indexes created';
    ELSE
        RAISE WARNING '❌ Expected 2 indexes, found %', v_count;
    END IF;

    -- 5. Check RLS policies
    SELECT COUNT(*) INTO v_count
    FROM pg_policies
    WHERE tablename = 'featured_content_clicks';
    
    IF v_count >= 3 THEN
        RAISE NOTICE '✅ RLS policies created for featured_content_clicks';
    ELSE
        RAISE WARNING '❌ Missing RLS policies for featured_content_clicks (found %)', v_count;
    END IF;

    -- 6. Check helper functions exist
    SELECT COUNT(*) INTO v_count
    FROM pg_proc
    WHERE proname IN ('can_access_featured_content', 'log_featured_content_click', 'get_featured_content', 'get_featured_content_analytics');
    
    IF v_count = 4 THEN
        RAISE NOTICE '✅ All 4 helper functions created';
    ELSE
        RAISE WARNING '❌ Expected 4 helper functions, found %', v_count;
    END IF;

    -- 7. Check constraints
    SELECT COUNT(*) INTO v_count
    FROM pg_constraint
    WHERE conname IN ('featured_description_length', 'featured_content_requirements', 'valid_google_drive_url');
    
    IF v_count = 3 THEN
        RAISE NOTICE '✅ All validation constraints created';
    ELSE
        RAISE WARNING '❌ Expected 3 constraints, found %', v_count;
    END IF;

    -- 8. Check trigger exists
    SELECT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trigger_set_featured_order'
    ) INTO v_result;
    
    IF v_result THEN
        RAISE NOTICE '✅ Featured order trigger created';
    ELSE
        RAISE WARNING '❌ Featured order trigger not found';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'VERIFICATION COMPLETE';
    RAISE NOTICE '============================================';

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Verification failed with error: %', SQLERRM;
END $$;
