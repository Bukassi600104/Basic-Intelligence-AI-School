# Critical: Configure RESEND_API_KEY for Email Delivery

**Status**: REQUIRED FOR PRODUCTION EMAIL DELIVERY
**Timeline**: Complete this BEFORE manual testing
**Effort**: 2 minutes

---

## Current State

✅ **Already Completed**:
- Edge Function deployed: `send-email`
- Function ID: `0ccfbea0-d820-4e17-8a4e-1fd731a88a5c`
- Database triggers: All 5 active and firing
- Templates: All 14 templates ready in database
- Code deployed: Vercel auto-deployed from commit ae1fc41

❌ **Missing**:
- RESEND_API_KEY secret in Supabase Edge Function

---

## What Happens Without the API Key

```
User Action (e.g., new signup)
    ↓
Database Trigger Fires ✅
    ↓
automated_notifications entry created ✅
    ↓
Edge Function send-email invoked ✅
    ↓
RESEND_API_KEY lookup... ❌ MISSING
    ↓
Email NOT SENT
    ↓
notification_logs: status = 'failed'
```

## What Happens With the API Key

```
User Action (e.g., new signup)
    ↓
Database Trigger Fires ✅
    ↓
automated_notifications entry created ✅
    ↓
Edge Function send-email invoked ✅
    ↓
RESEND_API_KEY found ✅
    ↓
Resend API call successful ✅
    ↓
Email SENT ✅
    ↓
notification_logs: status = 'sent'
```

---

## Step-by-Step Configuration

### Step 1: Get Your Resend API Key

1. Go to: https://resend.com/api-keys
2. Copy the API key (format: `re_xxxxxxxxxxxxxxxxxxxxx`)
3. Keep it safe (don't share!)

### Step 2: Add to Supabase Edge Function Secrets

1. Go to: **Supabase Dashboard** → Your Project (eremjpneqofidtktsfya)
2. Navigate: **Settings** → **Edge Function Secrets**
3. Click: **"Add Secret"** button
4. Fill in:
   ```
   Name: RESEND_API_KEY
   Value: re_[paste your key here]
   ```
5. Click: **"Create Secret"** button

**Screenshot Reference**:
```
Supabase Dashboard
├── Settings
│   └── Edge Function Secrets
│       └── [Add Secret Button]
│           ├── Name: RESEND_API_KEY
│           └── Value: re_xxxxxxxxx
│               └── [Create Secret]
```

### Step 3: Verify Configuration

1. Go to: **Supabase Dashboard** → **Edge Functions** → **send-email**
2. Look for "Secrets" section
3. Should show: `RESEND_API_KEY` ✓

### Step 4: Redeploy (If Needed)

Most likely NOT needed, but if emails still don't work:

```bash
cd c:\Users\USER\Downloads\BIC\ github\basic_intelligence_community_school
supabase functions deploy send-email
```

---

## Testing After Configuration

### Quick Test (1 minute)

1. Go to: Admin Dashboard → Settings (or any admin area that requires login)
2. Create a new test user via `/admin-users`
3. Use test email: `test-[timestamp]@temp-mail.org`
4. Check email inbox within 30 seconds
5. Verify welcome email received

### Detailed Test (5 minutes)

1. **Test 1**: Create user → Check for welcome email ✓
2. **Test 2**: Activate user account → Check for activation email ✓
3. **Test 3**: Request subscription → Approve → Check for confirmation email ✓
4. **Test 4**: Use notification wizard to send broadcast → Check all users get email ✓
5. **Test 5**: Check notification_logs table:
   ```sql
   SELECT 
     user_id, 
     template_name, 
     status, 
     recipient_type, 
     created_at,
     error_message
   FROM notification_logs
   ORDER BY created_at DESC
   LIMIT 10;
   ```
   Should show all `status = 'sent'` (or 'whatsapp_sent' for WhatsApp)

---

## Troubleshooting

### Problem: "API key not found" error in Edge Function logs

**Solution**:
1. Check Supabase Dashboard → Settings → Edge Function Secrets
2. Verify secret name is exactly `RESEND_API_KEY` (case-sensitive!)
3. Verify value is not empty
4. Redeploy: `supabase functions deploy send-email`

### Problem: Emails still not sending after adding API key

**Debug Steps**:
1. Check Supabase logs:
   ```bash
   supabase functions logs send-email
   ```
2. Look for error messages (usually about API key or rate limit)
3. Check notification_logs table for actual error message:
   ```sql
   SELECT 
     error_message,
     count(*) as count
   FROM notification_logs
   WHERE status = 'failed'
   GROUP BY error_message
   ORDER BY count DESC;
   ```
4. If "Invalid API key": Re-verify key format (should start with `re_`)
5. If "Rate limited": Resend has limits (check docs)

### Problem: Emails sent but not delivered to inbox

**Causes** (in order of likelihood):
1. User email is incorrect in `user_profiles.email`
2. Email in spam folder (check there first!)
3. Resend reputation issue (rare, check Resend dashboard)
4. Recipient email domain has strict SPF/DKIM policies

**Verify Email**:
```sql
SELECT 
  id,
  email,
  membership_status,
  created_at
FROM user_profiles
WHERE email LIKE '%@temp-mail.org'
LIMIT 5;
```

---

## Key Files Reference

**Edge Function Source Code**:
- Deployment location: Supabase Edge Functions
- Function name: `send-email`
- Runtime: Deno
- Entrypoint: `index.ts`

**Database**:
- Trigger functions: 5 active (verified)
- automated_notifications table: Ready
- notification_templates: 14 active
- notification_logs: Audit trail

**Frontend**:
- Admin Wizard: `/admin-notification-wizard` (1000+ lines)
- Service: `src/services/emailService.js`
- Template processor: `src/services/notificationService.js`

---

## Timeline

- ✅ Code-Splitting: DONE (commit ae1fc41)
- ✅ Deployment: DONE (auto-deployed to Vercel)
- ⏳ **CRITICAL**: Add RESEND_API_KEY to Supabase → **DO THIS NOW**
- ⏳ Manual testing: Test 8 email scenarios
- ⏳ Monitor production: Check email delivery stats

---

## Quick Checklist

```
[ ] 1. Get Resend API key from https://resend.com/api-keys
[ ] 2. Go to Supabase Dashboard → Settings → Edge Function Secrets
[ ] 3. Add secret: Name=RESEND_API_KEY, Value=re_xxx
[ ] 4. Click "Create Secret"
[ ] 5. Verify secret appears in list
[ ] 6. Create test user and check email within 30 seconds
[ ] 7. If received: ✅ DONE, continue with full testing
[ ] 8. If not: Check Supabase logs for error message
```

---

## Support

**Questions?** Check:
1. `OPTIMIZATION_AND_AUTOMATION_COMPLETE.md` - Full documentation
2. `notification_logs` table - Actual error messages
3. Supabase Dashboard → Edge Functions → send-email → Logs
4. Resend Dashboard → API Keys page (verify key is active)

---

**IMPORTANT**: Without this API key configured, emails will NOT send. This is blocking production email delivery. Please complete this step before manual testing.

---

*Last Updated: 2025-01-20*
*Status: CRITICAL - BLOCKING EMAIL DELIVERY*
