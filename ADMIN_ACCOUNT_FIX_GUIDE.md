# Admin Account Fix Guide
## Complete Process to Delete Student Account and Create Admin Account

### **Objective**
Delete the existing student account with email `bukassi@gmail.com` and create a fresh admin account with the same email and password `12345678`.

### **Prerequisites**
- Access to Supabase dashboard with service role privileges
- Your application deployed and accessible

### **Step-by-Step Process**

#### **Step 1: Check Current State**
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the following query to check current state:
```sql
SELECT 
    'Current user state:' as info,
    up.id as user_profile_id,
    up.email,
    up.role,
    up.membership_status,
    au.id as auth_user_id,
    au.email as auth_email
FROM public.user_profiles up
FULL JOIN auth.users au ON up.id = au.id
WHERE up.email = 'bukassi@gmail.com' OR au.email = 'bukassi@gmail.com';
```

#### **Step 2: Delete Existing Account Data**
Run this SQL in Supabase SQL Editor (requires service role):

```sql
-- Delete related data (if user exists)
DO $$
DECLARE
    user_id_to_delete uuid;
BEGIN
    -- Get the user ID if it exists
    SELECT id INTO user_id_to_delete 
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    IF user_id_to_delete IS NOT NULL THEN
        RAISE NOTICE 'Deleting data for user: %', user_id_to_delete;
        
        -- Delete from related tables
        DELETE FROM public.memberships WHERE user_id = user_id_to_delete;
        DELETE FROM public.payments WHERE user_id = user_id_to_delete;
        DELETE FROM public.reviews WHERE user_id = user_id_to_delete;
        DELETE FROM public.referrals WHERE referrer_id = user_id_to_delete OR referred_id = user_id_to_delete;
        DELETE FROM public.notifications WHERE user_id = user_id_to_delete;
        
        -- Delete user profile
        DELETE FROM public.user_profiles WHERE id = user_id_to_delete;
        
        RAISE NOTICE 'Deleted all data for user: %', user_id_to_delete;
    ELSE
        RAISE NOTICE 'No user profile found to delete';
    END IF;
END $$;

-- Delete auth user (if exists)
DO $$
DECLARE
    auth_user_id_to_delete uuid;
BEGIN
    -- Get the auth user ID if it exists
    SELECT id INTO auth_user_id_to_delete 
    FROM auth.users 
    WHERE email = 'bukassi@gmail.com';
    
    IF auth_user_id_to_delete IS NOT NULL THEN
        RAISE NOTICE 'Deleting auth user: %', auth_user_id_to_delete;
        
        -- Delete auth user (requires service role)
        DELETE FROM auth.users WHERE id = auth_user_id_to_delete;
        
        RAISE NOTICE 'Deleted auth user: %', auth_user_id_to_delete;
    ELSE
        RAISE NOTICE 'No auth user found to delete';
    END IF;
END $$;
```

#### **Step 3: Create New Admin Account**
1. **Go to your application's signup page**
2. **Use these credentials to sign up:**
   - **Email:** `bukassi@gmail.com`
   - **Password:** `12345678`

3. **Complete the signup process**

#### **Step 4: Update User to Admin Role**
After successful signup, run this SQL in Supabase:

```sql
-- Update user to admin role
DO $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Get the newly created user ID
    SELECT id INTO new_user_id 
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    IF new_user_id IS NOT NULL THEN
        -- Update to admin role
        UPDATE public.user_profiles 
        SET 
            role = 'admin',
            membership_status = 'active',
            membership_tier = 'elite',
            member_id = 'ADMIN001',
            full_name = 'Admin User',
            updated_at = NOW()
        WHERE id = new_user_id;
        
        RAISE NOTICE 'Updated user to admin role: %', new_user_id;
        
        -- Create membership record
        INSERT INTO public.memberships (
            user_id,
            tier,
            status,
            start_date,
            end_date,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            'elite',
            'active',
            NOW(),
            NULL,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created admin membership record';
    ELSE
        RAISE NOTICE 'No user found to update to admin role';
    END IF;
END $$;
```

#### **Step 5: Verify Admin Account**
Run this verification query:

```sql
SELECT 
    'Final verification:' as info,
    up.id,
    up.email,
    up.role,
    up.membership_status,
    up.membership_tier,
    up.member_id,
    m.status as membership_record_status
FROM public.user_profiles up
LEFT JOIN public.memberships m ON up.id = m.user_id
WHERE up.email = 'bukassi@gmail.com';
```

**Expected Result:**
- `role` should be `admin`
- `membership_status` should be `active`
- `membership_tier` should be `elite`
- `member_id` should be `ADMIN001`

#### **Step 6: Test Admin Access**
1. **Sign out** of your application (if currently signed in)
2. **Sign in** with:
   - **Email:** `bukassi@gmail.com`
   - **Password:** `12345678`

3. **Verify:**
   - You should be automatically redirected to `/admin-dashboard`
   - The header should show "Administrator" role
   - All admin features should be accessible

### **Troubleshooting**

#### **If signup fails:**
- Check if the email was completely deleted in Step 2
- Try using a different browser or incognito mode
- Clear browser cache and cookies

#### **If redirection fails:**
- Check browser console for debugging logs
- Verify the user profile has `role = 'admin'`
- Check the `apply_admin_account_fix.sql` file for complete SQL script

#### **If admin features are not accessible:**
- Verify the user profile has correct role and membership status
- Check that the membership record was created
- Ensure the application has the latest code deployed

### **Files Created**
- `apply_admin_account_fix.sql` - Complete SQL script for execution
- `supabase/migrations/20251021000005_delete_student_create_admin.sql` - Migration file
- `ADMIN_ACCOUNT_FIX_GUIDE.md` - This guide

### **Next Steps**
1. Execute the SQL scripts in Supabase dashboard
2. Create the admin account through application signup
3. Test the admin dashboard access
4. Remove debugging code if no longer needed

### **Important Notes**
- This process **completely deletes** all data associated with the existing student account
- The new admin account will have a fresh start with no previous data
- Make sure you have service role access in Supabase for the deletion steps
- Test thoroughly in production environment
