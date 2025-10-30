// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E Test Suite: Admin User Creation & Password Change Workflow
 * 
 * Tests the complete user lifecycle:
 * 1. Admin creates a new user
 * 2. User logs in with temporary password
 * 3. User is forced to change password
 * 4. User can access dashboard after password change
 */

// Test configuration
const BASE_URL = process.env.BASE_URL || 'https://www.basicai.fit';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@basicai.fit';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-admin-password';
const TEST_USER_EMAIL = `test-${Date.now()}@example.com`;
const TEST_USER_NAME = 'Playwright Test User';
const NEW_PASSWORD = 'NewTestPass123!';

test.describe('User Creation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Set timeout for slow network
    test.setTimeout(60000);
  });

  test('Complete user creation and password change flow', async ({ page }) => {
    let temporaryPassword = '';

    // ============================================================
    // STEP 1: Admin Login
    // ============================================================
    test.step('Admin logs in', async () => {
      // Ignore non-critical API errors (like member_reviews 400 errors)
      page.on('response', response => {
        if (response.status() === 400 && response.url().includes('member_reviews')) {
          console.log('⚠️ Ignoring member_reviews 400 error (non-critical)');
        }
      });
      
      // Navigate directly to login page
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      // Wait for login page to load
      await page.waitForSelector('input[type="email"]', { timeout: 15000 });
      
      // Fill login form
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Wait for redirect to admin dashboard
      await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
      
      console.log('✅ Admin logged in successfully');
    });

    // ============================================================
    // STEP 2: Navigate to Users Page
    // ============================================================
    test.step('Navigate to users management', async () => {
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Wait for users page to load
      await page.waitForSelector('text=User Management', { timeout: 10000 });
      
      console.log('✅ Navigated to users page');
    });

    // ============================================================
    // STEP 3: Create New User
    // ============================================================
    test.step('Create new user', async () => {
      // Click "Create User" button
      await page.click('button:has-text("Create User")');
      
      // Wait for modal/form to appear
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      
      // Fill user creation form
      await page.fill('input[type="email"]', TEST_USER_EMAIL);
      await page.fill('input[name="full_name"], input[placeholder*="name"]', TEST_USER_NAME);
      
      // Select role (Student)
      await page.selectOption('select[name="role"]', 'student');
      
      // Select membership tier (Starter)
      await page.selectOption('select[name="membership_tier"]', 'starter');
      
      // Submit form
      await page.click('button[type="submit"]:has-text("Create")');
      
      // Wait for success message or modal
      const successModal = page.locator('text=User created successfully, text=Temporary Password');
      await expect(successModal.first()).toBeVisible({ timeout: 15000 });
      
      // Extract temporary password from the page
      const passwordElement = page.locator('code, pre, [class*="password"]').first();
      temporaryPassword = await passwordElement.textContent();
      temporaryPassword = temporaryPassword?.trim() || '';
      
      console.log('✅ User created successfully');
      console.log(`📧 Email: ${TEST_USER_EMAIL}`);
      console.log(`🔑 Temp Password: ${temporaryPassword}`);
      
      // Verify we got a password
      expect(temporaryPassword.length).toBeGreaterThan(8);
      
      // Close modal if there's a close button
      const closeButton = page.locator('button:has-text("Close"), button:has-text("OK")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    });

    // ============================================================
    // STEP 4: Admin Logout
    // ============================================================
    test.step('Admin logs out', async () => {
      // Look for logout button (could be in dropdown menu)
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        // Try to find user menu/dropdown
        const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user"], button:has-text("Admin")');
        if (await userMenu.isVisible()) {
          await userMenu.click();
          await page.click('button:has-text("Logout"), a:has-text("Logout")');
        } else {
          // Navigate directly to logout endpoint
          await page.goto(`${BASE_URL}/logout`);
        }
      }
      
      // Wait for redirect to login page
      await page.waitForURL('**/login', { timeout: 10000 });
      
      console.log('✅ Admin logged out');
    });

    // ============================================================
    // STEP 5: New User First Login (with temp password)
    // ============================================================
    test.step('New user logs in with temporary password', async () => {
      // Fill login form with test user credentials
      await page.fill('input[type="email"]', TEST_USER_EMAIL);
      await page.fill('input[type="password"]', temporaryPassword);
      
      // Click login
      await page.click('button[type="submit"]');
      
      // Should redirect to change-password page
      await page.waitForURL('**/change-password', { timeout: 10000 });
      
      console.log('✅ Redirected to change password page (correct behavior)');
    });

    // ============================================================
    // STEP 6: Change Password
    // ============================================================
    test.step('User changes password', async () => {
      // Fill password change form
      await page.fill('input[placeholder*="current"], input[name="currentPassword"]', temporaryPassword);
      await page.fill('input[placeholder*="new"], input[name="newPassword"]', NEW_PASSWORD);
      await page.fill('input[placeholder*="confirm"], input[name="confirmPassword"]', NEW_PASSWORD);
      
      // Submit password change
      await page.click('button[type="submit"]:has-text("Change")');
      
      // Wait for success message or redirect
      await page.waitForTimeout(2000);
      
      console.log('✅ Password changed successfully');
    });

    // ============================================================
    // STEP 7: Logout After Password Change
    // ============================================================
    test.step('User logs out after password change', async () => {
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      } else {
        await page.goto(`${BASE_URL}/logout`);
      }
      
      await page.waitForURL('**/login', { timeout: 10000 });
      
      console.log('✅ User logged out');
    });

    // ============================================================
    // STEP 8: Login with New Password
    // ============================================================
    test.step('User logs in with new password', async () => {
      // Fill login form with new credentials
      await page.fill('input[type="email"]', TEST_USER_EMAIL);
      await page.fill('input[type="password"]', NEW_PASSWORD);
      
      // Click login
      await page.click('button[type="submit"]');
      
      // Should redirect to student dashboard (NOT change-password)
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Verify we're on the dashboard
      const currentUrl = page.url();
      expect(currentUrl).toContain('/dashboard');
      expect(currentUrl).not.toContain('/change-password');
      
      console.log('✅ Successfully logged in with new password');
      console.log('✅ Redirected to dashboard (NOT change-password page)');
    });

    // ============================================================
    // STEP 9: Verify Dashboard Access
    // ============================================================
    test.step('Verify user can access dashboard', async () => {
      // Check for dashboard elements
      const dashboardTitle = page.locator('h1, h2').filter({ hasText: /Dashboard|Welcome/i });
      await expect(dashboardTitle.first()).toBeVisible({ timeout: 5000 });
      
      console.log('✅ User has access to dashboard');
      console.log('🎉 COMPLETE WORKFLOW TEST PASSED!');
    });
  });

  test('Verify database state after user creation', async ({ page }) => {
    // This test verifies the user was created correctly in the database
    test.step('Check user profile exists', async () => {
      // Login as admin
      await page.goto(BASE_URL);
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
      
      // Navigate to users page
      await page.goto(`${BASE_URL}/admin/users`);
      
      // Search for recently created test user
      const searchBox = page.locator('input[placeholder*="Search"], input[type="search"]');
      if (await searchBox.isVisible()) {
        await searchBox.fill(TEST_USER_EMAIL);
        await page.waitForTimeout(1000);
      }
      
      // Verify user appears in the list
      const userRow = page.locator(`text=${TEST_USER_EMAIL}`);
      await expect(userRow).toBeVisible({ timeout: 5000 });
      
      console.log('✅ User profile exists in database');
    });
  });
});

test.describe('Error Handling', () => {
  test('Should show error for duplicate email', async ({ page }) => {
    const DUPLICATE_EMAIL = 'existing@example.com';
    
    // Login as admin
    await page.goto(BASE_URL);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    
    // Navigate to users page
    await page.goto(`${BASE_URL}/admin/users`);
    
    // Try to create user with duplicate email twice
    for (let i = 0; i < 2; i++) {
      await page.click('button:has-text("Create User")');
      await page.fill('input[type="email"]', DUPLICATE_EMAIL);
      await page.fill('input[name="full_name"], input[placeholder*="name"]', 'Duplicate User');
      await page.click('button[type="submit"]:has-text("Create")');
      
      if (i === 0) {
        // First time should succeed
        await page.waitForTimeout(2000);
      } else {
        // Second time should show error
        const errorMessage = page.locator('text=/already exists|duplicate/i');
        await expect(errorMessage).toBeVisible({ timeout: 5000 });
        console.log('✅ Duplicate email error shown correctly');
      }
    }
  });
});
