-- COMPLETE Member ID System with Admin Separation
-- All-in-One Migration - Run this AFTER cleanup
-- Date: 2025-10-25

BEGIN;

DO $$
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MEMBER ID SYSTEM - COMPLETE SETUP';
  RAISE NOTICE '====================================================';
END $$;

-- =====================================================
-- PART 1: MEMBER ID COUNTER AND FUNCTIONS
-- =====================================================

-- Create member ID counter table
CREATE TABLE IF NOT EXISTS public.member_id_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  next_id INTEGER NOT NULL DEFAULT 1,
  last_assigned TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_counter_row CHECK (id = 1)
);

INSERT INTO public.member_id_counter (id, next_id, last_assigned) 
VALUES (1, 1, NULL)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.member_id_counter IS 'Counter for generating BI#### member IDs';

-- Function to generate next member ID
CREATE OR REPLACE FUNCTION public.generate_next_member_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  new_member_id TEXT;
BEGIN
  UPDATE public.member_id_counter
  SET next_id = next_id + 1, updated_at = NOW()
  WHERE id = 1
  RETURNING next_id - 1 INTO next_num;
  
  new_member_id := 'BI' || LPAD(next_num::TEXT, 4, '0');
  
  UPDATE public.member_id_counter
  SET last_assigned = new_member_id
  WHERE id = 1;
  
  RETURN new_member_id;
END;
$$ LANGUAGE plpgsql;

-- Function to preview next member ID
CREATE OR REPLACE FUNCTION public.get_next_member_id_preview()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT next_id INTO next_num FROM public.member_id_counter WHERE id = 1;
  RETURN 'BI' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to validate member ID format
CREATE OR REPLACE FUNCTION public.is_valid_member_id(member_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN member_id ~ '^BI[0-9]{4}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if member ID exists
CREATE OR REPLACE FUNCTION public.member_id_exists(check_member_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles WHERE member_id = check_member_id
  );
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE 'Created member ID counter and functions';
END $$;

-- =====================================================
-- PART 2: ADMIN TABLE AND FUNCTIONS
-- =====================================================

-- Create admin users table
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
  CONSTRAINT admin_users_admin_id_format_check CHECK (admin_id ~ '^ADMIN[0-9]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_admin_users_auth_user_id ON public.admin_users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_admin_id ON public.admin_users(admin_id);

COMMENT ON TABLE public.admin_users IS 'Administrators with ADMIN### IDs, separate from regular members';

-- Create admin ID counter
CREATE TABLE IF NOT EXISTS public.admin_id_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  next_id INTEGER NOT NULL DEFAULT 1,
  last_assigned TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_admin_counter_row CHECK (id = 1)
);

INSERT INTO public.admin_id_counter (id, next_id, last_assigned) 
VALUES (1, 1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Function to generate admin ID
CREATE OR REPLACE FUNCTION public.generate_next_admin_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  new_admin_id TEXT;
BEGIN
  UPDATE public.admin_id_counter
  SET next_id = next_id + 1, updated_at = NOW()
  WHERE id = 1
  RETURNING next_id - 1 INTO next_num;
  
  new_admin_id := 'ADMIN' || LPAD(next_num::TEXT, 3, '0');
  
  UPDATE public.admin_id_counter
  SET last_assigned = new_admin_id
  WHERE id = 1;
  
  RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql;

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

-- Enable RLS for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_can_view_all_admins" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_update_own_record" ON public.admin_users;
DROP POLICY IF EXISTS "admins_can_create_new_admins" ON public.admin_users;

CREATE POLICY "admins_can_view_all_admins" ON public.admin_users
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND is_active = true)
);

CREATE POLICY "admins_can_update_own_record" ON public.admin_users
FOR UPDATE USING (auth_user_id = auth.uid()) WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "admins_can_create_new_admins" ON public.admin_users
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid() AND is_active = true)
);

DO $$
BEGIN
  RAISE NOTICE 'Created admin_users table and functions';
END $$;

-- =====================================================
-- PART 3: MIGRATE ADMIN USERS
-- =====================================================

DO $$
DECLARE
  admin_record RECORD;
  admin_count INTEGER := 0;
  new_admin_id TEXT;
BEGIN
  RAISE NOTICE '--- Migrating admin users to admin_users table ---';
  
  FOR admin_record IN 
    SELECT id, email, full_name, phone, created_at, updated_at
    FROM public.user_profiles 
    WHERE role = 'admin'
    ORDER BY created_at ASC
  LOOP
    admin_count := admin_count + 1;
    new_admin_id := public.generate_next_admin_id();
    
    INSERT INTO public.admin_users (
      auth_user_id, admin_id, email, full_name, phone, created_at, updated_at
    )
    VALUES (
      admin_record.id, new_admin_id, admin_record.email, 
      admin_record.full_name, admin_record.phone, 
      admin_record.created_at, admin_record.updated_at
    )
    ON CONFLICT (auth_user_id) DO NOTHING;
    
    RAISE NOTICE 'Migrated: % → % (%)', admin_record.full_name, new_admin_id, admin_record.email;
  END LOOP;
  
  IF admin_count > 0 THEN
    DELETE FROM public.user_profiles WHERE role = 'admin';
    RAISE NOTICE 'Removed % admin user(s) from user_profiles', admin_count;
  END IF;
END $$;

-- =====================================================
-- PART 4: UPDATE USER_PROFILES FOR MEMBERS ONLY
-- =====================================================

-- Ensure member_id column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'member_id'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN member_id TEXT;
  END IF;
END $$;

-- Drop old constraints
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_member_id_unique;
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_member_id_format_check;

-- Add new constraints (BI#### only)
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_member_id_unique UNIQUE (member_id);

ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_member_id_format_check 
CHECK (member_id IS NULL OR member_id ~ '^BI[0-9]{4}$');

CREATE INDEX IF NOT EXISTS idx_user_profiles_member_id 
ON public.user_profiles(member_id) WHERE member_id IS NOT NULL;

COMMENT ON COLUMN public.user_profiles.member_id IS 'Member ID in BI#### format. Admins are in separate admin_users table.';

-- Create auto-assign trigger
CREATE OR REPLACE FUNCTION public.auto_assign_member_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_id IS NULL AND NEW.role != 'admin' THEN
    NEW.member_id := public.generate_next_member_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_assign_member_id ON public.user_profiles;

CREATE TRIGGER trigger_auto_assign_member_id
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_member_id();

DO $$
BEGIN
  RAISE NOTICE 'Updated user_profiles for member IDs only';
END $$;

-- =====================================================
-- PART 5: CREATE AUDIT AND HISTORY TABLES
-- =====================================================

-- Audit log for member ID assignments
CREATE TABLE IF NOT EXISTS public.member_id_assignment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  old_member_id TEXT,
  new_member_id TEXT,
  user_email TEXT,
  user_full_name TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_id_assignment_log_user_id ON public.member_id_assignment_log(user_id);
CREATE INDEX IF NOT EXISTS idx_member_id_assignment_log_assigned_at ON public.member_id_assignment_log(assigned_at DESC);

-- Upgrade history table
CREATE TABLE IF NOT EXISTS public.upgrade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  member_id TEXT,
  from_tier TEXT NOT NULL,
  to_tier TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_by UUID,
  amount_paid DECIMAL(10,2),
  days_credited INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upgrade_history_user_id ON public.upgrade_history(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_history_member_id ON public.upgrade_history(member_id);

ALTER TABLE public.upgrade_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own upgrade history" ON public.upgrade_history;
DROP POLICY IF EXISTS "Admins can view all upgrade history" ON public.upgrade_history;

CREATE POLICY "Users can view own upgrade history" ON public.upgrade_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all upgrade history" ON public.upgrade_history
FOR ALL USING (public.is_admin_user(auth.uid()));

DO $$
BEGIN
  RAISE NOTICE 'Created audit and history tables';
END $$;

-- =====================================================
-- PART 6: BACKFILL REGULAR MEMBERS
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
  member_count INTEGER := 0;
  new_member_id TEXT;
BEGIN
  RAISE NOTICE '--- Assigning member IDs to regular users ---';
  
  FOR user_record IN 
    SELECT id, email, full_name, role, created_at
    FROM public.user_profiles 
    WHERE member_id IS NULL
    ORDER BY created_at ASC
  LOOP
    member_count := member_count + 1;
    new_member_id := 'BI' || LPAD(member_count::TEXT, 4, '0');
    
    UPDATE public.user_profiles
    SET member_id = new_member_id
    WHERE id = user_record.id;
    
    -- Log assignment
    INSERT INTO public.member_id_assignment_log (
      user_id, old_member_id, new_member_id, user_email, user_full_name
    ) VALUES (
      user_record.id, NULL, new_member_id, user_record.email, user_record.full_name
    );
    
    RAISE NOTICE 'Assigned: % → % (%)', user_record.full_name, new_member_id, user_record.email;
  END LOOP;
  
  IF member_count > 0 THEN
    UPDATE public.member_id_counter
    SET next_id = member_count + 1,
        last_assigned = 'BI' || LPAD(member_count::TEXT, 4, '0'),
        updated_at = NOW()
    WHERE id = 1;
  END IF;
  
  RAISE NOTICE 'Assigned % member ID(s)', member_count;
END $$;

-- =====================================================
-- PART 7: FINAL SUMMARY
-- =====================================================

DO $$
DECLARE
  admin_count INTEGER;
  member_count INTEGER;
  last_admin_id TEXT;
  next_member_id TEXT;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.admin_users;
  SELECT COUNT(*) INTO member_count FROM public.user_profiles WHERE member_id IS NOT NULL;
  SELECT last_assigned INTO last_admin_id FROM public.admin_id_counter WHERE id = 1;
  next_member_id := public.get_next_member_id_preview();
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'MEMBER ID SYSTEM SETUP COMPLETE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Admin users (admin_users table): %', admin_count;
  RAISE NOTICE 'Last admin ID: %', COALESCE(last_admin_id, 'None');
  RAISE NOTICE '';
  RAISE NOTICE 'Regular members (user_profiles table): %', member_count;
  RAISE NOTICE 'Next member ID: %', next_member_id;
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Tables created: admin_users, member_id_counter, admin_id_counter';
  RAISE NOTICE 'Triggers active: auto_assign_member_id';
  RAISE NOTICE 'New users will automatically get member IDs';
  RAISE NOTICE '====================================================';
END $$;

COMMIT;
