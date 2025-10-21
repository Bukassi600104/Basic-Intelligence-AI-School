-- Verification Script for Notification Migration
-- Run this in Supabase SQL Editor after executing the migration

-- 1. Check if notification_templates table exists and has data
SELECT 
    'notification_templates' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) = 4 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM notification_templates;

-- 2. Check if notification_logs table exists
SELECT 
    'notification_logs' as table_name,
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM notification_logs;

-- 3. Check if whatsapp_phone column exists in user_profiles
SELECT 
    'user_profiles.whatsapp_phone' as column_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'whatsapp_phone'
    ) THEN '✅ PASS' ELSE '❌ FAIL' END as status;

-- 4. List all notification templates
SELECT name, category, type, is_active 
FROM notification_templates 
ORDER BY category, name;

-- 5. Check RLS policies for notification tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('notification_templates', 'notification_logs')
ORDER BY tablename, policyname;

-- 6. Check indexes for performance
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('notification_templates', 'notification_logs', 'user_profiles')
AND indexname LIKE 'idx_notification%' OR indexname LIKE 'idx_user_profiles_whatsapp%'
ORDER BY tablename, indexname;

-- 7. Verify the has_admin_role function exists (required for RLS)
SELECT 
    'has_admin_role function' as function_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'has_admin_role'
    ) THEN '✅ PASS' ELSE '❌ FAIL' END as status;
