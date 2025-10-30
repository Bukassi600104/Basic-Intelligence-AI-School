# 🧪 Quick Testing Guide - Email System

## Prerequisites
- ✅ Database migration applied
- ✅ Resend API key configured
- ✅ Development server running on localhost:4028

---

## Test 1: Email Verification with OTP (5 minutes)

### Steps:
1. **Open browser:** http://localhost:4028/signup
2. **Fill in form:**
   - Full Name: Test User
   - Email: YOUR_REAL_EMAIL@gmail.com (use your actual email)
   - Password: test123
   - Confirm Password: test123
   - Phone: +2348012345678
   - Location: Lagos
3. **Click "Continue"** button
4. **Expected:** 
   - Page shows OTP verification step
   - Email received within 1 minute with 6-digit code
   - Countdown timer appears (15:00)

5. **Check your email:**
   - Subject: "Verify Your Email - Basic Intelligence AI School"
   - Body contains 6-digit OTP code
   - Verification link also included

6. **Enter OTP code** in the input field
7. **Click "Verify & Create Account"**
8. **Expected:**
   - Success message appears
   - Redirects to dashboard after 2 seconds
   - Second email received (thank you email)

9. **Check second email:**
   - Subject: "Thank You for Joining Basic Intelligence AI School! 🎉"
   - Contains account details
   - Dashboard link present

### Test Cases:

#### ✅ Valid OTP
- Enter correct 6-digit code → Account created successfully

#### ❌ Invalid OTP
- Enter wrong code (e.g., "000000") → Error: "Invalid or expired OTP code"

#### ⏱️ Expired OTP
- Wait 15 minutes → Enter code → Error: "Your OTP has expired"

#### 🔄 Resend OTP
- Click "Resend verification code"
- New email received
- 60-second cooldown starts
- Try to resend again immediately → Cooldown message shown

#### 🚫 Disposable Email
- Use email: test@tempmail.com
- Click "Continue"
- Expected error: "Disposable email addresses are not allowed"

#### 🔢 Max Attempts
- Enter wrong OTP 5 times
- Expected: "Maximum verification attempts exceeded. Please request a new OTP."

---

## Test 2: Thank You Email (2 minutes)

### Steps:
1. Complete Test 1 (registration with OTP)
2. **Check email inbox** after successful registration
3. **Verify email contains:**
   - Subject: "Thank You for Joining Basic Intelligence AI School! 🎉"
   - Your full name in greeting
   - Selected membership tier (pro)
   - Member ID (shows "Pending Assignment")
   - Dashboard link
   - Next steps information

4. **Click dashboard link** in email
5. **Expected:** Opens dashboard at http://localhost:4028/student-dashboard

---

## Test 3: Account Activation Email (3 minutes)

### Steps:
1. **Login as admin:**
   - Go to http://localhost:4028/signin
   - Use admin credentials

2. **Navigate to:** Admin Users page (`/admin-users`)

3. **Find the test user** you just created (from Test 1)
   - Should show "pending" status (yellow badge)

4. **Click 3-dot menu** on the user row

5. **Click "Activate Account"**

6. **Confirm** the activation dialog

7. **Expected:**
   - Success alert appears
   - User status changes to "active" (green badge)
   - Activation email sent automatically

8. **Check test user's email:**
   - Subject: "🎉 Your Account Has Been Activated!"
   - Contains activation confirmation
   - Shows member ID and tier
   - Dashboard login link
   - Welcome message

9. **Verify in database:**
   ```sql
   SELECT * FROM notification_logs 
   WHERE recipient_email = 'YOUR_TEST_EMAIL@gmail.com'
   ORDER BY created_at DESC;
   ```
   - Should show 2-3 email logs (verification, thank you, activation)
   - Status should be 'sent' or 'delivered'

---

## Test 4: Security Features (5 minutes)

### Test 4a: Disposable Email Blocking
1. Go to signup page
2. Enter email: test@guerrillamail.com
3. Fill other fields
4. Click "Continue"
5. **Expected error:** "Disposable email addresses are not allowed"

**Test these domains:**
- tempmail.com ❌
- throwaway.email ❌
- 10minutemail.com ❌
- mailinator.com ❌
- trashmail.com ❌

### Test 4b: Invalid Email Format
1. Try these emails:
   - "invalidemail" → Error
   - "test@" → Error
   - "@example.com" → Error
   - "test..user@example.com" → Error (double dot)
   - "test@example" → Error (no TLD)

### Test 4c: Rate Limiting
1. Complete registration and reach OTP step
2. Click "Resend verification code"
3. Immediately click "Resend" again
4. **Expected:** Button disabled, shows "Resend code in 60s"
5. Wait for countdown to reach 0
6. Button becomes enabled again

### Test 4d: OTP Expiry
1. Complete registration, receive OTP
2. **Don't enter the code**
3. Wait 15 minutes (or temporarily change expiry to 1 minute for testing)
4. Try to enter the code
5. **Expected error:** "Your OTP has expired. Please request a new one."
6. Timer shows 0:00

---

## Test 5: Database Verification (2 minutes)

### Check email_verification_tokens table:
```sql
-- View recent tokens
SELECT 
  email,
  otp_code,
  attempts,
  expires_at,
  verified_at,
  created_at
FROM email_verification_tokens
ORDER BY created_at DESC
LIMIT 10;
```

**Verify:**
- ✅ Token created for your test email
- ✅ OTP code matches what you received
- ✅ verified_at timestamp populated after successful verification
- ✅ expires_at is 15 minutes after created_at

### Check notification_logs table:
```sql
-- View recent notifications
SELECT 
  recipient_email,
  subject,
  status,
  sent_at,
  delivered_at,
  error_message
FROM notification_logs
ORDER BY created_at DESC
LIMIT 10;
```

**Verify:**
- ✅ 3 entries for your test email:
  1. "Email Verification OTP" (status: sent)
  2. "Registration Thank You" (status: sent)
  3. "Account Activated" (status: sent)
- ✅ No error_message entries
- ✅ sent_at timestamps populated

### Check user_profiles table:
```sql
-- Verify user created with email_verified flag
SELECT 
  full_name,
  email,
  email_verified,
  email_verified_at,
  membership_status,
  membership_tier
FROM user_profiles
WHERE email = 'YOUR_TEST_EMAIL@gmail.com';
```

**Verify:**
- ✅ email_verified = true
- ✅ email_verified_at timestamp populated
- ✅ membership_status = 'active' (after admin activation)

---

## Test 6: Resend Dashboard Verification (2 minutes)

1. **Open Resend Dashboard:** https://resend.com/emails
2. **Login** with your Resend account
3. **Filter by:** Last 24 hours
4. **Verify you see:**
   - Email Verification OTP email (to your test email)
   - Registration Thank You email
   - Account Activated email (if you completed Test 3)

5. **Click on each email** to see:
   - Delivery status (should be "Delivered")
   - Open status (if you opened the email)
   - Time sent
   - Full email content

---

## Test 7: Error Handling (3 minutes)

### Test 7a: Network Error Simulation
1. Turn off WiFi/disconnect network
2. Try to submit registration form
3. **Expected:** Error message about network failure
4. Reconnect network
5. Try again → Should work

### Test 7b: Invalid Template Name
1. Open browser console (F12)
2. In SignUpPage.jsx, temporarily change:
   ```javascript
   templateName: 'Registration Thank You'
   ```
   to:
   ```javascript
   templateName: 'NonExistentTemplate'
   ```
3. Complete registration
4. **Expected:** 
   - Account still created (doesn't block registration)
   - Error logged in console
   - notification_logs shows failed entry

### Test 7c: Supabase Connection Error
1. Temporarily use wrong Supabase URL in .env
2. Try to register
3. **Expected:** Clear error message shown to user
4. Restore correct URL

---

## Test 8: UI/UX Testing (5 minutes)

### Visual Checks:
- ✅ Form validation shows errors in red
- ✅ Success messages show in green
- ✅ Loading spinner appears during submit
- ✅ OTP input accepts only numbers
- ✅ OTP input limited to 6 digits
- ✅ Countdown timer updates every second
- ✅ Resend button shows cooldown countdown
- ✅ "Change email address" link returns to form
- ✅ Success animation shows checkmark icon
- ✅ All buttons disabled during loading

### Mobile Responsive:
1. Open DevTools (F12) → Device Toolbar
2. Select iPhone 12 Pro
3. Test entire registration flow
4. **Verify:**
   - Form inputs are touch-friendly
   - OTP input is large and centered
   - Buttons are full-width
   - Text is readable
   - No horizontal scrolling

---

## Test 9: Edge Cases (5 minutes)

### Case 1: Back Button During OTP Step
1. Start registration, reach OTP step
2. Press browser back button
3. **Expected:** Returns to form with data preserved

### Case 2: Refresh During OTP Step
1. Reach OTP step
2. Refresh page (F5)
3. **Expected:** Returns to step 1 (form), need to restart

### Case 3: Multiple Tabs
1. Open signup in two tabs
2. Start registration in tab 1
3. Complete OTP in tab 1
4. Try to use same OTP in tab 2
5. **Expected:** Error in tab 2 (OTP already used)

### Case 4: Already Registered Email
1. Complete full registration
2. Try to register again with same email
3. **Expected:** Supabase error about existing user

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to send verification email"
**Check:**
1. Resend API key in .env file
2. Internet connection
3. Resend dashboard for error details
4. Browser console for detailed errors

### Issue: OTP not received
**Check:**
1. Spam/junk folder
2. Email address typo
3. Resend dashboard for delivery status
4. notification_logs table for error_message

### Issue: "Invalid or expired OTP code"
**Check:**
1. OTP expired (15-minute limit)
2. Wrong code entered
3. Maximum attempts exceeded (5)
4. Token already verified

### Issue: Activation email not sent
**Check:**
1. Template name in adminService.js (should be "Account Activated")
2. notification_templates table has "Account Activated" template
3. Resend API key configured
4. Browser console for errors

---

## ✅ Success Criteria

**All tests pass if:**
- ✅ Registration requires email verification (no fake emails accepted)
- ✅ Users receive 3 emails total (verification, thank you, activation)
- ✅ OTP expires after 15 minutes
- ✅ Resend cooldown works (60 seconds)
- ✅ Disposable emails blocked
- ✅ Max 5 verification attempts enforced
- ✅ All emails logged in notification_logs
- ✅ Email delivery confirmed in Resend dashboard
- ✅ User profile has email_verified = true
- ✅ Mobile responsive design works
- ✅ Error messages are clear and helpful

---

## 📊 Test Results Template

```
=== EMAIL SYSTEM TEST RESULTS ===

Test 1: Email Verification with OTP
✅ OTP email received
✅ OTP verified successfully
✅ Thank you email received
⏱️ Email delivery time: ____ seconds

Test 2: Thank You Email
✅ Email contains correct information
✅ Dashboard link works

Test 3: Account Activation Email
✅ Admin activation triggers email
✅ Email received by user
✅ All details correct

Test 4: Security Features
✅ Disposable emails blocked
✅ Invalid formats rejected
✅ Rate limiting works
✅ OTP expiry enforced

Test 5: Database Verification
✅ email_verification_tokens populated
✅ notification_logs shows 3 entries
✅ user_profiles.email_verified = true

Test 6: Resend Dashboard
✅ All 3 emails visible
✅ Delivery status: Delivered

Test 7: Error Handling
✅ Network errors handled gracefully
✅ Invalid templates don't block registration

Test 8: UI/UX
✅ All visual elements correct
✅ Mobile responsive

Test 9: Edge Cases
✅ Back button handled
✅ Refresh handled
✅ Multiple tabs handled

OVERALL: ✅ PASS / ❌ FAIL

Notes:
_________________________________
_________________________________
```

---

## 🚀 Ready for Production?

**Before deploying to production:**
1. ✅ All tests pass locally
2. ✅ Resend API key configured in Vercel
3. ✅ Database migration applied to production
4. ✅ No console errors
5. ✅ Mobile testing complete
6. ✅ Email templates reviewed for typos
7. ✅ Test with 5+ real email addresses

**Deploy command:**
```bash
git add .
git commit -m "feat: Add email verification system with OTP, thank you emails, and activation notifications"
git push origin main
```

**Post-deployment:**
1. Test on production URL
2. Monitor Resend dashboard for 24 hours
3. Check notification_logs for failures
4. Gather user feedback
5. Monitor support tickets for email issues
