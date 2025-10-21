-- Fix user account creation policies
-- Description: This script fixes user registration issues by setting up proper RLS policies
--             and creating necessary triggers for automatic profile creation
-- Author: Basic Intelligence Community School
-- Date: October 21, 2025
-- Version: 1.0

-- !!! IMPORTANT: Run this script in the Supabase SQL Editor !!!
-- Make sure you have admin access before running this script

-- 1. Enable RLS on user_profiles table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for new user registration
CREATE POLICY "enable_user_registration" ON public.user_profiles
FOR INSERT 
TO authenticated
WITH CHECK (
    auth.uid() = id -- Ensure users can only create their own profile
    AND NOT EXISTS ( -- Prevent duplicate profiles
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid()
    )
);

-- 3. Update existing policies if needed
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;

-- 4. Ensure users can read their own profiles
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
CREATE POLICY "users_read_own_profile" ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 5. Allow users to update their own profiles
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile" ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 6. Allow admins full access
DROP POLICY IF EXISTS "admin_full_access_user_profiles" ON public.user_profiles;
CREATE POLICY "admin_full_access_user_profiles" ON public.user_profiles
FOR ALL
TO authenticated
USING (has_admin_role())
WITH CHECK (has_admin_role());

-- 7. Allow public to view basic user info
DROP POLICY IF EXISTS "public_read_user_basic_info" ON public.user_profiles;
CREATE POLICY "public_read_user_basic_info" ON public.user_profiles
FOR SELECT
TO public
USING (is_active = true);

-- 8. Verify user_profiles structure
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 9. Create trigger to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, is_active)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        'user',
        true
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();