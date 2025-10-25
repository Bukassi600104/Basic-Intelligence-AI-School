-- Clean Up Script - Run this FIRST if you have errors from partial migrations
-- This will reset everything so you can start fresh
-- Date: 2025-10-25

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'CLEANING UP PARTIAL MIGRATIONS';
  RAISE NOTICE '====================================================';
END $$;

-- =====================================================
-- 1. DROP TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS trigger_auto_assign_member_id ON public.user_profiles;

-- =====================================================
-- 2. DROP POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own upgrade history" ON public.upgrade_history;
DROP POLICY IF EXISTS "Admins can view all upgrade history" ON public.upgrade_history;
DROP POLICY IF EXISTS "admins_can_view_all_admins" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_update_own_record" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_create_new_admins" ON public.admin_users;

-- =====================================================
-- 3. DROP FUNCTIONS
-- =====================================================
DROP FUNCTION IF EXISTS public.auto_assign_member_id() CASCADE;
DROP FUNCTION IF EXISTS public.generate_next_member_id() CASCADE;
DROP FUNCTION IF EXISTS public.generate_next_admin_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_next_member_id_preview() CASCADE;
DROP FUNCTION IF EXISTS public.is_valid_member_id(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.member_id_exists(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_member_by_member_id(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_user(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_by_id(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_admin_user() CASCADE;

-- =====================================================
-- 4. DROP CONSTRAINTS
-- =====================================================
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_member_id_unique;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_member_id_format_check;

-- =====================================================
-- 5. CLEAR MEMBER IDs (but don't drop column)
-- =====================================================
UPDATE public.user_profiles SET member_id = NULL WHERE member_id IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE 'Cleared all member IDs from user_profiles';
END $$;

-- =====================================================
-- 6. DROP TABLES
-- =====================================================
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.admin_id_counter CASCADE;
DROP TABLE IF EXISTS public.member_id_counter CASCADE;
DROP TABLE IF EXISTS public.member_id_assignment_log CASCADE;
DROP TABLE IF EXISTS public.upgrade_history CASCADE;

DO $$
BEGIN
  RAISE NOTICE 'Dropped all member ID related tables';
END $$;

-- =====================================================
-- 7. DROP INDEXES
-- =====================================================
DROP INDEX IF EXISTS idx_user_profiles_member_id;
DROP INDEX IF EXISTS idx_upgrade_history_user_id;
DROP INDEX IF EXISTS idx_upgrade_history_member_id;
DROP INDEX IF EXISTS idx_upgrade_history_created_at;
DROP INDEX IF EXISTS idx_admin_users_auth_user_id;
DROP INDEX IF EXISTS idx_admin_users_email;
DROP INDEX IF EXISTS idx_admin_users_admin_id;
DROP INDEX IF EXISTS idx_member_id_assignment_log_user_id;
DROP INDEX IF EXISTS idx_member_id_assignment_log_assigned_at;

DO $$
BEGIN
  RAISE NOTICE 'Dropped all indexes';
END $$;

-- =====================================================
-- 8. SUMMARY
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'CLEANUP COMPLETED';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'You can now run: 20251025110000_complete_member_id_system.sql';
  RAISE NOTICE '====================================================';
END $$;

COMMIT;
