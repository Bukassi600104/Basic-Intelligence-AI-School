# 🚨 QUICK ACTION: Fix 401 Authentication Errors

**Status**: 🔴 BLOCKING - Website cannot load data  
**Time to Fix**: 5 minutes  
**Difficulty**: Easy (Copy/Paste environment variables)

---

## ⚡ IMMEDIATE ACTION (Do This Now)

### Step 1: Get the Anon Key from Local .env

**File**: `.env` in project root

Run this command:
```powershell
Get-Content ".env" | Select-String "VITE_SUPABASE_ANON_KEY"
```

**Output will show**:
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

**Copy the full value** (everything after the `=`)

---

### Step 2: Add to Vercel Dashboard

1. **URL**: https://vercel.com/projects/basic-intelligence-ai-school/settings/environment-variables

2. **OR manually**:
   - Visit: https://vercel.com
   - Select project: "Basic-Intelligence-AI-School"
   - Click: "Settings"
   - Click: "Environment Variables"

3. **Click "Add New"**

4. **Fill in**:
   ```
   Name: VITE_SUPABASE_ANON_KEY
   Value: [PASTE THE KEY YOU COPIED]
   Environments: [Check] Production
   [Check] Preview
   [Check] Development
   ```

5. **Click "Save"**

6. **Also verify these exist**:
   ```
   VITE_SUPABASE_URL = https://eremjpneqofidtktsfya.supabase.co
   VITE_RESEND_API_KEY = [your email API key]
   ```

---

### Step 3: Trigger Redeploy

1. Go to: https://vercel.com/projects/basic-intelligence-ai-school/deployments
2. Find latest deployment
3. Click "..." menu
4. Click "Redeploy"
5. Wait 5-10 minutes for rebuild

**OR** just push a commit:
```powershell
git add -A
git commit -m "fix: retrigger vercel deploy with env vars"
git push origin main
```

---

## ✅ VERIFY THE FIX

### After Vercel Redeploys (5-10 minutes):

1. **Open browser**: https://www.basicai.fit
2. **Open DevTools**: Right-click → "Inspect"
3. **Go to Network tab**: Click "Network" tab
4. **Reload page**: Press F5
5. **Look for requests**:
   - `/courses` - should be **200 OK** (not 401)
   - `/member_reviews` - should be **200 OK** (not 401)
   - `/auth/v1/token` - if you login, should be **200 OK** (not 401)

**If still 401 errors**:
- Wait another 5 minutes (cache propagation)
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Check Vercel deployment logs for errors

---

## 🔍 VERIFY ANON KEY CORRECT

Before adding to Vercel, make sure you have the right key:

```powershell
# Show the key
Get-Content ".env" | Select-String "VITE_SUPABASE_ANON_KEY"

# Should output something like:
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M6InN1cGFiYXNlIiwiMf...

# Key characteristics:
# - Starts with: eyJ (JWT format)
# - Contains: three parts separated by dots (header.payload.signature)
# - Length: typically 200+ characters
```

---

## 🎯 WHAT'S HAPPENING

**Problem**:
```
Browser requests: GET /rest/v1/courses
Supabase checks: Is there an Authorization header with a valid anon key?
Response: 401 Unauthorized (No valid key found)
Result: Courses don't load ❌
```

**After fix**:
```
Browser requests: GET /rest/v1/courses (with Authorization header)
Supabase checks: Valid anon key found ✅
Response: 200 OK + courses data
Result: Courses load ✅
```

---

## 📋 CHECKLIST

- [ ] Copied VITE_SUPABASE_ANON_KEY from local .env
- [ ] Logged into Vercel
- [ ] Found Environment Variables section
- [ ] Added VITE_SUPABASE_ANON_KEY variable
- [ ] Verified it's set for Production + Preview + Development
- [ ] Clicked Save
- [ ] Triggered redeploy (or git push)
- [ ] Waited 5-10 minutes
- [ ] Opened www.basicai.fit in browser
- [ ] Checked DevTools Network tab
- [ ] Verified courses load (200 status, not 401)
- [ ] Verified member_reviews load (200 status, not 401)

---

## 🆘 IF STILL BROKEN

1. **Check deployment logs**:
   - Vercel → Deployments → Latest → Click "Logs"
   - Look for: "VITE_SUPABASE_ANON_KEY" error
   - OR look for: Build succeeded with no errors

2. **Verify with curl** (in terminal):
   ```powershell
   # Get courses (should not return 401)
   curl -H "Authorization: Bearer YOUR_ANON_KEY" `
     "https://eremjpneqofidtktsfya.supabase.co/rest/v1/courses?select=*&limit=1"
   ```

3. **Check local build**:
   ```powershell
   npm run build
   npm run preview
   # Visit: http://localhost:3000
   # Check if courses load locally
   ```

4. **Last resort**: Check if Supabase account is active
   - Go to: https://supabase.com/dashboard
   - Verify project exists and is active

---

## ⏱️ TIME ESTIMATE

| Step | Time |
|------|------|
| Copy env var from .env | 1 min |
| Add to Vercel | 2 min |
| Trigger redeploy | 1 min |
| Wait for rebuild | 5-10 min |
| Verify in browser | 2 min |
| **TOTAL** | **~15-20 min** |

---

## 📞 SUPPORT

If this doesn't work:
1. Check Vercel deployment logs for specific error
2. Verify anon key is exactly correct (copy/paste again)
3. Try hard refresh (Ctrl+Shift+R)
4. Check if Supabase project is active on supabase.com dashboard
5. Verify no typos in environment variable name (must be exactly: `VITE_SUPABASE_ANON_KEY`)

---

**Next**: After fixing 401 errors, proceed with Phase 1.4-1.5 security work
