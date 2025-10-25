-- Manually insert admin into admin_users table
-- This is needed because the migration didn't properly migrate the admin

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MANUALLY INSERTING ADMIN INTO admin_users TABLE';
  RAISE NOTICE '====================================================';
END $$;

-- First, ensure the admin_id_counter is initialized
INSERT INTO public.admin_id_counter (id, next_id, last_assigned) 
VALUES (1, 1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Generate the admin ID (ADMIN001)
DO $$
DECLARE
  new_admin_id TEXT;
  admin_auth_id UUID := 'aad258af-e1af-4b9b-bbb2-cea5757c2fd6';
  admin_email TEXT := 'bukassi@gmail.com';
BEGIN
  -- Generate ADMIN001
  new_admin_id := generate_next_admin_id();
  
  -- Insert admin into admin_users table
  INSERT INTO public.admin_users (
    auth_user_id,
    admin_id,
    email,
    full_name,
    phone,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    admin_auth_id,
    new_admin_id,
    admin_email,
    'Admin User', -- Update this if you know the full name
    NULL, -- Update this if you know the phone
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_user_id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  RAISE NOTICE 'Admin inserted: % with ID: %', admin_email, new_admin_id;
END $$;

-- Verify the insertion
DO $$
DECLARE
  admin_count INTEGER;
  admin_id_val TEXT;
  admin_email_val TEXT;
BEGIN
  SELECT COUNT(*), MAX(admin_id), MAX(email) 
  INTO admin_count, admin_id_val, admin_email_val
  FROM public.admin_users;
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'ADMIN INSERTION COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Total admins: %', admin_count;
  RAISE NOTICE 'Admin ID: %', admin_id_val;
  RAISE NOTICE 'Admin Email: %', admin_email_val;
  RAISE NOTICE '====================================================';
END $$;

COMMIT;
