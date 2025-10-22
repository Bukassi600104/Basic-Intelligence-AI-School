# Fix 500 Error - Admin Redirect Issue

## Problem Summary

When you try to login, you get **500 errors** trying to fetch user profiles:
```
Failed to load resource: the server responded with a status of 500
eremjpneqofidtktsfya.supabase.co/rest/v1/user_profiles?select=*&id=eq.aad258af-e1af-4b9b-bbb2-cea5757c2fd6
```

## Root Cause

**Circular Dependency in RLS Policies:**

1. Your RLS policies on `user_profiles` table use the function `has_admin_role()`
2. The `has_admin_role()` function queries the `user_profiles` table
3. This creates: **Policy → Function → Same Table → Policy** (infinite loop)
4. Postgres returns 500 error when it detects this circular dependency

### The Problematic Code

In `20251021000003_update_user_roles.sql`:
```sql
CREATE POLICY student_read_own ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id 
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up  -- ← Querying same table!
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );
```

## Solution

Run the clean fix SQL script that:
1. Drops ALL existing policies on `user_profiles`
2. Creates simple policies using only `auth.uid()` (no circular dependencies)
3. Keeps `has_admin_role()` function for use in OTHER tables' policies (not on user_profiles itself)

## How to Fix

### Step 1: Run the Fix Script

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file: `scripts/fix_rls_policies_clean.sql`
4. Copy all contents and paste into SQL Editor
5. Click **Run**

### Step 2: Verify the Fix

After running the script, you should see output showing:
- All old policies dropped
- New policies created successfully
- List of current policies (should be 5 policies)
- List of current users

### Step 3: Create Admin Account

Now that the database is fixed, create your admin account:

1. In Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   - Email: `bukassi@gmail.com`
   - Password: `12345678`
   - **Check** "Auto Confirm User"
4. Click **"Create User"**

### Step 4: Set Admin Role

1. Copy the user ID from the created user
2. Go to **SQL Editor**
3. Run this query (replace `USER_ID_HERE` with actual user ID):

```sql
-- Set admin role for bukassi@gmail.com
UPDATE public.user_profiles
SET 
  role = 'admin'::public.user_role,
  membership_status = 'active'::public.membership_status,
  is_active = true,
  full_name = 'Administrator',
  updated_at = NOW()
WHERE id = 'USER_ID_HERE';

-- Or use email if you don't have the ID handy
UPDATE public.user_profiles
SET 
  role = 'admin'::public.user_role,
  membership_status = 'active'::public.membership_status,
  is_active = true,
  full_name = 'Administrator',
  updated_at = NOW()
WHERE email = 'bukassi@gmail.com';

-- Verify
SELECT id, email, role, membership_status, is_active
FROM public.user_profiles
WHERE email = 'bukassi@gmail.com';
```

### Step 5: Test Login

1. Go to your app: https://yourdomain.vercel.app/signin
2. Login with:
   - Email: `bukassi@gmail.com`
   - Password: `12345678`
3. You should be automatically redirected to `/admin-dashboard`
4. No more 500 errors!

## What Changed

### Before (Broken)
```sql
-- This caused circular dependency
CREATE POLICY student_read_own ON public.user_profiles
    USING (
        auth.uid() = id 
        AND EXISTS (
            SELECT 1 FROM public.user_profiles -- ← Circular!
            WHERE up.id = auth.uid()
        )
    );
```

### After (Fixed)
```sql
-- Simple, no circular dependency
CREATE POLICY "users_select_own_profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);  -- ← Just check if it's the user's own record
```

## Why This Works

1. **No Circular Dependencies**: Policies only use `auth.uid()` directly, not functions that query the same table
2. **Still Secure**: Users can only access their own profile row (`auth.uid() = id`)
3. **Handles All Cases**: 
   - Admin users can read their profile
   - Student users can read their profile
   - Frontend can then check the `role` field to determine dashboard redirect

## Expected Behavior After Fix

1. ✅ No more 500 errors when fetching user profile
2. ✅ Login successfully loads user profile
3. ✅ Frontend reads `userProfile.role` to determine redirect
4. ✅ Admin users redirected to `/admin-dashboard`
5. ✅ Student users redirected to `/student-dashboard`

## Troubleshooting

### Still getting 500 errors?
- Check that you ran the ENTIRE fix script
- Verify in Supabase → Database → user_profiles → Policies tab
- Should see exactly 5 policies, none using `has_admin_role()`

### User profile not loading?
```sql
-- Check if user exists in both tables
SELECT 
  au.id,
  au.email,
  up.role,
  up.membership_status
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'bukassi@gmail.com';
```

### Redirect not working?
- Check browser console for the log: `"User profile loaded: { role: 'admin' }"`
- If you see the log but no redirect, issue is in frontend (SignInPage.jsx)
- If you don't see the log, user profile didn't load (database issue)

## Files Modified

1. `scripts/fix_rls_policies_clean.sql` - The complete fix
2. `FIX_500_ERROR_GUIDE.md` - This guide

## Next Steps After Fixing

Once admin login works:
1. Test student registration flow
2. Verify all dashboard features work
3. Check that admin can manage users
4. Test notification system

---

**Remember**: The key insight is that RLS policies on a table should NEVER query that same table. Always use direct `auth.uid()` checks for the table's own policies.
