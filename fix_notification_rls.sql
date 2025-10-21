-- Fix RLS policies for notification system

-- 1. First verify admin role function exists and works
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- 2. First add recipient_id column to notification_logs if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'notification_logs' 
        AND column_name = 'recipient_id'
    ) THEN
        ALTER TABLE notification_logs
        ADD COLUMN recipient_id UUID REFERENCES user_profiles(id);
    END IF;
END $$;

-- 3. Update existing notification logs to include recipient_id
UPDATE notification_logs nl
SET recipient_id = up.id
FROM user_profiles up
WHERE nl.recipient_email = up.email
AND nl.recipient_id IS NULL;

-- 4. Create index for notification lookups (now that column exists)
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient
ON notification_logs(recipient_id);

-- 5. Add policy for users to view their own notifications
DROP POLICY IF EXISTS users_read_own_notifications ON notification_logs;
CREATE POLICY users_read_own_notifications
ON notification_logs
FOR SELECT
TO authenticated
USING (recipient_id = auth.uid());

-- 6. Update the users_insert_own_profile policy with proper qualification
DROP POLICY IF EXISTS users_insert_own_profile ON user_profiles;
CREATE POLICY users_insert_own_profile
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- 7. Add policy for admins to manage templates
DROP POLICY IF EXISTS admin_only_notification_templates ON notification_templates;
CREATE POLICY admin_only_notification_templates
ON notification_templates
FOR ALL
TO authenticated
USING (has_admin_role())
WITH CHECK (has_admin_role());