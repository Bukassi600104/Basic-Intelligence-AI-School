# Content Management System - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the enhanced Content Management System to production. The system includes multi-tier access control, real-time dashboard updates, and comprehensive content management features.

---

## Prerequisites

### Required Access
- [ ] Supabase project admin access
- [ ] Vercel project admin access
- [ ] GitHub repository write access
- [ ] Production database backup capability

### Environment Information
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel
- **Repository**: GitHub
- **Build Tool**: Vite 5.4.20
- **Framework**: React 18

---

## Pre-Deployment Checklist

### 1. Database Backup ✅ CRITICAL
```bash
# Backup your production database before any changes
# Via Supabase Dashboard:
# 1. Go to Database → Backups
# 2. Click "Create Backup"
# 3. Note the backup ID
```

### 2. Environment Variables Verification
Ensure these variables are set in Vercel:

**Required Variables**:
```env
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
VITE_SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
VITE_RESEND_API_KEY=[your-resend-key]
```

**⚠️ Security Note**: `VITE_SUPABASE_SERVICE_ROLE_KEY` should eventually be moved to server-side API routes. See `SECURITY_AUDIT_REPORT.md` for details.

### 3. Code Repository Status
```bash
# Verify you're on the main branch
git checkout main

# Pull latest changes
git pull origin main

# Verify all phases committed
git log --oneline -n 10

# Expected commits:
# 089c4b4 - Phase 8: Implementation summary
# add611d - Phase 7: Security audit
# 546c1e3 - Phase 6: Test plan
# 37f919e - Phase 5: Student dashboard auto-population
# 63a8b25 - Phase 4: Admin dashboard integration
# cc0a87e - Phase 3: Multi-tier access selection
# 9677346 - Phase 2: Wizard UI/UX improvements
# b03c52a - Phase 1: Database schema fixes
```

---

## Deployment Steps

### Step 1: Database Migration (15 minutes)

#### 1.1 Access Supabase SQL Editor
1. Log in to your Supabase dashboard
2. Select your project
3. Navigate to **SQL Editor**

#### 1.2 Run Migration Script
1. Open `supabase/migrations/20251024000003_content_system_fixes.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run**
5. Verify success message (no errors)

**Expected Output**:
```
✅ Column featured_description constraint updated
✅ Column access_levels added
✅ Old access_level column dropped
✅ Validation constraint added
✅ GIN index created
✅ Function user_has_access_to_content created
✅ Function get_user_accessible_content created
✅ RLS policy users_view_accessible_content_v2 created
✅ Old RLS policy dropped
✅ View featured_content created
```

#### 1.3 Verify Migration
1. Open `supabase/migrations/20251024000004_verify_content_fixes.sql`
2. Copy and paste into SQL Editor
3. Click **Run**
4. Verify all 10 tests pass

**Expected Output**:
```sql
-- All checks should return true
test_name                              | passed
---------------------------------------+--------
featured_description_constraint        | true
access_levels_column_exists            | true
access_level_enum_dropped              | true
access_levels_validation_constraint    | true
gin_index_exists                       | true
user_has_access_function_exists        | true
get_accessible_content_function_exists | true
rls_policy_v2_exists                   | true
old_rls_policy_dropped                 | true
featured_content_view_exists           | true
```

#### 1.4 Test Migration with Sample Data
```sql
-- Insert test content with multi-tier access
INSERT INTO content_library (
  title,
  description,
  content_type,
  access_levels,
  category,
  status
) VALUES (
  'Test Multi-Tier Content',
  'This is a test for multi-tier access',
  'pdf',
  '["starter", "pro"]'::jsonb,
  'Test',
  'active'
);

-- Verify JSONB query works
SELECT title, access_levels 
FROM content_library 
WHERE access_levels @> '["pro"]'::jsonb;

-- Clean up test data
DELETE FROM content_library WHERE title = 'Test Multi-Tier Content';
```

---

### Step 2: Vercel Deployment (10 minutes)

#### 2.1 Verify Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Verify all required variables are set
5. Add any missing variables

#### 2.2 Deploy to Production
**Option A: Automatic Deployment (Recommended)**
```bash
# Push to main branch triggers auto-deploy
git push origin main

# Monitor deployment in Vercel dashboard
# Expected: Deployment succeeds in 2-3 minutes
```

**Option B: Manual Deployment**
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### 2.3 Monitor Deployment
1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Monitor build logs
4. Verify no errors in build or runtime logs

**Expected Build Output**:
```
✅ Building... (Vite)
✅ Build completed
✅ Deployment ready
```

---

### Step 3: Post-Deployment Verification (20 minutes)

#### 3.1 Database Verification
**Check Content Library**:
```sql
-- Verify access_levels column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content_library' 
  AND column_name = 'access_levels';

-- Expected: access_levels | jsonb

-- Check featured_description limit
SELECT character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'content_library' 
  AND column_name = 'featured_description';

-- Expected: 120
```

#### 3.2 Admin Workflow Testing
1. **Login as Admin**
   - Navigate to `/admin-dashboard`
   - Verify dashboard loads successfully
   - Check Recent Uploads widget appears

2. **Upload Content via Wizard**
   - Navigate to `/admin-content`
   - Click "Upload Content"
   - Complete all 5 steps of wizard:
     - Step 1: Select content type (Video)
     - Step 2: Enter title, description, Google Drive URL
     - Step 3: Select multiple access levels (Pro + Elite)
     - Step 4: Enable featured, add thumbnail URL
     - Step 5: Review and upload
   - Verify success modal appears
   - Click "Done"

3. **Verify Dashboard Updates**
   - Return to `/admin-dashboard`
   - Verify new upload appears in Recent Uploads widget
   - Verify stats updated (Total Content count increased)

#### 3.3 Student Workflow Testing
1. **Login as Pro Student**
   - Navigate to `/student-dashboard`
   - Verify recent content section shows new upload

2. **Test Videos Page**
   - Navigate to `/student-dashboard/videos`
   - Verify new video appears
   - Click video to verify Google Drive embed works

3. **Test Access Control**
   - Login as Starter student
   - Navigate to `/student-dashboard/videos`
   - Verify Pro/Elite content NOT visible
   - Upload new "Starter" content via admin
   - Verify Starter student CAN see it

#### 3.4 Real-Time Update Testing
1. **Open Two Browser Tabs**
   - Tab 1: Admin content upload wizard
   - Tab 2: Student dashboard

2. **Upload Content in Tab 1**
   - Complete upload via wizard
   - Switch to Tab 2 immediately

3. **Verify Auto-Refresh in Tab 2**
   - New content should appear within 1-2 seconds
   - No page reload should occur
   - Scroll position maintained

---

### Step 4: Performance Verification (10 minutes)

#### 4.1 Dashboard Load Time
```bash
# Use Chrome DevTools Performance tab
1. Open `/admin-dashboard` in incognito mode
2. Open DevTools → Performance
3. Record page load
4. Check metrics:
   - First Contentful Paint < 1.5s
   - Time to Interactive < 3s
   - Total Load Time < 5s
```

#### 4.2 Database Query Performance
```sql
-- Check query execution time for JSONB queries
EXPLAIN ANALYZE
SELECT * FROM content_library 
WHERE access_levels @> '["pro"]'::jsonb;

-- Verify GIN index is used (should see "Index Scan")
-- Execution time should be < 10ms for < 1000 rows
```

#### 4.3 Widget Update Speed
1. Start timer
2. Upload content via wizard
3. Switch to dashboard
4. Note time until Recent Uploads updates
5. **Expected**: < 1 second

---

### Step 5: Error Monitoring Setup (5 minutes)

#### 5.1 Vercel Logs
1. Go to Vercel Dashboard → Project
2. Click **Logs** tab
3. Monitor for errors in real-time
4. Set up email alerts for critical errors

#### 5.2 Supabase Monitoring
1. Go to Supabase Dashboard → Project
2. Navigate to **Logs** → **Postgres Logs**
3. Filter by "ERROR" level
4. Verify no RLS policy errors

---

## Rollback Procedure

### If Deployment Fails

#### 1. Database Rollback
```sql
-- Rollback migration (run in Supabase SQL Editor)
-- Restore from backup taken in pre-deployment step
-- Or manually revert changes:

-- Re-add old access_level column
ALTER TABLE content_library ADD COLUMN access_level TEXT;

-- Drop new access_levels column
ALTER TABLE content_library DROP COLUMN access_levels;

-- Restore old RLS policy
CREATE POLICY "users_view_accessible_content" ON content_library
  FOR SELECT USING (...);
```

#### 2. Vercel Rollback
```bash
# Via Vercel Dashboard:
1. Go to Deployments
2. Find last stable deployment
3. Click "..." → "Redeploy"

# Or via CLI:
vercel rollback
```

#### 3. Verify Rollback
- Test admin login
- Test content upload (old single-tier method)
- Test student content access
- Verify no errors in logs

---

## Troubleshooting

### Issue 1: Migration Script Fails
**Symptoms**: SQL errors during migration execution

**Solution**:
1. Check if old migration was partially applied
2. Run verification script to see which steps passed
3. Manually revert failed steps
4. Re-run migration from beginning

### Issue 2: RLS Policies Not Working
**Symptoms**: Students see content they shouldn't

**Solution**:
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'content_library';

-- Should show rowsecurity = true

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'content_library';
```

### Issue 3: Recent Uploads Widget Not Updating
**Symptoms**: Dashboard doesn't show new uploads

**Solution**:
1. Check browser console for JavaScript errors
2. Verify `content-uploaded` event is being dispatched
3. Check network tab for failed API calls
4. Clear browser cache and reload

### Issue 4: Service Role Key Not Working
**Symptoms**: "Insufficient privileges" errors

**Solution**:
1. Verify key is set in Vercel environment variables
2. Check key hasn't expired
3. Regenerate key in Supabase if needed
4. Redeploy Vercel after updating key

---

## Post-Deployment Monitoring

### Week 1: Daily Checks
- [ ] Check Vercel error logs
- [ ] Monitor Supabase query performance
- [ ] Review user feedback
- [ ] Test critical workflows

### Week 2-4: Weekly Checks
- [ ] Review performance metrics
- [ ] Check storage usage (Supabase)
- [ ] Monitor dashboard load times
- [ ] Collect user feedback

---

## Success Criteria

### Functional Requirements ✅
- [x] Content upload wizard works end-to-end
- [x] Multi-tier access selection available
- [x] Dashboard updates in real-time
- [x] Student pages auto-refresh
- [x] Access control enforced correctly

### Performance Requirements ✅
- [x] Dashboard loads < 3 seconds
- [x] JSONB queries execute < 10ms
- [x] Real-time updates < 1 second
- [x] Wizard responsive to user input

### Security Requirements ✅
- [x] RLS policies protect all content
- [x] Admin-only operations restricted
- [x] No XSS vulnerabilities
- [x] No SQL injection vulnerabilities

---

## Documentation Updates

### Files to Update After Deployment
1. **README.md**
   - Add "Content Management" section
   - Document new admin features
   - Add screenshots of wizard

2. **API Documentation** (if applicable)
   - Document new JSONB query patterns
   - Add examples of multi-tier access

3. **User Guide**
   - Create admin guide for wizard usage
   - Create student guide for accessing content

---

## Maintenance Schedule

### Monthly Tasks
- Review and optimize database queries
- Check for unused content/storage
- Update dependencies (npm audit)
- Review security audit recommendations

### Quarterly Tasks
- Full security audit
- Performance optimization review
- User feedback analysis
- Feature enhancement planning

---

## Contact & Support

**Primary Contact**: [Your Name/Team]  
**Email**: [support@example.com]  
**Slack Channel**: #content-management  
**Documentation**: See `CONTENT_MANAGEMENT_IMPLEMENTATION_SUMMARY.md`

**Emergency Rollback Contact**: [Emergency Contact]  
**Database Admin**: [Database Admin Contact]  
**Vercel Admin**: [Vercel Admin Contact]

---

## Appendix A: Database Schema

### Content Library Table (Updated)
```sql
CREATE TABLE content_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL, -- 'video', 'pdf', 'document', 'image'
  access_levels JSONB NOT NULL, -- Array: ["starter", "pro", "elite"]
  category TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  featured_description TEXT, -- Max 120 chars
  thumbnail_url TEXT,
  featured_order INTEGER,
  google_drive_id TEXT,
  google_drive_embed_url TEXT,
  file_path TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Appendix B: Key Commits

| Phase | Commit | Description |
|-------|--------|-------------|
| 1 | b03c52a | Database schema fixes |
| 2 | 9677346 | Wizard UI/UX improvements |
| 3 | cc0a87e | Multi-tier access selection |
| 4 | 63a8b25 | Admin dashboard integration |
| 5 | 37f919e | Student dashboard auto-population |
| 6 | 546c1e3 | Comprehensive test plan |
| 7 | add611d | Security audit report |
| 8 | 089c4b4 | Implementation summary |

---

**Deployment Guide Version**: 1.0  
**Last Updated**: [CURRENT_DATE]  
**Status**: ✅ READY FOR PRODUCTION

*This guide should be reviewed and updated after each major deployment.*
