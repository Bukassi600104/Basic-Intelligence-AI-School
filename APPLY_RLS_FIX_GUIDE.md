# How to Apply RLS Fix for Admin User Creation

## Problem
You're getting the error: "Failed to create user: new row violates row-level security policy for table 'user_profiles'" when trying to create new users as an admin.

## Solution
Apply the RLS policy fix that allows admin users to create user profiles for other users.

## Method 1: Apply via Supabase Dashboard (Recommended)

### Steps:
1. **Go to Supabase Dashboard**
   - Navigate to your project at: https://supabase.com/dashboard/project/[your-project-id]

2. **Open SQL Editor**
   - In the left sidebar, click on "SQL Editor"
   - Click "New Query"

3. **Copy and Run the Fix**
   - Copy the entire contents of `apply_rls_fix.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)

4. **Verify Success**
   - You should see a success message: "RLS policies successfully updated for user_profiles table"
   - The query results should show the new policies

## Method 2: Apply via Supabase CLI (If Installed)

### Steps:
1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref [your-project-ref]
   ```

4. **Apply the migration**
   ```bash
   supabase db push
   ```

## What This Fix Does

### Before (Problematic Policies):
- `users_manage_own_user_profiles` - Only allows users to manage their own profiles
- `admin_full_access_user_profiles` - Uses `is_admin_from_auth()` which doesn't work properly for INSERT operations

### After (Fixed Policies):
- `users_read_own_profile` - Users can read their own profiles
- `users_update_own_profile` - Users can update their own profiles  
- `admin_full_access_user_profiles` - Admins have full access (including INSERT) using `has_admin_role()`
- `users_insert_own_profile` - Users can insert their own profiles (for auth triggers)
- `public_read_user_basic_info` - Public can read basic info for active users

## Testing the Fix

After applying the fix:

1. **Go to Admin Dashboard**
   - Navigate to `/admin-users`
   - Click "Add User"

2. **Create a Test User**
   - Fill in the required fields (email, full name)
   - Set role to "student" or "admin"
   - Click "Create User"

3. **Expected Result**
   - User should be created successfully
   - No RLS policy violation errors

## Troubleshooting

### If the error persists:
1. **Check Admin Role**: Ensure your user account has the 'admin' role in the `user_profiles` table
2. **Verify Policies**: Run this query in SQL Editor to check current policies:
   ```sql
   SELECT schemaname, tablename, policyname, cmd, qual, with_check 
   FROM pg_policies 
   WHERE tablename = 'user_profiles';
   ```
3. **Check Function**: Verify the `has_admin_role()` function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'has_admin_role';
   ```

### If you need to revert:
You can restore the original policies by running:
```sql
-- Drop the new policies
DROP POLICY IF EXISTS "users_read_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_full_access_user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "public_read_user_basic_info" ON public.user_profiles;

-- Restore original policies
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());
```

## Support
If you continue to experience issues, please contact technical support with:
- The exact error message
- Steps to reproduce
- Your Supabase project ID
