# ⚡ ACTIONABLE CHECKLIST: Fix 401 Errors NOW

**Time Required**: ~15-20 minutes  
**Difficulty**: Easy (Copy/Paste)  
**Urgency**: 🔴 CRITICAL

---

## 📋 BEFORE YOU START

- [ ] You have access to Vercel dashboard
- [ ] You have local project folder open
- [ ] You have browser ready to visit Vercel

---

## 🔧 STEP 1: GET THE ANON KEY (1 minute)

### Option A: Using Terminal (Recommended)

**Run this command** in project folder:
```powershell
Get-Content ".env" | Select-String "VITE_SUPABASE_ANON_KEY"
```

**Copy the full value** that appears after the `=`

Example output:
```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

Copy: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...`

### Option B: Manual (Open .env in Editor)

1. Open: `.env` file (in project root)
2. Find: `VITE_SUPABASE_ANON_KEY=...`
3. Select and copy: Everything AFTER the `=` (not including the line prefix)

---

## ✅ STEP 2: ADD TO VERCEL (2 minutes)

### Go to Vercel Dashboard

**URL**: https://vercel.com/projects/basic-intelligence-ai-school/settings/environment-variables

**OR manually navigate**:
1. Visit: https://vercel.com
2. Log in with your account
3. Select: "Basic-Intelligence-AI-School" project
4. Click: "Settings"
5. Click: "Environment Variables"

### Add the Variable

- [ ] Click blue "Add New" button
- [ ] **Name field**: Type exactly: `VITE_SUPABASE_ANON_KEY`
- [ ] **Value field**: Paste the key you copied
- [ ] **Environments**: Check ALL three:
  - [ ] Production
  - [ ] Preview  
  - [ ] Development
- [ ] Click "Save"

**Screenshot of what to see**:
```
[Name] VITE_SUPABASE_ANON_KEY
[Value] eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[✓] Production [✓] Preview [✓] Development
[Save]
```

---

## 🚀 STEP 3: TRIGGER REDEPLOY (1 minute)

### Option A: Automatic (Recommended)

**Just push a commit** from terminal:
```powershell
git add -A
git commit -m "fix: add environment variable - retrigger deploy"
git push origin main
```

Vercel automatically rebuilds.

### Option B: Manual Redeploy

1. Go to: https://vercel.com/projects/basic-intelligence-ai-school/deployments
2. Find: Most recent deployment
3. Click: "..." menu (three dots)
4. Click: "Redeploy"
5. Wait for rebuild to start

---

## ⏳ STEP 4: WAIT FOR REBUILD (10 minutes)

**What's happening**:
- Vercel runs: `npm install`
- Vercel runs: `npm run build` (WITH the env var)
- Vercel deploys: `dist/` to production
- Website updates: Live at www.basicai.fit

**Monitor progress**:
1. Go to: https://vercel.com/projects/basic-intelligence-ai-school/deployments
2. Watch the latest deployment status
3. Look for: Green checkmark ✅ (means deployed)
4. Look for: Build logs showing success

**Expected status**:
```
Status: Building... → Ready (✅)
```

---

## ✅ STEP 5: VERIFY THE FIX (5 minutes)

### Open the Website

- [ ] Visit: https://www.basicai.fit
- [ ] Wait for page to load (should be fast)
- [ ] Look at the page - should NOT be blank
- [ ] See: Homepage with courses visible

### Check DevTools Console

1. Right-click on page → "Inspect"
2. Click "Console" tab
3. Look for red errors
4. Should see: 0 errors
5. Should NOT see: "401 Unauthorized" or "Failed to load resource"

### Check Network Tab

1. DevTools → "Network" tab
2. Reload page: Press F5
3. Filter for: "courses" or "member_reviews"
4. Check status column
5. Should see: **200 OK** (green)
6. Should NOT see: **401 Unauthorized** (red)

### Try the Pricing Page

1. Click: "Pricing" link in navigation
2. Page should load: Courses and reviews visible
3. NO 401 errors in console

### Try the Sign In

1. Click: "Sign In" link
2. Form should appear
3. Open DevTools → Network tab
4. Type email/password and click "Sign In"
5. Should see: **200 OK** on auth request
6. Should NOT see: **401 Unauthorized**

---

## ✨ SUCCESS CONFIRMATION

### You'll Know It's Fixed When:

- [ ] Website loads (not blank page)
- [ ] Homepage displays correctly
- [ ] Courses visible on pricing page
- [ ] Member reviews visible on pricing page
- [ ] Sign In form works
- [ ] DevTools console: 0 errors
- [ ] DevTools network: No 401 errors
- [ ] All API requests show 200 status

---

## 🆘 TROUBLESHOOTING

### If Still Getting 401 Errors After 10 Minutes

**Try these in order**:

1. **Hard Refresh Browser**
   ```
   Press: Ctrl+Shift+R (Windows)
   Or: Cmd+Shift+R (Mac)
   ```
   Wait 2 minutes, then reload.

2. **Check Deployment Logs**
   - Go to: https://vercel.com/projects/.../deployments
   - Click latest deployment
   - Click "View Deployment"
   - Check if it says "Ready" or "Error"

3. **Check Environment Variable Was Saved**
   - Go to: Environment Variables section
   - Verify: VITE_SUPABASE_ANON_KEY is listed
   - Check: Value starts with `eyJ` (JWT format)

4. **Wait Longer**
   - Cache might take 15-20 minutes to propagate
   - Try accessing 15 minutes after redeploy

5. **Manual Redeploy Again**
   - Go to Deployments
   - Click "..." on latest
   - Click "Redeploy"
   - Wait another 10 minutes

### If Site Shows "Configuration Error"

This means env vars are still undefined.

Check:
- [ ] VITE_SUPABASE_ANON_KEY is in Vercel
- [ ] VITE_SUPABASE_URL is in Vercel
- [ ] Names are spelled EXACTLY correctly (with VITE_ prefix)
- [ ] Values don't have extra spaces

---

## 🎓 WHAT YOU'RE DOING

You're adding the **anon key** (public authentication key) to Vercel's environment variables.

**Why it's needed**:
- Local development: Uses `.env` file
- Production: Uses Vercel environment variables
- Without it: Browser can't authenticate with Supabase
- Result: All API requests return 401 Unauthorized

**After you add it**:
- Vercel rebuilds with the key included
- Browser gets anon key from build
- Browser can authenticate with Supabase
- API requests succeed (200 status)
- Website works correctly

---

## 📊 ESTIMATED TIMELINE

| Task | Time | Done? |
|------|------|-------|
| Get anon key from .env | 1 min | [ ] |
| Add to Vercel | 2 min | [ ] |
| Trigger redeploy | 1 min | [ ] |
| Wait for Vercel | 10 min | [ ] |
| Verify in browser | 5 min | [ ] |
| **TOTAL** | **~19 min** | [ ] |

---

## 🎯 FINAL CHECKLIST

Before considering this done:

- [ ] VITE_SUPABASE_ANON_KEY added to Vercel
- [ ] Vercel deployment shows green checkmark ✅
- [ ] Website loads at www.basicai.fit
- [ ] No 401 errors in DevTools console
- [ ] Courses load on pricing page
- [ ] Member reviews load on pricing page
- [ ] Sign In form works
- [ ] Network requests show 200 status

---

## ✅ ALL DONE?

**Congratulations! Phase 0 is complete.**

Next steps:
1. Website fully functional
2. Proceed with Phase 1.4 (Key rotation)
3. Proceed with Phase 1.5 (RLS policies)
4. Continue security remediation

---

**Questions?** Refer to these detailed docs:
- Quick explanations → QUICK_FIX_401_ERRORS.md
- Deep technical details → DIAGNOSTIC_401_ROOT_CAUSE.md
- Full analysis → CRITICAL_401_ERRORS_ANALYSIS.md

**Ready?** Go to Vercel and add that environment variable!
