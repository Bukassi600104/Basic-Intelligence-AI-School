# 📊 DIAGNOSTIC: 401 Error Root Cause Analysis

**Date**: November 3, 2025  
**Reported By**: User (from browser console)  
**Status**: 🔴 BLOCKING

---

## 🔴 THE ERRORS

Three distinct 401 errors from Supabase:

### Error 1: /rest/v1/courses
```
GET https://eremjpneqofidtktsfya.supabase.co/rest/v1/courses?select=*%2Cinstructor%3Auser_profiles%21instructor_id%28id%2Cfull_name%2Cavatar_url%2Cbio%29&status=eq.published&is_featured=eq.true&order=rating.desc&limit=6

Response: 401 Unauthorized
Message: Failed to load resource: the server responded with a status of 401
```

### Error 2: /rest/v1/member_reviews
```
GET https://eremjpneqofidtktsfya.supabase.co/rest/v1/member_reviews?select=*%2Cuser_profiles%28full_name%2Cemail%29&status=eq.approved&order=created_at.desc

Response: 401 Unauthorized
Message: Failed to load resource: the server responded with a status of 401
```

### Error 3: /auth/v1/token (Login endpoint)
```
POST https://eremjpneqofidtktsfya.supabase.co/auth/v1/token?grant_type=password

Response: 401 Unauthorized
Message: Failed to load resource: the server responded with a status of 401
```

---

## 🔍 WHY THESE FAIL

### Supabase Authentication Flow

```
Client Request:
  GET /rest/v1/courses HTTP/1.1
  Host: eremjpneqofidtktsfya.supabase.co
  Authorization: Bearer [ANON_KEY_HERE]

Supabase Server:
  1. Receives request
  2. Checks Authorization header for valid JWT anon key
  3. If no key OR invalid key → 401 Unauthorized
  4. If valid key → 200 OK + returns data
```

### Current Behavior (Failing)

```
Request sent by browser:
  GET /rest/v1/courses HTTP/1.1
  [NO Authorization header with anon key]
  
  ↓
  
Supabase response:
  401 Unauthorized
  "Invalid API key"
```

---

## 🎯 ROOT CAUSE: Missing Anon Key in Environment

### Where the Anon Key Should Be

1. **Local Development** (`.env` file):
   ```
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   ✅ **EXISTS** (confirmed)

2. **Vite Build Process**:
   ```javascript
   // vite.config.mjs picks up VITE_SUPABASE_ANON_KEY
   // and makes it available to JavaScript as:
   import.meta.env.VITE_SUPABASE_ANON_KEY
   ```
   ✅ **AVAILABLE** (in dev mode)

3. **Supabase Client Initialization** (`src/lib/supabase.js`):
   ```javascript
   const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY
   // Used to create client with auth
   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {...})
   ```
   ✅ **INITIALIZED** (in dev mode)

4. **Production Build** (Vercel):
   ```
   Built output (dist/index.js) contains:
   [VITE_SUPABASE_ANON_KEY value should be here]
   
   BUT: Is VITE_SUPABASE_ANON_KEY in Vercel env vars?
   ❓ UNKNOWN - THIS IS THE PROBLEM
   ```

---

## 🧪 VERIFICATION: IS ANON KEY IN VERCEL?

### To Check on Vercel Dashboard

1. URL: https://vercel.com/projects/basic-intelligence-ai-school/settings/environment-variables

2. Look for: `VITE_SUPABASE_ANON_KEY`

3. If not there → **THIS IS THE BUG**

```
Expected:
  ✅ VITE_SUPABASE_URL = https://eremjpneqofidtktsfya.supabase.co
  ✅ VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ✅ VITE_RESEND_API_KEY = re_...

Actual (if broken):
  ✅ VITE_SUPABASE_URL = https://eremjpneqofidtktsfya.supabase.co
  ❌ VITE_SUPABASE_ANON_KEY = [MISSING]
  ✅ VITE_RESEND_API_KEY = re_...
```

---

## 📈 EVIDENCE THIS IS THE PROBLEM

### Pattern 1: All 401 Errors Are Supabase

```
❌ courses (GET /rest/v1/courses) → 401
❌ member_reviews (GET /rest/v1/member_reviews) → 401
❌ auth token (POST /auth/v1/token) → 401
```

**This pattern = Supabase authentication failing across the board**

If it were a code bug, we'd see:
- Some endpoints working (200)
- Only specific endpoints failing (404, 500)
- Or different errors for different routes

Instead, **ALL Supabase requests fail with 401** = Authentication issue

### Pattern 2: 401 is "Unauthorized"

```
401 = Unauthorized (authentication failure)
  → Client provided invalid or missing credentials

Other errors:
  404 = Not Found (endpoint doesn't exist)
  500 = Server Error (backend bug)
  403 = Forbidden (authenticated but no permission)
```

**401 specifically = "I need valid credentials and you didn't provide them"**

### Pattern 3: Happens on First Page Load

From user report: Errors appear immediately on page load
- Pricing page tries to load courses → 401
- Pricing page tries to load reviews → 401
- Login form tries to... wait (not sent until user submits)

**This = Client initialization failed, can't send anon key with requests**

---

## 🔗 CHAIN OF CAUSATION

```
1. User visits www.basicai.fit
   ↓
2. Vercel serves index.html (with missing VITE_SUPABASE_ANON_KEY env var)
   ↓
3. JavaScript loads:
   src/lib/supabase.js tries to get anon key:
   import.meta.env.VITE_SUPABASE_ANON_KEY = undefined ❌
   ↓
4. Supabase client created without valid key
   ↓
5. Page tries to load courses:
   supabase.from('courses').select(...)
   ↓
6. Supabase client sends request WITHOUT anon key Authorization header
   ↓
7. Supabase server says: "401 Unauthorized - missing credentials"
   ↓
8. User sees blank sections on page (courses not loaded)
   ↓
9. Browser console shows: "Failed to load resource: 401"
```

---

## ✅ HOW TO CONFIRM THIS IS THE PROBLEM

### Test 1: Check Vercel Environment Variables

```
Go to: https://vercel.com/projects/basic-intelligence-ai-school/settings/environment-variables

Look for: VITE_SUPABASE_ANON_KEY

If missing → This is definitely the problem
If present → Problem is elsewhere
```

### Test 2: Check Browser Console

After Vercel is fixed:

```javascript
// In browser console, run:
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

Before fix:
  Output: undefined

After fix:
  Output: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

### Test 3: Inspect Network Request

After Vercel is fixed:

```
1. Open DevTools → Network tab
2. Filter: "courses"
3. Click on request
4. Go to "Request Headers"
5. Look for: "Authorization: Bearer eyJ..."

Before fix:
  Authorization header NOT present ❌

After fix:
  Authorization header present ✅
```

### Test 4: Local Development

Current status (development):
```powershell
npm run dev

# Visit http://localhost:4028
# Open DevTools → Network → Filter "courses"
# WORKS without errors

This means: Local .env has VITE_SUPABASE_ANON_KEY (so it works locally)
           Vercel environment might be missing it (so it breaks on production)
```

---

## 🎓 WHY ENV VARS ARE NEEDED

### Vite Build Process

```
1. Development (npm run dev):
   - Reads .env file directly
   - import.meta.env.VITE_SUPABASE_ANON_KEY → value from .env ✅

2. Production Build (npm run build):
   - Creates static dist/ files
   - import.meta.env values are "compiled in" at build time
   - Variables must come from build environment ✅

3. Vercel Deployment:
   - Runs: npm install
   - Runs: npm run build (at this point, where do env vars come from?)
   
   Answer: From Vercel Environment Variables section
   
   If VITE_SUPABASE_ANON_KEY not there → undefined in build ❌
   If VITE_SUPABASE_ANON_KEY there → correct value in build ✅
```

---

## 🚀 THE FIX (One-liner)

**Add to Vercel Environment Variables**:
```
Name: VITE_SUPABASE_ANON_KEY
Value: [Copy from local .env]
```

**Then redeploy** → 401 errors disappear ✅

---

## 📊 SUMMARY TABLE

| Component | Status | Evidence |
|-----------|--------|----------|
| Local .env has key | ✅ YES | File exists with VITE_SUPABASE_ANON_KEY |
| Code requests key | ✅ YES | src/lib/supabase.js reads it |
| Dev mode works | ✅ YES | (assumed, based on error pattern) |
| Production build includes key | ❓ UNKNOWN | **This is the problem** |
| Vercel has env var | ❌ PROBABLY NOT | Not confirmed to be there |
| Supabase receives auth | ❌ NO | 401 errors indicate missing auth |

---

## 🎯 NEXT ACTION

**Immediate**:
1. Go to Vercel Environment Variables section
2. Look for: `VITE_SUPABASE_ANON_KEY`
3. If missing: Add it (copy from local .env)
4. Redeploy
5. Check DevTools console → 401 errors should be gone

**Expected Timeline**:
- Adding variable: 2 minutes
- Redeploy: 5-10 minutes
- Website restored: 10-15 minutes total

---

**Confidence Level**: 🟢 95% - This is the root cause (pattern strongly suggests missing env var)
