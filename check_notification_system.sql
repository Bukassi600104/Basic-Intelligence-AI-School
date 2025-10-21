-- Regular maintenance operations (can run in transaction)
BEGIN;

-- 1. Update table statistics
ANALYZE notification_logs;
ANALYZE notification_templates;

-- 2. Report table sizes and bloat
SELECT 
    schemaname,
    relname,
    n_live_tup,
    n_dead_tup,
    last_autovacuum
FROM pg_stat_user_tables
WHERE relname IN ('notification_logs', 'notification_templates');

-- 3. Report index sizes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE tablename IN ('notification_logs', 'notification_templates')
ORDER BY tablename, indexname;

-- 4. Check for orphaned records
SELECT COUNT(*) as orphaned_notifications
FROM notification_logs nl
LEFT JOIN user_profiles up ON nl.recipient_id = up.id
WHERE up.id IS NULL;

COMMIT;