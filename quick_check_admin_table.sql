-- Quick check: Does admin_users table exist?
-- Run this first before anything else

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin_users'
) AS admin_users_exists;

-- If FALSE, you need to run: 20251025110000_complete_member_id_system.sql
-- If TRUE, check if admin record exists:

SELECT 
  COUNT(*) as admin_count,
  ARRAY_AGG(admin_id) as admin_ids,
  ARRAY_AGG(email) as emails
FROM admin_users;
