-- Add Force Password Change on First Login
-- Date: 2025-10-25

BEGIN;

-- Add column to track if user must change password
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;

-- Add column to track when password was last changed
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN public.user_profiles.must_change_password IS 'Forces user to change password on next login (set by admin when creating account)';
COMMENT ON COLUMN public.user_profiles.password_changed_at IS 'Timestamp of last password change';

-- Update existing users created by admin to require password change if they haven't changed it
-- We can identify them by checking if they have default/temporary passwords
-- For now, we'll leave existing users alone and only apply to new admin-created users

DO $$
BEGIN
  RAISE NOTICE 'Added password change tracking columns to user_profiles';
  RAISE NOTICE 'must_change_password: Forces password change on login';
  RAISE NOTICE 'password_changed_at: Tracks when password was last updated';
END $$;

COMMIT;
