# 🚀 Deployment Guide - Email System Updates

## Pre-Deployment Checklist

### ✅ Code Changes Review
- [x] Database migration applied to production Supabase
- [x] 5 email templates created in `notification_templates`
- [x] `emailVerificationService.js` created and tested
- [x] `SignUpPage.jsx` updated with OTP verification
- [x] `notificationService.js` updated with `sendNotificationByEmail()` method
- [x] `adminService.js` updated to use correct activation template
- [x] Build completed successfully (no errors)
- [x] No TypeScript/ESLint errors

### ✅ Environment Variables (Production)
Verify these are set in Vercel dashboard:

```
VITE_SUPABASE_URL=https://eremjpneqofidtktsfya.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
VITE_RESEND_API_KEY=re_ggm9rXgX_GdqwmWmQVe6hNnUBmFaTkqiG
```

**How to verify:**
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select project: `basic_intelligence_community_school`
3. Settings → Environment Variables
4. Confirm all 4 variables are present

---

## Deployment Steps

### Step 1: Commit Changes to Git

```powershell
# Navigate to project directory
cd "c:\Users\USER\Downloads\BIC github\basic_intelligence_community_school"

# Check what files were changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add email verification system with OTP

- Add email verification with 6-digit OTP during registration
- Create emailVerificationService for OTP generation and validation
- Update SignUpPage with 3-step verification flow (form → OTP → success)
- Add thank you email template sent after successful registration
- Add account activation email template for admin-activated accounts
- Update adminService to send activation emails automatically
- Block disposable email providers (tempmail, guerrillamail, etc.)
- Add rate limiting on OTP resends (60-second cooldown)
- Add OTP expiry (15 minutes) with countdown timer
- Track verification attempts (max 5 per OTP)
- Add email_verified columns to user_profiles table
- Create 5 new notification templates (verification, thank you, activation, reminder, announcement)
- Enhance email format validation
- Add RLS policies for email_verification_tokens table

BREAKING CHANGES: None
MIGRATION REQUIRED: Yes (already applied to production)
"

# Push to GitHub (triggers automatic Vercel deployment)
git push origin main
```

### Step 2: Monitor Vercel Deployment

1. **Check deployment status:**
   - Go to: https://vercel.com/dashboard
   - Click on your project
   - Watch "Deployments" tab for new deployment

2. **Expected deployment time:** 2-3 minutes

3. **Deployment success indicators:**
   - ✅ Green checkmark next to deployment
   - ✅ "Ready" status
   - ✅ No build errors in logs

4. **If deployment fails:**
   - Click on failed deployment
   - View logs for error details
   - Common issues:
     - Missing environment variables
     - Build errors (should have been caught in local build)
     - Exceeded function timeout

### Step 3: Verify Production Database

**Connect to production Supabase:**
1. Go to: https://supabase.com/dashboard
2. Select project: `eremjpneqofidtktsfya`
3. SQL Editor

**Run verification queries:**

```sql
-- 1. Check email_verification_tokens table exists
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'email_verification_tokens'
ORDER BY ordinal_position;

-- Expected: 12 columns (id, email, token, otp_code, expires_at, verified_at, verification_type, user_id, attempts, max_attempts, ip_address, user_agent, created_at)

-- 2. Check new email templates exist
SELECT id, name, category, is_active 
FROM notification_templates 
WHERE name IN (
  'Email Verification OTP',
  'Registration Thank You',
  'Account Activated',
  'Online Class Reminder',
  'General Announcement'
);

-- Expected: 5 rows returned, all with is_active = true

-- 3. Check user_profiles has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('email_verified', 'email_verified_at');

-- Expected: 2 rows (email_verified BOOLEAN, email_verified_at TIMESTAMPTZ)

-- 4. Check RLS policies on email_verification_tokens
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'email_verification_tokens';

-- Expected: 2 policies (SELECT for users, INSERT for anyone)
```

**If any queries fail:**
- Re-run the migration: `supabase/migrations/create_email_verification_system_v2.sql`
- Check Supabase logs for error details

### Step 4: Test on Production

**Test 1: Registration with OTP (CRITICAL)**

1. Go to: https://www.basicai.fit/signup
2. Fill in registration form with YOUR REAL EMAIL
3. Click "Continue"
4. Check email for OTP code
5. Enter OTP and complete registration
6. Verify account created in Supabase `user_profiles` table
7. Check `notification_logs` table for 2 email entries (verification + thank you)

**Test 2: Activation Email**

1. Login to admin: https://www.basicai.fit/signin
2. Go to Admin Users
3. Find test user, click "Activate"
4. Check test email for activation notification
5. Verify in `notification_logs` table

**Test 3: Security Features**

1. Try to register with `test@tempmail.com`
2. Should be blocked with error message
3. Try invalid email formats
4. Should show appropriate errors

### Step 5: Monitor Initial Traffic

**For the first 24 hours after deployment:**

1. **Resend Dashboard:**
   - URL: https://resend.com/emails
   - Monitor delivery rates (should be >95%)
   - Check for bounces or spam reports
   - Review email open rates

2. **Supabase Logs:**
   - Dashboard → Logs → Postgres
   - Filter by table: `notification_logs`
   - Check for failed email sends
   - Monitor error_message column

3. **Browser Console:**
   - Ask 2-3 users to register
   - Check for JavaScript errors
   - Verify OTP flow works end-to-end

4. **User Feedback:**
   - Monitor WhatsApp for support messages
   - Check if users report "didn't receive email"
   - Track registration completion rates

---

## Rollback Plan (If Issues Arise)

### Option 1: Quick Rollback (5 minutes)

If critical issues found:

```powershell
# Revert to previous commit
git revert HEAD

# Push reverted code
git push origin main

# Vercel will auto-deploy old version
```

**Note:** Database changes will remain, but old signup flow will be used (no OTP verification)

### Option 2: Database-Only Rollback

If only database issues:

```sql
-- Disable new email templates (don't delete)
UPDATE notification_templates 
SET is_active = false 
WHERE name IN (
  'Email Verification OTP',
  'Registration Thank You',
  'Account Activated',
  'Online Class Reminder',
  'General Announcement'
);

-- Keep table for historical data
-- DROP TABLE email_verification_tokens; -- Only if absolutely necessary
```

### Option 3: Disable Email Verification Only

If OTP system has issues but want to keep other features:

1. Go to `SignUpPage.jsx`
2. Temporarily comment out OTP verification:
   ```javascript
   // TEMPORARY BYPASS - Remove after fixing
   setVerificationStep(3); // Skip directly to success
   // Original code below...
   ```

3. Commit and push:
   ```powershell
   git add .
   git commit -m "hotfix: Temporarily disable OTP verification"
   git push origin main
   ```

---

## Post-Deployment Monitoring

### Day 1 Checklist

- [ ] 10 successful registrations with OTP
- [ ] All emails delivered (check Resend dashboard)
- [ ] No errors in Supabase logs
- [ ] No user complaints about email issues
- [ ] At least 1 activation email sent successfully
- [ ] notification_logs table populating correctly
- [ ] email_verification_tokens table cleaned up (expired tokens removed)

### Week 1 Metrics to Track

```sql
-- Registration stats
SELECT 
  COUNT(*) as total_registrations,
  COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_emails,
  ROUND(
    COUNT(CASE WHEN email_verified = true THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100, 
    2
  ) as verification_rate_percent
FROM user_profiles
WHERE created_at > NOW() - INTERVAL '7 days';

-- Email delivery stats
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM notification_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status
ORDER BY count DESC;

-- Average OTP verification time
SELECT 
  AVG(EXTRACT(EPOCH FROM (verified_at - created_at))) / 60 as avg_minutes
FROM email_verification_tokens
WHERE verified_at IS NOT NULL
AND created_at > NOW() - INTERVAL '7 days';
```

---

## Troubleshooting Guide

### Issue: OTP emails not being received

**Diagnosis:**
```sql
-- Check notification_logs for failures
SELECT 
  recipient_email,
  subject,
  status,
  error_message,
  sent_at
FROM notification_logs
WHERE recipient_type = 'email'
AND subject LIKE '%Verify Your Email%'
ORDER BY created_at DESC
LIMIT 20;
```

**Solutions:**
1. If `status = 'failed'` → Check `error_message` column
2. If no row exists → emailVerificationService not triggering
3. If `status = 'sent'` but user didn't receive → Check spam folder, Resend dashboard
4. If Resend shows "bounced" → Email address invalid
5. If Resend shows "spam complaint" → User marked as spam (update email content)

### Issue: "Invalid or expired OTP code" error

**Diagnosis:**
```sql
-- Check token status
SELECT 
  email,
  otp_code,
  attempts,
  max_attempts,
  expires_at,
  verified_at,
  created_at
FROM email_verification_tokens
WHERE email = 'USER_EMAIL_HERE'
ORDER BY created_at DESC
LIMIT 5;
```

**Solutions:**
1. If `expires_at < NOW()` → Token expired, request new OTP
2. If `attempts >= max_attempts` → Too many failed attempts, request new OTP
3. If `verified_at IS NOT NULL` → Token already used
4. If OTP doesn't match → User entered wrong code

### Issue: Activation email not sent

**Diagnosis:**
```sql
-- Check if activation emails are being sent
SELECT 
  recipient_email,
  subject,
  status,
  error_message,
  sent_at
FROM notification_logs
WHERE subject LIKE '%Activated%'
ORDER BY created_at DESC
LIMIT 10;
```

**Solutions:**
1. If no rows → `adminService.activateUserAccount()` not calling email send
2. If `status = 'failed'` → Check template exists: `SELECT * FROM notification_templates WHERE name = 'Account Activated'`
3. If template missing → Re-run template insertion SQL
4. If Resend error → Check API key validity

### Issue: High email bounce rate

**Check Resend Dashboard:**
1. Go to https://resend.com/emails
2. Filter by "Bounced"
3. Common causes:
   - Invalid email addresses (disposable emails not blocked)
   - User's mailbox full
   - Domain doesn't exist

**Solutions:**
1. Add more disposable domains to blocklist in `emailVerificationService.js`
2. Implement email validation API (e.g., ZeroBounce, EmailListVerify)
3. Update email content if marked as spam

---

## Success Metrics

### Target KPIs (Week 1)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Email Delivery Rate | >95% | Resend dashboard + notification_logs |
| Registration Completion Rate | >80% | Users who complete OTP verification |
| OTP Verification Time | <5 min average | email_verification_tokens table |
| Activation Email Delivery | 100% | notification_logs for activation emails |
| User Complaints | <5% | Support tickets / WhatsApp messages |
| Bounce Rate | <3% | Resend dashboard |
| Email Open Rate | >40% | Resend dashboard (if tracking enabled) |

---

## Communication Plan

### Internal Team Announcement

**Subject:** New Email Verification System Deployed

**Message:**
```
Hi Team,

We've just deployed a major update to our registration system:

✅ Email verification with OTP now required during signup
✅ Thank you emails sent automatically after registration  
✅ Activation emails sent when admins activate accounts
✅ Enhanced security: disposable emails blocked, rate limiting added

WHAT THIS MEANS FOR YOU:
- New users will need to verify their email with a 6-digit code
- Expect questions about "where's my OTP code?" → Check spam folder
- Activation is now faster - users get notified immediately
- Monitor notification logs in Supabase for any issues

SUPPORT SCRIPTS:
Q: "I didn't receive my verification code"
A: "Check your spam/junk folder. If still not there, click 'Resend verification code' on the signup page."

Q: "My code expired"
A: "Codes expire after 15 minutes. Click 'Resend verification code' to get a new one."

Q: "I haven't received activation email"
A: "We'll check with our admin team. Your account activation can take 24-48 hours depending on payment verification."

Any issues? Report in WhatsApp group immediately.

Thanks!
```

### User-Facing Announcement (Optional)

**Post on social media / send to existing members:**

```
📧 EXCITING UPDATE: Enhanced Account Security!

We've upgraded our registration process to ensure a safer, more secure experience:

✅ Email verification now required (we'll send you a code)
✅ Instant thank you message after signup
✅ Automatic notifications when your account is activated

Registering is still easy:
1. Fill out the form
2. Check your email for a 6-digit code
3. Enter the code
4. Done! ✨

Pro tip: Add notifications@basicai.fit to your contacts to ensure you receive all our emails.

Got questions? WhatsApp us: +234 906 228 4074
```

---

## Next Steps (Future Enhancements)

### Phase 2 - Template Builder (Task 4)
**Estimated:** 90 minutes
- Admin can create custom email templates
- WYSIWYG editor or markdown support
- Variable insertion helper
- Template preview

### Phase 3 - Broadcast System (Task 5)
**Estimated:** 60 minutes
- Send emails to filtered user groups
- Select by tier, status, date joined
- Batch processing (100 emails/batch)
- Progress tracking

### Phase 4 - Security Hardening (Task 7)
**Estimated:** 45 minutes
- Add CAPTCHA to registration form
- Global rate limiting (100 emails/hour per admin)
- Input sanitization with DOMPurify
- Email content XSS prevention

### Phase 5 - Analytics Dashboard
**Estimated:** 120 minutes
- Email open/click tracking
- Delivery rate charts
- User engagement metrics
- A/B testing for email content

---

## Emergency Contacts

**If critical issues arise:**
1. **Developer:** [Your contact info]
2. **Supabase Support:** https://supabase.com/dashboard/support
3. **Resend Support:** https://resend.com/support
4. **Vercel Support:** https://vercel.com/support

**Emergency Rollback Command:**
```powershell
git revert HEAD && git push origin main
```

---

## Final Pre-Deployment Checklist

Before running `git push origin main`:

- [ ] All tests passed locally (see TESTING_GUIDE.md)
- [ ] Build completed successfully (`npm run build`)
- [ ] Database migration verified on production
- [ ] Environment variables confirmed in Vercel
- [ ] Rollback plan understood
- [ ] Team notified of deployment
- [ ] Monitoring tools ready (Resend dashboard, Supabase logs)
- [ ] Test user registered with real email
- [ ] README updated with new features
- [ ] Support team briefed on new system
- [ ] Emergency contacts list ready

---

## Deploy Now!

**Run this command when ready:**

```powershell
cd "c:\Users\USER\Downloads\BIC github\basic_intelligence_community_school"
git add .
git commit -m "feat: Add email verification system with OTP, thank you emails, and activation notifications"
git push origin main
```

**Then:**
1. Watch Vercel deployment (2-3 minutes)
2. Test on production immediately
3. Monitor for 24 hours
4. Celebrate! 🎉

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Deployment Status:** ⏳ Pending / ✅ Success / ❌ Failed  
**Rollback Required:** Yes / No  
**Notes:** _____________________________________________
