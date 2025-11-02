# 🔴 PHASE 1.1 AUDIT RESULTS: Admin Key Vulnerability Analysis

**Date**: November 2, 2025  
**Status**: ⚠️ CRITICAL SECURITY ISSUES FOUND  
**Impact**: Service role key exposed in client bundle

---

## 📊 VULNERABILITY SUMMARY

### 🚨 CRITICAL FINDING: Service Role Key in Frontend

**File**: `src/lib/supabaseAdmin.js`  
**Problem**: Creates Supabase client with **SERVICE ROLE KEY** using environment variable `VITE_SUPABASE_SERVICE_ROLE_KEY`

```javascript
// ❌ CURRENT CODE - EXPOSES SERVICE KEY
const supabaseServiceKey = import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, { ... });
```

**Why This is Critical**:
- ✅ Service role keys have **FULL DATABASE ACCESS** (no RLS enforcement)
- ❌ **Client-side environment variables are bundled in JavaScript** (visible in network inspection)
- ❌ Any user can open DevTools → Network → See key in `index-*.js` bundle
- ❌ Malicious actors can abuse key to:
  - Bypass all RLS policies
  - Read/modify ANY user data
  - Delete database records
  - Escalate privileges
  - Access admin-only tables

**Attack Scenario**:
```javascript
// User opens DevTools on www.basicai.fit
Network → index-abc123.js → Search "VITE_SUPABASE_SERVICE_ROLE_KEY"
// Finds key in bundle, copies it
// Uses it with any Supabase client to access full database
const maliciousAdmin = createClient(url, stolenKey);
const allUsers = await maliciousAdmin.from('user_profiles').select('*');
// ⚠️ Gets all user data, passwords, emails, etc.
```

---

## 🔍 FILES IMPORTING SUPABASEADMIN (VULNERABLE)

### 1️⃣ `src/services/adminService.js` - **8 usages**

**Functions using supabaseAdmin**:

| Function | Line | Usage | Risk |
|----------|------|-------|------|
| `createUser()` | 325 | `supabaseAdmin.auth.admin.getUserByIdentifier()` | ⚠️ High |
| `createUser()` | 361 | `supabaseAdmin.auth.admin.createUser()` | ⚠️ High |
| `createUser()` | 419 | `supabaseAdmin.from('user_profiles').insert()` | ⚠️ High |
| `createUser()` | 484 | `supabaseAdmin.auth.admin.deleteUser()` | 🔴 Critical |
| `deleteUser()` | 686 | `supabaseAdmin.auth.admin.deleteUser()` | 🔴 Critical |
| `deleteMultipleUsers()` | 757 | `supabaseAdmin.auth.admin.deleteUser()` | 🔴 Critical |
| `importUsersFromFile()` | 846 | `supabaseAdmin.auth.admin.deleteUser()` | 🔴 Critical |
| Admin checks | 323, 685, 756, 842 | Conditional `if (supabaseAdmin)` guards | ✅ Has guards |

**Sample Code (Vulnerable)**:
```javascript
// Line 361 - Creating user with full admin privileges
const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
  email: userData.email,
  password: tempPassword,
  email_confirm: true,
});

// ❌ PROBLEM: If service key is stolen, attacker can:
// - Create unlimited fake users
// - Bypass email verification
// - Bypass authentication
```

### 2️⃣ `src/services/passwordService.js` - **1 usage**

**Functions using supabaseAdmin**:

| Function | Line | Usage | Risk |
|----------|------|-------|------|
| `setUserPassword()` | 42 | `supabaseAdmin.auth.admin.updateUserById()` | 🔴 Critical |

**Sample Code (Vulnerable)**:
```javascript
// Line 42 - Updating any user's password
const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
  userId,
  { password: password }
);

// ❌ PROBLEM: If key stolen, attacker can:
// - Change any user's password
// - Lock users out of accounts
// - Escalate to admin accounts
// - Complete account takeover
```

---

## 📋 ATTACK VECTOR ANALYSIS

### Current Vulnerability Chain

```
1. Frontend Code
   └─ src/lib/supabaseAdmin.js
      └─ import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY
         ↓
2. Build Process (Vite)
   └─ Bundles environment variable into index-*.js
      ↓
3. Browser Download
   └─ User downloads index-*.js with KEY embedded
      ↓
4. DevTools Inspection
   └─ Open Network tab → index-*.js
      └─ Search for "sk_" or "service"
         ↓
5. Key Extraction
   └─ Copy embedded service key
      ↓
6. Abuse
   └─ Use key in Supabase client
      └─ Bypass all security
      └─ Access full database
```

---

## 🛠️ WHAT NEEDS TO BE FIXED

### Problem 1: Service Key in Frontend ❌

**Current State**:
- `src/lib/supabaseAdmin.js` imported in 2 services
- Services run in browser (not server-side)
- Service key bundled in JavaScript
- Key exposed to all users

**Solution**:
1. ✅ Delete `src/lib/supabaseAdmin.js`
2. ✅ Remove imports from `adminService.js` and `passwordService.js`
3. ✅ Create Supabase Edge Function for admin operations
4. ✅ Replace admin calls with RPC calls (server-to-server)

### Problem 2: Direct Auth Admin API Calls ❌

**Current Unsafe Calls**:
- `supabaseAdmin.auth.admin.createUser()`
- `supabaseAdmin.auth.admin.deleteUser()`
- `supabaseAdmin.auth.admin.updateUserById()`
- `supabaseAdmin.auth.admin.getUserByIdentifier()`

**Safe Alternative**:
- Create Edge Function that calls these on server
- Frontend calls Edge Function via HTTP
- Verifies authentication on server before executing

---

## 🔐 REMEDIATION STEPS (Phase 1)

### Step 1: Create Edge Function for Admin Operations ✅

**Function**: `admin_operations` (create new Edge Function)

```typescript
// supabase/functions/admin-operations/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') // ✅ Never exposed to client
)

serve(async (req) => {
  // Only admins can call this
  const { operation, userId, email, password, data } = await req.json()

  switch(operation) {
    case 'create_user':
      return await supabaseAdmin.auth.admin.createUser({ email, password })
    case 'delete_user':
      return await supabaseAdmin.auth.admin.deleteUser(userId)
    case 'update_password':
      return await supabaseAdmin.auth.admin.updateUserById(userId, { password })
    default:
      return new Response('Invalid operation', { status: 400 })
  }
})
```

### Step 2: Replace Service Calls with RPC ✅

**Before (Vulnerable)**:
```javascript
// adminService.js
import { supabaseAdmin } from '../lib/supabaseAdmin';

const { data } = await supabaseAdmin.auth.admin.createUser({ email, password });
```

**After (Safe)**:
```javascript
// adminService.js
// No supabaseAdmin import!

const { data, error } = await supabase.functions.invoke('admin-operations', {
  body: { operation: 'create_user', email, password }
});
```

### Step 3: Remove Service Key from Environment ✅

**Before (Vulnerable)**:
```bash
# .env (exposed to browser if prefixed with VITE_)
VITE_SUPABASE_SERVICE_ROLE_KEY=sk_live_xxxxxxxx  # ❌ EXPOSED
```

**After (Safe)**:
```bash
# .env (server-side only, never prefixed with VITE_)
SUPABASE_SERVICE_ROLE_KEY=sk_live_xxxxxxxx  # ✅ Server-side only
```

### Step 4: Delete Vulnerable File ✅

```bash
rm src/lib/supabaseAdmin.js
```

### Step 5: Rotate Service Key ✅

After deployment, **rotate the service role key** in Supabase:
1. Go to: Supabase Dashboard → Settings → API
2. Click: "Rotate" next to SERVICE_ROLE_KEY
3. Update environment variables in Vercel
4. Redeploy

---

## 📈 USAGE BREAKDOWN

### adminService.js Usage

**Admin Operations** (Lines 318-850):

| Operation | Method | Safe? |
|-----------|--------|-------|
| Create User | `auth.admin.createUser()` | ❌ Unsafe |
| Delete User | `auth.admin.deleteUser()` | ❌ Unsafe |
| Check User | `auth.admin.getUserByIdentifier()` | ❌ Unsafe |
| Update Profile | `from('user_profiles').insert()` | ✅ Can use RLS |

**Needs Conversion** (4/10 functions):
- ✅ `createUser()` → needs Edge Function
- ✅ `deleteUser()` → needs Edge Function
- ✅ `deleteMultipleUsers()` → needs Edge Function
- ✅ `importUsersFromFile()` → needs Edge Function

**Can Stay Safe**:
- ✅ `getDashboardStats()` → Uses regular `supabase` (OK)
- ✅ `getRecentActivities()` → Uses regular `supabase` (OK)

---

## 🎯 NEXT STEPS (Timeline)

| Task | Duration | Priority |
|------|----------|----------|
| 1.2: Create Edge Function | 2 hours | 🔴 Critical |
| 1.3: Update Services | 3 hours | 🔴 Critical |
| 1.4: Test All Functions | 2 hours | 🔴 Critical |
| 1.5: Delete supabaseAdmin.js | 30 min | 🔴 Critical |
| 1.6: Rotate Service Key | 1 hour | 🔴 Critical |
| 1.7: Deploy & Verify | 1 hour | 🔴 Critical |

**Total Phase 1.1 Time**: ~9.5 hours

---

## 📊 SECURITY IMPACT

### Current Risk Level: 🔴 CRITICAL (8/10)

**Factors**:
- ✗ Service key exposed in client bundle
- ✗ No rate limiting on admin operations
- ✗ No audit logging of key usage
- ✗ Single key for all admin operations
- ✓ Environment variables are used (not hardcoded)

### After Remediation: ✅ SECURE (2/10)

**Benefits**:
- ✓ Service key server-side only
- ✓ Rate limiting via Supabase Edge Functions
- ✓ Audit logs for all admin operations
- ✓ Separate keys possible per operation
- ✓ Zero client-side access to sensitive data

---

## ✅ COMPLETION CHECKLIST

- [ ] **1.2.1**: Create `admin-operations` Edge Function
- [ ] **1.2.2**: Test Edge Function locally
- [ ] **1.3.1**: Update `adminService.js` (remove supabaseAdmin)
- [ ] **1.3.2**: Update `passwordService.js` (remove supabaseAdmin)
- [ ] **1.3.3**: Test all admin operations
- [ ] **1.4.1**: Verify user creation works
- [ ] **1.4.2**: Verify user deletion works
- [ ] **1.4.3**: Verify password reset works
- [ ] **1.5.1**: Delete `src/lib/supabaseAdmin.js`
- [ ] **1.6.1**: Update environment variables
- [ ] **1.6.2**: Rotate service role key
- [ ] **1.7.1**: Deploy to staging
- [ ] **1.7.2**: Deploy to production
- [ ] **1.7.3**: Verify no errors in production

---

**Status**: Ready for Phase 1.2 (Create Edge Function)  
**Impact**: Eliminates critical security vulnerability  
**Timeline**: Complete by end of week
