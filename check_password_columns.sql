-- Quick check if new columns exist
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'user_profiles' 
  AND column_name IN ('must_change_password', 'password_changed_at')
ORDER BY column_name;

-- If no results, the columns don't exist and migrations need to be run
