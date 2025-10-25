-- Migration: Separate Admin Users into Admin Table
-- Creates dedicated admin_users table and migrates admin users
-- Date: 2025-10-25
-- IMPORTANT: Run AFTER 20251025100000_member_id_system.sql and BEFORE backfill

BEGIN;

-- =====================================================
-- 1. CREATE ADMIN USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure admin_id follows ADMIN### format
  CONSTRAINT admin_users_admin_id_format_check CHECK (admin_id ~ '^ADMIN[0-9]{3}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_admin_id ON public.admin_users(admin_id);

-- Add comments
COMMENT ON TABLE public.admin_users IS 'Administrators with elevated privileges. Separate from regular members.';
COMMENT ON COLUMN public.admin_users.admin_id IS 'Unique admin identifier in ADMIN### format';

-- =====================================================
-- 2. CREATE ADMIN ID COUNTER
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_id_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  next_id INTEGER NOT NULL DEFAULT 1,
  last_assigned TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_admin_counter_row CHECK (id = 1)
);

-- Insert initial counter value
INSERT INTO public.admin_id_counter (id, next_id, last_assigned) 
VALUES (1, 1, NULL)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.admin_id_counter IS 'Counter for generating ADMIN### IDs';

-- =====================================================
-- 3. CREATE FUNCTION TO GENERATE ADMIN ID
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_next_admin_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  new_admin_id TEXT;
BEGIN
  -- Get and increment the counter atomically
  UPDATE public.admin_id_counter
  SET next_id = next_id + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING next_id - 1 INTO next_num;
  
  -- Generate admin ID in ADMIN### format (3 digits, zero-padded)
  new_admin_id := 'ADMIN' || LPAD(next_num::TEXT, 3, '0');
  
  -- Update last assigned
  UPDATE public.admin_id_counter
  SET last_assigned = new_admin_id
  WHERE id = 1;
  
  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.generate_next_admin_id() IS 'Generates next available admin ID in ADMIN### format';

-- =====================================================
-- 4. MIGRATE EXISTING ADMIN USERS
-- =====================================================
DO $$
DECLARE
  admin_record RECORD;
  admin_count INTEGER := 0;
  new_admin_id TEXT;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MIGRATING ADMIN USERS TO ADMIN TABLE';
  RAISE NOTICE '====================================================';
  
  -- Find all admin users in user_profiles
  FOR admin_record IN 
    SELECT id, email, full_name, phone, created_at, updated_at
    FROM public.user_profiles 
    WHERE role = 'admin'
    ORDER BY created_at ASC
  LOOP
    admin_count := admin_count + 1;
    
    -- Generate admin ID
    new_admin_id := public.generate_next_admin_id();
    
    -- Insert into admin_users table
    INSERT INTO public.admin_users (
      auth_user_id, 
      admin_id, 
      email, 
      full_name, 
      phone,
      created_at,
      updated_at
    )
    VALUES (
      admin_record.id,  -- Use user_profile id as auth_user_id
      new_admin_id,
      admin_record.email,
      admin_record.full_name,
      admin_record.phone,
      admin_record.created_at,
      admin_record.updated_at
    )
    ON CONFLICT (auth_user_id) DO NOTHING;  -- Skip if already migrated
    
    RAISE NOTICE 'Migrated admin: % → % (%)', 
      admin_record.full_name, new_admin_id, admin_record.email;
  END LOOP;
  
  IF admin_count = 0 THEN
    RAISE NOTICE 'No admin users found to migrate';
  ELSE
    RAISE NOTICE 'Successfully migrated % admin user(s)', admin_count;
  END IF;
  
  RAISE NOTICE '====================================================';
END $$;

-- =====================================================
-- 5. DELETE ADMIN USERS FROM USER_PROFILES
-- =====================================================
DO $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete admin users from user_profiles
  WITH deleted AS (
    DELETE FROM public.user_profiles 
    WHERE role = 'admin'
    RETURNING id, email, full_name
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Removed % admin user(s) from user_profiles table', deleted_count;
  ELSE
    RAISE NOTICE 'No admin users to remove from user_profiles';
  END IF;
END $$;

-- =====================================================
-- 6. UPDATE USER_PROFILES TO ONLY ALLOW MEMBER IDS
-- =====================================================
-- Drop old constraint if it exists
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_member_id_format_check;

-- Add new constraint that ONLY allows BI#### format (no ADMIN###)
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_member_id_format_check 
CHECK (member_id IS NULL OR member_id ~ '^BI[0-9]{4}$');

COMMENT ON CONSTRAINT user_profiles_member_id_format_check ON public.user_profiles 
IS 'Ensures member_id follows BI#### format. Admin users are in separate admin_users table.';

-- =====================================================
-- 7. UPDATE MEMBER ID VALIDATION FUNCTION
-- =====================================================
-- Update the validation function to clarify usage
CREATE OR REPLACE FUNCTION public.is_valid_member_id(member_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only validates BI#### format for regular members
  -- Admin IDs (ADMIN###) are validated separately in admin_users table
  RETURN member_id ~ '^BI[0-9]{4}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.is_valid_member_id(member_id TEXT) 
IS 'Validates member ID format (BI#### only). Admin IDs validated separately.';

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS FOR ADMIN TABLE
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE auth_user_id = check_user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get admin by admin_id
CREATE OR REPLACE FUNCTION public.get_admin_by_id(search_admin_id TEXT)
RETURNS TABLE (
  id UUID,
  admin_id TEXT,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  is_active BOOLEAN,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.admin_id,
    a.email,
    a.full_name,
    a.phone,
    a.is_active,
    a.last_login,
    a.created_at
  FROM public.admin_users a
  WHERE a.admin_id = search_admin_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. CREATE RLS POLICIES FOR ADMIN TABLE
-- =====================================================

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can view all admin records
CREATE POLICY "admins_can_view_all_admins" ON public.admin_users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- Admins can update their own record
CREATE POLICY "admins_can_update_own_record" ON public.admin_users
FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Only existing admins can insert new admins
CREATE POLICY "admins_can_create_new_admins" ON public.admin_users
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- =====================================================
-- 10. UPDATE AUTH TRIGGER TO HANDLE ADMIN CREATION
-- =====================================================

-- Function to auto-create admin profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is an admin user (you'll need to set user metadata)
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    INSERT INTO public.admin_users (auth_user_id, admin_id, email, full_name)
    VALUES (
      NEW.id,
      public.generate_next_admin_id(),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Administrator')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger should be created on auth.users, but we don't have permission
-- Instead, handle admin creation manually in your application code

-- =====================================================
-- 11. VERIFICATION AND SUMMARY
-- =====================================================
DO $$
DECLARE
  admin_count INTEGER;
  member_count INTEGER;
  next_admin_id TEXT;
  next_member_id TEXT;
BEGIN
  -- Count admins and members
  SELECT COUNT(*) INTO admin_count FROM public.admin_users;
  SELECT COUNT(*) INTO member_count FROM public.user_profiles;
  
  -- Get next IDs
  SELECT last_assigned INTO next_admin_id FROM public.admin_id_counter WHERE id = 1;
  next_member_id := public.get_next_member_id_preview();
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'ADMIN/MEMBER SEPARATION COMPLETED';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Admin users (admin_users table): %', admin_count;
  RAISE NOTICE 'Regular members (user_profiles table): %', member_count;
  RAISE NOTICE 'Last admin ID assigned: %', COALESCE(next_admin_id, 'None yet');
  RAISE NOTICE 'Next member ID will be: %', next_member_id;
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'IMPORTANT: user_profiles now only accepts BI#### format';
  RAISE NOTICE 'IMPORTANT: Admin users are in separate admin_users table';
  RAISE NOTICE '====================================================';
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION NOTES
-- =====================================================
-- 1. Admin users are now in public.admin_users table with ADMIN### IDs
-- 2. Regular members remain in public.user_profiles with BI#### IDs
-- 3. user_profiles constraint now ONLY allows BI#### format
-- 4. Admin creation must be handled in application code
-- 5. Use is_admin_user(uuid) to check if a user is an admin
-- 6. Update your application's adminService to use admin_users table
