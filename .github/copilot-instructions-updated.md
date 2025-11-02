# AI Agent Instructions for Basic Intelligence Community School

**Last Updated**: November 2, 2025  
**Project Status**: ✅ LIVE ON VERCEL - Production Environment  
**Node Version**: v18+ recommended  
**Build Tool**: Vite 5.4.20

---

## 🔧 MCP Servers Available - USE THESE FOR DEVELOPMENT

### **ALWAYS follow this workflow when implementing features:**

1. **For Supabase Operations** → Use `mcp_supabase_*` tools
   - Check migrations: `mcp_supabase_list_tables`, `mcp_supabase_get_advisors`
   - Apply migrations: `mcp_supabase_apply_migration`
   - Test queries: `mcp_supabase_execute_query`
   - Manage RLS policies before deploying

2. **For Documentation & Best Practices** → Use `mcp_upstash_conte_*` tools
   - FIRST: Call `resolve-library-id` with package name
   - THEN: Call `get-library-docs` with the returned ID
   - Get latest React, Next.js, Supabase docs before implementing

3. **For UI Components** → Use `mcp_shadcn_*` tools
   - Search components: `search_items_in_registries`
   - View examples: `get_item_examples_from_registries`
   - Add components: `get_add_command_for_items`

4. **For Browser Testing** → Use `mcp_chrome-devtoo_*` tools
   - Take snapshots: `take_snapshot` (for accessibility tree)
   - Check console: `list_console_messages` for errors
   - Monitor network: `list_network_requests` for API calls
   - Performance trace: `performance_start_trace` for CWV metrics

### **Environment Context**
- **Development Server**: Port 4028 (`npm run dev`)
- **Production**: Deployed on Vercel (basicintelligence.com or subdomain)
- **Database**: Supabase PostgreSQL with 30+ tables
- **All Environment Variables**: Already configured in Vercel (never commit)

---

## Project Overview

**React 18 + Vite educational platform with Supabase backend**. Manages subscription tiers (Starter ₦5k, Pro ₦15k, Elite ₦25k), automated notifications, role-based access control, and comprehensive admin workflows for an AI learning community.

### Frontend Stack

- **Build**: Vite 5.4.20 (dev port 4028) with React 18, TypeScript-style JSX
- **Routing**: React Router v6 with role-based redirects in `src/Routes.jsx`
- **State**: Context API (`AuthContext`) + service layer pattern
- **Styling**: TailwindCSS 3.4.6 with custom design tokens, animations, AI-gradient utilities
- **Data viz**: D3.js + Recharts for analytics dashboards
- **Components**: shadcn + custom components in `src/components/ui/`

### Backend Architecture (Supabase)

- **Auth**: Built-in Supabase auth with custom profile system
- **Database**: PostgreSQL with strict Row Level Security (RLS) on all tables
- **Key functions**: `has_admin_role()`, `admin_delete_user()`, `user_has_access_level()`
- **Critical tables**:
  - `user_profiles`: Core user data (role: 'admin'|'student', membership_status, tier)
  - `content_library`: Digital assets (videos, PDFs) with tier-based access
  - `courses`: Structured learning paths with instructor assignments
  - `notification_templates` + `notification_logs`: Email system with variable substitution
  - `subscription_requests`: Renewal/upgrade approval workflow
  - `member_reviews`: Testimonials with moderation flags

---

## Architecture Fundamentals

### Authentication & Authorization Patterns

#### Auth Context Usage

```jsx
import { useAuth } from '../contexts/AuthContext';

const { user, userProfile, isAdmin, isMember, canAccessContent } = useAuth();

// user: Supabase session
// userProfile: Database profile with role/membership data
// isAdmin: userProfile?.role === 'admin'
// isMember: admin OR membership_status === 'active'
// canAccessContent(tierLevel): Check if user can access specific tier content
```

**CRITICAL**: `AuthContext.jsx` has a fire-and-forget profile loading pattern. Never modify the `onAuthStateChange` callback signature—it MUST remain synchronous to prevent auth loops.

#### Role-Based Access Control

1. **Client-side checks**: `userProfile?.role !== 'admin'` → redirect in `useEffect`
2. **Database enforcement**: All tables have RLS policies checking `auth.uid()` and role
3. **Admin verification**: For sensitive operations, call `supabase.rpc('has_admin_role')`

#### Dual Supabase Client Pattern

- `src/lib/supabase.js`: Regular client (anon key) for user operations
- `src/lib/supabaseAdmin.js`: Service role key client for admin ops (user creation, deletion)
- **NEVER** expose service role key client-side—only use in controlled service methods

---

## Core Services Architecture

All backend communication goes through services in `src/services/`:

- `adminService.js`: User CRUD, dashboard stats, system alerts
- `notificationService.js`: Email/WhatsApp delivery with template processing
- `subscriptionService.js`: Plans (Basic ₦5k, Premium ₦15k, Pro ₦25k), renewal workflow
- `userService.js`: Profile updates, activity tracking
- `contentService.js`: Content library management, file uploads, access logging
- `courseService.js`: Course CRUD, enrollments, instructor management
- `emailService.js`: Resend API integration
- `systemService.js`: Health checks, storage metrics

**Pattern**: Services return `{ success: boolean, data?, error? }` objects

---

## Notification System

```javascript
// Template variables auto-injected: full_name, email, member_id, membership_tier, dashboard_url

await notificationService.sendNotification({
  userId: member.id,
  templateName: 'subscription_expiry_warning', // Must exist in notification_templates
  variables: { days_remaining: 7, custom_field: 'value' },
  recipientType: 'email' // 'whatsapp' | 'both'
});
```

Templates support `{{variable_name}}` syntax. Logs stored in `notification_logs` with status tracking.

---

## RLS Policy Pattern

Every table MUST have RLS enabled. Example pattern:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Users can read own data
CREATE POLICY "users_read_own" ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Admins can do anything
CREATE POLICY "admins_all_access" ON table_name FOR ALL
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Tier-based content access
CREATE POLICY "users_view_accessible_content" ON content_library FOR SELECT
USING (status = 'active' AND user_has_access_level(access_level));

-- Public read for approved reviews
CREATE POLICY "public_read_approved_reviews" ON member_reviews FOR SELECT
USING (status = 'approved');
```

---

## Subscription Management

The subscription service (`src/services/subscriptionService.js`) handles:

- **Plan configuration**: Basic (₦5,000), Premium (₦15,000), Pro (₦25,000)
- **Admin approval workflow** for renewals and upgrades
- **Expiration tracking** and automated warnings
- **Payment integration** with status tracking

```javascript
// Example: Approving a subscription request
await subscriptionService.approveRequest(requestId, adminId);
```

---

## Common Implementation Tasks

### Adding Admin Features

1. Create page in `src/pages/admin-dashboard/`
2. Add route to `Routes.jsx` with `/admin-*` pattern
3. Import in `AdminSidebar.jsx`, add nav item
4. Protect with role check:

```jsx
useEffect(() => {
  if (userProfile && userProfile?.role !== 'admin') {
    navigate('/');
  }
}, [userProfile, navigate]);
```

### Adding Student Features

1. Create page in `src/pages/student-dashboard/`
2. Add route with `/student-dashboard/*` pattern
3. Use `isMember` or `canAccessContent(tierLevel)` for content gating
4. Add to `StudentDashboardNav.jsx`

### Adding New Routes

1. Update `Routes.jsx` with new route definition
2. Create page component in appropriate directory
   - Admin routes in `pages/admin-dashboard/`
   - Student routes in `pages/student-dashboard/`
3. Add navigation link in relevant sidebar component
   - `components/ui/AdminSidebar.jsx` for admin navigation
   - `components/ui/StudentDashboardNav.jsx` for student navigation

### Creating Notification Templates

1. Insert into `notification_templates` table via Supabase SQL Editor:

```sql
INSERT INTO notification_templates (name, subject, content, category, is_active)
VALUES ('template_name', 'Subject {{full_name}}', 'Body {{variable}}', 'subscription', true);
```

2. Test via admin notification wizard (`/admin-notification-wizard`)
3. Trigger programmatically in service layer

### Managing Subscription Workflow

1. Student requests renewal/upgrade → creates row in `subscription_requests`
2. Admin approves via `subscriptionService.approveRequest(requestId, adminId)`
3. Service updates `user_profiles` (membership_status, tier, expiry date)
4. Automated notification sent via `notificationService`

---

## Security Best Practices

### Client-Side Data Validation

- Use `react-hook-form` for forms (already in package.json)
- Validate on client AND server (RLS policies + database constraints)
- Never trust `userProfile.role` alone—RLS enforces server-side

### Admin User Creation

**ONLY** via `adminService.createUser()` which:

1. Uses `supabaseAdmin` to create auth user
2. Inserts into `user_profiles` with role
3. Generates temporary password via `passwordService`
4. Sends welcome email with credentials

---

## Database Migrations

1. Migrations in `supabase/migrations/` ordered by timestamp (YYYYMMDDHHMMSS)
2. **Always verify** with `verify_migration.sql` after applying
3. RLS policies defined inline with table creation
4. Use `*_clean.sql` variants for fresh environments

**Common pitfall**: Migrations have evolved—some SQL in root directory are deprecated fixes. Trust timestamped migrations in `supabase/migrations/` first.

---

## Environment Setup

Required vars (see `.env.example`):

- `VITE_SUPABASE_URL`: Project URL
- `VITE_SUPABASE_ANON_KEY`: Public anon key
- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Admin operations (server-side only)
- `VITE_RESEND_API_KEY`: Email delivery

**Missing env vars** trigger error UI in `App.jsx`—NO silent failures.

---

## Production Deployment (Vercel)

- `vercel.json` configures SPA routing (all routes → `/index.html`)
- Build: `npm run build` (outputs to `dist/`)
- CSP headers configured in `vercel.json` (allows Supabase + Resend)
- **Secret management**: All env vars already in Vercel settings (never commit)

---

## Troubleshooting Common Issues

### Auth State Not Loading

- Check browser console for profile fetch errors
- Verify RLS policies on `user_profiles` allow `auth.uid()` to read own row
- Ensure `AuthContext` is wrapped around `<Routes />` in `App.jsx`

### "Service role key missing" Errors

- Admin operations require `VITE_SUPABASE_SERVICE_ROLE_KEY`
- In production, verify Vercel env var is set
- Locally, check `.env` file matches `.env.example`

### Content Not Appearing for Users

- Check user's `membership_tier` in `user_profiles`
- Verify content's `access_level` allows user's tier (starter ⊆ pro ⊆ elite)
- Confirm `membership_status = 'active'` in user profile
- Check content `status = 'active'` in `content_library`

### File Upload Failures

- Verify storage bucket exists and has correct MIME type restrictions
- Check file size against bucket limits (prompt-library: 50MB, course-materials: 100MB)
- Ensure RLS policies on `storage.objects` allow admin uploads
- Review Supabase storage quota (free tier: 1GB)

### Migrations Not Applying

- Run migrations in timestamp order from `supabase/migrations/`
- Use Supabase SQL Editor, not local psql (RLS context matters)
- Check for conflicting table/function definitions from prior migrations

### Notification Send Failures

- Verify `VITE_RESEND_API_KEY` is set
- Check `notification_templates.is_active = true`
- Review `notification_logs` table for error messages
- Ensure user has valid email in `user_profiles`

---

## Key Files Reference

- **Auth**: `src/contexts/AuthContext.jsx` (session + profile state)
- **Routes**: `src/Routes.jsx` (all app routes)
- **Supabase clients**: `src/lib/supabase.js`, `src/lib/supabaseAdmin.js`
- **Services**: `src/services/*Service.js` (backend communication)
- **Utils**: `src/utils/logger.js` (env-aware logging)
- **Config**: `tailwind.config.js` (design tokens), `vite.config.mjs` (build)
- **Migrations**: `supabase/migrations/*.sql` (database schema)

---

## Development Workflow

```bash
# Install dependencies
npm install

# Start development server (port 4028)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Browser auto-opens to** `http://localhost:4028`

---

## Quick Reference Checklist

When adding features:

- [ ] Create component/page in appropriate `src/` directory
- [ ] Add route to `Routes.jsx` with Suspense/lazy loading
- [ ] Add RLS policies if accessing database
- [ ] Use services layer for API calls
- [ ] Test with `npm run dev` locally
- [ ] Check build with `npm run build`
- [ ] Verify no console errors in Chrome DevTools
- [ ] Commit and push to GitHub (Vercel auto-deploys)
- [ ] Test on live Vercel URL

---

## Important Notes

✅ **SITE IS LIVE** - All changes go to production after merge  
✅ **Environment vars** are in Vercel (never add to `.env`)  
✅ **Database migrations** must be applied in order  
✅ **RLS policies** are security-critical—test before deploying  
✅ **No Redux**—use Context API + service layer  
✅ **TypeScript components**—.tsx files in `components/ui/`, .jsx for pages  

---
