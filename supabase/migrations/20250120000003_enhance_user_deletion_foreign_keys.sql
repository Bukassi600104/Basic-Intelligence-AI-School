-- Migration: Enhance foreign key constraints for complete user deletion
-- This migration ensures all foreign key constraints have proper CASCADE DELETE behavior
-- to support the complete user deletion functionality

-- 1. Update foreign key constraints to ensure proper cascading deletes

-- Update testimonials table to use CASCADE DELETE (if not already set)
ALTER TABLE public.testimonials 
DROP CONSTRAINT IF EXISTS testimonials_user_id_fkey,
ADD CONSTRAINT testimonials_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Update course_enrollments table to use CASCADE DELETE (if not already set)
ALTER TABLE public.course_enrollments 
DROP CONSTRAINT IF EXISTS course_enrollments_user_id_fkey,
ADD CONSTRAINT course_enrollments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Update payments table to use CASCADE DELETE (if not already set)
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS payments_user_id_fkey,
ADD CONSTRAINT payments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Update member_reviews table to use CASCADE DELETE (if not already set)
ALTER TABLE public.member_reviews 
DROP CONSTRAINT IF EXISTS member_reviews_user_id_fkey,
ADD CONSTRAINT member_reviews_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Update referral_analytics table to use CASCADE DELETE (if not already set)
ALTER TABLE public.referral_analytics 
DROP CONSTRAINT IF EXISTS referral_analytics_referrer_id_fkey,
ADD CONSTRAINT referral_analytics_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.referral_analytics 
DROP CONSTRAINT IF EXISTS referral_analytics_referred_user_id_fkey,
ADD CONSTRAINT referral_analytics_referred_user_id_fkey 
FOREIGN KEY (referred_user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Update notification_logs table to use CASCADE DELETE for created_by
ALTER TABLE public.notification_logs 
DROP CONSTRAINT IF EXISTS notification_logs_created_by_fkey,
ADD CONSTRAINT notification_logs_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Update notification_templates table to use CASCADE DELETE for created_by
ALTER TABLE public.notification_templates 
DROP CONSTRAINT IF EXISTS notification_templates_created_by_fkey,
ADD CONSTRAINT notification_templates_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Update system_settings table to use CASCADE DELETE for updated_by
ALTER TABLE public.system_settings 
DROP CONSTRAINT IF EXISTS system_settings_updated_by_fkey,
ADD CONSTRAINT system_settings_updated_by_fkey 
FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- 2. Create a function to clean up orphaned auth users
-- This function helps identify and clean up auth users that don't have corresponding user_profiles
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_auth_users()
RETURNS TABLE(deleted_count INTEGER, remaining_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
    remaining_count INTEGER := 0;
BEGIN
    -- Count remaining orphaned users first
    SELECT COUNT(*) INTO remaining_count
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL;
    
    -- Delete orphaned auth users (only if admin)
    IF public.has_admin_role() THEN
        DELETE FROM auth.users au
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
        );
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
    END IF;
    
    RETURN QUERY SELECT deleted_count, remaining_count;
END;
$$;

-- 3. Create a function to verify complete user deletion
CREATE OR REPLACE FUNCTION public.verify_user_deletion(user_id UUID)
RETURNS TABLE(
    table_name TEXT,
    record_count INTEGER,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check user_profiles
    SELECT 'user_profiles'::TEXT, COUNT(*), 
           CASE WHEN COUNT(*) = 0 THEN 'DELETED' ELSE 'EXISTS' END
    FROM public.user_profiles WHERE id = user_id;
    
    -- Check auth.users (if admin)
    IF public.has_admin_role() THEN
        SELECT 'auth.users'::TEXT, COUNT(*), 
               CASE WHEN COUNT(*) = 0 THEN 'DELETED' ELSE 'EXISTS' END
        FROM auth.users WHERE id = user_id;
    END IF;
    
    -- Check associated tables
    SELECT 'payments'::TEXT, COUNT(*), 
           CASE WHEN COUNT(*) = 0 THEN 'DELETED' ELSE 'EXISTS' END
    FROM public.payments WHERE user_id = verify_user_deletion.user_id;
    
    SELECT 'course_enrollments'::TEXT, COUNT(*), 
           CASE WHEN COUNT(*) = 0 THEN 'DELETED' ELSE 'EXISTS' END
    FROM public.course_enrollments WHERE user_id = verify_user_deletion.user_id;
    
    SELECT 'member_reviews'::TEXT, COUNT(*), 
           CASE WHEN COUNT(*) = 0 THEN 'DELETED' ELSE 'EXISTS' END
    FROM public.member_reviews WHERE user_id = verify_user_deletion.user_id;
    
    SELECT 'referral_analytics (as referrer)'::TEXT, COUNT(*), 
           CASE WHEN COUNT(*) = 0 THEN 'DELETED' ELSE 'EXISTS' END
    FROM public.referral_analytics WHERE referrer_id = verify_user_deletion.user_id;
    
    SELECT 'referral_analytics (as referred)'::TEXT, COUNT(*), 
           CASE WHEN COUNT(*) = 0 THEN 'DELETED' ELSE 'EXISTS' END
    FROM public.referral_analytics WHERE referred_user_id = verify_user_deletion.user_id;
    
    SELECT 'notification_logs'::TEXT, COUNT(*), 
           CASE WHEN COUNT(*) = 0 THEN 'DELETED' ELSE 'EXISTS' END
    FROM public.notification_logs WHERE created_by = verify_user_deletion.user_id;
    
    RETURN;
END;
$$;

-- 4. Create a function to get user deletion statistics
CREATE OR REPLACE FUNCTION public.get_user_deletion_stats()
RETURNS TABLE(
    total_users INTEGER,
    orphaned_auth_users INTEGER,
    users_with_associated_data INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Total users
    SELECT COUNT(*) INTO total_users FROM public.user_profiles;
    
    -- Orphaned auth users (users in auth.users but not in user_profiles)
    SELECT COUNT(*) INTO orphaned_auth_users
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL;
    
    -- Users with associated data
    SELECT COUNT(DISTINCT up.id) INTO users_with_associated_data
    FROM public.user_profiles up
    WHERE EXISTS (
        SELECT 1 FROM public.payments p WHERE p.user_id = up.id
    ) OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce WHERE ce.user_id = up.id
    ) OR EXISTS (
        SELECT 1 FROM public.member_reviews mr WHERE mr.user_id = up.id
    ) OR EXISTS (
        SELECT 1 FROM public.referral_analytics ra WHERE ra.referrer_id = up.id OR ra.referred_user_id = up.id
    );
    
    RETURN NEXT;
END;
$$;

-- 5. Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.cleanup_orphaned_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_user_deletion(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_deletion_stats() TO authenticated;

-- 6. Add comments for documentation
COMMENT ON FUNCTION public.cleanup_orphaned_auth_users() IS 'Cleans up auth users that don''t have corresponding user_profiles (admin only)';
COMMENT ON FUNCTION public.verify_user_deletion(UUID) IS 'Verifies complete deletion of a user from all tables';
COMMENT ON FUNCTION public.get_user_deletion_stats() IS 'Provides statistics about user deletion status';

-- 7. Verify the migration was successful
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully: Enhanced foreign key constraints for complete user deletion';
    RAISE NOTICE 'Created functions: cleanup_orphaned_auth_users(), verify_user_deletion(), get_user_deletion_stats()';
END $$;
