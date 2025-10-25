-- Verify admin was inserted correctly
SELECT 
  id,
  auth_user_id,
  admin_id,
  email,
  full_name,
  phone,
  is_active,
  created_at,
  updated_at
FROM admin_users
WHERE email = 'bukassi@gmail.com' OR auth_user_id = 'aad258af-e1af-4b9b-bbb2-cea5757c2fd6';

-- Also check what the AuthContext should see
SELECT 
  'admin' as role,
  auth_user_id as id,
  email,
  full_name,
  phone,
  admin_id as member_id,
  is_active,
  'active' as membership_status,
  'admin' as membership_tier,
  created_at,
  updated_at
FROM admin_users
WHERE auth_user_id = 'aad258af-e1af-4b9b-bbb2-cea5757c2fd6';
