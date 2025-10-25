-- Migration: Member ID System with Auto-Generation
-- Implements BI#### format member IDs with automatic assignment
-- Date: 2025-10-25

BEGIN;

-- =====================================================
-- 1. CREATE MEMBER ID COUNTER TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.member_id_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  next_id INTEGER NOT NULL DEFAULT 1,
  last_assigned TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_counter_row CHECK (id = 1)
);

-- Insert initial counter value
INSERT INTO public.member_id_counter (id, next_id, last_assigned) 
VALUES (1, 1, NULL)
ON CONFLICT (id) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.member_id_counter IS 'Stores the next available member ID counter for BI#### format generation';

-- =====================================================
-- 2. CREATE FUNCTION TO GENERATE NEXT MEMBER ID
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_next_member_id()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  new_member_id TEXT;
BEGIN
  -- Get and increment the counter atomically
  UPDATE public.member_id_counter
  SET next_id = next_id + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING next_id - 1 INTO next_num;
  
  -- Generate member ID in BI#### format (4 digits, zero-padded)
  new_member_id := 'BI' || LPAD(next_num::TEXT, 4, '0');
  
  -- Update last assigned
  UPDATE public.member_id_counter
  SET last_assigned = new_member_id
  WHERE id = 1;
  
  RETURN new_member_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment
COMMENT ON FUNCTION public.generate_next_member_id() IS 'Generates next sequential member ID in BI#### format (e.g., BI0001, BI0002)';

-- =====================================================
-- 3. CREATE FUNCTION TO VALIDATE MEMBER ID FORMAT
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_valid_member_id(member_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if format matches BI#### (BI followed by 4 digits) OR ADMIN### (ADMIN followed by 3 digits)
  RETURN member_id ~ '^(BI[0-9]{4}|ADMIN[0-9]{3})$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 4. UPDATE USER_PROFILES CONSTRAINTS
-- =====================================================

-- Drop old constraint if exists
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_member_id_key;

-- Ensure member_id column exists (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'member_id'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN member_id TEXT;
  END IF;
END $$;

-- Drop existing constraints if they exist (for re-running migration)
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_member_id_unique;

ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_member_id_format_check;

-- Add unique constraint for member_id
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_member_id_unique UNIQUE (member_id);

-- Add check constraint for format validation (allows both BI#### and ADMIN### initially)
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_member_id_format_check 
CHECK (member_id IS NULL OR is_valid_member_id(member_id));

-- Add index for fast member_id lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_member_id 
ON public.user_profiles(member_id) 
WHERE member_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.user_profiles.member_id IS 'Unique member identifier. Format: BI#### for regular members, ADMIN### for admins. Auto-generated on user creation. Required for login.';

-- =====================================================
-- 5. CREATE TRIGGER FOR AUTO MEMBER ID ASSIGNMENT
-- =====================================================

-- Function to auto-assign member ID on user creation
CREATE OR REPLACE FUNCTION public.auto_assign_member_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if member_id is not already set
  IF NEW.member_id IS NULL THEN
    NEW.member_id := public.generate_next_member_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_assign_member_id ON public.user_profiles;

-- Create trigger that fires BEFORE INSERT
CREATE TRIGGER trigger_auto_assign_member_id
  BEFORE INSERT ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_member_id();

-- Add comment
COMMENT ON FUNCTION public.auto_assign_member_id() IS 'Automatically assigns member ID to new users on registration';

-- =====================================================
-- 6. CREATE UPGRADE HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.upgrade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  member_id TEXT,
  from_tier TEXT NOT NULL,
  to_tier TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  amount_paid DECIMAL(10,2),
  days_credited INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_upgrade_history_user_id ON public.upgrade_history(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_history_member_id ON public.upgrade_history(member_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_history_created_at ON public.upgrade_history(created_at);

-- Enable RLS
ALTER TABLE public.upgrade_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own upgrade history" ON public.upgrade_history;
DROP POLICY IF EXISTS "Admins can view all upgrade history" ON public.upgrade_history;

-- RLS Policies
CREATE POLICY "Users can view own upgrade history" ON public.upgrade_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all upgrade history" ON public.upgrade_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE public.upgrade_history IS 'Audit trail of all membership tier upgrades';

-- =====================================================
-- 7. UPDATE SUBSCRIPTION_REQUESTS TABLE
-- =====================================================

-- Add columns for wizard functionality
ALTER TABLE public.subscription_requests
ADD COLUMN IF NOT EXISTS assigned_member_id TEXT,
ADD COLUMN IF NOT EXISTS upgrade_effective_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS previous_tier TEXT,
ADD COLUMN IF NOT EXISTS days_credited INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_proof_required BOOLEAN DEFAULT true;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_subscription_requests_assigned_member_id 
ON public.subscription_requests(assigned_member_id);

-- Add comments
COMMENT ON COLUMN public.subscription_requests.assigned_member_id IS 'Member ID assigned during approval wizard';
COMMENT ON COLUMN public.subscription_requests.payment_proof_required IS 'Whether payment proof is required for approval';

-- =====================================================
-- 8. ADD SUBSCRIPTION_EXPIRY TO USER_PROFILES
-- =====================================================

-- Ensure subscription_expiry exists (might already exist in some migrations)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'subscription_expiry'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN subscription_expiry TIMESTAMPTZ;
  END IF;
END $$;

-- Add index for expiry lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_expiry 
ON public.user_profiles(subscription_expiry) 
WHERE subscription_expiry IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.user_profiles.subscription_expiry IS 'Date when membership subscription expires';

-- =====================================================
-- 9. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get next available member ID (without incrementing counter)
CREATE OR REPLACE FUNCTION public.get_next_member_id_preview()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT next_id INTO next_num FROM public.member_id_counter WHERE id = 1;
  RETURN 'BI' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to check if member ID exists
CREATE OR REPLACE FUNCTION public.member_id_exists(check_member_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles WHERE member_id = check_member_id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get member by member ID
CREATE OR REPLACE FUNCTION public.get_member_by_member_id(search_member_id TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  member_id TEXT,
  membership_tier TEXT,
  membership_status TEXT,
  subscription_expiry TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.member_id,
    up.membership_tier,
    up.membership_status::TEXT,
    up.subscription_expiry
  FROM public.user_profiles up
  WHERE up.member_id = search_member_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. CREATE AUDIT LOG TABLE FOR MEMBER ID ASSIGNMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.member_id_assignment_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  old_member_id TEXT,
  new_member_id TEXT,
  user_email TEXT,
  user_full_name TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for queries
CREATE INDEX IF NOT EXISTS idx_member_id_assignment_log_user_id 
ON public.member_id_assignment_log(user_id);

CREATE INDEX IF NOT EXISTS idx_member_id_assignment_log_assigned_at 
ON public.member_id_assignment_log(assigned_at DESC);

-- Add comment
COMMENT ON TABLE public.member_id_assignment_log IS 'Audit log of all member ID assignments and changes';

-- =====================================================
-- 11. LOG MIGRATION COMPLETION
-- =====================================================
DO $$
DECLARE
  counter_value INTEGER;
  preview_id TEXT;
BEGIN
  SELECT next_id INTO counter_value FROM public.member_id_counter WHERE id = 1;
  preview_id := public.get_next_member_id_preview();
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Member ID System Migration Completed Successfully';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Counter initialized at: %', counter_value;
  RAISE NOTICE 'Next member ID will be: %', preview_id;
  RAISE NOTICE 'Auto-assignment trigger: ACTIVE';
  RAISE NOTICE 'Upgrade history tracking: ENABLED';
  RAISE NOTICE 'Audit log table: CREATED';
  RAISE NOTICE '====================================================';
END $$;

COMMIT;
