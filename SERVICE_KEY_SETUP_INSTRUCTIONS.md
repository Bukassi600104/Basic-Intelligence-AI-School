# Supabase Service Role Key Setup Instructions

## Why You Need the Service Key

The service role key is required for:
- **Complete user deletion** from both `user_profiles` and `auth.users`
- **Checking for existing auth users** before creating new ones
- **Creating auth users** when creating user profiles
- **Preventing email conflicts** like "A user with this email address has already been registered"

## How to Get Your Service Role Key

### Step 1: Access Your Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **eremjpneqofidtktsfya**

### Step 2: Navigate to Settings
1. In your project dashboard, click on **Settings** in the left sidebar
2. Select **API** from the settings menu

### Step 3: Find Your Service Role Key
1. Look for the **Service Role Key** section
2. Copy the key (it starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 4: Update Your Environment File
1. Open your `.env` file
2. Replace this line:
   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key-here
   ```
3. With your actual service key:
   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
   ```

## Important Security Notes

⚠️ **WARNING**: The service role key has **full admin access** to your database. Keep it secure:
- Never commit it to public repositories
- Only use it in server-side code or secure environments
- Your `.env` file should be in `.gitignore`

## Immediate Manual Cleanup (Alternative)

If you can't get the service key immediately, you can manually clean up orphaned auth users:

### Step 1: Identify Orphaned Users
Run this SQL in your Supabase SQL Editor:
```sql
SELECT 
    au.id as auth_user_id,
    au.email,
    au.created_at as auth_created
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
```

### Step 2: Delete Specific Orphaned Users
For each conflicting email, run:
```sql
DELETE FROM auth.users 
WHERE email = 'conflicting-email@example.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = auth.users.id
);
```

### Step 3: Test User Creation
Try creating users with the previously conflicting emails - they should now work.

## After Service Key Configuration

Once you configure the service key:

1. **Restart your development server**
2. **Test user deletion** - users should be completely removed from both tables
3. **Test user creation** - no more email conflicts
4. **The system will automatically prevent** future orphaned users

## Verification

After setup, you can verify it's working by:

1. **Creating a test user** - should work without conflicts
2. **Deleting the test user** - should completely disappear
3. **Creating another user with the same email** - should work

## Troubleshooting

If you still get errors after configuring the service key:

1. **Check the key format** - it should be a long JWT token
2. **Verify the project URL** matches your Supabase project
3. **Restart your development server** to reload environment variables
4. **Check browser console** for any error messages

## Long-term Solution

Once configured, the system will:
- ✅ Automatically delete users from both tables
- ✅ Prevent email conflicts during user creation
- ✅ Clean up orphaned auth users automatically
- ✅ Provide complete user management functionality
