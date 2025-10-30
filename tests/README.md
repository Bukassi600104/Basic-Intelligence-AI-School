# Playwright E2E Tests for Basic Intelligence Community School

This directory contains end-to-end tests using Playwright to verify critical user workflows.

## 🎯 Test Coverage

### User Creation Workflow (`user-creation.spec.js`)
Tests the complete admin user creation and password change flow:

1. ✅ Admin login
2. ✅ Navigate to users management
3. ✅ Create new user with temporary password
4. ✅ Admin logout
5. ✅ New user login with temporary password
6. ✅ Forced redirect to password change page
7. ✅ User changes password
8. ✅ User logout
9. ✅ User login with new password
10. ✅ Verify redirect to dashboard (NOT password change page)
11. ✅ Verify dashboard access

### Error Handling Tests
- ✅ Duplicate email validation
- ✅ Missing required fields
- ✅ Invalid credentials

## 🚀 Setup

### 1. Install Playwright (Already Done!)
```bash
npx playwright install --with-deps
```

### 2. Configure Environment Variables
Create a `.env.test.local` file (this is gitignored):

```bash
ADMIN_EMAIL=your-admin-email@basicai.fit
ADMIN_PASSWORD=your-admin-password
BASE_URL=https://www.basicai.fit
```

## 🧪 Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test user-creation.spec.js
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run Tests on Specific Browser
```bash
# Chromium only
npx playwright test --project=chromium

# Firefox only
npx playwright test --project=firefox

# WebKit (Safari) only
npx playwright test --project=webkit

# Mobile Chrome
npx playwright test --project="Mobile Chrome"
```

### Debug Tests
```bash
npx playwright test --debug
```

### Show Test Report
```bash
npx playwright show-report
```

## 📊 Test Results

After running tests, you'll find:

- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `test-results/results.json`
- **Screenshots**: `test-results/` (on failure)
- **Videos**: `test-results/` (on failure)
- **Traces**: `test-results/` (on retry)

## 🎬 What the Tests Verify

### ✅ User Creation Flow
- Admin can successfully create users
- Temporary passwords are generated
- User profiles are created in database
- Success modals display correctly

### ✅ Password Change Flow
- New users are redirected to `/change-password` on first login
- Password change form works correctly
- After password change, users can login normally
- Users are NOT redirected to `/change-password` after changing password

### ✅ Authentication
- Login/logout works correctly
- Session management is proper
- Role-based redirects work (admin → `/admin/dashboard`, student → `/dashboard`)

### ✅ Error Handling
- Duplicate email shows appropriate error
- Missing fields are validated
- Invalid credentials show error messages

## 🔧 Troubleshooting

### Test Fails with "Timeout"
- Increase timeout in `playwright.config.js`
- Check if website is accessible at `https://www.basicai.fit`
- Verify admin credentials in `.env.test.local`

### Test Fails at "Create User"
- Verify `EMERGENCY_SERVICE_ROLE_FIX.sql` was applied
- Check Supabase logs for trigger errors
- Ensure RLS policies are correct

### Can't Find Elements
- Inspect the actual HTML in browser
- Update selectors in test file
- Use Playwright Inspector: `npx playwright test --debug`

### Admin Login Fails
- Verify admin credentials in `.env.test.local`
- Check if admin user exists in database
- Try logging in manually at https://www.basicai.fit

## 📝 Writing New Tests

To add new test files:

1. Create file in `tests/` directory: `tests/my-new-test.spec.js`
2. Import Playwright test utilities:
   ```javascript
   const { test, expect } = require('@playwright/test');
   ```
3. Write test cases:
   ```javascript
   test('my test case', async ({ page }) => {
     await page.goto('/');
     // ... test steps
   });
   ```
4. Run your test:
   ```bash
   npx playwright test my-new-test.spec.js
   ```

## 🎯 Best Practices

1. **Use Data Attributes**: Add `data-testid` to elements for reliable selection
2. **Wait for Elements**: Always wait for elements before interacting
3. **Use Descriptive Names**: Test names should clearly describe what they test
4. **Clean Up**: Tests should clean up any data they create
5. **Independent Tests**: Each test should be independent and runnable in any order
6. **Use test.step()**: Break complex tests into logical steps
7. **Add Console Logs**: Help with debugging when tests fail

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Assertions Guide](https://playwright.dev/docs/test-assertions)
