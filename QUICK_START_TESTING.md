# 🎭 Playwright Testing - Quick Start Guide

## 📋 3-Step Quick Start

### Step 1: Add Your Credentials (2 minutes)

Open `.env.test.local` and replace with YOUR admin credentials:

```bash
# Before (placeholder)
ADMIN_EMAIL=admin@basicai.fit
ADMIN_PASSWORD=YourActualPassword123

# After (your real credentials)
ADMIN_EMAIL=john@basicai.fit
ADMIN_PASSWORD=MyRealPassword123!
```

**Where to find your credentials:**
- The email and password you use to login at https://www.basicai.fit

---

### Step 2: Run Tests (1 minute)

Open PowerShell/Terminal in project folder and run:

```bash
npm run test:ui
```

**What happens:**
- Playwright UI opens in browser
- You see all test files
- Click the ▶️ play button to run tests
- Watch tests execute in real-time

---

### Step 3: See Results (2 minutes)

**While tests run, you'll see:**
- ✅ Green checkmarks for passing steps
- ❌ Red X for failing steps
- Screenshots at each step
- Exact DOM state

**After tests finish:**
```bash
npm run test:report
```
Opens HTML report with:
- ✅ Pass/fail summary
- 📸 Screenshots on failure
- 🎥 Videos of failures
- 📊 Detailed timeline

---

## 🎯 What Gets Tested

### Test #1: Complete User Creation & Password Change Flow
```
1. Admin logs in              ✅
2. Navigate to users page     ✅
3. Click "Create User"        ✅
4. Fill form & submit         ✅
5. Get temporary password     ✅
6. Admin logs out             ✅
7. User logs in (temp pass)   ✅
8. Redirect to /change-pass   ✅ ← Critical check!
9. User changes password      ✅
10. User logs out             ✅
11. User logs in (new pass)   ✅
12. Redirect to /dashboard    ✅ ← Critical check!
13. Dashboard accessible      ✅
```

### Test #2: Database Verification
```
1. Check user exists in DB    ✅
2. Profile data correct       ✅
3. No orphaned records        ✅
```

### Test #3: Error Handling
```
1. Duplicate email error      ✅
2. Validation works           ✅
```

---

## 🎬 Expected Timeline

Total test time: **~60-90 seconds**

- **0-10s**: Admin login & navigation
- **10-20s**: Create user form & submission
- **20-30s**: Extract password & logout
- **30-40s**: New user first login
- **40-50s**: Password change flow
- **50-60s**: Login with new password
- **60-70s**: Verify dashboard access
- **70-80s**: Cleanup & verification

---

## ✅ Success = All Green!

When tests pass, you'll see:

```
✓ Complete user creation and password change flow (65s)
  ✓ Admin logs in (3s)
  ✓ Navigate to users management (2s)
  ✓ Create new user (8s)
  ✓ Admin logs out (2s)
  ✓ New user logs in with temporary password (4s)
  ✓ Change password (5s)
  ✓ User logs out after password change (2s)
  ✓ User logs in with new password (4s)
  ✓ Verify user can access dashboard (3s)

✓ Verify database state after user creation (12s)
✓ Should show error for duplicate email (15s)

3 passed (92s)
```

**This means:**
- ✅ User creation works
- ✅ Temporary passwords work
- ✅ Password change flow works
- ✅ No infinite redirect loops
- ✅ Database is correct
- ✅ Error handling works
- **✅ EVERYTHING IS WORKING!** 🎉

---

## ❌ Failure = Red X + Error

If tests fail, you'll see:

```
✗ Complete user creation and password change flow (15s)
  ✓ Admin logs in (3s)
  ✓ Navigate to users management (2s)
  ✗ Create new user (8s)
    Error: Database error creating new user
    
    Screenshot: test-results/user-creation-Create-user-chromium/test-failed-1.png
```

**What to do:**
1. Look at the screenshot (shows what test saw)
2. Read the error message
3. Check which step failed
4. Apply appropriate fix

**Common failures:**
- **Login failed**: Wrong credentials in `.env.test.local`
- **User creation failed**: Need to apply `EMERGENCY_SERVICE_ROLE_FIX.sql`
- **Timeout errors**: Website slow or unreachable
- **Element not found**: UI changed, need to update selectors

---

## 🐛 Quick Troubleshooting

### Error: "Cannot find .env.test.local"
```bash
# Create the file
New-Item -ItemType File -Path ".env.test.local"

# Add your credentials
ADMIN_EMAIL=your-email@basicai.fit
ADMIN_PASSWORD=your-password
BASE_URL=https://www.basicai.fit
```

### Error: "Login failed"
1. Check credentials in `.env.test.local`
2. Try logging in manually at https://www.basicai.fit
3. Verify admin account exists

### Error: "Database error creating user"
1. Apply `EMERGENCY_SERVICE_ROLE_FIX.sql` in Supabase
2. Check Supabase logs for trigger errors
3. Verify service_role has BYPASSRLS

### Error: "Timeout waiting for element"
1. Check if website is accessible
2. Run with visible browser: `npm run test:headed`
3. Use debug mode: `npm run test:debug`

---

## 🎮 Available Commands

```bash
# Interactive UI (recommended first)
npm run test:ui

# See browser (watch it happen)
npm run test:headed

# Debug step-by-step
npm run test:debug

# Fast headless run
npm test

# View last report
npm run test:report

# Run specific test
npm test user-creation.spec.js

# Run on specific browser
npm test -- --project=firefox
npm test -- --project=webkit
npm test -- --project="Mobile Chrome"
```

---

## 📊 After Tests Pass

**Congratulations!** Your user creation workflow is working perfectly!

**What this confirms:**
- ✅ Admin can create users
- ✅ Temporary passwords generated
- ✅ Users forced to change password on first login
- ✅ Password change works correctly
- ✅ Users access dashboard after password change
- ✅ No redirect loops
- ✅ Database state is correct
- ✅ Error handling works

**Next steps:**
1. Mark user creation workflow as complete ✅
2. Update project completion to 96% 🎉
3. Move on to remaining tasks (testing, documentation)
4. Run tests on different browsers
5. Set up CI/CD to run tests automatically

---

## 💡 Pro Tips

1. **Always use UI mode first** - Easiest to understand what's happening
2. **Check credentials carefully** - Most common failure point
3. **Read error messages** - They tell you exactly what went wrong
4. **Look at screenshots** - Visual proof of what happened
5. **Watch videos** - See the exact sequence of events
6. **Use debug mode** - Step through tests when confused
7. **Run headed mode** - Watch tests execute in real browser

---

## 🎯 Your Checklist

Before running tests:
- [ ] `.env.test.local` exists
- [ ] Real credentials added (not placeholders)
- [ ] Database fix applied (`EMERGENCY_SERVICE_ROLE_FIX.sql`)
- [ ] Website accessible at https://www.basicai.fit
- [ ] Playwright installed (`npx playwright install --with-deps`)

To run tests:
- [ ] Open terminal in project folder
- [ ] Run: `npm run test:ui`
- [ ] Click play button in UI
- [ ] Watch tests execute
- [ ] Review results

After tests:
- [ ] All tests passed (green) or identified failures
- [ ] Reviewed HTML report
- [ ] Fixed any issues
- [ ] Re-ran tests to confirm fixes

---

**Ready? Update `.env.test.local` and run `npm run test:ui`!** 🚀

Questions? Check `PLAYWRIGHT_TESTING_SUMMARY.md` for detailed info!
