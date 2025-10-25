-- Remove Old Member ID Column from user_profiles
-- The old member_id column is no longer needed with the new BI#### system
-- Date: 2025-10-25

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'REMOVING OLD MEMBER_ID COLUMN';
  RAISE NOTICE '====================================================';
END $$;

-- =====================================================
-- 1. CHECK IF OLD COLUMN EXISTS AND NEEDS BACKUP
-- =====================================================

-- First, let's see if there's an old_member_id column we need to keep
DO $$
DECLARE
  has_old_column BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'old_member_id'
  ) INTO has_old_column;
  
  IF has_old_column THEN
    RAISE NOTICE 'Found old_member_id column - will be removed';
  ELSE
    RAISE NOTICE 'No old_member_id column found - nothing to remove';
  END IF;
END $$;

-- =====================================================
-- 2. REMOVE OLD_MEMBER_ID COLUMN IF IT EXISTS
-- =====================================================

-- Drop the old_member_id column from user_profiles if it exists
ALTER TABLE public.user_profiles 
DROP COLUMN IF EXISTS old_member_id CASCADE;

DO $$
BEGIN
  RAISE NOTICE 'Removed old_member_id column from user_profiles';
END $$;

-- =====================================================
-- 3. CLEAN UP AUDIT LOG
-- =====================================================

-- The audit log (member_id_assignment_log) keeps old_member_id for historical tracking
-- We'll keep this table as-is since it's just a log
DO $$
BEGIN
  RAISE NOTICE 'Keeping member_id_assignment_log for audit purposes';
  RAISE NOTICE 'The old_member_id field in logs is for historical tracking only';
END $$;

-- =====================================================
-- 4. VERIFY CLEANUP
-- =====================================================

DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns 
  WHERE table_name = 'user_profiles' 
  AND column_name LIKE '%old%member%';
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'CLEANUP COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Old member ID columns remaining: %', column_count;
  RAISE NOTICE 'Current user_profiles has only: member_id (BI####)';
  RAISE NOTICE 'Admins are in separate admin_users table with admin_id (ADMIN###)';
  RAISE NOTICE '====================================================';
END $$;

COMMIT;

-- =====================================================
-- SUMMARY
-- =====================================================
-- 1. Removed old_member_id column from user_profiles (if it existed)
-- 2. New users only get member_id in BI#### format
-- 3. Audit log keeps historical old_member_id for tracking purposes
-- 4. System is clean and ready for production
