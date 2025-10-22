# CRITICAL FIX REQUIRED - READ THIS FIRST

## The Problem You're Experiencing

❌ **500 Errors** when trying to login
❌ **Cannot fetch user profile** from database
❌ **User stays on signin page** with spinner running
❌ **No redirect to admin dashboard**

## Root Cause Identified

Your Supabase database has a **circular dependency** in the Row Level Security (RLS) policies:

```
RLS Policy on user_profiles table
    ↓ (uses function)
has_admin_role() function
    ↓ (queries)
user_profiles table
    ↓ (triggers)
RLS Policy (infinite loop!)
```

This causes Postgres to return **500 Internal Server Error**.

## The Fix (3 Simple Steps)

### Step 1: Run the SQL Fix Script

1. Open **Supabase Dashboard** → Go to your project
2. Click **SQL Editor** in left sidebar
3. Open this file on your computer: `scripts/fix_rls_policies_clean.sql`
4. **Copy all the content** from that file
5. **Paste** into Supabase SQL Editor
6. Click **RUN** button
7. Wait for success message

### Step 2: Create Admin User

1. In Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"** button
3. Fill in:
   - Email: `bukassi@gmail.com`
   - Password: `12345678`
   - ✅ Check "Auto Confirm User"
4. Click **"Create User"**

### Step 3: Set Admin Role

1. In Supabase Dashboard → **SQL Editor**
2. Run this query:

```sql
UPDATE public.user_profiles
SET 
  role = 'admin'::public.user_role,
  membership_status = 'active'::public.membership_status,
  is_active = true,
  full_name = 'Administrator'
WHERE email = 'bukassi@gmail.com';

-- Verify it worked
SELECT email, role, membership_status FROM public.user_profiles WHERE email = 'bukassi@gmail.com';
```

## Test It

1. Go to your website: `yourdomain.vercel.app/signin`
2. Login with:
   - Email: `bukassi@gmail.com`
   - Password: `12345678`
3. ✅ Should redirect to `/admin-dashboard` immediately
4. ✅ No more 500 errors!

## What Gets Fixed

✅ No more 500 errors when fetching user profile
✅ Login works correctly
✅ Automatic redirect to admin dashboard
✅ All authentication flows restored

## Need More Details?

Read the complete guide: `FIX_500_ERROR_GUIDE.md`

## Why This Happened

The migration script `20251021000003_update_user_roles.sql` created RLS policies that reference the same table they're protecting, causing a circular dependency. The fix removes this circular reference while maintaining security.

---

**Time to fix:** ~5 minutes
**Complexity:** Copy/paste SQL and click Run
**Risk:** None - this fixes broken functionality
