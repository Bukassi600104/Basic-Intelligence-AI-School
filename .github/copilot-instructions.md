# AI Agent Instructions for Basic Intelligence Community School

**Last Updated**: November 2, 2025  
**Project Status**: ✅ LIVE ON VERCEL  
**Core Stack**: React 18 + Vite 5.4.20 + Supabase + TailwindCSS 3.4.6

---

## 🔧 MCP Servers - Use These for Every Task

### ⚠️ CRITICAL WORKFLOW

All 4 MCP servers configured in `.vscode/mcp.json`. **Always investigate with MCPs first** before coding:

1. **Context7** → Fetch latest library docs
2. **Supabase MCP** → Inspect schema & check RLS policies
3. **Chrome DevTools MCP** → Debug & test rendering
4. **Shadcn MCP** → Find components & examples

**Project Ref**: `eremjpneqofidtktsfya` (Supabase)

---

## Architecture Overview

### Frontend Structure (`src/`)

```
src/
├── Routes.jsx                 # All routes (static + lazy-loaded)
├── App.jsx                    # Env var validation, AuthProvider wrapper
├── contexts/AuthContext.jsx   # Global auth state + profile loading
├── pages/
│   ├── auth/                  # SignIn, SignUp, PasswordReset (static imports)
│   ├── admin-dashboard/       # Admin features (lazy-loaded)
│   ├── student-dashboard/     # Student features (lazy-loaded)
│   └── home-page/             # Public pages (static imports)
├── components/ui/             # shadcn-based components (mix of .tsx & .jsx)
├── services/                  # 18 backend services (pattern: {success, data, error})
├── lib/
│   ├── supabase.js            # Client (anon key)
│   └── supabaseAdmin.js       # Admin client (service role key - server-side only)
└── utils/logger.js            # Environment-aware logging
```

**Routing Strategy**:
- **Static imports** (`Routes.jsx`): Core pages (home, auth, pricing)
- **Lazy-loaded** with `Suspense`: Admin pages, student pages (reduces initial bundle)
- **PageLoader component** shown during route transitions

### Backend Architecture (Supabase)

- **Auth**: Supabase built-in + custom `user_profiles` table
- **Key tables**: `user_profiles`, `admin_users`, `content_library`, `courses`, `course_enrollments`, `notification_templates`, `notification_logs`, `subscription_requests`, `member_reviews`
- **Security**: Row Level Security (RLS) enforced on **all** tables
- **Functions**: `has_admin_role()`, `admin_delete_user()`, `user_has_access_level()`

### Build Configuration (Vite)

**⚠️ CRITICAL**: `vite.config.mjs` uses **minimal code-splitting** to prevent React initialization errors:
- ✅ Splits: Individual admin/student/auth page chunks
- ❌ **NO separate vendor chunks** — All `node_modules` (React, Radix, Supabase) stay in main entry
- **Why**: Any async chunk trying to import React before it loads = blank page error

**Build output**: `npm run build` → `dist/` → Vercel deploys

---

## Authentication & Authorization

### useAuth Hook (Required Pattern)

```jsx
import { useAuth } from '../contexts/AuthContext';

export function MyComponent() {
  const { user, userProfile, isAdmin, isMember, canAccessContent } = useAuth();

  if (!userProfile) return <LoadingSpinner />;  // Profile still loading

  // userProfile structure:
  // { id, email, full_name, role: 'admin'|'student', membership_status, membership_tier, ... }
  
  // Authorization checks:
  // isAdmin → boolean (userProfile.role === 'admin')
  // isMember → boolean (admin OR membership_status === 'active')
  // canAccessContent(tier) → boolean (checks user's tier against content's access_level)
}
```

**CRITICAL**: `AuthContext.jsx` has fire-and-forget profile loading (`setProfileLoading(false)` called before state updates complete). **Never** add `await` or modify callback signatures.

### Role-Based Access Control (3-Layer Pattern)

1. **Client-side redirects** (immediate UX feedback):
   ```jsx
   useEffect(() => {
     if (userProfile?.role !== 'admin') navigate('/');
   }, [userProfile]);
   ```

2. **RLS policies** (server-side enforcement):
   ```sql
   CREATE POLICY "admins_all_access" ON table_name FOR ALL
   USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
   ```

3. **Service layer checks** (for sensitive operations):
   ```javascript
   const hasAdminRole = await supabase.rpc('has_admin_role');
   if (!hasAdminRole) throw new Error('Unauthorized');
   ```

### Admin vs Regular User Access

**Admin users** stored in `admin_users` table (separate from `user_profiles`):
- `AuthContext` checks `admin_users` first, then falls back to `user_profiles`
- Admin profiles get role: `'admin'` + membership_tier: `'admin'`
- Admin operations use `supabaseAdmin` (service role client)

**Regular users** in `user_profiles` with role: `'student'`

---

## Services Layer Patterns

All backend communication in `src/services/`:

```javascript
// Service return pattern (consistent across all services):
{ success: boolean, data?: any, error?: string }

// Example usage:
const { success, data, error } = await userService.getUserById(userId);
if (!success) {
  console.error('Failed to fetch user:', error);
  return;
}
console.log('User:', data);
```

### Critical Services

| Service | Purpose |
|---------|---------|
| `adminService.js` | User CRUD, dashboard stats (getDashboardStats, createUser, deleteUser) |
| `userService.js` | Profile updates, activity tracking |
| `notificationService.js` | Email/WhatsApp via templates + Resend API |
| `subscriptionService.js` | Tier management (₦5k/₦15k/₦25k), approval workflow |
| `contentService.js` | File uploads, content library, access logging |
| `courseService.js` | Course CRUD, enrollments, instructor assignments |

---

## Notification System (Template-Driven)

```javascript
// Send notification:
await notificationService.sendNotification({
  userId: memberId,
  templateName: 'subscription_expiry_warning',  // Must exist in DB
  variables: { days_remaining: 7 },             // Auto-injected: full_name, email, member_id, membership_tier
  recipientType: 'email'                        // 'email' | 'whatsapp' | 'both'
});

// Template syntax in DB:
// Subject: "{{full_name}}, your subscription expires in {{days_remaining}} days"
// Body: "Dear {{full_name}}, visit {{dashboard_url}} to renew..."
```

**Logs stored in `notification_logs`** with status tracking. Admin can create templates via SQL editor or UI wizard (`/admin-notification-wizard`).

---

## Common Implementation Patterns

### Adding Admin Feature

1. Create page: `src/pages/admin-dashboard/NewFeaturePage.jsx`
2. Add route to `Routes.jsx`:
   ```jsx
   const AdminNewFeature = lazy(() => import('./pages/admin-dashboard/NewFeaturePage'));
   <Route path="/admin-new-feature" element={<AdminNewFeature />} />
   ```
3. Add nav link to `components/ui/AdminSidebar.jsx`
4. Protect with role check:
   ```jsx
   useEffect(() => {
     if (userProfile?.role !== 'admin') navigate('/');
   }, [userProfile, navigate]);
   ```

### Adding Student Feature

1. Create page: `src/pages/student-dashboard/NewFeaturePage.jsx`
2. Add route: `<Route path="/student-dashboard/new-feature" element={<NewFeaturePage />} />`
3. Gate by membership: Use `isMember` or `canAccessContent(tier)`
4. Add nav link to `components/ui/StudentDashboardNav.jsx`

### Creating New RLS Policy

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Pattern 1: User owns data
CREATE POLICY "users_read_own" ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Pattern 2: Admins unrestricted
CREATE POLICY "admins_all_access" ON table_name FOR ALL
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Pattern 3: Tier-based access
CREATE POLICY "members_access_tier_content" ON content_library FOR SELECT
USING (status = 'active' AND user_has_access_level(access_level));
```

**Always verify with**: `mcp_supabase_get_advisors(type: "security")`

### Adding UI Component from Shadcn

```bash
# 1. Search: mcp_shadcn_search_items_in_registries(query: "button")
# 2. View example: mcp_shadcn_get_item_examples_from_registries(query: "button-demo", registries: ["@shadcn"])
# 3. Get add command: mcp_shadcn_get_add_command_for_items(items: ["@shadcn/button"])
# 4. Run the command from terminal
# 5. Import and use in your component

import { Button } from "@/components/ui/button";

export function MyComponent() {
  return <Button variant="outline">Click me</Button>;
}
```

---

## Build & Deployment

### Development

```bash
npm install                    # Install deps
npm run dev                    # Start Vite on port 4028
npm run typecheck              # Verify TypeScript types
npm run lint                   # Run ESLint
```

**Browser auto-opens** to `http://localhost:4028`

### Production Build

```bash
npm run build                  # Vite builds → dist/
npm run preview                # Test production build locally
```

**⚠️ Build Notes**:
- Outputs to `dist/` with sourcemaps enabled (`--sourcemap` flag)
- Chunk size warning limit: 2000KB
- Terser minification enabled, console logs kept

### Deployment (Vercel)

- `vercel.json` configures:
  - SPA routing: All routes → `/index.html`
  - CSP headers: Allows Supabase + Resend APIs
  - CORS headers for cross-origin requests
- **Environment vars** managed in Vercel dashboard (never `.env` in repo)
- Auto-deploys on merge to `main`

---

## Environment Variables (Required in Production)

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | Database endpoint | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public auth key | `eyJxxxx...` |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Admin key (server-side only) | `eyJxxxx...` |
| `VITE_RESEND_API_KEY` | Email API | `re_xxx...` |

**Missing vars** trigger error UI in `App.jsx` with setup instructions. Production errors in Vercel dashboard.

---

## Code Organization Conventions

### Component Naming & Files

- **shadcn-based UI**: `.tsx` files in `components/ui/` (e.g., `button.tsx`, `card.tsx`)
- **Custom components**: `.jsx` files (e.g., `PaymentCard.jsx`, `DashboardNav.jsx`)
- **Page components**: `.jsx` in `pages/` (e.g., `AdminDashboard.jsx`)
- **Services**: `.js` in `services/` with consistent export pattern

### Import Paths

```javascript
// Prefer absolute imports (configured in tsconfig.json):
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

// Avoid relative imports:
// ❌ import { useAuth } from '../../contexts/AuthContext';
```

### File Organization

```
Feature-related files group together:
src/pages/student-dashboard/
├── StudentDashboard.jsx          # Main page
├── StudentDashboardNav.jsx        # Navigation component (reused in ui/)
└── StudentSubscription.jsx        # Nested page
```

---

## Common Issues & Debugging

### Blank Page / White Screen

1. **Check console errors**: `mcp_chrome_devtoo_list_console_messages`
2. **Verify Supabase**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
3. **Check network**: `mcp_chrome_devtoo_list_network_requests` for failed API calls
4. **Inspect auth**: Is `AuthContext` wrapping `<Routes />`?

**Common cause**: Build issue with code-splitting. Check `vite.config.mjs` manualChunks (should NOT split React).

### Auth State Not Loading

- Verify `user_profiles` RLS allows `auth.uid()` to read own data
- Check `admin_users` RLS if user is admin
- Inspect `AuthContext.jsx` profile loading logic (lines 26-80)
- Review Supabase logs: `mcp_supabase_get_logs(service: "postgres")`

### Content Access Denied

- Check user's `membership_tier` matches content's `access_level`
- Verify `membership_status = 'active'` in user profile
- Confirm content `status = 'active'` in `content_library`
- Test RLS policy with: `mcp_supabase_execute_sql("SELECT * FROM content_library WHERE id = 'xxx'")`

### File Upload Failures

- Verify storage bucket exists in Supabase
- Check file size: prompt-library max 50MB, course-materials max 100MB
- Ensure RLS allows admin uploads to `storage.objects`
- Review Supabase storage quota (free: 1GB)

### Database Migration Issues

- Always apply in timestamp order from `supabase/migrations/`
- Use Supabase SQL Editor (preserves RLS context)
- Verify with: `mcp_supabase_list_migrations` after applying
- Check for conflicts: `mcp_supabase_get_advisors(type: "security")`

### Notification Not Sending

1. Verify `VITE_RESEND_API_KEY` in Vercel
2. Check template exists: `SELECT * FROM notification_templates WHERE name = 'xxx' AND is_active = true`
3. Review error log: `SELECT * FROM notification_logs WHERE status = 'error' ORDER BY created_at DESC LIMIT 10`
4. Ensure user has valid email: `SELECT email FROM user_profiles WHERE id = 'xxx'`

---

## Key Files Reference

- **Core**: `src/App.jsx` (env validation), `src/Routes.jsx` (routing), `src/index.jsx` (entry)
- **Auth**: `src/contexts/AuthContext.jsx` (session + profile), `src/components/ui/AuthenticationGate.jsx`
- **Clients**: `src/lib/supabase.js` (anon), `src/lib/supabaseAdmin.js` (admin-only)
- **UI**: `src/components/ui/` (60+ shadcn-based components)
- **Pages**: `src/pages/admin-*`, `src/pages/student-dashboard`, `src/pages/auth`
- **Services**: `src/services/*Service.js` (18 services)
- **Build**: `vite.config.mjs` (critical: code-splitting), `vercel.json` (deployment), `tailwind.config.js` (design)
- **DB**: `supabase/migrations/` (timestamp-ordered SQL)

---

## Quick Checklist for New Features

- [ ] Create component/page in correct `src/` directory
- [ ] Add route to `Routes.jsx` (lazy-load if admin/student page)
- [ ] Protect with `useAuth` hook if restricted
- [ ] Create/update RLS policies if accessing DB
- [ ] Use services layer for API calls (never raw Supabase in components)
- [ ] Test locally: `npm run dev`
- [ ] Build locally: `npm run build` (check for errors)
- [ ] Check console: `mcp_chrome_devtoo_list_console_messages` on dev server
- [ ] Git push (triggers Vercel deploy)
- [ ] Test on live Vercel URL

---

## Critical Constraints

✅ **LIVE PRODUCTION** — All commits to `main` deploy immediately  
✅ **No Redux** — Use Context API + services layer only  
✅ **RLS Mandatory** — Every table must have RLS enabled  
✅ **Service layer** — Never call Supabase directly from components  
✅ **Admin key** — `supabaseAdmin` server-side only, never expose client-side  
✅ **Build splitting** — Do NOT add vendor chunks in `vite.config.mjs`  

---
