# Admin User Creation Fix Guide

## Problem
When trying to create a new user from the admin dashboard, you get the error:
```
Failed to create user: User not allowed
```

## Root Causes
1. **Service Key Variable Name Mismatch**: The code was using `VITE_SUPABASE_SERVICE_KEY` but the actual variable on Vercel is `VITE_SUPABASE_SERVICE_ROLE_KEY`
2. **RLS Policy Conflict**: The current Row Level Security policies prevent admins from creating users with IDs different from their own

## Solution Steps

### Step 1: Verify Service Key is Configured

The service key should already be configured on Vercel as `VITE_SUPABASE_SERVICE_ROLE_KEY`. Verify this in your Vercel dashboard under Environment Variables.

If you need to add it locally for development:
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings > API**
4. Copy the `service_role` key (starts with `eyJ...`)
5. Open your `.env` file and replace the placeholder:
   ```
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-actual-service-key-here
   ```

### Step 2: Apply the Database Migration

1. Run the new migration to fix RLS policies:
   ```sql
   -- The migration file is located at:
   -- supabase/migrations/20250116000013_fix_admin_user_creation_final.sql
   ```

2. You can apply this migration through:
   - Supabase dashboard SQL Editor
   - Supabase CLI: `supabase db push`
   - Your preferred database management tool

### Step 3: Restart Your Development Server

After updating the `.env` file, restart your development server:
```bash
npm run dev
```

## What Was Fixed

### 1. Admin Service Improvements
- Added proper error handling for missing service key
- Using admin client (`supabaseAdmin`) for all user creation operations to bypass RLS
- Better error messages for debugging

### 2. RLS Policy Fixes
- Removed conflicting `users_insert_own_profile` policy that only allowed users to insert their own profiles
- Created new `admin_insert_user_profiles` policy that allows admins to insert any user profile
- Ensured admin full access policy covers all operations properly

## Testing the Fix

1. Navigate to the admin dashboard
2. Go to User Management
3. Click "Add User"
4. Fill in the required fields (email and full name)
5. Submit the form

You should now see:
- Success message: "User created successfully! They can now sign up with their email."
- The new user appears in the user list

## Troubleshooting

### If you still get errors:

1. **Check Service Key**: Ensure the service key is correctly set in your `.env` file
2. **Verify Migration**: Confirm the RLS policies were applied successfully
3. **Check Admin Role**: Make sure you're logged in as an admin user
4. **Browser Console**: Check for any JavaScript errors in the browser console

### Common Error Messages:

- **"Admin service key not configured"**: Service key is missing from `.env`
- **"User with this email already exists"**: Email is already registered
- **"new row violates row-level security policy"**: RLS policies still need to be fixed

## Security Note

The service key has elevated privileges and should:
- Never be committed to public repositories
- Only be used server-side (though in this case it's needed client-side for admin operations)
- Be rotated regularly for security

## Files Modified

- `.env` - Added service key placeholder
- `src/services/adminService.js` - Improved user creation logic
- `supabase/migrations/20250116000013_fix_admin_user_creation_final.sql` - Fixed RLS policies
