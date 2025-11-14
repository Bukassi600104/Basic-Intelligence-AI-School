# Email Configuration Guide

## Overview
The application uses **Supabase Edge Functions** with **Resend** API for reliable email delivery. All emails are sent server-side, ensuring security and avoiding CORS issues.

## Current Status

### ✅ What's Working
- Email service infrastructure (Supabase Edge Function)
- Welcome emails for new registrations
- Admin notifications for new registrations
- Payment receipt upload notifications
- Email service properly configured

### 🔧 Required Configuration

#### 1. Supabase Edge Function Secrets

You need to configure the `RESEND_API_KEY` in Supabase:

1. **Get Resend API Key**
   - Go to [Resend.com](https://resend.com)
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key (format: `re_xxxxxxxxxxxxx`)

2. **Add to Supabase**
   - Open your Supabase Dashboard
   - Go to **Project Settings** → **Edge Functions**
   - Click **Add Secret** or **Manage Secrets**
   - Add secret:
     - **Name**: `RESEND_API_KEY`
     - **Value**: Your Resend API key (starts with `re_`)
   - Save the secret

3. **Verify Configuration**
   - The edge function at `/supabase/functions/send-email/index.ts` will use this key
   - Test by registering a new user

#### 2. Email Sender Domain (Optional but Recommended)

For production use, verify your domain with Resend:

1. **Add Domain in Resend**
   - Go to Resend Dashboard → Domains
   - Add your domain (e.g., `basicai.fit`)
   - Add the DNS records provided by Resend

2. **Update Email Service**
   - Once verified, update the `from` field in email sends
   - Default: `onboarding@resend.dev` (for testing)
   - Production: `noreply@basicai.fit` (your verified domain)

## Email System Architecture

### Components

1. **Supabase Edge Function** (`/supabase/functions/send-email/`)
   - Server-side email sending
   - Handles authentication via Resend API
   - Provides detailed logging for debugging

2. **Email Service** (`/src/services/emailService.js`)
   - Client-side wrapper for edge function
   - Calls Supabase Edge Function via HTTP

3. **Specialized Email Services**
   - `welcomeEmailService.js` - Welcome emails for new members
   - `adminNotificationService.js` - Admin notifications for registrations

### Email Flow

```
Registration Form
    ↓
SignUpPage.jsx
    ↓
adminNotificationService.notifyNewRegistration()
    ↓
emailService.sendEmail()
    ↓
Supabase Edge Function (/functions/v1/send-email)
    ↓
Resend API
    ↓
Email Delivered
```

## Email Types

### 1. Welcome Email
- **Sent to**: New member
- **When**: After successful registration
- **Purpose**: Welcome message with account details and dashboard access
- **Template**: Custom HTML in `welcomeEmailService.js`

### 2. Admin Registration Notification
- **Sent to**: Admin (`bukassi@gmail.com`)
- **When**: After new member registration
- **Purpose**: Notify admin of new registration with payment details
- **Template**: Custom HTML in `adminNotificationService.js`
- **Content**: Member details, plan info, payment receipt link

## Troubleshooting

### Email Not Received

1. **Check Supabase Logs**
   ```bash
   # In Supabase Dashboard
   Project → Logs → Edge Functions → send-email
   ```

2. **Verify RESEND_API_KEY**
   - Ensure it's set in Supabase Edge Function Secrets
   - Check it starts with `re_`
   - Verify it's active in Resend dashboard

3. **Check Spam/Junk Folder**
   - Emails from `onboarding@resend.dev` may be marked as spam
   - Whitelist the sender or verify your own domain

4. **Check Resend Dashboard**
   - Go to Resend → Logs
   - Check for delivery status and any errors

### Common Issues

#### Issue: "RESEND_API_KEY not found"
**Solution**: Add the API key to Supabase Edge Function Secrets (see above)

#### Issue: "Invalid API token"
**Solution**: 
- Verify the API key format (should start with `re_`)
- Generate a new API key in Resend
- Update in Supabase secrets

#### Issue: "Rate limit exceeded"
**Solution**: 
- Resend free tier: 150 emails/day
- Upgrade Resend plan or wait for reset

#### Issue: Emails go to spam
**Solution**:
- Verify your own domain with Resend
- Update sender from `onboarding@resend.dev` to `noreply@yourdomain.com`

## Testing Email Delivery

### Manual Test
1. Register a new user with your email
2. Check inbox (and spam folder)
3. Admin should receive notification at `bukassi@gmail.com`

### Via Browser Console
```javascript
// In browser console on the app
await fetch('YOUR_SUPABASE_URL/functions/v1/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Test</h1><p>This is a test email.</p>'
  })
});
```

## Configuration Checklist

- [ ] Resend account created
- [ ] Resend API key generated
- [ ] `RESEND_API_KEY` added to Supabase Edge Function Secrets
- [ ] Edge function deployed to Supabase
- [ ] Test registration performed
- [ ] Welcome email received by new member
- [ ] Admin notification received
- [ ] (Optional) Custom domain verified in Resend
- [ ] (Optional) Sender email updated to custom domain

## Support

If emails are still not working after following this guide:

1. Check Supabase Edge Function logs for detailed error messages
2. Check Resend logs for delivery status
3. Ensure the edge function is deployed (redeploy if needed)
4. Verify network connectivity to Resend API

## Environment Variables

The following environment variables can be used to configure admin notifications:

- `VITE_ADMIN_NOTIFICATION_EMAIL` - Primary admin email for notifications
- `VITE_ADMIN_EMAIL` - Fallback admin email
- `VITE_SUPPORT_EMAIL` - Support email fallback
- **Default**: `bukassi@gmail.com`

Add to `.env` file:
```bash
VITE_ADMIN_NOTIFICATION_EMAIL=your-admin@example.com
```

## Next Steps

1. **Configure RESEND_API_KEY in Supabase** (most important)
2. Test email delivery with a new registration
3. Monitor Supabase and Resend logs
4. (Optional) Verify custom domain for production use
