# 🔧 PHASE 1.2-1.3 IMPLEMENTATION GUIDE: Admin Operations Migration

**Date**: November 2, 2025  
**Status**: 🟡 IN PROGRESS  
**Objective**: Move admin operations from client to Supabase Edge Function

---

## 📋 COMPLETED

### ✅ Edge Function Created
**File**: `supabase/functions/admin-operations/index.ts`

**Operations Supported**:
1. ✅ `create_user` - Create new user with auth
2. ✅ `delete_user` - Delete user account
3. ✅ `update_password` - Update user password
4. ✅ `get_user_by_email` - Fetch user by email

**Security**:
- ✅ Admin verification via JWT token
- ✅ Service key never exposed to client
- ✅ All operations authenticated

---

## 🎯 PHASE 1.3: Update Service Calls

### Task 1: Update `adminService.js`

**Changes Needed**:

#### 1. Remove supabaseAdmin import

**BEFORE**:
```javascript
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';  // ❌ REMOVE THIS
```

**AFTER**:
```javascript
import { supabase } from '../lib/supabase';
// supabaseAdmin removed - now use Edge Function instead
```

#### 2. Update `createUser()` function

**BEFORE (Lines 318-430)**:
```javascript
export const adminService = {
  createUser: async (userData, tempPassword) => {
    try {
      if (supabaseAdmin) {
        const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserByIdentifier(userData.email);
        if (existingAuthUser?.user) {
          return { data: null, error: 'User with this email already exists' };
        }
      }

      const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: tempPassword,
        email_confirm: true,
      });

      if (authError) {
        return { data: null, error: authError.message };
      }

      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .insert([{ id: authUserData.user.id, ...userData }]);

      if (error) {
        // Cleanup: delete auth user if profile creation fails
        if (supabaseAdmin) {
          await supabaseAdmin.auth.admin.deleteUser(authUserData.user.id);
        }
        return { data: null, error: error.message };
      }

      return { data: { id: authUserData.user.id, ...userData }, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  },
```

**AFTER (Updated)**:
```javascript
export const adminService = {
  createUser: async (userData, tempPassword) => {
    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return { data: null, error: 'User with this email already exists' };
      }

      // Call Edge Function to create user (server-side with service key)
      const { data: edgeFunctionResponse, error: edgeFunctionError } = 
        await supabase.functions.invoke('admin-operations', {
          body: {
            operation: 'create_user',
            email: userData.email,
            password: tempPassword
          }
        });

      if (edgeFunctionError || !edgeFunctionResponse?.success) {
        return { 
          data: null, 
          error: edgeFunctionResponse?.error || edgeFunctionError?.message || 'Failed to create user'
        };
      }

      const authUserId = edgeFunctionResponse.data.userId;

      // Create user profile in database
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([{ 
          id: authUserId, 
          ...userData,
          email: userData.email 
        }])
        .select()
        .single();

      if (profileError) {
        // Cleanup: delete auth user if profile creation fails
        await supabase.functions.invoke('admin-operations', {
          body: {
            operation: 'delete_user',
            userId: authUserId
          }
        });
        return { data: null, error: profileError.message };
      }

      return { data: profile, error: null };
    } catch (error) {
      logger.error('createUser error:', error);
      return { data: null, error: error.message };
    }
  },
```

#### 3. Update `deleteUser()` function

**BEFORE (Lines 680-710)**:
```javascript
deleteUser: async (userId) => {
  try {
    // ... existing code ...
    
    if (supabaseAdmin) {
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        return { data: null, error: deleteAuthError.message };
      }
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    return { data: { message: 'User deleted successfully' }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
},
```

**AFTER (Updated)**:
```javascript
deleteUser: async (userId) => {
  try {
    // Call Edge Function to delete user auth account
    const { data: edgeFunctionResponse, error: edgeFunctionError } = 
      await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'delete_user',
          userId: userId
        }
      });

    if (edgeFunctionError || !edgeFunctionResponse?.success) {
      return { 
        data: null, 
        error: edgeFunctionResponse?.error || edgeFunctionError?.message || 'Failed to delete user'
      };
    }

    // Delete user profile from database
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    return { data: { message: 'User deleted successfully' }, error: null };
  } catch (error) {
    logger.error('deleteUser error:', error);
    return { data: null, error: error.message };
  }
},
```

#### 4. Update `deleteMultipleUsers()` function

**BEFORE (Lines 750-790)**:
```javascript
deleteMultipleUsers: async (userIds) => {
  try {
    // Delete from auth for each user
    for (const userId of userIds) {
      if (supabaseAdmin) {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteAuthError) {
          logger.error(`Error deleting auth user ${userId}:`, deleteAuthError);
        }
      }
    }

    // Delete profiles from database
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .in('id', userIds);

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: { message: `${userIds.length} users deleted successfully` }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
},
```

**AFTER (Updated)**:
```javascript
deleteMultipleUsers: async (userIds) => {
  try {
    // Delete auth accounts for each user
    const deleteErrors = [];
    for (const userId of userIds) {
      const { data: response, error: edgeFunctionError } = 
        await supabase.functions.invoke('admin-operations', {
          body: {
            operation: 'delete_user',
            userId: userId
          }
        });

      if (edgeFunctionError || !response?.success) {
        deleteErrors.push({ userId, error: response?.error || edgeFunctionError?.message });
      }
    }

    // Delete profiles from database
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .in('id', userIds);

    if (profileError) {
      return { data: null, error: profileError.message };
    }

    if (deleteErrors.length > 0) {
      logger.warn('Errors deleting auth accounts:', deleteErrors);
    }

    return { 
      data: { 
        message: `${userIds.length} users deleted successfully`,
        warnings: deleteErrors.length > 0 ? deleteErrors : undefined
      }, 
      error: null 
    };
  } catch (error) {
    logger.error('deleteMultipleUsers error:', error);
    return { data: null, error: error.message };
  }
},
```

#### 5. Update `importUsersFromFile()` function

**BEFORE (Lines 840-860)**:
```javascript
importUsersFromFile: async (users) => {
  try {
    // ... existing code ...
    
    for (const user of users) {
      // ... validation ...
      if (supabaseAdmin) {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteAuthError) {
          logger.error(`Error deleting duplicate user ${user.id}:`, deleteAuthError);
        }
      }
    }
```

**AFTER (Updated)**:
```javascript
importUsersFromFile: async (users) => {
  try {
    // ... existing code ...
    
    for (const user of users) {
      // ... validation ...
      const { data: response, error: edgeFunctionError } = 
        await supabase.functions.invoke('admin-operations', {
          body: {
            operation: 'delete_user',
            userId: user.id
          }
        });

      if (edgeFunctionError || !response?.success) {
        logger.error(`Error deleting duplicate user ${user.id}:`, response?.error || edgeFunctionError?.message);
      }
    }
```

---

### Task 2: Update `passwordService.js`

**BEFORE (Lines 1-70)**:
```javascript
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';  // ❌ REMOVE THIS
import { logger } from '../utils/logger';

export const passwordService = {
  // ... helper functions ...

  async setUserPassword(userId, password) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: password }
      );

      if (error) {
        logger.error('Password update error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Password service error:', error);
      return { success: false, error: error.message };
    }
  },

  async generateAndSetPassword(userId = null) {
    try {
      const password = this.generatePassword();
      
      if (userId) {
        const result = await this.setUserPassword(userId, password);
        if (result.success) {
          return { success: true, password, error: null };
        } else {
          return { success: false, password: null, error: result.error };
        }
      }
      
      return { success: true, password, error: null };
    } catch (error) {
      return { success: false, password: null, error: error.message };
    }
  },
```

**AFTER (Updated)**:
```javascript
import { supabase } from '../lib/supabase';
// supabaseAdmin removed - now use Edge Function instead
import { logger } from '../utils/logger';

export const passwordService = {
  // ... helper functions ...

  async setUserPassword(userId, password) {
    try {
      // Call Edge Function to update password (server-side with service key)
      const { data: response, error: edgeFunctionError } = 
        await supabase.functions.invoke('admin-operations', {
          body: {
            operation: 'update_password',
            userId: userId,
            newPassword: password
          }
        });

      if (edgeFunctionError || !response?.success) {
        const errorMsg = response?.error || edgeFunctionError?.message || 'Failed to update password';
        logger.error('Password update error:', errorMsg);
        return { success: false, error: errorMsg };
      }

      return { success: true, data: response.data };
    } catch (error) {
      logger.error('Password service error:', error);
      return { success: false, error: error.message };
    }
  },

  async generateAndSetPassword(userId = null) {
    try {
      const password = this.generatePassword();
      
      if (userId) {
        const result = await this.setUserPassword(userId, password);
        if (result.success) {
          return { success: true, password, error: null };
        } else {
          return { success: false, password: null, error: result.error };
        }
      }
      
      return { success: true, password, error: null };
    } catch (error) {
      logger.error('generateAndSetPassword error:', error);
      return { success: false, password: null, error: error.message };
    }
  },
```

---

## 📝 IMPLEMENTATION STEPS

### Step 1: Deploy Edge Function (5 min)
```bash
# Edge Function is already created at:
# supabase/functions/admin-operations/index.ts

# Deploy via Supabase CLI:
supabase functions deploy admin-operations

# Test locally (if needed):
supabase functions serve admin-operations
```

### Step 2: Update adminService.js (30 min)
- [ ] Remove: `import { supabaseAdmin } from '../lib/supabaseAdmin';`
- [ ] Update: `createUser()` function (use Edge Function)
- [ ] Update: `deleteUser()` function (use Edge Function)
- [ ] Update: `deleteMultipleUsers()` function (use Edge Function)
- [ ] Update: `importUsersFromFile()` function (use Edge Function)
- [ ] Run: `npm run lint` to verify syntax

### Step 3: Update passwordService.js (15 min)
- [ ] Remove: `import { supabaseAdmin } from '../lib/supabaseAdmin';`
- [ ] Update: `setUserPassword()` function (use Edge Function)
- [ ] Update: `generateAndSetPassword()` function (inherit changes)
- [ ] Run: `npm run lint` to verify syntax

### Step 4: Test in Development (20 min)
```bash
# Start dev server
npm run dev

# Test each function in browser:
# 1. Create user
# 2. Reset password
# 3. Delete user
# 4. Bulk delete users

# Check DevTools Console for errors
# Verify no errors related to supabaseAdmin
```

### Step 5: Delete supabaseAdmin.js (5 min)
```bash
# Remove the vulnerable file
rm src/lib/supabaseAdmin.js

# Verify no import errors:
npm run build
```

### Step 6: Commit & Push (5 min)
```bash
git add .
git commit -m "fix(security): move admin operations to Edge Function

- Create admin-operations Edge Function (server-side admin operations)
- Update adminService.js to use Edge Function instead of supabaseAdmin
- Update passwordService.js to use Edge Function instead of supabaseAdmin
- Delete vulnerable src/lib/supabaseAdmin.js
- Service role key now server-side only

Fixes: Admin key no longer exposed in client bundle"

git push origin main
```

---

## 🔍 VERIFICATION CHECKLIST

### Before Deletion
- [ ] All tests pass
- [ ] `npm run build` succeeds
- [ ] No console errors in dev
- [ ] All admin operations tested

### After Deletion
- [ ] `grep -r "supabaseAdmin" src/` returns 0 results
- [ ] Build succeeds: `npm run build`
- [ ] No import errors
- [ ] Website loads without errors

### Production Verification
- [ ] Vercel deployment succeeds
- [ ] Website loads: https://www.basicai.fit
- [ ] Admin dashboard works
- [ ] Create user works
- [ ] Delete user works
- [ ] Password reset works

---

## ⏰ TIMELINE

| Task | Duration | Total |
|------|----------|-------|
| 1. Deploy Edge Function | 5 min | 5 min |
| 2. Update adminService.js | 30 min | 35 min |
| 3. Update passwordService.js | 15 min | 50 min |
| 4. Test in Development | 20 min | 70 min |
| 5. Delete supabaseAdmin.js | 5 min | 75 min |
| 6. Commit & Push | 5 min | 80 min |

**Total Phase 1.2-1.3**: ~1.3 hours

---

## 🚨 ROLLBACK PLAN

If issues arise:

```bash
# Revert last commit
git revert HEAD

# Restore supabaseAdmin.js from backup
git restore src/lib/supabaseAdmin.js

# Restore services
git restore src/services/adminService.js
git restore src/services/passwordService.js

# Push rollback
git push origin main
```

---

**Status**: Ready for implementation  
**Next**: Execute steps 2-3 (update services)  
**Impact**: Eliminates critical security vulnerability
