-- VACUUM operations for notification system
-- IMPORTANT: Run these commands one at a time, NOT in a transaction block

-- 1. Clean up old notifications (optional - run this first if needed)
-- DELETE FROM notification_logs
-- WHERE created_at < NOW() - INTERVAL '90 days'
-- AND status IN ('sent', 'failed');

-- 2. VACUUM FULL with ANALYZE for complete cleanup
-- Run these commands individually:

VACUUM (FULL, ANALYZE) notification_logs;

VACUUM (FULL, ANALYZE) notification_templates;

-- Note: VACUUM FULL will lock the tables and rewrite them entirely.
-- Only run during maintenance windows when the system can be offline.