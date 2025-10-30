# User Creation Wizard - Test Plan

## Test Environment
- **URL:** http://localhost:4028
- **Admin Account:** bukassi@gmail.com / 12345678
- **Browser:** Chrome/Edge (recommended)

## Pre-Test Setup
1. ✅ Development server running on port 4028
2. Login as admin user (bukassi@gmail.com)
3. Navigate to Admin Users page
4. Click "Create New User" button

## Test Cases

### TC01: Wizard Opens Successfully
**Steps:**
1. Click "Create New User" button
2. Observe wizard modal appearance

**Expected Result:**
- ✅ Wizard modal opens with gradient header
- ✅ Shows "Step 1 of 3" in header
- ✅ Progress indicator shows Step 1 active
- ✅ Basic Info section is visible
- ✅ Email and Full Name fields are shown

---

### TC02: Email Validation - Invalid Formats
**Steps:**
1. Open wizard (Step 1)
2. Try entering invalid email formats:
   - `test` (no @ or domain)
   - `test@` (no domain)
   - `test@test` (no TLD)
   - `@example.com` (no local part)
   - `test @test.com` (space in email)
3. Click "Next Step" button

**Expected Result:**
- ✅ Red border appears on email field
- ✅ Error message shows: "Please enter a valid email address (e.g., user@example.com)"
- ✅ Cannot proceed to Step 2 (blocked by validation)
- ✅ Error clears when valid email is entered

---

### TC03: Email Validation - Valid Formats
**Steps:**
1. Open wizard (Step 1)
2. Enter valid email formats:
   - `user@example.com`
   - `john.doe@company.co.uk`
   - `test_user-123@mail.org`
3. Observe validation feedback

**Expected Result:**
- ✅ Green checkmark icon appears
- ✅ Success message shows: "Email format is valid"
- ✅ No red border or error message
- ✅ Can proceed to Step 2

---

### TC04: Full Name Validation
**Steps:**
1. Open wizard (Step 1)
2. Leave Full Name empty, click "Next"
3. Enter 1 character (e.g., "A"), click "Next"
4. Enter 2 characters (e.g., "AB"), click "Next"
5. Enter 3+ characters (e.g., "John Doe")

**Expected Result:**
- ✅ Step 1-2: Error shows "Full name is required"
- ✅ Step 3-4: Error shows "Full name must be at least 3 characters"
- ✅ Step 5: No error, can proceed to Step 2

---

### TC05: Step 1 to Step 2 Progression
**Steps:**
1. Fill Step 1 with valid data:
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Role: `Student`
   - Membership Tier: `Starter`
2. Click "Next Step" button

**Expected Result:**
- ✅ Step 2 content appears (Contact Details)
- ✅ Progress indicator updates (Step 2 active, Step 1 completed with checkmark)
- ✅ Header shows "Step 2 of 3"
- ✅ Fields visible: Membership Status, Phone, WhatsApp, Location, Bio
- ✅ "Back" button appears
- ✅ Animation plays (smooth transition)

---

### TC06: Back Button Preserves Data
**Steps:**
1. Complete Step 1 with specific data
2. Click "Next Step"
3. On Step 2, click "Back" button
4. Observe Step 1 fields

**Expected Result:**
- ✅ Returns to Step 1
- ✅ All previously entered data is preserved
- ✅ Email field still shows entered value
- ✅ Full Name field still shows entered value
- ✅ Role and Membership Tier selections preserved

---

### TC07: Step 2 - Optional Fields
**Steps:**
1. Reach Step 2
2. Leave all fields empty
3. Click "Next Step"

**Expected Result:**
- ✅ No validation errors
- ✅ Successfully proceeds to Step 3
- ✅ Optional fields can be skipped

---

### TC08: Step 2 - Phone Validation
**Steps:**
1. Reach Step 2
2. Enter short phone number (e.g., "123")
3. Click "Next Step"

**Expected Result:**
- ✅ Error shows: "Phone number must be at least 10 digits"
- ✅ Cannot proceed to Step 3
- ✅ Error clears when valid phone is entered or field is cleared

---

### TC09: Step 3 - Review Summary
**Steps:**
1. Complete Steps 1 and 2 with data:
   - Email: `john.doe@example.com`
   - Full Name: `John Doe`
   - Role: `Admin`
   - Membership Tier: `Pro`
   - Phone: `+234 800 123 4567`
   - Location: `Lagos, Nigeria`
2. Click "Next Step" to reach Step 3

**Expected Result:**
- ✅ Shows "Review and confirm user details" section
- ✅ Displays all entered data in summary format
- ✅ Email displays: `john.doe@example.com`
- ✅ Full Name displays: `John Doe`
- ✅ Role badge shows "Admin" with purple background
- ✅ Tier badge shows "Pro" with orange background
- ✅ Phone displays if entered
- ✅ Location displays if entered
- ✅ Password generation info box visible
- ✅ "Create User" button visible (green gradient)

---

### TC10: Cancel Wizard from Step 1
**Steps:**
1. Open wizard
2. Click "Cancel" button

**Expected Result:**
- ✅ Wizard closes
- ✅ Returns to Admin Users page
- ✅ No user created
- ✅ No database changes

---

### TC11: Cancel Wizard from Step 2 or 3
**Steps:**
1. Complete Step 1, reach Step 2
2. Click "Back" repeatedly or use X button to close

**Expected Result:**
- ✅ Can navigate back through steps
- ✅ Can close wizard at any step
- ✅ No user created if wizard not completed

---

### TC12: Create User - Complete Flow
**Steps:**
1. Open wizard
2. **Step 1:**
   - Email: `newuser@test.com`
   - Full Name: `New Test User`
   - Role: `Student`
   - Membership Tier: `Starter`
3. Click "Next Step"
4. **Step 2:**
   - Membership Status: `Pending`
   - Phone: `+234 800 555 1234` (optional)
   - Location: `Abuja, Nigeria` (optional)
5. Click "Next Step"
6. **Step 3:**
   - Review all data
   - Click "Create User" button

**Expected Result:**
- ✅ Button shows "Creating User..." during submission
- ✅ Success popup appears with temporary password
- ✅ Password is displayed in popup (copy button works)
- ✅ Wizard closes after success
- ✅ User appears in users list
- ✅ Welcome email sent to `newuser@test.com`
- ✅ Database entry created in user_profiles table

---

### TC13: Create User - Email Sent Verification
**Steps:**
1. Create a user with valid email
2. Check Resend dashboard or email inbox

**Expected Result:**
- ✅ Email sent to user's address
- ✅ Email contains temporary password
- ✅ Email has welcome message
- ✅ Email prompts user to change password on first login

---

### TC14: Responsive Design - Desktop
**Steps:**
1. Open wizard on desktop browser (≥1024px width)
2. Observe layout

**Expected Result:**
- ✅ Modal width is appropriate (max-w-4xl)
- ✅ Progress indicator is clearly visible
- ✅ Fields are properly spaced
- ✅ Buttons are accessible
- ✅ No horizontal scroll
- ✅ Text is readable

---

### TC15: Responsive Design - Mobile
**Steps:**
1. Open Chrome DevTools
2. Toggle device emulation (iPhone 12, 390x844)
3. Open wizard
4. Navigate through all steps

**Expected Result:**
- ✅ Modal fits screen without overflow
- ✅ Single-column layout on small screens
- ✅ Touch targets are appropriately sized
- ✅ Progress indicator adapts to small width
- ✅ Buttons stack vertically if needed
- ✅ Keyboard appears when typing
- ✅ Can scroll form content

---

### TC16: Visual Design Consistency
**Steps:**
1. Open wizard
2. Compare with existing platform UI

**Expected Result:**
- ✅ Orange gradient theme matches platform
- ✅ Icons are consistent (from AppIcon component)
- ✅ Typography matches existing styles
- ✅ Border colors consistent
- ✅ Shadow effects appropriate
- ✅ Animations smooth (not jarring)

---

### TC17: Keyboard Navigation
**Steps:**
1. Open wizard
2. Use Tab key to navigate fields
3. Use Enter key to submit/proceed
4. Use Escape key (if implemented) to close

**Expected Result:**
- ✅ Tab key cycles through fields in logical order
- ✅ Enter key can trigger "Next Step" button
- ✅ Focus indicators are visible
- ✅ Can navigate without mouse

---

### TC18: Loading States
**Steps:**
1. Complete wizard to Step 3
2. Click "Create User"
3. Observe button during submission

**Expected Result:**
- ✅ Button text changes to "Creating User..."
- ✅ Button is disabled during submission
- ✅ Cursor changes to not-allowed
- ✅ Cannot click button multiple times
- ✅ Loading completes and shows success

---

### TC19: Error Handling - Server Error
**Steps:**
1. Simulate server error (e.g., disconnect network)
2. Try to create user
3. Observe error handling

**Expected Result:**
- ✅ Error alert appears with message
- ✅ Wizard stays open (does not close)
- ✅ Can retry after fixing issue
- ✅ No partial data saved

---

### TC20: Multiple Field Types
**Steps:**
1. Test all field types in wizard:
   - Text input (email, full name, location)
   - Select dropdown (role, tier, status)
   - Phone input (with country code)
   - Textarea (bio)

**Expected Result:**
- ✅ All input types render correctly
- ✅ Placeholder text is visible
- ✅ Can type/select in all fields
- ✅ PhoneInput component works (country code selector)
- ✅ Textarea allows multiline entry

---

## Visual Regression Tests

### VR01: Step 1 Appearance
**Screenshot:** `wizard-step1.png`
- Progress indicator with Step 1 active
- Email and Full Name fields visible
- Role and Tier dropdowns visible
- Cancel and Next buttons at bottom

### VR02: Step 2 Appearance
**Screenshot:** `wizard-step2.png`
- Progress indicator with Step 2 active
- Contact detail fields visible
- Back and Next buttons at bottom

### VR03: Step 3 Appearance
**Screenshot:** `wizard-step3.png`
- Progress indicator with Step 3 active
- Summary card with all data
- Password info box
- Back and Create User buttons

### VR04: Validation Error State
**Screenshot:** `wizard-error.png`
- Red border on invalid field
- Error message displayed
- AlertCircle icon visible

### VR05: Success State
**Screenshot:** `wizard-success.png`
- Green checkmark on email
- Success message displayed

---

## Performance Tests

### P01: Initial Load Time
**Metric:** Time from clicking "Create New User" to wizard appearance
**Target:** < 200ms

### P02: Step Transition Speed
**Metric:** Time from clicking "Next" to new step appearing
**Target:** < 100ms (smooth animation)

### P03: Form Submission Time
**Metric:** Time from clicking "Create User" to success popup
**Target:** < 3 seconds (depends on backend)

---

## Accessibility Tests

### A01: Screen Reader Support
**Tool:** NVDA or JAWS
**Test:** Navigate wizard with screen reader
**Expected:**
- All labels are announced
- Progress indicator state is announced
- Error messages are announced
- Button states are announced

### A02: Keyboard-Only Navigation
**Test:** Complete entire flow with keyboard only
**Expected:**
- Can reach all interactive elements
- Focus order is logical
- Can submit form with Enter key

### A03: Color Contrast
**Tool:** Chrome DevTools Lighthouse
**Expected:**
- All text meets WCAG AA standard (4.5:1 contrast)
- Error messages are readable

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome 120+ (Windows/Mac)
- [ ] Edge 120+ (Windows)
- [ ] Firefox 120+ (Windows/Mac)
- [ ] Safari 17+ (Mac)

### Mobile Browsers
- [ ] Chrome Mobile (Android 12+)
- [ ] Safari Mobile (iOS 16+)
- [ ] Samsung Internet (Android)

---

## Post-Deployment Verification

1. **Production URL:** https://www.basicai.fit/admin-users
2. **Admin Login:** (production admin account)
3. **Create Test User:** Use wizard to create a test account
4. **Verify Database:** Check Supabase dashboard for new user entry
5. **Check Email:** Verify welcome email was sent
6. **Check Logs:** Review Supabase logs for any errors

---

## Known Issues / Limitations

1. **Email Uniqueness Check:** Wizard does not check if email already exists until submission (could add real-time check)
2. **Phone Formatting:** No auto-formatting as user types (shows raw input)
3. **Draft Saving:** Data is lost if wizard is closed mid-process (no localStorage persistence)

---

## Bug Report Template

If you find an issue, report it with:
```
**Bug Title:** [Short description]
**Test Case:** TC##
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**

**Actual Result:**

**Screenshot/Video:**

**Environment:**
- Browser: 
- OS: 
- Screen Size: 
```

---

## Test Execution Log

| Test Case | Status | Tester | Date | Notes |
|-----------|--------|--------|------|-------|
| TC01 | ⬜ Pending | | | |
| TC02 | ⬜ Pending | | | |
| TC03 | ⬜ Pending | | | |
| ... | ⬜ Pending | | | |

**Legend:**
- ⬜ Pending
- ✅ Pass
- ❌ Fail
- ⚠️ Blocked

---

**Last Updated:** 2025-01-XX  
**Test Plan Version:** 1.0  
**Ready for Testing:** ✅ Yes
