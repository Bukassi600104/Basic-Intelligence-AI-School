# Content Management System - Comprehensive Test Plan

## Test Execution Date
**Date**: [TO BE COMPLETED]  
**Tester**: [TO BE COMPLETED]  
**Environment**: Production (Vercel + Supabase)

---

## Phase 1: Database Schema Tests

### 1.1 Migration Verification ✅
- [ ] Run `verify_migration.sql` in Supabase SQL Editor
- [ ] Verify all 10 checks pass:
  - [ ] `featured_description` column exists with 120 char limit
  - [ ] `access_levels` JSONB column exists
  - [ ] Old `access_level` ENUM column dropped
  - [ ] Validation constraint on `access_levels` ensures non-empty array
  - [ ] GIN index `idx_content_access_levels` exists
  - [ ] Function `user_has_access_to_content()` exists
  - [ ] Function `get_user_accessible_content()` exists
  - [ ] RLS policy `users_view_accessible_content_v2` exists
  - [ ] Old RLS policy `users_view_accessible_content` dropped
  - [ ] View `featured_content` exists

### 1.2 Data Integrity Tests
- [ ] Insert test content with multi-tier access: `["starter", "pro"]`
- [ ] Insert test content with single tier: `["elite"]`
- [ ] Insert test content with all tiers: `["starter", "pro", "elite"]`
- [ ] Verify empty array insertion fails (constraint check)
- [ ] Verify non-array values fail (type check)

**SQL Test Queries:**
```sql
-- Test multi-tier insertion
INSERT INTO content_library (title, content_type, access_levels, status) 
VALUES ('Test Multi-Tier', 'pdf', '["starter", "pro"]'::jsonb, 'active');

-- Test empty array (should fail)
INSERT INTO content_library (title, content_type, access_levels, status) 
VALUES ('Test Empty', 'pdf', '[]'::jsonb, 'active');

-- Verify JSONB containment queries
SELECT * FROM content_library 
WHERE access_levels @> '["pro"]'::jsonb;
```

---

## Phase 2: Wizard UI/UX Tests

### 2.1 Modal Behavior
- [ ] Open wizard from Admin Content page
- [ ] Verify modal doesn't extend beyond viewport
- [ ] Verify header is sticky when scrolling
- [ ] Verify modal content scrolls smoothly
- [ ] Press ESC key → Exit confirmation appears
- [ ] Click X button → Exit confirmation appears
- [ ] Click outside modal (if applicable) → No unintended close

### 2.2 Form Validation
- [ ] Try to proceed with empty title → Error shown
- [ ] Try to proceed with empty description → Error shown
- [ ] Try to proceed without selecting content type → Error shown
- [ ] Try to proceed without selecting access levels → Error shown
- [ ] Enter 121 characters in featured description → Error shown
- [ ] Enter 120 characters in featured description → Accepted

### 2.3 Thumbnail Preview
- [ ] Paste invalid URL → Error message shown
- [ ] Paste valid image URL → Loading spinner → Preview shown
- [ ] Paste broken image URL → Error message shown
- [ ] Clear thumbnail URL → Preview disappears

### 2.4 Success/Failure Flows
- [ ] Complete upload successfully → Success modal appears
- [ ] Verify uploaded content details displayed correctly
- [ ] Click "Upload Another" → Form resets, wizard returns to step 1
- [ ] Click "Done" → Wizard closes, content list refreshes
- [ ] Simulate upload failure → Error message shown

### 2.5 Exit Confirmation
- [ ] Make changes in wizard → Click X → Confirmation appears
- [ ] Click "Continue Editing" → Returns to wizard
- [ ] Click "Discard & Exit" → Wizard closes, changes lost

---

## Phase 3: Multi-Tier Access Tests

### 3.1 UI Selection
- [ ] Step 3: Verify checkboxes displayed (not radio buttons)
- [ ] Click "Select All" → All 3 tiers selected
- [ ] Click "Clear All" → All tiers deselected
- [ ] Select individual tiers → Selection summary updates
- [ ] Select 1 tier → Summary shows "1 tier"
- [ ] Select 2 tiers → Summary shows "2 tiers"
- [ ] Select 3 tiers → Summary shows "3 tiers"

### 3.2 Icon Display
- [ ] Starter tier shows Shield icon
- [ ] Pro tier shows Award icon
- [ ] Elite tier shows Crown icon

### 3.3 Review Step
- [ ] Navigate to Step 5 Review
- [ ] Verify multiple selected tiers displayed as badges
- [ ] Verify each badge has correct color and name
- [ ] Verify count text: "Available to X membership tiers"

### 3.4 Database Storage
- [ ] Upload content with multiple tiers
- [ ] Check database: `SELECT access_levels FROM content_library WHERE id = <new_id>`
- [ ] Verify stored as JSONB array: `["starter", "pro"]`
- [ ] NOT stored as string: `"starter,pro"`

---

## Phase 4: Admin Dashboard Integration Tests

### 4.1 Recent Uploads Widget
- [ ] Widget visible on admin dashboard
- [ ] Shows last 5 uploads
- [ ] Each upload shows:
  - [ ] Content type icon with correct color
  - [ ] Title (truncated if too long)
  - [ ] Description (truncated to 1 line)
  - [ ] Multiple access level badges (if multi-tier)
  - [ ] Category badge
  - [ ] Featured star badge (if applicable)
  - [ ] Time ago (e.g., "2m ago", "3h ago", "1d ago")

### 4.2 Real-Time Updates
- [ ] Open admin dashboard in one tab
- [ ] Open admin content in another tab
- [ ] Upload new content via wizard
- [ ] Switch to dashboard tab → Recent Uploads updates automatically
- [ ] Verify new upload appears at top of list

### 4.3 Click Navigation
- [ ] Click on any upload in Recent Uploads widget
- [ ] Verify navigates to `/admin-content`
- [ ] Verify content list shown

### 4.4 Empty State
- [ ] Delete all content from database (test environment only)
- [ ] Verify empty state shows:
  - [ ] "No content yet" message
  - [ ] "Upload Content" button
  - [ ] Click button → Navigates to admin content page

---

## Phase 5: Student Dashboard Auto-Population Tests

### 5.1 PDFs Page Auto-Refresh
- [ ] Open student PDFs page in one tab
- [ ] Open admin content wizard in another tab
- [ ] Upload a new PDF (any category)
- [ ] Switch to student PDFs tab → New PDF appears automatically
- [ ] Verify no page reload occurred

### 5.2 Videos Page Auto-Refresh
- [ ] Open student Videos page in one tab
- [ ] Upload a new video via admin wizard
- [ ] Switch to student Videos tab → New video appears automatically
- [ ] Verify Google Drive embed URL working

### 5.3 Prompts Page Auto-Refresh
- [ ] Open student Prompts page in one tab
- [ ] Upload a new PDF with category "Prompts"
- [ ] Switch to student Prompts tab → New prompt appears
- [ ] Upload a PDF with category "Business" → Prompts page doesn't refresh

### 5.4 Main Dashboard Auto-Refresh
- [ ] Open student dashboard (main) in one tab
- [ ] Upload any content type via admin wizard
- [ ] Switch to student dashboard → "Recent Content" section updates
- [ ] Verify shows latest 6 items

### 5.5 Multi-User Test (if possible)
- [ ] User A: Open student dashboard
- [ ] User B (admin): Upload new content
- [ ] User A: Verify content appears automatically

---

## Phase 6: Access Control Tests

### 6.1 Single-Tier Content
- [ ] Create content with `access_levels: ["starter"]`
- [ ] Login as Starter member → Verify can access
- [ ] Login as Pro member → Verify can access (higher tier)
- [ ] Login as Elite member → Verify can access (higher tier)

### 6.2 Multi-Tier Content
- [ ] Create content with `access_levels: ["pro", "elite"]`
- [ ] Login as Starter member → Verify CANNOT access
- [ ] Login as Pro member → Verify CAN access
- [ ] Login as Elite member → Verify CAN access

### 6.3 All-Tier Content
- [ ] Create content with `access_levels: ["starter", "pro", "elite"]`
- [ ] Login as Starter member → Verify can access
- [ ] Login as Pro member → Verify can access
- [ ] Login as Elite member → Verify can access

### 6.4 RLS Policy Verification
- [ ] Verify starter members see only starter content
- [ ] Verify pro members see starter + pro content
- [ ] Verify elite members see all content
- [ ] Verify inactive members see NO content (locked overlay)

---

## Phase 7: Featured Content Tests

### 7.1 Featured Flag
- [ ] Upload content with "Featured" enabled
- [ ] Upload content with "Featured" disabled
- [ ] Verify featured content has `is_featured = true` in database
- [ ] Verify non-featured has `is_featured = false` or `null`

### 7.2 Featured Description
- [ ] Enter 120 characters in featured description → Accepted
- [ ] Try 121 characters → Rejected
- [ ] Verify description stored correctly in database
- [ ] Verify description displays on homepage (if integrated)

### 7.3 Thumbnail URL
- [ ] Upload with valid thumbnail URL
- [ ] Verify URL stored in database
- [ ] Verify thumbnail displays on homepage (if integrated)
- [ ] Verify thumbnail displays in Recent Uploads widget

### 7.4 Featured Order
- [ ] Upload 3 featured items with orders: 1, 2, 3
- [ ] Verify homepage displays in correct order
- [ ] Change order to 3, 1, 2
- [ ] Verify homepage reorders correctly

---

## Phase 8: End-to-End Workflow Tests

### 8.1 Complete Upload Flow
1. [ ] Admin logs in
2. [ ] Navigates to Admin Content
3. [ ] Clicks "Upload Content" → Wizard opens
4. [ ] Step 1: Selects "Video" type
5. [ ] Step 2: Enters title, description, Google Drive URL, category, tags
6. [ ] Step 3: Selects multiple access levels (Pro + Elite)
7. [ ] Step 4: Enables featured, adds description, thumbnail URL, order
8. [ ] Step 5: Reviews all details
9. [ ] Clicks "Upload" → Success modal appears
10. [ ] Clicks "Done" → Returns to content list
11. [ ] Verify new video in content list
12. [ ] Switch to admin dashboard → Verify in Recent Uploads
13. [ ] Login as Pro student → Verify video accessible
14. [ ] Login as Starter student → Verify video NOT accessible

### 8.2 Multiple Content Types
- [ ] Upload 1 PDF with Prompts category
- [ ] Upload 1 PDF with Business category
- [ ] Upload 1 Video
- [ ] Verify all appear in correct student dashboard sections
- [ ] Verify Prompts page shows only Prompts category PDFs
- [ ] Verify PDFs page shows all PDFs regardless of category
- [ ] Verify Videos page shows only videos

---

## Phase 9: Performance Tests

### 9.1 Load Time
- [ ] Measure admin dashboard initial load time
- [ ] Measure content list load time (with 50+ items)
- [ ] Measure wizard open time
- [ ] Measure student dashboard load time

### 9.2 Event Performance
- [ ] Upload content → Measure time until Recent Uploads updates
- [ ] Upload content → Measure time until student page updates
- [ ] Verify no memory leaks from event listeners
- [ ] Verify event listeners properly cleaned up on unmount

### 9.3 Database Queries
- [ ] Check Supabase dashboard for query performance
- [ ] Verify GIN index used for JSONB queries
- [ ] Verify RLS policies not causing N+1 queries

---

## Phase 10: Error Handling Tests

### 10.1 Network Errors
- [ ] Disable network → Try to upload → Error message shown
- [ ] Slow 3G simulation → Verify loading states shown
- [ ] Timeout simulation → Verify timeout error handled

### 10.2 Invalid Data
- [ ] Try to upload with SQL injection in title
- [ ] Try to upload with XSS script in description
- [ ] Try to upload with invalid Google Drive URL
- [ ] Try to upload with extremely long title (>1000 chars)

### 10.3 Permission Errors
- [ ] Try to access admin pages as student → Redirected
- [ ] Try to upload as non-admin → Blocked by RLS
- [ ] Try to access elite content as starter → Blocked

---

## Test Summary

**Total Test Cases**: ~120  
**Passed**: [TO BE COMPLETED]  
**Failed**: [TO BE COMPLETED]  
**Blocked**: [TO BE COMPLETED]  
**Not Tested**: [TO BE COMPLETED]

---

## Critical Issues Found

| Issue # | Severity | Description | Status | Fix Commit |
|---------|----------|-------------|--------|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Sign-Off

**Tested By**: ___________________  
**Date**: ___________________  
**Approved By**: ___________________  
**Date**: ___________________  

**Status**: ⬜ PASSED | ⬜ FAILED | ⬜ CONDITIONALLY APPROVED

---

## Notes

*Add any additional observations, recommendations, or concerns here*
