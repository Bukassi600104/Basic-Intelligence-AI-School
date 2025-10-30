# Resend Email Configuration Guide

## ✅ What Was Fixed

### 1. Welcome Email Template Updated
- ✅ Added `{{temporary_password}}` variable to the template
- ✅ Template now includes security notice about password change requirement
- ✅ Users will receive their login credentials via email

### 2. Email System Status
- ✅ Resend SDK is already integrated in `emailService.js`
- ✅ Notification service is configured to send emails
- ✅ User creation triggers welcome email automatically

---

## 🔑 Required: Configure Resend API Key

### Step 1: Get Your Resend API Key

1. Go to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Sign in or create an account
3. Click **"Create API Key"**
4. Give it a name like "Basic Intelligence Dev"
5. Copy the API key (starts with `re_...`)

### Step 2: Create `.env` File

Create a new file named `.env` in your project root:

```bash
# c:\Users\USER\Downloads\BIC github\basic_intelligence_community_school\.env

# Supabase Configuration
VITE_SUPABASE_URL=https://eremjpneqofidtktsfya.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend Email Configuration
VITE_RESEND_API_KEY=re_YourActualResendAPIKeyHere

# Application Configuration
VITE_APP_NAME=Basic Intelligence Community School
VITE_SUPPORT_EMAIL=support@basicintelligence.ng
NODE_ENV=development
```

**IMPORTANT:** Replace `re_YourActualResendAPIKeyHere` with your actual Resend API key!

### Step 3: Restart Your Development Server

```powershell
# Stop the current dev server (Ctrl+C in the terminal)

# Restart it
npm run dev
```

---

## 📧 Resend Email Domain Configuration

### For Production (Required for `notifications@basicintelligence.ng`)

1. **Add Domain in Resend:**
   - Go to [https://resend.com/domains](https://resend.com/domains)
   - Click **"Add Domain"**
   - Enter: `basicintelligence.ng`

2. **Verify Domain with DNS Records:**
   - Resend will provide DNS records (SPF, DKIM, DMARC)
   - Add these records to your domain registrar's DNS settings
   - Wait for verification (can take up to 48 hours, usually 10 minutes)

3. **Update Email Service "From" Address:**
   Once verified, emails will be sent from `notifications@basicintelligence.ng`

### For Development/Testing (Use Resend's Test Domain)

If you haven't verified your domain yet, use Resend's test email:

**Update** `src/services/emailService.js`:

```javascript
// Line 64 and Line 101 - Change from address temporarily:
from: 'onboarding@resend.dev'  // Resend's test domain (works immediately)
```

This allows you to test emails immediately without domain verification.

---

## 🔄 How Email Notifications Work

### Current Flow:

1. **Admin Creates User** → Admin dashboard `/admin/users`
2. **User Account Created** → Supabase Auth + Database trigger
3. **Notification Service Triggered** → `adminService.createUser()` calls `notificationService.sendNotification()`
4. **Template Retrieved** → "Welcome Email" template fetched from database
5. **Variables Processed** → `{{temporary_password}}`, `{{full_name}}`, etc. replaced
6. **Email Sent via Resend** → `emailService.sendEmailViaResend()`
7. **Log Created** → Stored in `notification_logs` table

### What Gets Sent:

```
To: newuser@example.com
From: onboarding@resend.dev (or notifications@basicintelligence.ng if domain verified)
Subject: Welcome to Basic Intelligence AI School!

Dear [User Name],

Welcome to Basic Intelligence AI School! We are excited to have you join our community.

Your account has been created successfully:
- Email: newuser@example.com
- Temporary Password: RandomPass123!
- Member ID: BIC-001234
- Membership Tier: starter

IMPORTANT: For security reasons, you will be required to change your password upon first login.

You can access your dashboard here: https://www.basicai.fit/student-dashboard

Best regards,
Basic Intelligence AI School Team
```

---

## 🐛 Troubleshooting

### Issue: "Resend API key is not configured"

**Solution:**
1. Ensure `.env` file exists in project root
2. Verify `VITE_RESEND_API_KEY` is set correctly
3. Restart dev server: `npm run dev`
4. Check browser console for API key errors

### Issue: Emails not sending

**Checklist:**
- ✅ Resend API key is valid and active
- ✅ `.env` file is in the correct location (project root)
- ✅ Dev server was restarted after adding `.env`
- ✅ Check browser console for errors
- ✅ Check Supabase logs: Dashboard → Database → Logs
- ✅ Check `notification_logs` table for error messages

**Check Notification Logs:**
```sql
SELECT * FROM notification_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

### Issue: "Template not found" error

The "Welcome Email" template has been updated and is active. If you still see this error:

1. Check database:
```sql
SELECT name, is_active FROM notification_templates WHERE name = 'Welcome Email';
```

2. If missing, run `FIX_NOTIFICATION_TEMPLATES.sql`

### Issue: Emails going to spam

**Solutions:**
1. Verify your domain in Resend (SPF, DKIM, DMARC records)
2. Use a professional "from" email: `notifications@basicintelligence.ng`
3. Add unsubscribe link to email templates
4. Avoid spam trigger words in subject/content

---

## 🚀 Production Deployment (Vercel)

### Environment Variables in Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Settings → Environment Variables
4. Add:

```
VITE_RESEND_API_KEY = re_YourProductionResendAPIKey
```

5. Redeploy your application

**IMPORTANT:** Use a DIFFERENT API key for production than development!

---

## 📊 Monitoring Email Delivery

### Check Email Logs in Resend:

1. Go to [https://resend.com/emails](https://resend.com/emails)
2. View all sent emails, delivery status, bounces, opens (if tracking enabled)

### Check Internal Logs:

**Admin Dashboard:**
- Navigate to `/admin/notifications` 
- View notification history, delivery status, errors

**Database Query:**
```sql
SELECT 
  nl.created_at,
  nl.recipient_email,
  nl.status,
  nl.error_message,
  nt.name as template_name
FROM notification_logs nl
LEFT JOIN notification_templates nt ON nl.template_id = nt.id
ORDER BY nl.created_at DESC
LIMIT 20;
```

---

## 🎯 Next Steps

1. **Create `.env` file** with your Resend API key
2. **Restart dev server**: `npm run dev`
3. **Test user creation** at https://www.basicai.fit/admin/users
4. **Check your email inbox** for the welcome message
5. **Verify domain in Resend** for production use
6. **Update Vercel environment variables** before deploying to production

---

## ✅ Summary

✅ **Fixed:** Welcome Email template now includes `{{temporary_password}}`  
✅ **Ready:** Email service is configured and functional  
⚠️ **Action Required:** Add `VITE_RESEND_API_KEY` to `.env` file  
⚠️ **Production:** Verify domain in Resend before going live  

**Test it now:**
1. Add Resend API key to `.env`
2. Restart server
3. Create a test user
4. Check email inbox for welcome message with temporary password!
