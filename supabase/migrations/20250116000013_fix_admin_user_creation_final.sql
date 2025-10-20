-- Final fix for admin user creation RLS policies
-- This migration ensures admins can create users with any ID (not just their own)

-- Drop the conflicting INSERT policy for users
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;

-- Create a new INSERT policy specifically for admins that allows any ID
CREATE POLICY "admin_insert_user_profiles" ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_role());

-- Ensure the admin full access policy covers all operations
DROP POLICY IF EXISTS "admin_full_access_user_profiles" ON public.user_profiles;

-- Recreate the admin full access policy with proper permissions
CREATE POLICY "admin_full_access_user_profiles" ON public.user_profiles
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Add comment explaining the policies
COMMENT ON TABLE public.user_profiles IS 'User profiles with RLS policies: users manage own profiles, admins have full access including creating users with any ID';
