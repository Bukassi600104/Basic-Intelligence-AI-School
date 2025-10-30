# Admin User Email Notification Setup

**Date:** October 30, 2025  
**Purpose:** Ensure admin-created users receive the same welcome emails as self-registered users

---

## 🎯 What Changed

Admin-created users now receive **two email notifications**:

1. **"Registration Thank You"** - Same welcome email that self-registered users get
2. **"Admin Created Account"** - Special email with login credentials and temporary password

---

## 📋 Setup Steps

### Step 1: Apply Database Migration

Run the migration to add the new email template:

```sql
-- Copy and paste this into Supabase SQL Editor
-- File: supabase/migrations/add_admin_created_account_template.sql

INSERT INTO notification_templates (name, subject, content, category, is_active, created_at, updated_at)
VALUES (
  'Admin Created Account',
  'Your Basic Intelligence Account Has Been Created',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4F46E5;">Welcome to Basic Intelligence!</h2>
    <p>Hi {{full_name}},</p>
    <p>An administrator has created an account for you on Basic Intelligence, your gateway to AI education excellence!</p>
    
    <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="color: #4F46E5; margin-top: 0;">Your Login Credentials</h3>
      <p style="margin: 10px 0;"><strong>Email:</strong> {{email}}</p>
      <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #E5E7EB; padding: 4px 8px; border-radius: 4px; font-size: 14px;">{{temporary_password}}</code></p>
      <p style="margin: 10px 0; color: #DC2626; font-weight: 600;">⚠️ You will be required to change this password on your first login.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
        Login to Your Account
      </a>
    </div>

    <h3 style="color: #1F2937;">What You Can Do:</h3>
    <ul style="line-height: 1.8; color: #4B5563;">
      <li>Access exclusive AI learning resources and courses</li>
      <li>Download our comprehensive prompt library</li>
      <li>Track your learning progress</li>
      <li>Connect with our AI learning community</li>
    </ul>

    <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #92400E;">
        <strong>Security Tip:</strong> For your security, please change your temporary password immediately after logging in. Choose a strong, unique password.
      </p>
    </div>

    <p>If you have any questions or need assistance, please don''t hesitate to reach out to our support team.</p>
    
    <p>We''re excited to have you join our community!</p>
    <p><strong>The Basic Intelligence Team</strong></p>
    
    <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
    <p style="color: #6B7280; font-size: 12px;">
      This is an automated message from Basic Intelligence. If you did not expect this email, please contact our support team immediately.
    </p>
  </div>',
  'authentication',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (name) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  updated_at = NOW();
```

### Step 2: Verify Template Creation

```sql
-- Check that the template was created
SELECT name, subject, category, is_active 
FROM notification_templates 
WHERE name = 'Admin Created Account';

-- Should return:
-- name: 'Admin Created Account'
-- subject: 'Your Basic Intelligence Account Has Been Created'
-- category: 'authentication'
-- is_active: true
```

### Step 3: Deploy Code Changes

```bash
# Pull latest changes
git pull origin main

# Verify changes
git log --oneline -3
# Should see: "Add email notifications for admin-created users"

# Deploy to Vercel (automatic if connected)
# Or manually: vercel --prod
```

---

## 🧪 Testing the Email Flow

### Test 1: Create User via Admin Dashboard

1. Go to `/admin-dashboard` → "Add User"
2. Fill in user details:
   - Email: test@example.com
   - Full Name: Test User
   - Role: Student
   - Membership Tier: Starter
3. Complete wizard and create user
4. Check browser console for logs:
   ```
   ✅ Welcome email sent (Registration Thank You template)
   ✅ Admin-created account credentials email sent
   ```

### Test 2: Check User's Email Inbox

User should receive **TWO emails**:

**Email 1: "Welcome to Basic Intelligence!"**
- Subject: Welcome to Basic Intelligence!
- Template: Registration Thank You
- Content: Welcome message, dashboard link, community intro

**Email 2: "Your Basic Intelligence Account Has Been Created"**
- Subject: Your Basic Intelligence Account Has Been Created
- Template: Admin Created Account
- Content: Login credentials, temporary password, security warning

### Test 3: User Login Flow

1. New user receives emails
2. User clicks "Login to Your Account" in email
3. User signs in with email + temporary password
4. **Redirected to `/force-password-change`**
5. User sets new password
6. User is redirected to dashboard

---

## 📧 Email Template Variables

### Registration Thank You Template
```javascript
{
  full_name: 'John Doe',
  email: 'john@example.com',
  member_id: 'BKO-123456',
  membership_tier: 'starter',
  dashboard_url: 'https://basicintelligence.vercel.app/dashboard'
}
```

### Admin Created Account Template
```javascript
{
  full_name: 'John Doe',
  email: 'john@example.com',
  temporary_password: 'SecureTemp123!',
  login_url: 'https://basicintelligence.vercel.app/signin',
  dashboard_url: 'https://basicintelligence.vercel.app/dashboard'
}
```

---

## 🔍 Troubleshooting

### Issue: Emails Not Sending

**Check 1: Email Service Configuration**
```javascript
// In browser console (dev mode):
console.log('Email Service:', import.meta.env.VITE_RESEND_API_KEY ? 'Configured' : 'Missing');
```

**Check 2: Template Exists**
```sql
SELECT * FROM notification_templates 
WHERE name IN ('Registration Thank You', 'Admin Created Account');
```

**Check 3: Notification Logs**
```sql
SELECT recipient_email, template_name, status, error_message, created_at
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

### Issue: "Template not found" Error

**Solution:** Run the migration again
```sql
-- Delete and recreate
DELETE FROM notification_templates WHERE name = 'Admin Created Account';

-- Then run INSERT from Step 1 again
```

### Issue: Email Sent But User Didn't Receive

**Check 1: Email in Development Mode**
In development, check browser console for alert popup with OTP/credentials.

**Check 2: Email Logs**
```sql
SELECT * FROM notification_logs 
WHERE recipient_email = 'user@example.com'
ORDER BY created_at DESC;
```

**Check 3: Resend Dashboard**
Go to Resend Dashboard → Emails → Check delivery status

### Issue: Email Failed (Non-Critical)

**Expected Behavior:**
- User creation should still succeed
- Console shows: `⚠️ Welcome email failed (non-critical)`
- User is created but didn't receive email
- Admin can manually share credentials

---

## 🎭 Development Mode vs Production

### Development Mode (localhost)
- Emails may not send (mock service)
- OTP/credentials shown in browser alert
- Console logs show email attempts
- Non-critical failures expected

### Production Mode (Vercel)
- Emails sent via Resend API
- Edge Function handles delivery
- Full email tracking in notification_logs
- Critical for user onboarding

---

## ✅ Success Criteria

When everything is working correctly:

1. ✅ Admin creates user in dashboard
2. ✅ Console shows: "✅ Welcome email sent (Registration Thank You template)"
3. ✅ Console shows: "✅ Admin-created account credentials email sent"
4. ✅ User receives 2 emails within 1 minute
5. ✅ User can login with temporary password
6. ✅ User is forced to change password on first login
7. ✅ notification_logs table shows 2 successful email entries

---

## 📝 Code Changes Summary

### Modified Files:
1. **src/services/adminService.js**
   - Updated `createUser()` method
   - Now sends 2 emails instead of 1
   - Uses "Registration Thank You" template (same as self-registration)
   - Uses "Admin Created Account" template (new, with credentials)
   - Non-critical email failures won't block user creation

2. **supabase/migrations/add_admin_created_account_template.sql**
   - New email template for admin-created accounts
   - Includes temporary password display
   - Security warnings and instructions
   - Professional styling with branding

---

## 🚀 Deployment Checklist

- [ ] Run migration in Supabase SQL Editor
- [ ] Verify template exists in notification_templates
- [ ] Deploy code changes to Vercel
- [ ] Test user creation in admin dashboard
- [ ] Verify 2 emails are sent
- [ ] Test login with temporary password
- [ ] Test forced password change flow
- [ ] Check notification_logs for successful delivery
- [ ] Document any issues encountered

---

## 📞 Support

If emails are still not working after following this guide:

1. Check Supabase Dashboard → Database → Logs
2. Check Vercel Dashboard → Functions → Logs
3. Check Resend Dashboard → Emails → Delivery Status
4. Review browser console for detailed error messages
5. Check notification_logs table for error messages

---

**Status:** ✅ Ready for Deployment  
**Last Updated:** October 30, 2025  
**Git Commit:** 2831e2b
