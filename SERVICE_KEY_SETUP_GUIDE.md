# Supabase Service Key Setup Guide

## Problem
The admin user creation was failing with "User not allowed" because the Supabase Admin API requires a **service key** with elevated privileges, not the regular anon key.

## Solution
We've created a separate Supabase admin client that uses the service key for Admin API operations.

## How to Set Up the Service Key

### Step 1: Get Your Service Key
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/[your-project-id]
2. Navigate to **Settings** → **API**
3. In the **Project API keys** section, find the **service_role** key
4. Copy the **service_role** key (it starts with `eyJ...`)

### Step 2: Add Service Key to Environment
Add the service key to your `.env` file:

```env
VITE_SUPABASE_SERVICE_KEY=your-service-key-here
```

**Important Security Notes:**
- The service key has **elevated privileges** and should **NEVER** be exposed to the frontend
- In production, this should be handled by a backend service
- For this MVP, we're using it carefully in the admin service with proper error handling

### Step 3: Deploy to Vercel
If deploying to Vercel, add the service key to your environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add `VITE_SUPABASE_SERVICE_KEY` with your service key value

## What Changed

### New Files:
- `src/lib/supabaseAdmin.js` - Admin client using service key

### Modified Files:
- `src/services/adminService.js` - Now uses admin client for Admin API operations

## How It Works

### Before (Problem):
- Admin API calls used the regular client with anon key
- Anon key doesn't have permissions for `supabase.auth.admin.createUser()`
- Result: "User not allowed" error

### After (Solution):
- Admin API calls use the admin client with service key
- Service key has elevated privileges for user management
- Result: Admin can create users successfully

## Security Considerations

The service key implementation is designed to be secure:

1. **Limited Scope**: Only used for specific admin operations
2. **Server-Side Only**: In production, this should be moved to a backend API
3. **Error Handling**: Proper error handling and cleanup
4. **No Frontend Exposure**: Service key is never exposed to the browser

## Testing

After setting up the service key:

1. **Apply RLS Fix**: Run `apply_rls_fix_final.sql` in Supabase SQL Editor
2. **Test Admin User Creation**: 
   - Go to `/admin-users`
   - Click "Add User"
   - Create a test user - it should work without errors

## Troubleshooting

### If you still get "User not allowed":
1. **Verify Service Key**: Make sure you're using the **service_role** key, not the anon key
2. **Check Environment**: Ensure `VITE_SUPABASE_SERVICE_KEY` is set correctly
3. **Restart Development Server**: Restart your dev server after adding the environment variable

### If you get "Missing Supabase service key":
- The environment variable `VITE_SUPABASE_SERVICE_KEY` is not set
- Add it to your `.env` file and restart the development server

## Next Steps for Production

For production deployment, consider:

1. **Backend API**: Move admin operations to a secure backend API
2. **Role-Based Access**: Implement proper role-based access control
3. **Audit Logging**: Add audit logging for admin operations
4. **Rate Limiting**: Implement rate limiting for user creation
