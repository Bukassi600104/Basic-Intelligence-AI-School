-- Test Member Registration Flow
-- Run BEFORE registration to see current state
-- Then run AFTER registration to verify new member

-- Part 1: Check Counter State
SELECT 
  'Counter State' as check_type,
  next_id,
  last_assigned,
  updated_at
FROM member_id_counter;

-- Part 2: Check All Members in user_profiles
SELECT 
  'Existing Members' as check_type,
  member_id,
  email,
  full_name,
  role,
  membership_status,
  membership_tier,
  created_at
FROM user_profiles
WHERE role = 'student'
ORDER BY created_at DESC;

-- Part 3: Check auth.users count (total registered users)
SELECT 
  'Auth Users Count' as check_type,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as confirmed_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unconfirmed_users
FROM auth.users;

-- Part 4: Check most recent registrations (top 3)
SELECT 
  'Recent Registrations' as check_type,
  au.email,
  au.created_at as auth_created_at,
  au.email_confirmed_at,
  up.member_id,
  up.full_name,
  up.membership_status,
  up.membership_tier
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC
LIMIT 3;

-- Part 5: Check member_id_assignment_log (last 3 assignments)
SELECT 
  'Assignment Log' as check_type,
  user_email,
  user_full_name,
  old_member_id,
  new_member_id,
  assigned_at
FROM member_id_assignment_log
ORDER BY assigned_at DESC
LIMIT 3;
