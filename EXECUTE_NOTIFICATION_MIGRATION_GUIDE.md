# 🚀 EXECUTE NOTIFICATION MIGRATION GUIDE

## 🔧 Problem Identified

The notification wizard is failing because the required database tables don't exist in your live Supabase database. The migration script needs to be executed.

## 📋 Step-by-Step Instructions

### Step 1: Execute the Migration Script

1. **Go to your Supabase dashboard** at https://supabase.com/dashboard
2. **Select your project** (Basic Intelligence AI School)
3. **Click on "SQL Editor"** in the left sidebar
4. **Copy the entire content** of the `apply_notification_migration.sql` file
5. **Paste it into the SQL Editor**
6. **Click "Run"** to execute the script

### Step 2: Verify Migration Success

After executing the script, run these verification queries in the SQL Editor:

```sql
-- Check if notification_templates table exists and has data
SELECT COUNT(*) FROM notification_templates; -- Should return 4

-- Check if notification_logs table exists
SELECT COUNT(*) FROM notification_logs; -- Should return 0 (empty)

-- Check if whatsapp_phone column was added to user_profiles
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'whatsapp_phone';

-- Check if default templates were inserted
SELECT name, category, is_active FROM notification_templates;
```

**Expected Results:**
- ✅ `notification_templates` count: 4
- ✅ `notification_logs` count: 0
- ✅ `whatsapp_phone` column exists in `user_profiles`
- ✅ 4 default templates visible

### Step 3: Test the Notification Wizard

1. **Go to your live application**
2. **Login as admin**
3. **Navigate to `/admin-notification-wizard`**
4. **Verify the page loads without errors**
5. **Check that the template dropdown shows 4 options**
6. **Test user selection and notification sending**

## 🎯 What the Migration Script Does

The script creates:

1. **`notification_templates` table** with 4 default templates:
   - Welcome Email
   - Welcome WhatsApp  
   - Password Reset
   - Subscription Reminder

2. **`notification_logs` table** for tracking sent notifications

3. **`whatsapp_phone` column** in user_profiles table

4. **RLS Policies** for admin-only access to notification tables

5. **Performance indexes** for optimal query performance

## 🛠️ Troubleshooting

### If you get errors during migration:

1. **Check if tables already exist** - The script uses `IF NOT EXISTS` so it's safe to run multiple times
2. **Verify RLS functions exist** - The script depends on `public.has_admin_role()` function
3. **Check for syntax errors** - The script has been tested and should work correctly

### If the wizard still shows errors:

1. **Check browser console** for JavaScript errors
2. **Verify admin access** - Make sure you're logged in as admin
3. **Test API endpoints** - Check if the notification service API calls are working

## ✅ Success Indicators

After successful migration:

- ✅ Notification wizard loads without "Something went wrong" error
- ✅ Template dropdown shows 4 default templates
- ✅ User list loads properly
- ✅ You can select users and send notifications
- ✅ No JavaScript errors in browser console

## 📞 Need Help?

If you encounter any issues during the migration:

1. **Copy any error messages** from the SQL Editor
2. **Check the browser console** for JavaScript errors
3. **Verify your Supabase project settings** and environment variables

The migration script is designed to be idempotent (safe to run multiple times) and will only create what doesn't already exist.
