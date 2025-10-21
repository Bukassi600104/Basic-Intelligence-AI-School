-- Verify notification system setup

-- 1. Check notification_logs table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification_logs'
ORDER BY ordinal_position;

-- 2. Verify RLS is enabled
SELECT 
    tablename,
    CASE WHEN relrowsecurity THEN 'enabled' ELSE 'disabled' END as rls_status
FROM pg_tables
JOIN pg_class ON pg_tables.tablename = pg_class.relname
WHERE tablename IN ('notification_logs', 'notification_templates', 'user_profiles');

-- 3. Test admin role function
SELECT has_admin_role() as is_admin;

-- 4. Verify notification template categories
SELECT 
    category,
    COUNT(*) as template_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM notification_templates
GROUP BY category
ORDER BY category;

-- 5. Check for any orphaned notification logs
SELECT COUNT(*) as orphaned_count
FROM notification_logs nl
LEFT JOIN user_profiles up ON nl.recipient_id = up.id
WHERE up.id IS NULL;

-- 6. Verify policy permissions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('notification_logs', 'notification_templates', 'user_profiles')
ORDER BY tablename, policyname;

-- 7. Test notifications access for non-admin user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" TO '00000000-0000-0000-0000-000000000000';
SELECT COUNT(*) as visible_notifications 
FROM notification_logs 
WHERE recipient_id = auth.uid();
RESET ROLE;

-- 8. Performance check for common queries
EXPLAIN ANALYZE
SELECT nl.*, nt.name as template_name
FROM notification_logs nl
JOIN notification_templates nt ON nl.template_id = nt.id
WHERE nl.recipient_id = auth.uid()
ORDER BY nl.created_at DESC
LIMIT 10;