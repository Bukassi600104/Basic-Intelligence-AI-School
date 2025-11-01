# 🚀 Quick Email Service Verification Guide

**Time Required:** 5-10 minutes  
**Prerequisites:** Supabase project with `RESEND_API_KEY` configured

---

## ✅ Step 1: Verify RESEND_API_KEY is Configured (2 min)

### In Supabase Dashboard:

1. Go to your Supabase project
2. Navigate: **Settings → Edge Function Secrets**
3. Look for `RESEND_API_KEY`
   - ✅ If present → Continue to Step 2
   - ❌ If missing → [Add it now](#how-to-add-resend_api_key)

**How to Add RESEND_API_KEY:**

1. Get API key from [https://resend.com/api-keys](https://resend.com/api-keys)
   - Format: `re_xxxxxxxxxxxx`
2. In Supabase:
   - Click **New Secret**
   - Name: `RESEND_API_KEY`
   - Value: Paste your Resend API key
   - Click **Add**

---

## ✅ Step 2: Restart Dev Server (1 min)

```bash
# Stop current server (Ctrl+C if running)
# Then start fresh:
npm run dev
```

Expected output:
```
  VITE v5.4.21  ready in 1953 ms
  ➜  Local:   http://localhost:4028/
  ➜  Network: http://192.168.0.138:4028/
```

---

## ✅ Step 3: Test Sign-Up Email (3 min)

### Test Flow:

1. **Open:** `http://localhost:4028/signup`
2. **Fill Form:**
   - Email: `test-20250110@example.com` (use unique email)
   - Password: Any strong password
   - Full Name: Test User
3. **Click:** Sign Up
4. **Wait:** 2-3 seconds for processing
5. **Check Console:** Press `F12` → Console tab

### Expected Console Output:

```javascript
// Look for these messages:
✅ Sending email via Supabase Edge Function: {
  to: "test-20250110@example.com",
  subject: "Welcome to Basic Intelligence!",
  from: "Basic Intelligence <onboarding@resend.dev>"
}

✅ Email sent successfully via Edge Function: {
  id: "abc123-def456-ghi789"
}
```

### If You See Error:

```javascript
❌ Edge Function error: RESEND_API_KEY not found
// SOLUTION: Add RESEND_API_KEY to Edge Function secrets (Step 1)

❌ Edge Function error: Failed to send email
// SOLUTION: Check Resend dashboard for account/domain issues
```

---

## ✅ Step 4: Verify Email Received (2 min)

### Option A: Check Your Inbox
1. Check email inbox for: `test-20250110@example.com`
2. Look for email from: `onboarding@resend.dev`
3. Subject: "Welcome to Basic Intelligence!"

### Option B: Check Resend Dashboard
1. Go to [https://resend.com/emails](https://resend.com/emails)
2. Should see recent sent email
3. Status should be: ✅ Delivered

### Option C: Check Database Logs
```sql
-- In Supabase SQL Editor
SELECT recipient_email, template_name, status, created_at
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC;

-- Look for:
-- recipient_email: "test-20250110@example.com"
-- status: "sent" or "delivered"
```

---

## ✅ Step 5: Test Admin User Creation (Optional, 3 min)

### Create Test User:

1. **Go to:** `http://localhost:4028/admin-dashboard`
2. **Find:** "Users" section → "Add User" button
3. **Fill Form:**
   - Full Name: Admin Test User
   - Email: `admin-test-20250110@example.com`
   - Role: Student
   - Membership Tier: Starter
4. **Click:** Create User
5. **Wait:** 2-3 seconds

### Expected Result:

- ✅ User created in database
- ✅ Two emails sent:
  - Email 1: "Welcome to Basic Intelligence!"
  - Email 2: "Your Basic Intelligence Account Has Been Created"
- ✅ Temporary password in second email
- ✅ Both visible in Resend dashboard

---

## ✅ Step 6: Test Notification Wizard (Optional, 3 min)

### Send Bulk Notification:

1. **Go to:** `http://localhost:4028/admin-notification-wizard`
2. **Select Users:**
   - Check "Select All" or pick specific users
3. **Compose Message:**
   - Template: Choose any template
   - Subject: Type a test subject
   - Message: Type test content
4. **Send Via:** Email
5. **Click:** Send Notifications
6. **Wait:** Progress bar shows completion

### Expected Result:

- ✅ Console shows each email being sent
- ✅ Green checkmark next to successful sends
- ✅ Emails visible in Resend dashboard
- ✅ Logs stored in `notification_logs` table

---

## 🔍 Troubleshooting Quick Reference

| Symptom | Cause | Solution |
|---------|-------|----------|
| "Email logged (not sent)" message | Old code still running | Restart dev server: `npm run dev` |
| "RESEND_API_KEY not found" error | Secret not configured | Add RESEND_API_KEY to Supabase Edge Function secrets |
| "Failed to call Edge Function" | Invalid API key | Verify key format at https://resend.com/api-keys |
| Email not arriving | Bounced/spam filtered | Check Resend dashboard for delivery status |
| Console shows no email logs | Service layer not called | Check if you're on correct page and network tab |
| "Template not found" error | Template doesn't exist | Verify templates in `notification_templates` table |

---

## ✅ Success Checklist

After completing these steps, you should have:

- [ ] RESEND_API_KEY configured in Supabase
- [ ] Dev server running on port 4028
- [ ] Sign-up test email received
- [ ] Console logs show "Email sent successfully via Edge Function"
- [ ] Resend dashboard shows delivered email
- [ ] Database logs show "sent" status
- [ ] (Optional) Admin user creation sends two emails
- [ ] (Optional) Notification wizard sends bulk emails

---

## 📊 What's Working Now

After this fix:

✅ **Sign-Up Emails** - New users receive welcome email  
✅ **Admin User Creation** - Welcome + credentials emails sent  
✅ **Bulk Notifications** - Admin can send to multiple users  
✅ **Template System** - All templates now send properly  
✅ **Notification Logs** - All activity tracked in database  

---

## 🚀 Production Deployment

Once testing confirms everything works:

1. **Changes Already Pushed:** Commit `0042c2b` in main branch
2. **Vercel Auto-Deploy:** Will deploy when you merge to main
3. **Supabase Configuration:** Add RESEND_API_KEY to production instance
   - Same steps as local development
   - Use same Resend API key (or separate production key if preferred)

---

**Last Updated:** October 2025  
**Status:** Ready for testing ✅
