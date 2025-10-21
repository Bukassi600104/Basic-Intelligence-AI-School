# Quick Admin Account Fix Guide
## Simple Steps to Fix the Duplicate Key Error

### **Problem Identified:**
The previous script failed because:
- The user profile with ID `32739535-755e-40a7-bb5f-06a866bd30d9` already exists
- The deletion step didn't work properly
- The script tried to insert a user profile with an existing ID

### **Solution: Manual Cleanup + Simple Approach**

#### **Step 1: Delete the Existing User Manually**
Run this SQL in Supabase SQL Editor:

```sql
-- Delete the specific user profile that's causing the conflict
DELETE FROM public.user_profiles WHERE id = '32739535-755e-40a7-bb5f-06a866bd30d9';

-- Delete the auth user (if it exists)
DELETE FROM auth.users WHERE email = 'bukassi@gmail.com';

-- Verify deletion
SELECT * FROM public.user_profiles WHERE email = 'bukassi@gmail.com';
SELECT * FROM auth.users WHERE email = 'bukassi@gmail.com';
```

#### **Step 2: Create Admin Account Through Application**
1. **Go to your application's signup page**
2. **Use these credentials:**
   - **Email:** `bukassi@gmail.com`
   - **Password:** `12345678`
3. **Complete the signup process**

#### **Step 3: Update to Admin Role**
After successful signup, run this SQL:

```sql
-- Update the new user to admin role
UPDATE public.user_profiles 
SET 
    role = 'admin',
    membership_status = 'active',
    membership_tier = 'elite',
    member_id = 'ADMIN001',
    full_name = 'Admin User',
    updated_at = NOW()
WHERE email = 'bukassi@gmail.com';

-- Create membership record
INSERT INTO public.memberships (
    user_id,
    tier,
    status,
    start_date,
    end_date,
    created_at,
    updated_at
) 
SELECT 
    id,
    'elite',
    'active',
    NOW(),
    NULL,
    NOW(),
    NOW()
FROM public.user_profiles 
WHERE email = 'bukassi@gmail.com';

-- Verify admin account
SELECT 
    'Admin account verification:' as info,
    id,
    email,
    role,
    membership_status,
    membership_tier,
    member_id
FROM public.user_profiles 
WHERE email = 'bukassi@gmail.com';
```

### **Alternative: Complete Reset Script**
If the manual approach doesn't work, use this complete script:

```sql
-- Complete Admin Account Reset Script
BEGIN;

-- Step 1: Delete all data for the user
DELETE FROM public.memberships WHERE user_id IN (SELECT id FROM public.user_profiles WHERE email = 'bukassi@gmail.com');
DELETE FROM public.payments WHERE user_id IN (SELECT id FROM public.user_profiles WHERE email = 'bukassi@gmail.com');
DELETE FROM public.user_profiles WHERE email = 'bukassi@gmail.com';
DELETE FROM auth.users WHERE email = 'bukassi@gmail.com';

-- Step 2: Verify deletion
SELECT 'After deletion - user_profiles:' as info, COUNT(*) FROM public.user_profiles WHERE email = 'bukassi@gmail.com';
SELECT 'After deletion - auth.users:' as info, COUNT(*) FROM auth.users WHERE email = 'bukassi@gmail.com';

COMMIT;

-- Step 3: Create account through application signup
-- Step 4: Run the admin role update SQL above
```

### **Expected Results:**
- **After Step 1:** Both queries should return 0 rows
- **After Step 3:** User should be able to sign up successfully
- **After Step 4:** User should have role = 'admin' and membership_status = 'active'

### **Troubleshooting:**
- **If signup fails:** The user wasn't properly deleted - run the deletion SQL again
- **If update fails:** The user profile doesn't exist - check if signup was successful
- **If still issues:** Use the complete reset script above

### **Quick Test:**
After completing all steps:
1. Sign out of your application
2. Sign in with `bukassi@gmail.com` / `12345678`
3. You should be redirected to the admin dashboard
4. Check browser console for debugging logs

This manual approach bypasses the complex migration issues and directly addresses the duplicate key problem.
