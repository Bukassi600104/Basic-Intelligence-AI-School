# Member Management Wizards Implementation Plan

## Overview
This plan consolidates member management operations into three dedicated wizards to streamline admin workflows and ensure proper member ID assignment following the BI0001 pattern.

---

## Current Issues Identified

1. ✗ **No Member ID on Registration/Creation**: New members lack member IDs when created
2. ✗ **No Member ID Assignment During Approval**: Admins cannot assign member IDs when approving subscriptions
3. ✗ **Scattered Approval Process**: Subscription approval lacks validation and centralized workflow
4. ✗ **Duplicate Operations**: Multiple entry points for similar operations causing confusion
5. ✗ **Member ID Format Inconsistency**: Current system uses `BKO-XXXXXX` instead of required `BI0001` format

---

## Required Member ID System

### Format Specification
- **Pattern**: `BI####` (e.g., BI0001, BI0002, BI0150)
- **Prefix**: `BI` (Basic Intelligence)
- **Counter**: 4-digit zero-padded sequential number
- **Example**: First member = BI0001, 150th member = BI0150

### Implementation Strategy
1. Create `member_id_counter` table to track next available ID
2. Add function `generate_next_member_id()` to auto-generate IDs
3. Ensure uniqueness with database constraints
4. Required for login alongside email

---

## Wizard 1: Member Approval Wizard

### Purpose
Consolidate the subscription approval process into a single, comprehensive workflow where admins can review all details and assign member IDs before approval.

### Current Files to Modify/Remove
- `src/services/subscriptionService.js` - Update `approveRequest()` method
- `src/pages/admin-users/index.jsx` - Remove inline approval buttons
- Database: `subscription_requests` table

### New Files to Create
- `src/pages/admin-dashboard/components/MemberApprovalWizard.jsx`
- `src/services/memberIdService.js` - Member ID generation logic

### Wizard Steps

#### Step 1: Review Member Details
- Display member information:
  - Full Name
  - Email Address
  - Phone/WhatsApp
  - Registration Date
  - Requested Tier (Basic ₦5k, Premium ₦15k, Pro ₦25k)
- Show payment slip/proof if uploaded
- Display current status

#### Step 2: Assign Member ID
- Auto-generate next available member ID (BI####)
- Display generated ID with option to manually edit
- Validate uniqueness
- Preview: "Member ID will be: **BI0042**"

#### Step 3: Configure Membership
- Select/Confirm membership tier:
  - [ ] Starter (₦5,000/month)
  - [ ] Pro (₦15,000/month)
  - [ ] Elite (₦25,000/month)
- Set subscription duration (default 30 days)
- Calculate expiry date (auto-display)

#### Step 4: Review & Approve
- Summary display:
  ```
  Member: John Doe (john@example.com)
  Member ID: BI0042
  Tier: Pro
  Duration: 30 days
  Expiry: November 24, 2025
  ```
- Approve or Reject buttons
- Rejection reason textarea (if rejecting)

### Database Changes Required
```sql
-- Add member_id to subscription_requests for tracking
ALTER TABLE subscription_requests 
ADD COLUMN IF NOT EXISTS assigned_member_id TEXT;

-- Create member_id_counter table
CREATE TABLE IF NOT EXISTS member_id_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  next_id INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial counter
INSERT INTO member_id_counter (id, next_id) VALUES (1, 1)
ON CONFLICT (id) DO NOTHING;
```

### Service Methods Required
```javascript
// memberIdService.js
- generateNextMemberId() // Returns BI####
- validateMemberId(memberId) // Check uniqueness
- reserveMemberId(memberId) // Mark as used
- getNextAvailableId() // Get counter value

// subscriptionService.js - UPDATE
- approveRequestWithWizard(requestId, memberId, tierConfig, adminId)
```

---

## Wizard 2: Manual Member Addition Wizard

### Purpose
Allow admins to manually add members directly without requiring payment confirmation, with proper member ID assignment.

### Current Files to Modify
- `src/services/adminService.js` - Replace `createUser()` with wizard-compatible version
- `src/pages/admin-users/index.jsx` - Remove inline "Add User" form

### New Files to Create
- `src/pages/admin-dashboard/components/AddMemberWizard.jsx`

### Wizard Steps

#### Step 1: Basic Information
- Full Name (required)
- Email Address (required)
- Phone Number (optional)
- WhatsApp Number (optional)

#### Step 2: Assign Member ID
- Auto-generate: BI####
- Allow manual override
- Validate uniqueness in real-time

#### Step 3: Select Membership Level
- **Single Selection** (radio buttons):
  - [ ] Starter - ₦5,000/month
  - [ ] Pro - ₦15,000/month
  - [ ] Elite - ₦25,000/month
- Set subscription duration (default 30 days)
- Calculate expiry date

#### Step 4: Additional Settings
- Role selection:
  - [ ] Student (default)
  - [ ] Instructor
  - [ ] Admin
- Membership status:
  - [ ] Active (default)
  - [ ] Pending
  - [ ] Inactive
- Send welcome email: [x] Yes [ ] No

#### Step 5: Review & Create
- Summary of all entered data
- Temporary password display (auto-generated)
- Create button

### Database Changes Required
```sql
-- Ensure user_profiles has all required fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMPTZ;

-- Update member_id constraint
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_member_id_key;
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_member_id_unique UNIQUE (member_id);
```

### Service Methods Required
```javascript
// adminService.js - UPDATE
- createMemberWithWizard(memberData, adminId)
  // Includes member ID generation, password creation, welcome email
```

---

## Wizard 3: Membership Upgrade Wizard

### Purpose
Handle member upgrades from one tier to another when members pay for an upgrade.

### Current Files to Modify
- `src/services/subscriptionService.js` - Update upgrade logic
- `src/pages/admin-users/index.jsx` - Remove inline upgrade buttons

### New Files to Create
- `src/pages/admin-dashboard/components/MemberUpgradeWizard.jsx`

### Wizard Steps

#### Step 1: Select Member
- Search by:
  - Member ID (BI####)
  - Name
  - Email
- Display current membership details

#### Step 2: Review Current Status
- Current Tier: Pro
- Current Expiry: November 15, 2025
- Days Remaining: 21 days
- Member ID: BI0042

#### Step 3: Select New Tier
- **Upgrade to** (only show higher tiers):
  - [ ] Elite (₦25,000) - if currently Starter or Pro
- Payment amount confirmation
- Option to extend subscription: [ ] Add 30 days

#### Step 4: Configure Upgrade
- Effective date:
  - [ ] Immediate
  - [ ] On next renewal
- Handle remaining days:
  - [ ] Credit proportionally
  - [ ] Reset to full duration
  - [ ] Keep current expiry

#### Step 5: Confirm Upgrade
- Summary:
  ```
  Member: John Doe (BI0042)
  Current: Pro (21 days remaining)
  Upgrade to: Elite
  New Expiry: December 15, 2025
  Amount Paid: ₦25,000
  ```
- Process Upgrade button

### Database Changes Required
```sql
-- Add upgrade tracking to subscription_requests
ALTER TABLE subscription_requests
ADD COLUMN IF NOT EXISTS upgrade_effective_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS previous_tier TEXT,
ADD COLUMN IF NOT EXISTS days_credited INTEGER DEFAULT 0;

-- Create upgrade_history table for audit trail
CREATE TABLE IF NOT EXISTS upgrade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  from_tier TEXT NOT NULL,
  to_tier TEXT NOT NULL,
  effective_date TIMESTAMPTZ NOT NULL,
  processed_by UUID REFERENCES user_profiles(id),
  amount_paid DECIMAL(10,2),
  days_credited INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Service Methods Required
```javascript
// subscriptionService.js - NEW
- upgradeWithWizard(userId, upgradeConfig, adminId)
- calculateUpgradeCredit(currentTier, newTier, daysRemaining)
- applyUpgrade(userId, upgradeData)
```

---

## Files to Remove/Deprecate

### Complete Removal
1. Any standalone "Approve Payment" buttons in `admin-users/index.jsx`
2. Inline "Add User" forms (replace with wizard button)
3. Quick upgrade buttons (replace with wizard)

### Methods to Deprecate (Mark as deprecated, keep for backwards compatibility)
```javascript
// adminService.js
- createUser() // Replace with createMemberWithWizard()
- assignMemberId() // Now handled in wizards

// subscriptionService.js
- approveRequest() // Replace with approveRequestWithWizard()
- createUpgradeRequest() // Replace with upgradeWithWizard()
```

---

## Navigation & Access

### Admin Dashboard Updates
Add wizard access cards/buttons:
```
┌─────────────────────────────────────────────┐
│  Member Management                          │
├─────────────────────────────────────────────┤
│  [ Approve New Members ]  (Badge: 5 pending)│
│  [ Add Member Manually ]                    │
│  [ Upgrade Member Tier ]                    │
└─────────────────────────────────────────────┘
```

### Admin Sidebar
Add menu section:
```
- Dashboard
- Users
  - View All Users
  - Approve Members ← NEW
  - Add Member ← NEW
  - Upgrade Member ← NEW
- Courses
- Content
...
```

---

## Implementation Order (Phased Rollout)

### Phase 1: Database & Core Services (Week 1)
1. Create database migration for member_id_counter
2. Implement memberIdService.js
3. Update user_profiles constraints
4. Create upgrade_history table
5. Update existing services (mark old methods as deprecated)

### Phase 2: Member Approval Wizard (Week 1-2)
1. Build MemberApprovalWizard component
2. Integrate with subscriptionService
3. Add to admin dashboard
4. Test approval workflow end-to-end
5. Deploy and monitor

### Phase 3: Manual Addition Wizard (Week 2)
1. Build AddMemberWizard component
2. Update adminService.createMemberWithWizard
3. Add welcome email with member ID
4. Test member creation workflow
5. Deploy and monitor

### Phase 4: Upgrade Wizard (Week 2-3)
1. Build MemberUpgradeWizard component
2. Implement upgrade logic and credit calculation
3. Create upgrade history tracking
4. Test upgrade scenarios
5. Deploy and monitor

### Phase 5: Cleanup & Documentation (Week 3)
1. Remove deprecated UI elements
2. Update admin documentation
3. Create video tutorials for admins
4. Final testing of all wizards
5. Production rollout

---

## Testing Checklist

### Member Approval Wizard
- [ ] Generate sequential member IDs correctly (BI0001, BI0002...)
- [ ] Validate uniqueness of member IDs
- [ ] Approve request successfully
- [ ] Reject request with reason
- [ ] Send welcome email with member ID
- [ ] Update user_profiles correctly
- [ ] Handle duplicate approval attempts

### Manual Addition Wizard
- [ ] Create member with all details
- [ ] Assign unique member ID
- [ ] Generate secure temporary password
- [ ] Send welcome email/WhatsApp
- [ ] Create member in both auth and user_profiles
- [ ] Handle existing email errors gracefully
- [ ] All membership tiers work correctly

### Upgrade Wizard
- [ ] Search members by ID/name/email
- [ ] Display current membership details
- [ ] Calculate upgrade correctly
- [ ] Credit remaining days properly
- [ ] Update tier and expiry
- [ ] Create audit trail in upgrade_history
- [ ] Send upgrade confirmation email

### Integration Tests
- [ ] All wizards accessible from admin dashboard
- [ ] Navigation works correctly
- [ ] Loading states display properly
- [ ] Error handling works
- [ ] Success messages show
- [ ] Database consistency maintained

---

## Security Considerations

1. **Member ID Generation**: Atomic operation to prevent duplicates
2. **Admin Verification**: Only admins can access wizards (RLS policies)
3. **Audit Trail**: Log all wizard operations
4. **Password Security**: Temporary passwords must be strong
5. **Email Validation**: Verify email uniqueness before creation

---

## User Documentation Required

### For Admins
1. "How to Approve New Members" - Video tutorial
2. "How to Manually Add Members" - Step-by-step guide
3. "How to Upgrade Member Tiers" - Best practices
4. "Understanding Member IDs" - Format and usage

### For Members
1. Update login instructions to include member ID
2. "Your Member ID" section in profile
3. Email templates with member ID prominently displayed

---

## Success Metrics

- ✅ 100% of new members have member IDs assigned
- ✅ Average approval time reduced from X mins to Y mins
- ✅ Zero duplicate member IDs
- ✅ 90%+ admin satisfaction with wizards
- ✅ Zero orphaned auth users without profiles

---

## Rollback Plan

If issues occur:
1. **Database**: Keep old columns/tables intact during migration
2. **Services**: Deprecated methods remain functional
3. **UI**: Old UI can be re-enabled via feature flag
4. **Member IDs**: Manual assignment possible via SQL if needed

---

## Next Steps

1. **Review & Approve Plan**: Get stakeholder sign-off
2. **Create Detailed Tickets**: Break down each phase into tasks
3. **Set Timeline**: Allocate developers and set milestones
4. **Begin Phase 1**: Start with database migrations

---

**Questions for Review:**
1. Should member IDs be editable after assignment?
2. What happens to members created before this system? Backfill member IDs?
3. Should we migrate existing member IDs to new BI#### format?
4. Any additional validation rules for member data?
5. Should wizards support bulk operations?

**Estimated Development Time**: 2-3 weeks for complete implementation
**Risk Level**: Medium (requires careful database migrations)
**Priority**: High (affects core member management workflow)
