# 🚀 EMAIL SENDING - STEP-BY-STEP FIX GUIDE

**Objective**: Fix "Failed to send a request to the Edge Function" error  
**Time Required**: 30 minutes  
**Status**: Ready to implement  

---

## 🎯 THE FIX (In Priority Order)

### STEP 1: Add RESEND_API_KEY to Supabase ⭐ DO THIS FIRST

**Time**: 2 minutes  
**Probability of Fixing Issue**: 80%

#### 1a. Get Your Resend API Key

1. Visit: https://resend.com/api-keys
2. Find your API key in the list (format: `re_xxxxxxxxxxxxxxxxxxxxx`)
3. Copy it (click the copy button or select all)
4. **Keep it safe** - don't share this key

**Screenshot Reference**:
```
Resend Dashboard
├── API Keys (left sidebar)
│   └── Your API Key: re_12345678901234567890...
│       └── [Copy Button]
```

#### 1b. Add to Supabase Edge Function Secrets

1. Go to: **https://app.supabase.com**
2. Select your project: **basic_intelligence_community_school**
3. Click: **Settings** (left sidebar)
4. Click: **Edge Function Secrets** (should be under Settings)
5. Click: **"Add Secret"** button (or "Create Secret")

**Form to Fill**:
```
Name: RESEND_API_KEY
Value: [paste your API key here - format: re_xxxxx...]
```

6. Click: **"Create Secret"** or **"Add"** button

**Verification**:
```
After saving, you should see:
✅ RESEND_API_KEY ••••••••••••••• (masked)
```

#### 1c. Optional - Redeploy Edge Function

Usually NOT needed, but if emails still don't work:

```bash
# In your terminal:
cd c:\Users\USER\Downloads\BIC\ github\basic_intelligence_community_school

# Deploy the send-email function
supabase functions deploy send-email

# Output should show:
# ✓ send-email deployed successfully
```

---

### STEP 2: Verify Resend Account Status

**Time**: 3 minutes  
**Impact**: Confirm account is active

#### 2a. Check Account Status

Visit: https://resend.com/dashboard

**Look For**:
- ✅ Account status: "Active" (not suspended)
- ✅ No billing warnings
- ✅ API quota remaining

**If Suspended**:
- Check email for suspension notice
- Verify payment method on file
- Contact Resend support: support@resend.com

#### 2b. Verify API Key Active

1. Go to: https://resend.com/api-keys
2. Find your key in the list
3. Verify: Status = **"Active"** (not disabled)

**If Disabled**:
- Click to enable OR
- Generate new key and replace in Supabase

#### 2c. Check Rate Limits

1. Visit: https://resend.com/dashboard
2. Look for: "Quota" or "API Usage" section
3. Check daily email count

**Resend Free Tier Limit**: 150 emails/day

**If Over Limit**:
- Wait until tomorrow, OR
- Upgrade plan

---

### STEP 3: Deploy Diagnostic Function

**Time**: 5 minutes  
**Purpose**: Get detailed error messages

#### 3a. Deploy to Supabase

```bash
# In your terminal:
cd c:\Users\USER\Downloads\BIC\ github\basic_intelligence_community_school

# Deploy diagnostic function:
supabase functions deploy diagnose-email

# Expected output:
# ✓ diagnose-email deployed successfully
```

#### 3b. Test Diagnostic Function

**Option A: Simple GET Test**
```bash
curl -X GET "https://[project-ref].functions.supabase.co/diagnose-email" \
  -H "Authorization: Bearer [ANON_KEY]"
```

**Option B: Test Email**
```bash
curl -X POST "https://[project-ref].functions.supabase.co/diagnose-email" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -d '{"testEmail": "your-email@example.com"}'
```

**Where to Find Values**:
- `[project-ref]`: Supabase Dashboard → Settings → General
- `[ANON_KEY]`: Supabase Dashboard → Settings → API Keys → anon

#### 3c: Review Diagnostic Output

Look for one of these responses:

**✅ SUCCESS Response**:
```json
{
  "timestamp": "2025-11-11T...",
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
    "testResult": "SUCCESS - Email System Working"
  }
}
```
✅ **This means emails should work now!**

**❌ Failure: Missing API Key**:
```json
{
  "environment": {
    "apiKeyPresent": false,
    "apiKeyFormat": "MISSING"
  },
  "configuration": {
    "testResult": "FAILED - Missing API Key"
  }
}
```
→ **Go back to Step 1 and add the API key**

**❌ Failure: Invalid API Key**:
```json
{
  "environment": {
    "apiKeyFormat": "INVALID"
  },
  "configuration": {
    "recommendations": [
      "Invalid API key or key has been revoked"
    ]
  }
}
```
→ **Regenerate key at https://resend.com/api-keys**

**❌ Failure: Cannot Reach Resend**:
```json
{
  "connectivity": {
    "resendApiReachable": false
  },
  "recommendations": [
    "Cannot reach Resend API"
  ]
}
```
→ **Check internet connection and Resend status page**

---

### STEP 4: Test Email Sending

**Time**: 2 minutes  
**Purpose**: Verify system end-to-end

#### 4a. Manual Test Through Admin UI

1. Go to: Admin Dashboard → Notifications (or Email Templates)
2. Create/select a notification template
3. Send test email to yourself
4. **Check inbox within 30 seconds**

**Expected Result**:
- ✅ Email received
- ✅ Subject and content correct
- ✅ No errors in console

#### 4b. Check Notification Logs

```sql
-- Query database for recent attempts
SELECT 
  id,
  recipient_email,
  subject,
  status,
  error_message,
  created_at
FROM notification_logs
ORDER BY created_at DESC
LIMIT 5;

-- Expected status: 'sent' (not 'failed')
```

---

### STEP 5: Set Up Custom Domain (OPTIONAL but RECOMMENDED)

**Time**: 20 minutes  
**Impact**: Production-ready email sender

**Current Issue**: Using test domain `onboarding@resend.dev` (Resend sandbox)

#### 5a. Add Custom Domain to Resend

1. Visit: https://resend.com/domains
2. Click: **"Add Domain"** button
3. Enter: Your domain (e.g., `basicai.fit`)
4. Click: **"Add"**

#### 5b. Configure DNS Records

Resend will give you 2 records:

**SPF Record**:
```
Type: TXT
Name: basicai.fit (or root)
Value: v=spf1 include:resend.mx ~all
```

**DKIM Record**:
```
Type: CNAME
Name: default._domainkey
Value: [resend-provided-value]
```

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add these records.

#### 5c: Wait for Verification

- ⏳ Typically 5-10 minutes
- Resend will automatically verify when records are found
- Check Resend dashboard for status

#### 5d: Update Edge Function

Edit `supabase/functions/send-email/index.ts`:

**Current (Line 80)**:
```typescript
from: emailRequest.from || 'Basic Intelligence <onboarding@resend.dev>',
```

**Change To**:
```typescript
from: emailRequest.from || 'Basic Intelligence <no-reply@basicai.fit>',
```

**Deploy**:
```bash
supabase functions deploy send-email
```

---

## 🧪 VERIFICATION CHECKLIST

### After Step 1 (API Key Added)
- [ ] API key added to Supabase Edge Function Secrets
- [ ] Secret shows in Supabase dashboard
- [ ] No errors when saving

### After Step 2 (Resend Verified)
- [ ] Resend account status: Active
- [ ] API key: Active (not disabled)
- [ ] Rate limit: Not exceeded

### After Step 3 (Diagnostic Test)
- [ ] Diagnostic function deployed successfully
- [ ] Test returns SUCCESS response
- [ ] All checks show ✅

### After Step 4 (Email Test)
- [ ] Test email sent without errors
- [ ] Email received in inbox
- [ ] Sender: Basic Intelligence
- [ ] Subject and content correct

### After Step 5 (Custom Domain - Optional)
- [ ] Custom domain added to Resend
- [ ] DNS records configured
- [ ] Domain verified (shows ✅ in Resend)
- [ ] Edge function updated
- [ ] Test email sent from custom domain

---

## ❌ TROUBLESHOOTING

### Problem: "Email service not configured"

**Cause**: RESEND_API_KEY not set in Supabase

**Solution**:
1. Go to Supabase Dashboard → Settings → Edge Function Secrets
2. Verify RESEND_API_KEY exists
3. If not: Add it (follow Step 1)
4. If yes: Delete and re-add it

### Problem: "Invalid API token"

**Cause**: Wrong or revoked API key

**Solution**:
1. Go to https://resend.com/api-keys
2. Check if key still exists
3. If not: Generate new key
4. Update Supabase Edge Function Secret
5. Test again

### Problem: "Rate limit exceeded"

**Cause**: Too many emails sent today (>150)

**Solution**:
- **Free Tier**: Wait until tomorrow
- **Paid Tier**: Upgrade plan at https://resend.com/pricing

### Problem: "Domain not verified"

**Cause**: Using test domain (onboarding@resend.dev) or custom domain not verified

**Solution**:
- **Option A**: Use test domain (works for testing)
- **Option B**: Add verified custom domain (Step 5)

### Problem: Email sent but not delivered

**Cause**: Could be spam folder or recipient email issues

**Solutions**:
1. Check spam/junk folder
2. Verify recipient email in database:
   ```sql
   SELECT email FROM user_profiles WHERE id = '[user-id]';
   ```
3. Test with your own email address
4. Check Resend dashboard for bounce notifications

### Problem: Still getting "Failed to send request to Edge Function"

**Diagnosis Steps**:
1. Check console errors (F12 → Console)
2. Run diagnostic function (Step 3)
3. Query notification_logs for error_message
4. Check Supabase function logs:
   ```bash
   supabase functions logs send-email
   ```
5. Visit Resend dashboard for API errors

---

## 📊 QUICK REFERENCE

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Add RESEND_API_KEY to Supabase | 2 min | 🔴 DO THIS FIRST |
| 2 | Verify Resend Account | 3 min | 🟡 Important |
| 3 | Deploy & Test Diagnostic | 5 min | 🟡 Helpful |
| 4 | Test Email Sending | 2 min | ✅ Verification |
| 5 | Set Up Custom Domain | 20 min | 🟢 Optional |

---

## 🎯 SUCCESS CRITERIA

✅ **Email system is working when**:
1. Test email sent without errors
2. Email received in inbox
3. notification_logs shows status = 'sent'
4. No errors in console or Supabase logs
5. Diagnostic function returns SUCCESS

---

## 💡 TIPS & BEST PRACTICES

**Tip 1**: Always save API keys securely - never share them  
**Tip 2**: Use custom domain for production (more professional)  
**Tip 3**: Monitor notification_logs for failures  
**Tip 4**: Test emails with your own address first  
**Tip 5**: Keep Resend account status page bookmarked: https://status.resend.com  

---

## 📞 NEED HELP?

**For Email Issues**:
- Check: Supabase Edge Function logs
- Query: notification_logs table
- Test: Diagnostic function
- Contact: Resend support (support@resend.com)

**For Supabase Issues**:
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Community: https://discord.gg/supabase

---

**Last Updated**: November 11, 2025  
**Version**: 1.0  
**Status**: Ready to implement  

