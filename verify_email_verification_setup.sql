-- Quick verification: Check if email_verification_tokens table exists
-- Run this in Supabase SQL Editor first

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'email_verification_tokens'
    ) 
    THEN '✅ Table EXISTS - Migration already applied'
    ELSE '❌ Table MISSING - Need to apply migration from file: supabase/migrations/20250130000001_email_verification_system.sql'
  END AS migration_status;

-- If table exists, check its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'email_verification_tokens'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  policyname,
  cmd AS operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END AS using_check
FROM pg_policies
WHERE tablename = 'email_verification_tokens';

-- Check email templates
SELECT 
  name,
  category,
  is_active,
  created_at
FROM notification_templates
WHERE name IN ('Email Verification OTP', 'Registration Thank You')
ORDER BY name;
