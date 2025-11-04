# 🔴 CRITICAL: Fix Vercel Environment Variables NOW

**Date**: November 4, 2025  
**Status**: URGENT - Website broken due to missing env vars  
**Root Cause**: `VITE_SUPABASE_ANON_KEY` not configured in Vercel dashboard

---

## ❌ WHAT'S BROKEN

**Live Site Errors** (www.basicai.fit):
```
401 Unauthorized - eremjpneqofidtktsfya.supabase.co/auth/v1/token
401 Unauthorized - eremjpneqofidtktsfya.supabase.co/rest/v1/courses
401 Unauthorized - eremjpneqofidtktsfya.supabase.co/rest/v1/member_reviews

Content-Security-Policy: eval blocked (secondary issue)
```

**Why**: Browser receiving `undefined` for Supabase auth key → All API calls fail with 401

---

## ✅ YOUR LOCAL .ENV IS CORRECT

```properties
VITE_SUPABASE_URL=https://eremjpneqofidtktsfya.supabase.co ✅
VITE_SUPABASE_ANON_KEY=eyJhbGc... ✅
VITE_RESEND_API_KEY=re_ggm9rXgX_... ✅
```

**Problem**: Vercel dashboard does NOT have these variables set!

---

## 🚀 FIX (5 MINUTES)

### Step 1: Open Vercel Dashboard
```
https://vercel.com/dashboard
→ Select project: "Basic-Intelligence-AI-School"
→ Settings tab (top navigation)
```

### Step 2: Add Environment Variables

**Go to**: Settings → Environment Variables

Add **3 variables** (copy values from your local `.env`):

```
NAME: VITE_SUPABASE_URL
VALUE: https://eremjpneqofidtktsfya.supabase.co
ENVIRONMENTS: Production, Preview, Development
```

```
NAME: VITE_SUPABASE_ANON_KEY
VALUE: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZW1qcG5lcW9maWR0a3RzZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3NDEwMzMsImV4cCI6MjA0MjMxNzAzM30.v5V8P9SiLGQh8g7JovwiX0vVt0vvJHUMTzGCLbDKm8o
ENVIRONMENTS: Production, Preview, Development
```

```
NAME: VITE_RESEND_API_KEY
VALUE: re_ggm9rXgX_GdqwmWmQVe6hNnUBmFaTkqiG
ENVIRONMENTS: Production, Preview, Development
```

### Step 3: Redeploy
```
Vercel will auto-redeploy when env vars saved
OR manually trigger: Deployments → Redeploy
```

### Step 4: Verify
Wait 2-3 minutes, then check:
```
https://www.basicai.fit → DevTools Console
Should show: NO 401 errors
Should show: ✅ Courses loading
```

---

## 🔍 HOW TO VERIFY IT WORKED

### In DevTools (F12 → Network tab):

**Before Fix** ❌:
```
GET /auth/v1/token → 401 Unauthorized
GET /rest/v1/courses → 401 Unauthorized
```

**After Fix** ✅:
```
GET /auth/v1/token → 200 OK
GET /rest/v1/courses → 200 OK
```

### In DevTools Console:

```javascript
// Run this in console:
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

// Before: undefined ❌
// After: eyJhbGc... ✅
```

---

## ⚠️ CSP EVAL ISSUE (Secondary)

Your `vercel.json` CSP header **already includes** `'unsafe-eval'`:
```json
"script-src 'self' 'unsafe-inline' 'unsafe-eval' ..."
```

**But** it's being blocked. Two possibilities:

1. **Vercel not redeploying** → CSP header not applied
   - Fix: After adding env vars, manually redeploy
   
2. **Third-party library using eval()** → Need to investigate
   - Check: DevTools → Console → CSP violations
   - Common culprits: framer-motion, Recharts, or bundled libraries

**Action**: Fix auth first, then eval will resolve naturally with redeploy.

---

## 📋 QUICK CHECKLIST

- [ ] Open Vercel Dashboard
- [ ] Go to Settings → Environment Variables
- [ ] Add VITE_SUPABASE_URL (copy from .env)
- [ ] Add VITE_SUPABASE_ANON_KEY (copy from .env)
- [ ] Add VITE_RESEND_API_KEY (copy from .env)
- [ ] Save (all environments: Production + Preview + Development)
- [ ] Wait 2-3 min for auto-redeploy
- [ ] Visit https://www.basicai.fit
- [ ] Open DevTools → Network tab
- [ ] Check: NO 401 errors
- [ ] Check: Courses section loads
- [ ] Check: Login form appears

---

## 🎯 SUCCESS CRITERIA

When fixed, you should see:

✅ Homepage displays (not blank)  
✅ Courses section shows data  
✅ Pricing section visible  
✅ Sign In button works  
✅ DevTools Console: 0 critical errors  
✅ DevTools Network: No 401 Unauthorized  

---

## 🆘 IF STILL BROKEN AFTER FIX

1. **Hard refresh**: Ctrl+Shift+R (clear cache)
2. **Check Vercel logs**: Deployments → Latest → View Logs
3. **Verify redeploy happened**: Should see "Environment variables updated" message
4. **Check value was saved**: Settings → Environment Variables → confirm values shown

---

## 💾 REFERENCE: YOUR LOCAL .ENV VALUES

```properties
VITE_SUPABASE_URL=https://eremjpneqofidtktsfya.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZW1qcG5lcW9maWR0a3RzZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3NDEwMzMsImV4cCI6MjA0MjMxNzAzM30.v5V8P9SiLGQh8g7JovwiX0vVt0vvJHUMTzGCLbDKm8o
VITE_RESEND_API_KEY=re_ggm9rXgX_GdqwmWmQVe6hNnUBmFaTkqiG
```

---

## 🔗 VERCEL DASHBOARD LINKS

- **Project Dashboard**: https://vercel.com/bukassi600104/basic-intelligence-ai-school
- **Environment Variables**: https://vercel.com/bukassi600104/basic-intelligence-ai-school/settings/environment-variables
- **Deployments**: https://vercel.com/bukassi600104/basic-intelligence-ai-school/deployments

---

## 📞 SUPPORT

After setting env vars:
1. Vercel auto-redeploys (2-3 min)
2. Visit website
3. Open DevTools (F12)
4. Check Network/Console tabs
5. Report back if still seeing 401 errors

**ETA to fix**: 5 minutes + 3 minutes redeploy = **8 minutes total**

---

**Time-Sensitive**: Do this NOW to get website working. Then we can proceed with homepage design.
