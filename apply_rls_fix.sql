-- Apply RLS Fix for Admin User Creation
-- This script applies the RLS policy fix to allow admin users to create user profiles

-- Fix RLS policies to allow admin user creation
-- This migration addresses the "new row violates row-level security policy" error

-- Drop the problematic policies
DROP POLICY IF EXISTS "users_manage_own_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_full_access_user_profiles" ON public.user_profiles;

-- Create new, more specific policies for user_profiles table

-- Policy 1: Users can read and update their own profiles
CREATE POLICY "users_read_own_profile" ON public.user_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "users_update_own_profile" ON public.user_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 2: Admins have full access to all user profiles (including INSERT)
CREATE POLICY "admin_full_access_user_profiles" ON public.user_profiles
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Policy 3: Allow users to insert their own profile (for the trigger)
CREATE POLICY "users_insert_own_profile" ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Policy 4: Allow public to read basic user info for published content
CREATE POLICY "public_read_user_basic_info" ON public.user_profiles
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
