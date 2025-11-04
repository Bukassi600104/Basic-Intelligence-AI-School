# VERCEL ENV VAR SETUP - STEP BY STEP VISUAL GUIDE

## 🎯 GOAL
Add 3 environment variables to Vercel so website can authenticate with Supabase.

---

## STEP 1️⃣ - OPEN VERCEL DASHBOARD

**URL**: https://vercel.com/dashboard

**What you'll see**:
```
┌─────────────────────────────┐
│ Vercel Dashboard            │
│                             │
│ Projects:                   │
│ ├─ Basic-Intelligence... ← SELECT THIS
│ ├─ other-project-1         │
│ └─ other-project-2         │
└─────────────────────────────┘
```

---

## STEP 2️⃣ - GO TO PROJECT SETTINGS

**After selecting your project, click**:
```
Top Navigation Bar:
┌────────────────────────────────────┐
│ Overview | Deployments | Functions │
│ [Settings] ← CLICK HERE            │
└────────────────────────────────────┘
```

---

## STEP 3️⃣ - OPEN ENVIRONMENT VARIABLES

**Left Sidebar**:
```
Settings
├─ General
├─ Analytics
├─ Domains
├─ Environment Variables ← CLICK HERE
├─ Git
└─ ...other options...
```

---

## STEP 4️⃣ - ADD FIRST VARIABLE: VITE_SUPABASE_URL

**Click**: "Add New"

```
┌─────────────────────────────────────┐
│ Name:                               │
│ [VITE_SUPABASE_URL]                │
│                                     │
│ Value:                              │
│ [https://eremjpneq...supabase.co]  │
│                                     │
│ Environments:                       │
│ ☑ Production                        │
│ ☑ Preview                          │
│ ☑ Development                      │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

**Click**: SAVE

---

## STEP 5️⃣ - ADD SECOND VARIABLE: VITE_SUPABASE_ANON_KEY

**Click**: "Add New"

```
┌─────────────────────────────────────┐
│ Name:                               │
│ [VITE_SUPABASE_ANON_KEY]           │
│                                     │
│ Value:                              │
│ [eyJhbGciOiJIUzI1NiIs...long key..│ 
│                                     │
│ Environments:                       │
│ ☑ Production                        │
│ ☑ Preview                          │
│ ☑ Development                      │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

**Value to copy**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZW1qcG5lcW9maWR0a3RzZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY3NDEwMzMsImV4cCI6MjA0MjMxNzAzM30.v5V8P9SiLGQh8g7JovwiX0vVt0vvJHUMTzGCLbDKm8o
```

**Click**: SAVE

---

## STEP 6️⃣ - ADD THIRD VARIABLE: VITE_RESEND_API_KEY

**Click**: "Add New"

```
┌─────────────────────────────────────┐
│ Name:                               │
│ [VITE_RESEND_API_KEY]              │
│                                     │
│ Value:                              │
│ [re_ggm9rXgX_GdqwmWmQVe6hNnUBmFa...│
│                                     │
│ Environments:                       │
│ ☑ Production                        │
│ ☑ Preview                          │
│ ☑ Development                      │
│                                     │
│ [Save] [Cancel]                     │
└─────────────────────────────────────┘
```

**Value to copy**:
```
re_ggm9rXgX_GdqwmWmQVe6hNnUBmFaTkqiG
```

**Click**: SAVE

---

## STEP 7️⃣ - VERIFY ALL VARIABLES SAVED

**You should now see**:
```
Environment Variables

✅ VITE_SUPABASE_URL
   ├─ Production ✓
   ├─ Preview ✓
   └─ Development ✓

✅ VITE_SUPABASE_ANON_KEY
   ├─ Production ✓
   ├─ Preview ✓
   └─ Development ✓

✅ VITE_RESEND_API_KEY
   ├─ Production ✓
   ├─ Preview ✓
   └─ Development ✓
```

---

## STEP 8️⃣ - WAIT FOR AUTO-REDEPLOY

Vercel **automatically redeploys** when env vars are saved.

**Check**: Deployments tab
```
Expected to see a new deployment starting in 10-30 seconds:

Deployments
├─ [Latest] "Environment variables updated" - Building...
└─ [Previous] "fix(critical): remove vendor..." - ✓ Complete
```

---

## STEP 9️⃣ - VERIFY WEBSITE WORKS

**After redeploy completes** (2-3 minutes):

1. **Go to**: https://www.basicai.fit
2. **Open DevTools**: Press `F12`
3. **Go to**: Console tab
4. **Look for**:
   ```
   ✅ App.jsx initialized
   📦 Environment variables check: {
        VITE_SUPABASE_URL: ✅ SET
        VITE_SUPABASE_ANON_KEY: ✅ SET
   }
   ```

---

## 🔟 CHECK NETWORK REQUESTS

**DevTools → Network tab**:

**Before** ❌:
```
GET /auth/v1/token → 401 Unauthorized ❌
GET /rest/v1/courses → 401 Unauthorized ❌
```

**After** ✅:
```
GET /auth/v1/token → 200 OK ✅
GET /rest/v1/courses → 200 OK ✅
```

---

## ✅ SUCCESS!

When you see:
- ✅ Homepage loads (not blank)
- ✅ Courses section populated with data
- ✅ No 401 errors in Network tab
- ✅ Console shows env vars SET

**Then**: Website is FIXED and ready for homepage design work! 🚀

---

## 🆘 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Still seeing 401 errors | Hard refresh: Ctrl+Shift+R |
| Redeploy not starting | Click "Redeploy" button manually in Deployments tab |
| Values not showing | Wait 30 seconds, refresh page |
| Copy-paste errors | Double-check values match exactly (no extra spaces) |

---

## ⏱️ TOTAL TIME: ~8 minutes

- Setup: 5 min
- Redeploy: 2-3 min
- Verification: 1 min

**Do this NOW and report back when fixed!**
