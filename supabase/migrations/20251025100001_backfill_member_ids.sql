-- Migration: Backfill Member IDs for Existing Users
-- Assigns BI#### format member IDs to REGULAR USERS ONLY
-- Admin users are handled in separate migration (20251025100002_separate_admin_table.sql)
-- Date: 2025-10-25
-- IMPORTANT: Run AFTER 20251025100000_member_id_system.sql AND 20251025100002_separate_admin_table.sql

BEGIN;

-- =====================================================
-- 1. BACKUP EXISTING MEMBER IDs (if any)
-- =====================================================
CREATE TEMP TABLE temp_old_member_ids AS
SELECT id, member_id, email, full_name, role
FROM public.user_profiles
WHERE member_id IS NOT NULL;

-- Log existing member IDs
DO $$
DECLARE
  old_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO old_count FROM temp_old_member_ids;
  IF old_count > 0 THEN
    RAISE NOTICE 'Backed up % existing member IDs', old_count;
  ELSE
    RAISE NOTICE 'No existing member IDs found';
  END IF;
END $$;

-- =====================================================
-- 2. CLEAR EXISTING MEMBER IDs TO ALLOW REASSIGNMENT
-- =====================================================
UPDATE public.user_profiles
SET member_id = NULL
WHERE member_id IS NOT NULL;

-- =====================================================
-- 3. SKIP ADMIN ASSIGNMENT (handled in separate migration)
-- =====================================================
-- Admin users are migrated to admin_users table in migration 20251025100002
DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Skipping admin ID assignment (handled separately)';
  RAISE NOTICE 'Admin users are in admin_users table';
  RAISE NOTICE '====================================================';
END $$;

-- =====================================================
-- 4. ASSIGN SEQUENTIAL IDs TO REGULAR USERS
-- =====================================================
-- Regular users (students/instructors) get BI#### format
DO $$
DECLARE
  user_record RECORD;
  member_count INTEGER := 0;
  new_member_id TEXT;
BEGIN
  -- Assign member IDs to users without admin role
  FOR user_record IN 
    SELECT id, email, full_name, role, created_at
    FROM public.user_profiles 
    WHERE role != 'admin' AND member_id IS NULL
    ORDER BY created_at ASC  -- Oldest users get lower numbers
  LOOP
    -- Generate next member ID
    member_count := member_count + 1;
    new_member_id := 'BI' || LPAD(member_count::TEXT, 4, '0');
    
    -- Assign the ID
    UPDATE public.user_profiles
    SET member_id = new_member_id
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Assigned member ID % to %: % (%)', 
      new_member_id, user_record.role, user_record.full_name, user_record.email;
  END LOOP;
  
  -- Update the counter to continue from where we left off
  IF member_count > 0 THEN
    UPDATE public.member_id_counter
    SET next_id = member_count + 1,
        last_assigned = 'BI' || LPAD(member_count::TEXT, 4, '0'),
        updated_at = NOW()
    WHERE id = 1;
    
    RAISE NOTICE 'Updated member_id_counter: next_id = %', member_count + 1;
  END IF;
END $$;

-- =====================================================
-- 5. VERIFICATION AND SUMMARY
-- =====================================================
DO $$
DECLARE
  total_users INTEGER;
  users_with_ids INTEGER;
  users_without_ids INTEGER;
  admin_ids INTEGER;
  regular_ids INTEGER;
  next_id_preview TEXT;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO total_users FROM public.user_profiles;
  SELECT COUNT(*) INTO users_with_ids FROM public.user_profiles WHERE member_id IS NOT NULL;
  SELECT COUNT(*) INTO users_without_ids FROM public.user_profiles WHERE member_id IS NULL;
  SELECT COUNT(*) INTO admin_ids FROM public.user_profiles WHERE member_id LIKE 'ADMIN%';
  SELECT COUNT(*) INTO regular_ids FROM public.user_profiles WHERE member_id LIKE 'BI%';
  
  -- Get next ID preview
  next_id_preview := public.get_next_member_id_preview();
  
  -- Display summary
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MEMBER ID BACKFILL COMPLETED';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with member IDs: %', users_with_ids;
  RAISE NOTICE 'Users without member IDs: %', users_without_ids;
  RAISE NOTICE 'Admin IDs assigned: %', admin_ids;
  RAISE NOTICE 'Regular member IDs assigned: %', regular_ids;
  RAISE NOTICE 'Next member ID will be: %', next_id_preview;
  RAISE NOTICE '====================================================';
  
  -- Warn if there are users without IDs
  IF users_without_ids > 0 THEN
    RAISE WARNING '% users still do not have member IDs! Please investigate.', users_without_ids;
  END IF;
END $$;

-- =====================================================
-- 6. LOG ASSIGNMENTS IN AUDIT TABLE
-- =====================================================
-- Log all assignments (audit table created in previous migration)
INSERT INTO public.member_id_assignment_log (user_id, old_member_id, new_member_id, user_email, user_full_name)
SELECT 
  up.id,
  tom.member_id as old_member_id,
  up.member_id as new_member_id,
  up.email,
  up.full_name
FROM public.user_profiles up
LEFT JOIN temp_old_member_ids tom ON up.id = tom.id
WHERE up.member_id IS NOT NULL;

-- Log summary
DO $$
DECLARE
  log_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO log_count FROM public.member_id_assignment_log;
  RAISE NOTICE 'Created audit log with % entries', log_count;
END $$;

-- =====================================================
-- 7. DISPLAY ALL ASSIGNED MEMBER IDs
-- =====================================================
DO $$
DECLARE
  user_record RECORD;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MEMBER ID ASSIGNMENTS (ordered by member_id)';
  RAISE NOTICE '====================================================';
  
  FOR user_record IN 
    SELECT member_id, full_name, email, role, 
           CASE 
             WHEN membership_status = 'active' THEN '✓ Active'
             ELSE '○ ' || COALESCE(membership_status::TEXT, 'pending')
           END as status
    FROM public.user_profiles 
    WHERE member_id IS NOT NULL
    ORDER BY 
      CASE WHEN role = 'admin' THEN 0 ELSE 1 END,
      member_id
  LOOP
    RAISE NOTICE '% | % | % | % | %', 
      RPAD(user_record.member_id, 10),
      RPAD(user_record.full_name, 25),
      RPAD(user_record.email, 30),
      RPAD(user_record.role, 10),
      user_record.status;
  END LOOP;
  
  RAISE NOTICE '====================================================';
END $$;

COMMIT;

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. Admin users are in separate admin_users table (migration 20251025100002)
-- 2. Regular users get BI#### format (e.g., BI0001, BI0002)
-- 3. Member IDs are assigned based on account creation date (oldest first)
-- 4. The counter is updated to continue from the last assigned ID
-- 5. New users will automatically get member IDs via trigger
-- 6. Audit log is created in member_id_assignment_log table
