-- COMPREHENSIVE DATABASE TABLES CHECK
-- Run this in Supabase SQL Editor to see all tables and their structure

-- ============================================================
-- 1. List all tables in the public schema
-- ============================================================
SELECT 
    '========== ALL TABLES IN DATABASE ==========' as info;

SELECT 
    schemaname as schema,
    tablename as table_name,
    tableowner as owner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================
-- 2. Check notification_templates table
-- ============================================================
SELECT 
    '========== NOTIFICATION TEMPLATES ==========' as info;

SELECT 
    name as template_name,
    subject,
    category,
    is_active,
    created_at
FROM notification_templates
ORDER BY category, name;

-- Show count
SELECT 
    'Total notification templates:' as info,
    COUNT(*) as count
FROM notification_templates;

-- ============================================================
-- 3. Check user_profiles table structure
-- ============================================================
SELECT 
    '========== USER_PROFILES TABLE STRUCTURE ==========' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Show sample data
SELECT 
    '========== USER_PROFILES SAMPLE DATA ==========' as info;

SELECT 
    id,
    email,
    full_name,
    role,
    membership_status,
    membership_tier,
    must_change_password,
    password_changed_at,
    created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================
-- 4. Check admin_users table
-- ============================================================
SELECT 
    '========== ADMIN USERS ==========' as info;

SELECT 
    admin_id,
    email,
    full_name,
    is_active,
    created_at
FROM admin_users
ORDER BY created_at DESC;

-- ============================================================
-- 5. Check content_library table
-- ============================================================
SELECT 
    '========== CONTENT LIBRARY ==========' as info;

SELECT 
    title,
    content_type,
    access_level,
    status,
    category,
    created_at
FROM content_library
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- 6. Check courses table
-- ============================================================
SELECT 
    '========== COURSES ==========' as info;

SELECT 
    title,
    level,
    status,
    is_featured,
    instructor_id,
    created_at
FROM courses
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- 7. Check subscription_requests table
-- ============================================================
SELECT 
    '========== SUBSCRIPTION REQUESTS ==========' as info;

SELECT 
    user_id,
    request_type,
    current_tier,
    requested_tier,
    status,
    created_at
FROM subscription_requests
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- 8. Check notification_logs table
-- ============================================================
SELECT 
    '========== RECENT NOTIFICATION LOGS ==========' as info;

SELECT 
    user_id,
    template_name,
    status,
    error_message,
    sent_at
FROM notification_logs
ORDER BY sent_at DESC
LIMIT 10;

-- ============================================================
-- 9. Check member_reviews table
-- ============================================================
SELECT 
    '========== MEMBER REVIEWS ==========' as info;

SELECT 
    user_id,
    rating,
    status,
    created_at
FROM member_reviews
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- 10. Check RLS policies on key tables
-- ============================================================
SELECT 
    '========== RLS POLICIES ==========' as info;

SELECT 
    schemaname as schema,
    tablename as table,
    policyname as policy_name,
    cmd as command,
    roles::text as roles
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'admin_users', 'notification_templates', 'content_library')
ORDER BY tablename, policyname;

-- ============================================================
-- 11. Check triggers
-- ============================================================
SELECT 
    '========== TRIGGERS ==========' as info;

SELECT 
    trigger_name,
    event_manipulation as event,
    event_object_table as table_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
OR event_object_schema = 'auth'
ORDER BY event_object_table;

-- ============================================================
-- 12. Summary
-- ============================================================
SELECT 
    '========== DATABASE SUMMARY ==========' as info;

-- Count tables
WITH table_counts AS (
    SELECT 'Total tables' as metric, COUNT(*)::text as value
    FROM pg_tables WHERE schemaname = 'public'
    UNION ALL
    SELECT 'User profiles', COUNT(*)::text FROM user_profiles
    UNION ALL
    SELECT 'Admin users', COUNT(*)::text FROM admin_users
    UNION ALL
    SELECT 'Notification templates', COUNT(*)::text FROM notification_templates
    UNION ALL
    SELECT 'Content items', COUNT(*)::text FROM content_library
    UNION ALL
    SELECT 'Courses', COUNT(*)::text FROM courses
    UNION ALL
    SELECT 'Notification logs', COUNT(*)::text FROM notification_logs
)
SELECT * FROM table_counts;

-- Final message
SELECT 
    '========================================' as summary
UNION ALL SELECT '     DATABASE CHECK COMPLETE'
UNION ALL SELECT '========================================';
