# 📊 EMAIL SYSTEM DIAGNOSTIC WORKFLOW

**Purpose**: Visual guide to email sending flow, failure points, and diagnostic steps  
**Created**: November 11, 2025  

---

## 🔄 COMPLETE EMAIL FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN SENDS EMAIL                            │
│              (Via Email Template Form / Admin UI)               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│        notificationService.sendNotification()                   │
│  ✅ Gets template from database                                 │
│  ✅ Processes variables ({{full_name}}, {{email}}, etc)        │
│  ✅ Validates recipient email                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│          emailService.sendEmail()                               │
│  ✅ Gets recipient details from database                        │
│  ✅ Formats email HTML template                                 │
│  ✅ Calls sendEmailViaResend()                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│       emailService.sendEmailViaResend()                         │
│  ✅ Invokes Supabase Edge Function                              │
│  📍 this.supabase.functions.invoke('send-email')               │
│  📝 Passes: to, subject, html, from                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ✅ Request reaches Edge Function
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│   Edge Function: send-email (Deno/TypeScript)                  │
│   File: supabase/functions/send-email/index.ts                 │
│                                                                  │
│   STEP 1: Check RESEND_API_KEY                                  │
│   ├─ const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')    │
│   ├─ if (!RESEND_API_KEY) → ❌ ERROR: "Service not configured" │
│   └─ if exists → ✅ CONTINUE                                    │
│                                                                  │
│   STEP 2: Validate Request Body                                 │
│   ├─ Parse JSON request                                         │
│   ├─ Check: to, subject, html fields exist                      │
│   ├─ if missing → ❌ ERROR: "Missing required fields"           │
│   └─ if valid → ✅ CONTINUE                                     │
│                                                                  │
│   STEP 3: Call Resend API                                       │
│   ├─ fetch('https://api.resend.com/emails')                    │
│   ├─ Headers: Authorization: Bearer ${RESEND_API_KEY}          │
│   ├─ Body: { from, to, subject, html }                         │
│   └─ if fails → ❌ ERROR (various causes)                       │
│                                                                  │
│   STEP 4: Parse Response                                        │
│   ├─ const resendData = await resendResponse.json()            │
│   ├─ if ok → ✅ Extract message ID                              │
│   └─ if error → ❌ Log Resend error message                     │
│                                                                  │
│   STEP 5: Return Result                                         │
│   ├─ Success: { success: true, data: { id: '...' } }           │
│   └─ Failure: { error: '...', details: {...} }                 │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    Response to Client
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
    ✅ SUCCESS                          ❌ FAILURE
    (Email sent)                        (Error logged)
         │                                   │
         └────────────┬──────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │  Log to notification_logs   │
        │  - status: 'sent'/'failed'  │
        │  - error_message (if error) │
        │  - recipient_email          │
        │  - subject                  │
        └─────────────────────────────┘
                      │
              ✅ AUDIT TRAIL COMPLETE
```

---

## 🔴 FAILURE SCENARIOS

### Failure Point 1: Missing API Key (MOST LIKELY)

```
Edge Function Execution:
├─ Deno.env.get('RESEND_API_KEY') → undefined
└─ ❌ RETURNS: "Email service not configured"

Root Cause:
- RESEND_API_KEY not in Supabase Edge Function Secrets

Fix:
1. Supabase Dashboard → Settings → Edge Function Secrets
2. Add Secret: Name=RESEND_API_KEY, Value=re_xxxxx
3. Save → Done
```

### Failure Point 2: Invalid API Key Format

```
Edge Function Execution:
├─ API Key: "invalid_key_format" (doesn't start with 're_')
├─ Resend API rejects: "Invalid API token"
└─ ❌ RETURNS: "Failed to send email"

Root Cause:
- API key corrupted or manually edited
- Wrong key pasted (from different service)

Fix:
1. Go to https://resend.com/api-keys
2. Verify correct key format: re_xxxxx (50+ chars)
3. Update Supabase Edge Function Secret
```

### Failure Point 3: Resend API Unreachable

```
Edge Function Execution:
├─ fetch('https://api.resend.com/emails') → Network Error
├─ Error: "Could not reach Resend API"
└─ ❌ RETURNS: "Network error"

Root Cause:
- Resend API down
- Internet connection issue
- Firewall/proxy blocking

Fix:
1. Check: https://status.resend.com
2. Check internet connection
3. Check Supabase logs for details
```

### Failure Point 4: Rate Limit Exceeded

```
Edge Function Execution:
├─ Resend API response: 429 (Too Many Requests)
├─ Message: "Rate limit exceeded"
└─ ❌ RETURNS: "Rate limit exceeded"

Root Cause:
- Free tier limit: 150 emails/day exceeded
- Sending too many emails at once

Fix:
1. Wait until tomorrow (free tier)
2. OR upgrade to paid plan
3. OR batch emails over time
```

### Failure Point 5: Domain Not Verified

```
Edge Function Execution:
├─ Sender: Basic Intelligence <onboarding@resend.dev>
├─ Status: ⚠️ This is Resend's TEST DOMAIN
├─ Behavior: Only works with test recipients
└─ ⚠️ Production Emails May Fail

Root Cause:
- Using Resend sandbox domain
- Real recipients may not receive email

Fix (RECOMMENDED):
1. Add custom domain to Resend
2. Configure DNS (SPF/DKIM)
3. Update Edge Function sender
```

---

## 🧪 DIAGNOSTIC FLOW

```
START: User reports email not working
         │
         ▼
┌─────────────────────────────────────┐
│  Question 1: Did you set           │
│  RESEND_API_KEY in Supabase?        │
└────────┬────────────────────────────┘
         │
    ┌────┴─────┐
    │           │
   NO          YES
    │           │
    ▼           ▼
❌ PROBLEM  ┌─────────────────────────────────┐
   FOUND   │  Question 2: Does API key       │
           │  start with 're_'?              │
           └────────┬────────────────────────┘
                    │
                ┌───┴────┐
                │        │
               NO       YES
                │        │
                ▼        ▼
           ❌ PROBLEM  ┌─────────────────────────────────┐
              FOUND   │  Run Diagnostic Function:       │
                      │  /diagnose-email                │
                      │  POST: Send test email          │
                      └────────┬────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
               SUCCEEDS            FAILS WITH:
                    │                     │
                    ▼                     ▼
               ✅ EMAIL WORKS    ┌──────────────────────┐
                    │            │ Error Message:       │
                    │            │ - Invalid API token? │
                    │            │ - Rate limited?      │
                    │            │ - Domain issue?      │
                    │            │ - Network error?     │
                    │            │ - Other?             │
                    │            └──────────────────────┘
                    │                     │
         Log in notification_logs    FIX based on message
              status='sent' ✅       (See failure scenarios)
```

---

## 📋 STEP-BY-STEP DIAGNOSTIC CHECKLIST

```
LEVEL 1: Environment Check (5 minutes)
┌─────────────────────────────────────────────────────┐
│ ☐ RESEND_API_KEY exists in Supabase Secrets        │
│ ☐ API Key format: starts with 're_'                │
│ ☐ API Key length: >40 characters                    │
│ ☐ Supabase project accessible                       │
│ ☐ No typos in secret name (case-sensitive!)         │
└─────────────────────────────────────────────────────┘
      ❌ If any FAIL → ADD/FIX API KEY

LEVEL 2: Resend Account Check (5 minutes)
┌─────────────────────────────────────────────────────┐
│ ☐ Resend account active (not suspended)             │
│ ☐ Resend API key still active/enabled               │
│ ☐ Daily email quota not exceeded (150+)             │
│ ☐ Resend API responding (status.resend.com)         │
│ ☐ IP not blocked by Resend                          │
└─────────────────────────────────────────────────────┘
      ❌ If any FAIL → CHECK RESEND DASHBOARD

LEVEL 3: Function Check (5 minutes)
┌─────────────────────────────────────────────────────┐
│ ☐ Edge Function deployed (send-email ACTIVE)        │
│ ☐ Edge Function has access to secrets               │
│ ☐ Function logs show execution                      │
│ ☐ No timeout errors in logs                         │
│ ☐ Request body valid JSON                           │
└─────────────────────────────────────────────────────┘
      ❌ If any FAIL → REDEPLOY EDGE FUNCTION

LEVEL 4: Integration Check (5 minutes)
┌─────────────────────────────────────────────────────┐
│ ☐ notificationService calling emailService          │
│ ☐ emailService calling Edge Function                │
│ ☐ Error handling in all layers                      │
│ ☐ Database logging capturing attempts               │
│ ☐ Response being returned to client                 │
└─────────────────────────────────────────────────────┘
      ❌ If any FAIL → CHECK SERVICE CODE

LEVEL 5: Database Check (5 minutes)
┌─────────────────────────────────────────────────────┐
│ ☐ notification_logs table exists                    │
│ ☐ Recent entries in table                           │
│ ☐ Status field shows 'sent' or 'failed'             │
│ ☐ Error messages logged for failures                │
│ ☐ Recipient emails valid                            │
└─────────────────────────────────────────────────────┘
      ❌ If any FAIL → CHECK DATABASE QUERIES
```

---

## 🔧 DIAGNOSTIC FUNCTION RESPONSE

### Successful Response (Status 200)

```json
{
  "timestamp": "2025-11-11T15:30:45.123Z",
  "environment": {
    "apiKeyPresent": true,
    "apiKeyFormat": "VALID",
    "apiKeyLength": 50
  },
  "connectivity": {
    "resendApiReachable": true,
    "responseTime": 234
  },
  "configuration": {
    "testResult": "SUCCESS - Email System Working",
    "recommendations": [
      "✅ Email system is operational"
    ]
  },
  "testEmail": {
    "success": true,
    "messageId": "00112233-4455-6677-8899-aabbccddeeff"
  }
}
```

### Failed Response: Missing API Key (Status 400)

```json
{
  "timestamp": "2025-11-11T15:30:45.123Z",
  "environment": {
    "apiKeyPresent": false,
    "apiKeyFormat": "MISSING",
    "apiKeyLength": 0
  },
  "connectivity": {
    "resendApiReachable": false,
    "responseTime": 0
  },
  "configuration": {
    "testResult": "FAILED - Missing API Key",
    "recommendations": [
      "🔴 CRITICAL: RESEND_API_KEY not set in Supabase Edge Function Secrets",
      "1. Go to Supabase Dashboard",
      "2. Settings → Edge Function Secrets",
      "3. Click Add Secret",
      "4. Name: RESEND_API_KEY",
      "5. Value: re_xxxx... (from Resend)",
      "6. Click Create Secret"
    ]
  }
}
```

### Failed Response: Invalid API Key (Status 400)

```json
{
  "environment": {
    "apiKeyFormat": "INVALID"
  },
  "configuration": {
    "recommendations": [
      "🟠 WARNING: API Key does not start with 're_'",
      "1. Visit https://resend.com/api-keys",
      "2. Verify correct key format",
      "3. Update Supabase Edge Function Secret"
    ]
  }
}
```

---

## 🎯 QUICK DECISION TREE

```
Email not working?
    │
    ├─→ Have you added RESEND_API_KEY? ──No──→ ❌ ADD IT NOW (2 min)
    │                                    Yes
    │                                     │
    ├─→ Does key start with 're_'?  ──No──→ ❌ GET CORRECT KEY (5 min)
    │                                   Yes
    │                                    │
    ├─→ Is Resend account active?  ──No──→ ❌ CHECK RESEND STATUS (5 min)
    │                                  Yes
    │                                   │
    ├─→ Is rate limit exceeded?   ──Yes──→ ⚠️ WAIT OR UPGRADE (varies)
    │                                   No
    │                                   │
    ├─→ Edge Function deployed?   ──No──→ ✅ DEPLOY FUNCTION (5 min)
    │                                  Yes
    │                                   │
    └─→ All checks pass?          ──Yes──→ ✅ SHOULD WORK! Test it.
                                      No
                                       │
                                       ✅ REFER TO DETAILED GUIDE
```

---

## 📞 SUPPORT COMMAND REFERENCE

### Deploy Diagnostic Function

```bash
# Navigate to project
cd c:\Users\USER\Downloads\BIC\ github\basic_intelligence_community_school

# Deploy diagnostic tool
supabase functions deploy diagnose-email

# Expected output:
# ✓ Function deployed successfully
```

### Run Diagnostic Test

```bash
# GET: Check configuration
curl -X GET "https://[PROJECT-REF].functions.supabase.co/diagnose-email"

# POST: Send test email
curl -X POST "https://[PROJECT-REF].functions.supabase.co/diagnose-email" \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@example.com"}'

# Where:
# [PROJECT-REF] = From Supabase Dashboard → Settings → General
```

### Check Supabase Logs

```bash
# View send-email function logs
supabase functions logs send-email

# View recent entries (last 50 lines)
supabase functions logs send-email | tail -50
```

### Query Email Logs

```sql
-- Check recent email sending attempts
SELECT 
  recipient_email,
  subject,
  status,
  error_message,
  created_at
FROM notification_logs
ORDER BY created_at DESC
LIMIT 10;

-- Count failures
SELECT 
  status,
  COUNT(*) as count
FROM notification_logs
GROUP BY status;
```

---

## ✨ SUCCESS INDICATORS

✅ **System is working when**:
1. Diagnostic function returns SUCCESS
2. Test email sent without errors
3. Email received in target inbox
4. notification_logs shows status='sent'
5. Supabase logs show success message
6. Admin UI sends email without errors
7. No console errors in browser
8. Multiple consecutive emails work

❌ **System has issues when**:
- Any diagnostic check fails
- Error messages reference missing API key
- Test email not received
- notification_logs shows status='failed'
- Supabase logs show error messages
- Admin UI shows error popup
- Random email failures (rate limit)

---

**Workflow Document**: EMAIL_SYSTEM_DIAGNOSTIC_WORKFLOW.md  
**Created**: November 11, 2025  
**Purpose**: Visual guide to email system diagnostics  
**Related**: EMAIL_FIX_GUIDE.md | EMAIL_SENDING_INVESTIGATION.md  

