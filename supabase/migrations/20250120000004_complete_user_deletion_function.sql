-- Complete User Deletion Function for Basic Intelligence AI School
-- Migration: Create admin_delete_user function for complete user data removal
-- This function ensures all user data is deleted from all tables, freeing up email for re-registration

CREATE OR REPLACE FUNCTION admin_delete_user(user_id UUID)
RETURNS json AS $$
DECLARE
  v_result json;
  v_email text;
  v_full_name text;
  v_deleted_tables text[] := ARRAY[]::text[];
  v_deleted_count integer := 0;
BEGIN
  -- Security check: Only allow admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'::public.user_role
  ) THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;

  -- First, get the user's email and name for logging purposes
  SELECT email, full_name INTO v_email, v_full_name 
  FROM auth.users WHERE id = user_id;
  
  IF v_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'User not found in auth.users table',
      'error_code', 'USER_NOT_FOUND'
    );
  END IF;

  -- Begin transaction block for atomic operations
  BEGIN
    -- Delete from user_content_access table
    DELETE FROM public.user_content_access WHERE user_id = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'user_content_access');
    END IF;

    -- Delete from notification_logs table (created_by references)
    DELETE FROM public.notification_logs WHERE created_by = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'notification_logs');
    END IF;

    -- Delete from notification_templates table (created_by references)
    DELETE FROM public.notification_templates WHERE created_by = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'notification_templates');
    END IF;

    -- Delete from system_settings table (updated_by references)
    DELETE FROM public.system_settings WHERE updated_by = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'system_settings');
    END IF;

    -- Delete from payments table
    DELETE FROM public.payments WHERE user_id = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'payments');
    END IF;

    -- Delete from course_enrollments table
    DELETE FROM public.course_enrollments WHERE user_id = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'course_enrollments');
    END IF;

    -- Delete from testimonials table
    DELETE FROM public.testimonials WHERE user_id = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'testimonials');
    END IF;

    -- Delete from courses table (instructor references)
    UPDATE public.courses SET instructor_id = NULL WHERE instructor_id = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'courses (instructor cleared)');
    END IF;

    -- Delete from content_library table (uploader references)
    UPDATE public.content_library SET uploader_id = NULL WHERE uploader_id = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'content_library (uploader cleared)');
    END IF;

    -- Finally, delete from user_profiles table
    DELETE FROM public.user_profiles WHERE id = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'user_profiles');
    END IF;

    -- Finally, delete from auth.users (this frees up the email address)
    DELETE FROM auth.users WHERE id = user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    IF v_deleted_count > 0 THEN
      v_deleted_tables := array_append(v_deleted_tables, 'auth.users');
    END IF;

    -- Return success message with details
    v_result := json_build_object(
      'success', true,
      'message', 'User and all associated data deleted successfully',
      'deleted_email', v_email,
      'deleted_full_name', v_full_name,
      'deleted_user_id', user_id,
      'tables_affected', v_deleted_tables,
      'total_tables_cleaned', array_length(v_deleted_tables, 1),
      'timestamp', NOW(),
      'deleted_by_admin', auth.uid()
    );
    
    RETURN v_result;

  EXCEPTION WHEN OTHERS THEN
    -- Rollback the transaction on any error
    v_result := json_build_object(
      'success', false,
      'message', 'Error deleting user: ' || SQLERRM,
      'error_code', SQLSTATE,
      'deleted_email', v_email,
      'deleted_user_id', user_id,
      'tables_partially_cleaned', v_deleted_tables
    );
    RETURN v_result;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (RLS will restrict to admins)
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION admin_delete_user IS 'Completely deletes a user and all associated data from all tables, freeing up email for re-registration. Only accessible by administrators.';

-- Create audit logging table for user deletions
CREATE TABLE IF NOT EXISTS public.user_deletion_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deleted_user_id UUID NOT NULL,
    deleted_user_email TEXT NOT NULL,
    deleted_user_full_name TEXT,
    deleted_by_admin UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    deletion_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tables_affected TEXT[],
    deletion_reason TEXT,
    ip_address TEXT,
    user_agent TEXT
);

-- Enable RLS on audit table
ALTER TABLE public.user_deletion_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view deletion audit logs
CREATE POLICY "admin_only_user_deletion_audit"
ON public.user_deletion_audit
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Create index for audit queries
CREATE INDEX IF NOT EXISTS idx_user_deletion_audit_timestamp 
ON public.user_deletion_audit(deletion_timestamp);

CREATE INDEX IF NOT EXISTS idx_user_deletion_audit_admin 
ON public.user_deletion_audit(deleted_by_admin);

CREATE INDEX IF NOT EXISTS idx_user_deletion_audit_email 
ON public.user_deletion_audit(deleted_user_email);

-- Add comment for audit table
COMMENT ON TABLE public.user_deletion_audit IS 'Audit trail for all user deletions performed by administrators';
