# AI Agent Instructions for Basic Intelligence Community School# AI Agent Instructions for Basic Intelligence Community School# AI Agent Instructions for Basic Intelligence Community School



## Project Overview

React 18 + Vite educational platform with Supabase backend. Manages subscription tiers, automated notifications, role-based access control, and comprehensive admin workflows for an AI learning community.

## Project Overview## Project Overview

## Architecture Fundamentals

React 18 + Vite educational platform with Supabase backend. Manages subscription tiers, automated notifications, role-based access control, and comprehensive admin workflows for an AI learning community.This is a React-based educational platform with Supabase backend, focusing on subscription management, automated notifications, and role-based user access. The system manages student learning pathways, membership subscriptions, and comprehensive admin workflows.

### Frontend Stack

- **Build**: Vite 5.4.20 (dev port 4028) with React 18, TypeScript-style JSX

- **Routing**: React Router v6 with role-based redirects in `src/Routes.jsx`

- **State**: Context API (`AuthContext`) + service layer pattern (NO Redux Toolkit despite package.json)## Architecture Fundamentals## Key Architecture Components

- **Styling**: TailwindCSS 3.4.6 with custom design tokens, animations, AI-gradient utilities

- **Data viz**: D3.js + Recharts for analytics dashboards



### Backend Architecture (Supabase)### Frontend Stack### Frontend Architecture

- **Auth**: Built-in Supabase auth with custom profile system

- **Database**: PostgreSQL with strict Row Level Security (RLS) on all tables- **Build**: Vite 5.4.20 (dev port 4028) with React 18, TypeScript-style JSX- **React 18 with Vite** for optimized build tooling and fast development

- **Key functions**:

  - `has_admin_role()`: Role verification (checks `user_profiles.role`)- **Routing**: React Router v6 with role-based redirects in `src/Routes.jsx`- **TailwindCSS** with extensive customizations (forms, typography, container-queries)

  - `admin_delete_user(user_id)`: Complete user deletion with audit trail

  - `user_has_access_level(required_level)`: Content tier access validation- **State**: Context API (`AuthContext`) + service layer pattern (NO Redux Toolkit despite package.json)- **React Router v6** with role-based navigation (`src/Routes.jsx`)

- **Critical tables**:

  - `user_profiles`: Core user data (role: 'admin'|'student', membership_status, tier)- **Styling**: TailwindCSS 3.4.6 with custom design tokens, animations, AI-gradient utilities- **Context API** for auth state management (`src/contexts/AuthContext.jsx`)

  - `content_library`: Digital assets (videos, PDFs) with tier-based access

  - `courses`: Structured learning paths with instructor assignments- **Data viz**: D3.js + Recharts for analytics dashboards- **Service Layer Pattern** for backend communication (`src/services/`)

  - `notification_templates` + `notification_logs`: Email system with variable substitution

  - `subscription_requests`: Renewal/upgrade approval workflow- **Data Visualization** using D3.js and Recharts for analytics

  - `member_reviews`: Testimonials with moderation flags

### Backend Architecture (Supabase)

## Authentication & Authorization Patterns

- **Auth**: Built-in Supabase auth with custom profile system### Backend (Supabase)

### Auth Context Usage

```jsx- **Database**: PostgreSQL with strict Row Level Security (RLS) on all tables- **Row Level Security (RLS)** enforces role-based data access

import { useAuth } from '../contexts/AuthContext';

- **Key functions**:- **Postgres Functions** for admin operations (`has_admin_role()`)

const { user, userProfile, isAdmin, isMember, canAccessContent } = useAuth();

// user: Supabase session  - `has_admin_role()`: Role verification (checks `user_profiles.role`)- **Key tables**:

// userProfile: Database profile with role/membership data

// isAdmin: userProfile?.role === 'admin'  - `admin_delete_user(user_id)`: Complete user deletion with audit trail  - `user_profiles`: Core user data with role system ('admin'/'student')

// isMember: admin OR membership_status === 'active'

// canAccessContent(tierLevel): Check if user can access specific tier content- **Critical tables**:  - `notification_templates` & `notification_logs`: Email templates/history

```

  - `user_profiles`: Core user data (role: 'admin'|'student', membership_status, tier)  - `subscription_requests`: Manages renewal/upgrade workflow

**CRITICAL**: `AuthContext.jsx` has a fire-and-forget profile loading pattern. Never modify the `onAuthStateChange` callback signature—it MUST remain synchronous to prevent auth loops.

  - `notification_templates` + `notification_logs`: Email system with variable substitution  - `automated_notifications`: System-generated notifications

### Role-Based Access Control

1. **Client-side checks**: `userProfile?.role !== 'admin'` → redirect in `useEffect`  - `subscription_requests`: Renewal/upgrade approval workflow  - `member_reviews`: User testimonials with moderation workflow

2. **Database enforcement**: All tables have RLS policies checking `auth.uid()` and role

3. **Admin verification**: For sensitive operations, call `supabase.rpc('has_admin_role')`  - `automated_notifications`: System-triggered notifications



### Dual Supabase Client Pattern  - `member_reviews`: Testimonials with moderation flags## Authentication & User Roles

- `src/lib/supabase.js`: Regular client (anon key) for user operations

- `src/lib/supabaseAdmin.js`: Service role key client for admin ops (user creation, deletion)

- **NEVER** expose service role key client-side—only use in controlled service methods

## Authentication & Authorization Patterns### Role System

## Content Management & Course System

- **Two-role system**: 'admin' and 'student' roles in `user_profiles`

### Content Library Architecture

The platform manages digital learning assets through a tiered access system:### Auth Context Usage- **Role-based redirects**: After login, users are redirected to appropriate dashboards:



**Content Types** (ENUM `content_type`):```jsx  - Admins → `/admin/dashboard`

- `video`: Video tutorials (Google Drive embeds or Supabase storage)

- `pdf`: Document resources (prompt libraries, guides)import { useAuth } from '../contexts/AuthContext';  - Students → `/dashboard`

- `document`: Text-based materials

- `image`: Visual assets- **RLS policies**: All database access is controlled by user role



**Access Tiers** (ENUM `access_level`):const { user, userProfile, isAdmin, isMember, canAccessContent } = useAuth();- **Role verification**: Use `await supabase.rpc('has_admin_role')` to verify admin access

- `starter`: Basic tier (₦5k/month) - foundational content

- `pro`: Mid tier (₦15k/month) - includes starter + advanced materials// user: Supabase session

- `elite`: Premium tier (₦25k/month) - full catalog access

// userProfile: Database profile with role/membership data### Auth Services

**Database Schema**:

```sql// isAdmin: userProfile?.role === 'admin'- **Auth context**: `src/contexts/AuthContext.jsx` provides user session & profile data

-- Core content table

content_library (// isMember: admin OR membership_status === 'active'- **Admin functions**: Use `supabaseAdmin` client with service role key for elevated privileges

  id, title, description, content_type,

  file_path,              -- Supabase storage path```

  google_drive_id,        -- Google Drive file ID

  google_drive_embed_url, -- Iframe embed URL## Core Services Architecture

  access_level,           -- Tier requirement

  status,                 -- active|inactive|archived**CRITICAL**: `AuthContext.jsx` has a fire-and-forget profile loading pattern. Never modify the `onAuthStateChange` callback signature—it MUST remain synchronous to prevent auth loops.

  category, tags[],       -- Organization

  uploader_id             -- Admin who uploaded### Notification System

)

### Role-Based Access ControlThe notification service (`src/services/notificationService.js`) provides:

-- Video-course linkage

course_videos (1. **Client-side checks**: `userProfile?.role !== 'admin'` → redirect in `useEffect`- **Centralized email sending** with template support

  course_id, video_id, 

  sequence_order,         -- Playlist order2. **Database enforcement**: All tables have RLS policies checking `auth.uid()` and role- **Scheduled notifications** (activation reminders, expiry warnings)

  is_required             -- Mandatory viewing flag

)3. **Admin verification**: For sensitive operations, call `supabase.rpc('has_admin_role')`- **Multi-channel delivery**: Both email and WhatsApp



-- Access analytics- **Template variables**: Process templates with user-specific data

user_content_access (

  user_id, content_id,### Dual Supabase Client Pattern

  accessed_at,

  access_duration_minutes,- `src/lib/supabase.js`: Regular client (anon key) for user operations```javascript

  completion_percentage

)- `src/lib/supabaseAdmin.js`: Service role key client for admin ops (user creation, deletion)// Example: Sending a notification

```

- **NEVER** expose service role key client-side—only use in controlled service methodsawait notificationService.sendNotification({

### Content Access Control

Access enforced via RLS function `user_has_access_level(required_level)`:  userId: member.id,

- Checks `user_profiles.membership_tier` matches or exceeds content's `access_level`

- Validates `membership_status = 'active'`## Service Layer Architecture  templateName: 'subscription_expiry_warning',

- Pro users access starter + pro content; elite users access everything

  variables: { days_remaining: daysRemaining },

**Service usage**:

```javascriptAll backend communication goes through services in `src/services/`:  recipientType: 'email' // or 'whatsapp', 'both'

// Get content by type (auto-filtered by user's tier)

const { data } = await contentService.getAccessibleContent('pdf', 'Prompts');- `adminService.js`: User CRUD, dashboard stats, system alerts});



// Upload new content (admin only)- `notificationService.js`: Email/WhatsApp delivery with template processing```

await contentService.createContent({

  title: 'ChatGPT Mastery Guide',- `subscriptionService.js`: Plans (Basic ₦5k, Premium ₦15k, Pro ₦25k), renewal workflow

  content_type: 'pdf',

  access_level: 'pro',- `userService.js`: Profile updates, activity tracking### Subscription Management

  category: 'Prompts',

  file_path: 'prompt-library/chatgpt-guide.pdf'- `emailService.js`: Resend API integrationThe subscription service (`src/services/subscriptionService.js`) handles:

});

- `systemService.js`: Health checks, storage metrics- **Plan configuration**: Basic (₦5,000), Premium (₦15,000), Pro (₦25,000)

// Log user viewing activity

await contentService.logContentAccess(contentId, durationMinutes, completionPercent);- **Admin approval workflow** for renewals and upgrades

```

**Pattern**: Services return `{ success: boolean, data?, error? }` objects- **Expiration tracking** and automated warnings

### Course Management System

Courses support structured learning paths with instructor assignments:- **Payment integration** with status tracking



**Course Structure**:### Notification System Deep Dive

- `courses` table: title, description, level (beginner|intermediate|advanced), status (draft|published|archived)

- `instructor_id`: References `user_profiles` (admin or instructor role)```javascript```javascript

- `is_featured`: Boolean for homepage display

- `rating`: Aggregate from testimonials// Template variables auto-injected: full_name, email, member_id, membership_tier, dashboard_url// Example: Approving a subscription request



**Enrollment Tracking**:await notificationService.sendNotification({await subscriptionService.approveRequest(requestId, adminId);

```javascript

// Enroll student in course  userId: member.id,```

await courseService.enrollInCourse(userId, courseId);

  templateName: 'subscription_expiry_warning', // Must exist in notification_templates

// Get student's courses with progress

const { data } = await courseService.getUserEnrollments(userId);  variables: { days_remaining: 7, custom_field: 'value' },## Critical Workflows

// Returns: course details + enrollment status (enrolled|in_progress|completed)

```  recipientType: 'email' // 'whatsapp' | 'both'



**Storage Buckets**:});### Development

- `prompt-library`: PDFs, documents (50MB limit)

- `course-materials`: Videos, PDFs, images (100MB limit)``````bash

- `user-uploads`: Profile pictures, assignments (10MB limit)

Templates support `{{variable_name}}` syntax. Logs stored in `notification_logs` with status tracking.# Install dependencies

### Content Delivery Patterns

**PDFs page** (`/student-dashboard/pdfs`):npm install

- Fetches `content_type = 'pdf'` filtered by user's tier

- Categories: Prompts, Business, Technical, Marketing## Critical Development Workflows

- Direct download via signed URLs for private files

# Start development server

**Videos page** (`/student-dashboard/videos`):

- Displays Google Drive embeds or Supabase-hosted videos### Local Developmentnpm run dev

- Tier-based access with upgrade prompts for locked content

- Progress tracking via `user_content_access` logs```bash



**Admin content management** (`/admin-content`):npm install# Build for production

- CRUD operations on `content_library`

- File uploads to Supabase storagenpm run dev  # Starts Vite on port 4028npm run build

- Batch tier assignment and category tagging

# Browser auto-opens to http://localhost:4028```

## Service Layer Architecture

```

All backend communication goes through services in `src/services/`:

- `adminService.js`: User CRUD, dashboard stats, system alerts### Database Migrations

- `notificationService.js`: Email/WhatsApp delivery with template processing

- `subscriptionService.js`: Plans (Basic ₦5k, Premium ₦15k, Pro ₦25k), renewal workflow### Environment Setup1. Run migrations in Supabase SQL Editor (in order by timestamp)

- `contentService.js`: Content library management, file uploads, access logging

- `courseService.js`: Course CRUD, enrollments, instructor managementRequired vars (see `.env.example`):2. Always verify migrations using `verify_migration.sql`

- `userService.js`: Profile updates, activity tracking

- `emailService.js`: Resend API integration- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: Public client3. Check RLS policies after schema changes

- `systemService.js`: Health checks, storage metrics

- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Admin operations (SECURE!)4. Use `clean` migrations for fresh environments

**Pattern**: Services return `{ success: boolean, data?, error? }` objects

- `VITE_RESEND_API_KEY`: Email delivery (local dev only; production uses Vercel env)

### Notification System Deep Dive

```javascript### Admin Account Management

// Template variables auto-injected: full_name, email, member_id, membership_tier, dashboard_url

await notificationService.sendNotification({**Missing env vars** trigger error UI in `App.jsx`—NO silent failures.- Create admin users with service role key only

  userId: member.id,

  templateName: 'subscription_expiry_warning', // Must exist in notification_templates- Never expose service role key client-side

  variables: { days_remaining: 7, custom_field: 'value' },

  recipientType: 'email' // 'whatsapp' | 'both'### Database Migrations- Admin password changes happen in `/admin/settings`

});

```1. Migrations in `supabase/migrations/` ordered by timestamp (YYYYMMDDHHMMSS)

Templates support `{{variable_name}}` syntax. Logs stored in `notification_logs` with status tracking.

2. **Always verify** with `verify_migration.sql` after applying## Project Structure Patterns

## Critical Development Workflows

3. RLS policies defined inline with table creation

### Local Development

```bash4. Use `*_clean.sql` variants for fresh environments### Service Layer Pattern

npm install

npm run dev  # Starts Vite on port 4028```

# Browser auto-opens to http://localhost:4028

```**Common pitfall**: Migrations have evolved—some SQL in root directory are deprecated fixes. Trust timestamped migrations in `supabase/migrations/` first.src/



### Environment Setup├── services/

Required vars (see `.env.example`):

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`: Public client### Production Deployment (Vercel)│   ├── adminService.js    # Admin-only operations

- `VITE_SUPABASE_SERVICE_ROLE_KEY`: Admin operations (SECURE!)

- `VITE_RESEND_API_KEY`: Email delivery (local dev only; production uses Vercel env)- `vercel.json` configures SPA routing (all routes → `/index.html`)│   ├── notificationService.js  # Email/notification delivery



**Missing env vars** trigger error UI in `App.jsx`—NO silent failures.- Build: `npm run build` (outputs to `dist/`)│   ├── subscriptionService.js  # Plan management



### Database Migrations- CSP headers configured in `vercel.json` (allows Supabase + Resend)│   ├── userService.js     # User profile operations

1. Migrations in `supabase/migrations/` ordered by timestamp (YYYYMMDDHHMMSS)

2. **Always verify** with `verify_migration.sql` after applying- **Secret management**: Add `VITE_SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars (never commit)│   └── systemService.js   # System health monitoring

3. RLS policies defined inline with table creation

4. Use `*_clean.sql` variants for fresh environments```



**Common pitfall**: Migrations have evolved—some SQL in root directory are deprecated fixes. Trust timestamped migrations in `supabase/migrations/` first.## Component Patterns & Conventions



### Production Deployment (Vercel)### Component Organization

- `vercel.json` configures SPA routing (all routes → `/index.html`)

- Build: `npm run build` (outputs to `dist/`)### Navigation Components```

- CSP headers configured in `vercel.json` (allows Supabase + Resend)

- **Secret management**: Add `VITE_SUPABASE_SERVICE_ROLE_KEY` to Vercel env vars (never commit)- `AdminSidebar.jsx`: Admin nav with dashboard, users, courses, notifications, reviews, settingssrc/



## Component Patterns & Conventions- `StudentDashboardNav.jsx`: Student nav with dashboard, PDFs, videos, prompts, subscription, settings├── components/     # Reusable UI components



### Navigation Components- Both use `useAuth()` for role-based menu items├── contexts/       # React context providers

- `AdminSidebar.jsx`: Admin nav with dashboard, users, courses, notifications, reviews, settings

- `StudentDashboardNav.jsx`: Student nav with dashboard, PDFs, videos, prompts, subscription, settings├── lib/           # Supabase clients & utilities

- Both use `useAuth()` for role-based menu items

### Error Handling├── pages/         # Route-level components

### Error Handling

- `ErrorBoundary.jsx`: Catches React errors globally- `ErrorBoundary.jsx`: Catches React errors globally│   ├── admin-dashboard/   # Admin-specific pages

- `logger.js`: Environment-aware logging (`info` only in dev, `error`/`warn` always)

  ```javascript- `logger.js`: Environment-aware logging (`info` only in dev, `error`/`warn` always)│   ├── student-dashboard/ # Student-specific pages

  import { logger } from '../utils/logger';

  logger.info('Debug message'); // Silent in production  ```javascript│   └── auth/            # Login/registration

  logger.error('Critical error'); // Always logs

  ```  import { logger } from '../utils/logger';└── utils/         # Helper functions



### Styling Conventions  logger.info('Debug message'); // Silent in production```

- **Custom Tailwind tokens**: `primary-*`, `secondary-*`, `ai-*` colors in `tailwind.config.js`

- **AI gradients**: `bg-gradient-ai`, `bg-gradient-neural`, `bg-gradient-cyber`  logger.error('Critical error'); // Always logs

- **Animations**: `animate-fadeIn`, `animate-slideDown`, `animate-glow`, `animate-float`

- **Shadows**: `shadow-glow-md`, `shadow-card-hover` for interactive elements  ```## Integration Points & Environment



## Common Implementation Tasks



### Adding Admin Features### Styling Conventions### Supabase Integration

1. Create page in `src/pages/admin-dashboard/`

2. Add route to `Routes.jsx` with `/admin-*` pattern- **Custom Tailwind tokens**: `primary-*`, `secondary-*`, `ai-*` colors in `tailwind.config.js`- **Client setup**: `src/lib/supabase.js` for normal user operations

3. Import in `AdminSidebar.jsx`, add nav item

4. Protect with role check:- **AI gradients**: `bg-gradient-ai`, `bg-gradient-neural`, `bg-gradient-cyber`- **Admin client**: `src/lib/supabaseAdmin.js` for privileged operations

   ```jsx

   useEffect(() => {- **Animations**: `animate-fadeIn`, `animate-slideDown`, `animate-glow`, `animate-float`- **Environment variables**:

     if (userProfile && userProfile?.role !== 'admin') {

       navigate('/');- **Shadows**: `shadow-glow-md`, `shadow-card-hover` for interactive elements  - `VITE_SUPABASE_URL`: Project URL

     }

   }, [userProfile, navigate]);  - `VITE_SUPABASE_ANON_KEY`: Public anon key

   ```

## Common Implementation Tasks  - `VITE_SUPABASE_SERVICE_ROLE_KEY`: Admin operations (server-side only)

### Adding Student Features

1. Create page in `src/pages/student-dashboard/`  - `VITE_RESEND_API_KEY`: Email delivery

2. Add route with `/student-dashboard/*` pattern

3. Use `isMember` or `canAccessContent(tierLevel)` for content gating### Adding Admin Features

4. Add to `StudentDashboardNav.jsx`

1. Create page in `src/pages/admin-dashboard/`### Email Integration

### Adding Content to Library

1. **Via Admin UI** (`/admin-content`):2. Add route to `Routes.jsx` with `/admin-*` pattern- **Resend API** for transactional emails

   - Use content management interface

   - Upload files to appropriate storage bucket3. Import in `AdminSidebar.jsx`, add nav item- **Template system** in `notification_templates` table

   - Set tier, category, and tags

4. Protect with role check:- **Fallback logging** in `email_logs` table

2. **Programmatically**:

   ```javascript   ```jsx- **Error handling** with graceful degradation

   // Upload file first

   const { data: uploadData } = await contentService.uploadFile(   useEffect(() => {

     'course-materials', 

     'videos/intro-to-ai.mp4',      if (userProfile && userProfile?.role !== 'admin') {## Common Implementation Tasks

     fileObject

   );       navigate('/');

   

   // Create library entry     }### Adding New Routes

   await contentService.createContent({

     title: 'Introduction to AI',   }, [userProfile, navigate]);1. Update `Routes.jsx` with new route definition

     content_type: 'video',

     file_path: uploadData.path,   ```2. Create page component in appropriate directory

     access_level: 'starter',

     category: 'Fundamentals'   - Admin routes in `pages/admin-dashboard/`

   });

   ```### Adding Student Features   - Student routes in `pages/student-dashboard/`



### Creating Notification Templates1. Create page in `src/pages/student-dashboard/`3. Add navigation link in relevant sidebar component

1. Insert into `notification_templates` table via Supabase SQL Editor:

   ```sql2. Add route with `/student-dashboard/*` pattern   - `components/ui/AdminSidebar.jsx` for admin navigation

   INSERT INTO notification_templates (name, subject, content, category, is_active)

   VALUES ('template_name', 'Subject {{full_name}}', 'Body {{variable}}', 'subscription', true);3. Use `isMember` or `canAccessContent(tierLevel)` for content gating   - `components/ui/StudentDashboardNav.jsx` for student navigation

   ```

2. Test via admin notification wizard (`/admin-notification-wizard`)4. Add to `StudentDashboardNav.jsx`

3. Trigger programmatically in service layer

### Implementing Role-Based Features

### Managing Subscription Workflow

1. Student requests renewal/upgrade → creates row in `subscription_requests`### Creating Notification Templates1. Use `userProfile.role === 'admin'` for UI conditionals

2. Admin approves via `subscriptionService.approveRequest(requestId, adminId)`

3. Service updates `user_profiles` (membership_status, tier, expiry date)1. Insert into `notification_templates` table via Supabase SQL Editor:2. Use database RLS policies for data access control

4. Automated notification sent via `notificationService`

   ```sql3. Include role verification in admin components:

## Security Best Practices

   INSERT INTO notification_templates (name, subject, content, category, is_active)```jsx

### RLS Policy Pattern

Every table MUST have RLS enabled. Example pattern:   VALUES ('template_name', 'Subject {{full_name}}', 'Body {{variable}}', 'subscription', true);// Check if user is admin

```sql

ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;   ```const { data: isAdmin, error } = await supabase.rpc('has_admin_role');



-- Users can read own data2. Test via admin notification wizard (`/admin-notification-wizard`)if (!isAdmin) { navigate('/'); }

CREATE POLICY "users_read_own" ON table_name FOR SELECT

USING (auth.uid() = user_id);3. Trigger programmatically in service layer```



-- Admins can do anything

CREATE POLICY "admins_all_access" ON table_name FOR ALL

USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));### Managing Subscription Workflow### Managing Notifications



-- Tier-based content access1. Student requests renewal/upgrade → creates row in `subscription_requests`1. Add template to `notification_templates` table

CREATE POLICY "users_view_accessible_content" ON content_library FOR SELECT

USING (status = 'active' AND user_has_access_level(access_level));2. Admin approves via `subscriptionService.approveRequest(requestId, adminId)`2. Implement delivery in `notificationService.js`

```

3. Service updates `user_profiles` (membership_status, tier, expiry date)3. Trigger notifications from appropriate workflow

### Client-Side Data Validation

- Use `react-hook-form` for forms (already in package.json)4. Automated notification sent via `notificationService`4. Test with notification wizard for admins

- Validate on client AND server (RLS policies + database constraints)

- Never trust `userProfile.role` alone—RLS enforces server-side



### Admin User Creation## Security Best Practices## Security Guidelines

**ONLY** via `adminService.createUser()` which:

1. Uses `supabaseAdmin` to create auth user- All database operations must use RLS policies

2. Inserts into `user_profiles` with role

3. Generates temporary password via `passwordService`### RLS Policy Pattern- Admin functions should call `has_admin_role()` check

4. Sends welcome email with credentials

Every table MUST have RLS enabled. Example pattern:- Use service role key only for admin operations, never expose client-side

## Troubleshooting Common Issues

```sql- Always validate user inputs on both client and server

### Auth State Not Loading

- Check browser console for profile fetch errorsALTER TABLE table_name ENABLE ROW LEVEL SECURITY;- Verify security after schema changes

- Verify RLS policies on `user_profiles` allow `auth.uid()` to read own row

- Ensure `AuthContext` is wrapped around `<Routes />` in `App.jsx`-- Users can read own data

CREATE POLICY "users_read_own" ON table_name FOR SELECT

### "Service role key missing" ErrorsUSING (auth.uid() = user_id);

- Admin operations require `VITE_SUPABASE_SERVICE_ROLE_KEY`

- In production, verify Vercel env var is set-- Admins can do anything

- Locally, check `.env` file matches `.env.example`CREATE POLICY "admins_all_access" ON table_name FOR ALL

USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

### Content Not Appearing for Users```

- Check user's `membership_tier` in `user_profiles`

- Verify content's `access_level` allows user's tier (starter ⊆ pro ⊆ elite)### Client-Side Data Validation

- Confirm `membership_status = 'active'` in user profile- Use `react-hook-form` for forms (already in package.json)

- Check content `status = 'active'` in `content_library`- Validate on client AND server (RLS policies + database constraints)

- Never trust `userProfile.role` alone—RLS enforces server-side

### File Upload Failures

- Verify storage bucket exists and has correct MIME type restrictions### Admin User Creation

- Check file size against bucket limits (prompt-library: 50MB, course-materials: 100MB)**ONLY** via `adminService.createUser()` which:

- Ensure RLS policies on `storage.objects` allow admin uploads1. Uses `supabaseAdmin` to create auth user

- Review Supabase storage quota (free tier: 1GB)2. Inserts into `user_profiles` with role

3. Generates temporary password via `passwordService`

### Migrations Not Applying4. Sends welcome email with credentials

- Run migrations in timestamp order from `supabase/migrations/`

- Use Supabase SQL Editor, not local psql (RLS context matters)## Troubleshooting Common Issues

- Check for conflicting table/function definitions from prior migrations

### Auth State Not Loading

### Notification Send Failures- Check browser console for profile fetch errors

- Verify `VITE_RESEND_API_KEY` is set- Verify RLS policies on `user_profiles` allow `auth.uid()` to read own row

- Check `notification_templates.is_active = true`- Ensure `AuthContext` is wrapped around `<Routes />` in `App.jsx`

- Review `notification_logs` table for error messages

- Ensure user has valid email in `user_profiles`### "Service role key missing" Errors

- Admin operations require `VITE_SUPABASE_SERVICE_ROLE_KEY`

## Key Files Reference- In production, verify Vercel env var is set

- **Auth**: `src/contexts/AuthContext.jsx` (session + profile state)- Locally, check `.env` file matches `.env.example`

- **Routes**: `src/Routes.jsx` (all app routes)

- **Supabase clients**: `src/lib/supabase.js`, `src/lib/supabaseAdmin.js`### Migrations Not Applying

- **Services**: `src/services/*Service.js` (backend communication)- Run migrations in timestamp order from `supabase/migrations/`

- **Content**: `src/services/contentService.js`, `src/services/courseService.js`- Use Supabase SQL Editor, not local psql (RLS context matters)

- **Utils**: `src/utils/logger.js` (env-aware logging)- Check for conflicting table/function definitions from prior migrations

- **Config**: `tailwind.config.js` (design tokens), `vite.config.mjs` (build)

- **Migrations**: `supabase/migrations/*.sql` (database schema)### Notification Send Failures

- **Content schema**: `supabase/migrations/20250115152519_content_management_system.sql`- Verify `VITE_RESEND_API_KEY` is set

- Check `notification_templates.is_active = true`
- Review `notification_logs` table for error messages
- Ensure user has valid email in `user_profiles`

## Key Files Reference
- **Auth**: `src/contexts/AuthContext.jsx` (session + profile state)
- **Routes**: `src/Routes.jsx` (all app routes)
- **Supabase clients**: `src/lib/supabase.js`, `src/lib/supabaseAdmin.js`
- **Services**: `src/services/*Service.js` (backend communication)
- **Utils**: `src/utils/logger.js` (env-aware logging)
- **Config**: `tailwind.config.js` (design tokens), `vite.config.mjs` (build)
- **Migrations**: `supabase/migrations/*.sql` (database schema)
