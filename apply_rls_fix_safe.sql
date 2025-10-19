-- Apply RLS Fix for Admin User Creation - Safe Version
-- This script uses conditional creation to avoid duplicate policy errors
-- Safe to run multiple times - won't fail if policies already exist

-- Fix RLS policies to allow admin user creation
-- This migration addresses the "new row violates row-level security policy" error

-- Drop the problematic policies if they exist
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_full_access_user_profiles" ON public.user_profiles;

-- Create new, more specific policies for user_profiles table
-- Using CREATE POLICY IF NOT EXISTS to avoid duplicate errors

-- Policy 1: Users can read their own profiles
CREATE POLICY IF NOT EXISTS "users_read_own_profile" ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 2: Users can update their own profiles
CREATE POLICY IF NOT EXISTS "users_update_own_profile" ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 3: Admins have full access to all user profiles (including INSERT)
CREATE POLICY IF NOT EXISTS "admin_full_access_user_profiles" ON public.user_profiles
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Policy 4: Allow users to insert their own profile (for the trigger)
CREATE POLICY IF NOT EXISTS "users_insert_own_profile" ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Policy 5: Allow public to read basic user info for published content
CREATE POLICY IF NOT EXISTS "public_read_user_basic_info" ON public.user_profiles
FOR SELECT
TO public
USING (is_active = true);

-- Create a function to check if user can create profiles (for admin operations)
CREATE OR REPLACE FUNCTION public.can_create_user_profile()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT public.has_admin_role()
$$;

-- Add a comment explaining the RLS policies
COMMENT ON TABLE public.user_profiles IS 'User profiles with RLS policies allowing: users to manage own profiles, admins full access, and public read for active users';

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Display success message
SELECT 'RLS policies successfully updated for user_profiles table' as status;
