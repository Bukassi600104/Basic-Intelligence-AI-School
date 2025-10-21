-- Enhanced RLS policies for notification system

-- 1. Allow users to read their own notifications
DROP POLICY IF EXISTS users_read_own_notifications ON notification_logs;
CREATE POLICY users_read_own_notifications
ON notification_logs
FOR SELECT
TO authenticated
USING (
    recipient_id = auth.uid() OR
    (has_admin_role() AND recipient_id IS NOT NULL)
);

-- 2. Allow admins to create notifications
DROP POLICY IF EXISTS admin_create_notifications ON notification_logs;
CREATE POLICY admin_create_notifications
ON notification_logs
FOR INSERT
TO authenticated
WITH CHECK (has_admin_role());

-- 3. Allow admins to update notification status
DROP POLICY IF EXISTS admin_update_notifications ON notification_logs;
CREATE POLICY admin_update_notifications
ON notification_logs
FOR UPDATE
TO authenticated
USING (has_admin_role())
WITH CHECK (has_admin_role());

-- 4. Allow admins to manage templates with additional checks
DROP POLICY IF EXISTS admin_manage_templates ON notification_templates;
CREATE POLICY admin_manage_templates
ON notification_templates
FOR ALL
TO authenticated
USING (
    (has_admin_role() AND is_active = true) OR
    (SELECT has_admin_role())
)
WITH CHECK (has_admin_role());

-- 5. Enable RLS on all notification-related tables
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- 6. Verify setup with test queries
-- Test as admin
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.role" TO 'admin';
SELECT COUNT(*) as admin_visible_count FROM notification_logs;

-- Test as regular user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.role" TO 'user';
SELECT COUNT(*) as user_visible_count 
FROM notification_logs 
WHERE recipient_id = auth.uid();

RESET ROLE;