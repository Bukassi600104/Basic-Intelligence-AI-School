-- Comprehensive verification script for notification system
-- Run this in Supabase SQL Editor

-- 1. Check if all required tables exist
SELECT table_name, 'exists' as status
FROM information_schema.tables
WHERE table_name IN (
    'notification_templates',
    'notification_logs',
    'user_profiles',
    'email_logs'
)
AND table_schema = 'public';

-- 2. Check RLS policies (using correct column names)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN (
    'notification_templates',
    'notification_logs',
    'user_profiles',
    'email_logs'
)
ORDER BY tablename, policyname;

-- 3. Verify table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN (
    'notification_templates',
    'notification_logs',
    'user_profiles',
    'email_logs'
)
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 4. Check notification templates count
SELECT 
    category,
    COUNT(*) as template_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_templates
FROM notification_templates
GROUP BY category;

-- 5. Verify admin role function
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_name = 'has_admin_role'
AND routine_schema = 'public';

-- 6. Check for required indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN (
    'notification_templates',
    'notification_logs',
    'user_profiles',
    'email_logs'
)
ORDER BY tablename, indexname;

-- 7. Verify notification_logs structure specifically
SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'notification_logs'
    AND column_name IN (
        'id',
        'template_id',
        'recipient_type',
        'recipient_email',
        'recipient_phone',
        'status',
        'error_message',
        'created_at'
    )
) as has_required_columns;

-- 8. Check for missing RLS policies
SELECT 
    tables.table_name,
    CASE 
        WHEN policies.tablename IS NULL THEN 'Missing RLS'
        ELSE 'Has RLS'
    END as rls_status
FROM information_schema.tables tables
LEFT JOIN pg_policies policies 
    ON tables.table_name = policies.tablename
WHERE tables.table_name IN (
    'notification_templates',
    'notification_logs',
    'user_profiles',
    'email_logs'
)
AND tables.table_schema = 'public'
GROUP BY tables.table_name, policies.tablename;