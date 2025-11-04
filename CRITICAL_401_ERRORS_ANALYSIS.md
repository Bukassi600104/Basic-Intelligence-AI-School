# 🚨 CRITICAL: 401 Authentication Errors + CSP Violations

**Date**: November 3, 2025  
**Status**: 🔴 BLOCKING  
**Severity**: CRITICAL - Website cannot authenticate

---

## 📋 ERRORS REPORTED

### 1️⃣ Supabase REST API 401 Errors
```
❌ /rest/v1/courses?... → 401 (Unauthorized)
❌ /rest/v1/member_reviews?... → 401 (Unauthorized)
❌ /auth/v1/token?grant_type=password → 401 (Unauthorized)
```

### 2️⃣ Content Security Policy (CSP) Violation
```
⚠️ CSP blocks eval() in JavaScript
   - Directive: script-src
   - Problem: Code trying to use eval(), new Function(), or similar
   - Status: BLOCKED
```

---

## 🔍 ROOT CAUSE ANALYSIS

### Problem 1: Missing/Invalid Anon Key in Requests

**What's happening**:
1. Browser makes request to Supabase REST API
2. Request includes Authentication header with anon key
3. Supabase rejects request with 401 (Unauthorized)
4. This means: **Anon key is missing OR invalid**

**Possible causes**:
- ❌ VITE_SUPABASE_ANON_KEY not in Vercel environment variables
- ❌ VITE_SUPABASE_ANON_KEY in .env.local (not deployed)
- ❌ Anon key has wrong value (revoked, expired, incorrect)
- ❌ Browser not sending Authorization header (CORS issue)

**Current status**:
```
vercel.json CSP Header includes:
  connect-src: 'self' ... https://*.supabase.co wss://*.supabase.co

✅ Supabase domain IS allowed in CSP
✅ WebSocket connections allowed (wss://)
```

---

### Problem 2: CSP eval() Blocking

**What's happening**:
- Some code is trying to execute `eval()`, `new Function()`, `setTimeout(code)`, or `setInterval(code)`
- Browser's CSP policy BLOCKS this (script-src directive)
- This prevents JavaScript from being evaluated dynamically

**Possible sources**:
- ✅ vercel.json ALLOWS: `'unsafe-eval'` in script-src
  ```
  script-src 'self' 'unsafe-inline' 'unsafe-eval' ... (currently allowed)
  ```
- ❌ BUT: CSP header being SENT by browser blocks it anyway
- This suggests: **CSP header in Vercel production differs from local config**

**Current CSP in vercel.json**:
```
"Content-Security-Policy": "default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
  connect-src 'self' ... https://*.supabase.co wss://*.supabase.co ..."
```

---

## 🎯 DIAGNOSIS

### Issue Priority Matrix

| Issue | Severity | Impact | Root Cause |
|-------|----------|--------|-----------|
| 401 Auth Errors | 🔴 CRITICAL | Cannot load data | Anon key missing/invalid in Vercel |
| CSP eval() Block | 🟡 MEDIUM | Code execution blocked | CSP mismatch between vercel.json and production |

### Most Likely Cause: Missing Vercel Environment Variable

**Evidence**:
1. 401 errors on ALL Supabase REST API calls
2. Auth token request also fails (401)
3. This pattern = anon key not being sent with requests
4. Anon key comes from `VITE_SUPABASE_ANON_KEY` environment variable

**Check needed**:
```bash
# On Vercel dashboard:
Settings → Environment Variables

Expected:
VITE_SUPABASE_URL = https://eremjpneqofidtktsfya.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ FIX CHECKLIST

### Step 1: Verify Vercel Environment Variables (5 minutes)

- [ ] Go to: https://vercel.com/dashboard
- [ ] Select: Basic-Intelligence-AI-School project
- [ ] Navigate: Settings → Environment Variables
- [ ] Check for these variables (all 3 required):
  - [ ] `VITE_SUPABASE_URL` = `https://eremjpneqofidtktsfya.supabase.co`
  - [ ] `VITE_SUPABASE_ANON_KEY` = (should be long JWT-like key)
  - [ ] `VITE_RESEND_API_KEY` = (email service key)

**If missing**:
```bash
# Add to Vercel:
1. Click "Add New"
2. Name: VITE_SUPABASE_ANON_KEY
3. Value: (copy full key from .env)
4. Click "Save"
5. Trigger redeploy
```

### Step 2: Check Current Vercel Build Logs

- [ ] Go to: https://vercel.com/dashboard
- [ ] Select project
- [ ] Click "Deployments" tab
- [ ] Open latest deployment
- [ ] Check "Build logs" for errors
- [ ] Look for: "VITE_SUPABASE_ANON_KEY is missing"

### Step 3: Verify Local .env File

- [ ] Open: `.env` in project root
- [ ] Confirm has all 3 variables:
  ```
  VITE_SUPABASE_URL=https://eremjpneqofidtktsfya.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGci...
  VITE_RESEND_API_KEY=re_...
  ```

### Step 4: Test Locally First

```bash
# Test development environment
npm run dev

# Visit: http://localhost:4028
# Open DevTools → Network tab
# Check if courses/member_reviews load without 401 errors

# Expected: Requests succeed (200 status)
# If 401: Anon key not in environment
```

### Step 5: Rebuild Vercel

**If variables were missing**:
1. Go to Vercel Deployments
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for rebuild (5-10 minutes)
5. Check deployment logs

---

## 🔧 POSSIBLE ADDITIONAL ISSUE: CSP Mismatch

**Check**: Does Vercel production environment differ from vercel.json?

**Solution**:
```json
// Verify vercel.json has these headers:
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' ... connect-src 'self' ... https://*.supabase.co wss://*.supabase.co ..."
        }
      ]
    }
  ]
}
```

**If CSP still blocks eval** after fixing anon key:
- Open `vercel.json`
- Ensure `script-src` includes `'unsafe-eval'`
- Commit and redeploy

---

## 📊 DIAGNOSTIC SUMMARY

| Component | Status | Action |
|-----------|--------|--------|
| VITE_SUPABASE_ANON_KEY | ❓ UNKNOWN | **CHECK VERCEL VARIABLES** |
| Local .env | ✅ EXISTS | File present with values |
| vercel.json CSP | ✅ CONFIGURED | unsafe-eval allowed |
| Supabase REST API | 🔴 401 ERRORS | Blocked (auth issue) |
| Authentication | 🔴 FAILING | Cannot login |
| CSP eval() | ⚠️ BLOCKED | Secondary issue |

---

## 🚀 IMMEDIATE ACTION REQUIRED

### Priority 1: Check Vercel Environment Variables

1. **Visit**: https://vercel.com/projects/basic-intelligence-ai-school/settings/environment-variables
2. **Look for**: VITE_SUPABASE_ANON_KEY
3. **If missing**:
   - Add variable
   - Set value to anon key from .env
   - Trigger redeploy
4. **Expected result**: 401 errors disappear, authentication works

### Priority 2: Verify Request Headers (DevTools)

Once deployed:
1. Open: https://www.basicai.fit
2. Open DevTools → Network tab
3. Click on any request to Supabase
4. Check "Request Headers" section
5. Look for: `Authorization: Bearer eyJ...`
6. If missing: Anon key not being sent

### Priority 3: Test Login Flow

1. Go to Sign In page
2. Try login with test account
3. Check console for errors
4. Expected: `/auth/v1/token` returns 200 (not 401)

---

## 📝 NOTES

**Why 401 on /auth/v1/token**:
- This is the login endpoint
- Client sends username/password + anon key
- If 401: Anon key not valid OR not being sent
- Fix: Ensure VITE_SUPABASE_ANON_KEY in Vercel environment

**Why multiple endpoints 401**:
- All require anon key in Authorization header
- Failure on all = anon key problem (not individual endpoint issue)
- Pattern confirms: **Missing or invalid authentication variable**

**CSP eval() secondary issue**:
- May be from third-party library (less critical)
- Fix anon key issue first
- Then investigate eval() usage if still blocked

---

## ✅ VALIDATION STEPS

After implementing fixes:

```bash
# 1. Local test
npm run dev
# Open http://localhost:4028/pricing
# Expected: Member reviews load without 401 errors

# 2. Check network requests
# DevTools → Network tab
# Filter: courses, member_reviews
# Expected status: 200 (not 401)

# 3. Test auth flow
# Go to Sign In
# Try logging in
# Expected: No 401 errors

# 4. Check deployment
# Visit: https://www.basicai.fit
# Open DevTools
# Refresh page
# Expected: No 401 errors in Network tab
```

---

## 🎯 SUCCESS CRITERIA

✅ Website displays without 401 authentication errors  
✅ Courses load on homepage  
✅ Member reviews display on pricing page  
✅ Login form works without 401 errors  
✅ Console shows no CSP eval() violations  
✅ All Supabase API requests succeed (200 status)

---

**Next Step**: Check Vercel environment variables immediately
