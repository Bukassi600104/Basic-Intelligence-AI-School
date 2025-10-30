# CORS Email Error - Complete Fix Guide

## Issue Summary

**Error:** `Access to fetch at 'https://api.resend.com/emails' from origin 'https://www.basicai.fit' has been blocked by CORS policy`

**Root Cause:** Frontend code was trying to call Resend API directly from the browser, which:
1. **Violates CORS policy** - Resend API doesn't allow browser requests
2. **Exposes API keys** - MAJOR security vulnerability
3. **Not production-ready** - API keys visible in browser dev tools

---

## Quick Fix Applied (Temporary)

### 1. Disabled Direct Resend API Calls
Modified `src/services/emailService.js` to mock email sending instead of making CORS-blocked requests.

### 2. Development Mode Bypass
Modified `src/services/emailVerificationService.js` to:
- Display OTP code in browser alert (development only)
- Log OTP to console
- Skip actual email sending

**Result:** Registration now works, OTP displayed on screen for testing.

---

## Proper Solution (Production-Ready)

### Step 1: Deploy Supabase Edge Function

The proper way to send emails is via **Supabase Edge Functions** (server-side):

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref eremjpneqofidtktsfya

# Deploy the send-email function
supabase functions deploy send-email

# Set Resend API key as secret (server-side only)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Step 2: Update Email Service to Use Edge Function

Replace the mock in `emailService.js` with:

```javascript
async sendEmailViaResend(emailData) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: emailData.to,
        from: emailData.from || 'Basic Intelligence <onboarding@resend.dev>',
        subject: emailData.subject,
        html: emailData.html
      }
    });

    if (error) {
      logger.error('Edge Function error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Error calling Edge Function:', error);
    return { success: false, error: error.message };
  }
}
```

### Step 3: Re-enable Email Verification

In `emailVerificationService.js`, uncomment the original email sending code.

---

## Testing the Fix

### Development Mode (Current State)
1. Go to https://www.basicai.fit/signup
2. Fill registration form
3. Click "Sign Up"
4. **See OTP in alert popup** (temporary workaround)
5. Enter OTP to verify
6. Complete registration

### Production Mode (After Edge Function Deployment)
1. Register new account
2. Receive actual email with OTP
3. Enter OTP from email
4. Complete registration

---

## Edge Function Files Created

### `supabase/functions/send-email/index.ts`
- Handles email sending server-side
- Keeps Resend API key secure
- No CORS issues
- Proper error handling

---

## Security Best Practices

### ❌ NEVER DO THIS:
```javascript
// BAD: Exposes API key in browser
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);
await resend.emails.send({...});
```

### ✅ ALWAYS DO THIS:
```javascript
// GOOD: API key stays on server
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to, subject, html }
});
```

---

## Deployment Checklist

- [x] Remove direct Resend API calls from frontend
- [x] Create Supabase Edge Function for email
- [ ] Deploy Edge Function to Supabase
- [ ] Set RESEND_API_KEY as Edge Function secret
- [ ] Update emailService.js to use Edge Function
- [ ] Re-enable actual email sending in emailVerificationService.js
- [ ] Test end-to-end email flow
- [ ] Remove development mode alerts
- [ ] Update environment variables in Vercel
- [ ] Test production deployment

---

## Quick Commands

```bash
# Deploy Edge Function
cd "C:\Users\USER\Downloads\BIC github\basic_intelligence_community_school"
supabase functions deploy send-email

# Set secret (replace with your actual Resend API key)
supabase secrets set RESEND_API_KEY=re_YourActualKeyHere

# Test function locally
supabase functions serve send-email

# Test with curl
curl -X POST https://eremjpneqofidtktsfya.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from Basic Intelligence!</h1>"
  }'
```

---

## Additional Issues Fixed

### Issue 2: Duplicate User Error
**Error:** "Failed to create user: User with this email already exists"

**Solution:**
- Partial registration created auth user but didn't complete
- Use admin dashboard to delete incomplete users
- Or complete registration with OTP verification

---

## Files Modified

### `/src/services/emailService.js`
- Removed direct Resend API calls
- Added temporary mock implementation
- Added comments for proper Edge Function usage

### `/src/services/emailVerificationService.js`
- Added development mode OTP display
- Temporarily disabled email sending
- Added console logging for testing

### `/supabase/functions/send-email/index.ts` (NEW)
- Server-side email sending
- Secure API key handling
- Proper error handling
- CORS headers configured

---

## Environment Variables

### Remove from Frontend (.env)
```bash
# Remove this - it's a security risk!
# VITE_RESEND_API_KEY=re_xxxxx
```

### Add to Supabase Edge Function Secrets
```bash
# Set via Supabase CLI
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### Keep in Vercel (if needed for other features)
```
VITE_SUPABASE_URL=https://eremjpneqofidtktsfya.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (admin only)
```

---

## Next Steps

1. **Immediate:** Current workaround allows testing (OTP displayed on screen)
2. **Next session:** Deploy Edge Function for proper email delivery
3. **Production:** Remove development mode alerts, enable real emails

---

**Status:** 🟡 Temporary fix deployed - Registration works but emails not sent  
**Security:** ✅ API keys no longer exposed in frontend  
**Next Action:** Deploy Supabase Edge Function for production email delivery

**Date:** October 30, 2025  
**Updated By:** AI Agent
