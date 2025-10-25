-- Check if admin still exists in user_profiles
SELECT 
  id,
  email,
  full_name,
  role,
  member_id,
  membership_status,
  created_at
FROM user_profiles
WHERE role = 'admin' OR email = 'bukassi@gmail.com';

-- Also check auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'bukassi@gmail.com';
