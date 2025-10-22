# AI Agent Instructions for Basic Intelligence Community School

## Project Overview
This is a React-based educational platform with Supabase backend, focusing on subscription management, automated notifications, and role-based user access. The system manages student learning pathways, membership subscriptions, and comprehensive admin workflows.

## Key Architecture Components

### Frontend Architecture
- **React 18 with Vite** for optimized build tooling and fast development
- **TailwindCSS** with extensive customizations (forms, typography, container-queries)
- **React Router v6** with role-based navigation (`src/Routes.jsx`)
- **Context API** for auth state management (`src/contexts/AuthContext.jsx`)
- **Service Layer Pattern** for backend communication (`src/services/`)
- **Data Visualization** using D3.js and Recharts for analytics

### Backend (Supabase)
- **Row Level Security (RLS)** enforces role-based data access
- **Postgres Functions** for admin operations (`has_admin_role()`)
- **Key tables**:
  - `user_profiles`: Core user data with role system ('admin'/'student')
  - `notification_templates` & `notification_logs`: Email templates/history
  - `subscription_requests`: Manages renewal/upgrade workflow
  - `automated_notifications`: System-generated notifications
  - `member_reviews`: User testimonials with moderation workflow

## Authentication & User Roles

### Role System
- **Two-role system**: 'admin' and 'student' roles in `user_profiles`
- **Role-based redirects**: After login, users are redirected to appropriate dashboards:
  - Admins → `/admin/dashboard`
  - Students → `/dashboard`
- **RLS policies**: All database access is controlled by user role
- **Role verification**: Use `await supabase.rpc('has_admin_role')` to verify admin access

### Auth Services
- **Auth context**: `src/contexts/AuthContext.jsx` provides user session & profile data
- **Admin functions**: Use `supabaseAdmin` client with service role key for elevated privileges

## Core Services Architecture

### Notification System
The notification service (`src/services/notificationService.js`) provides:
- **Centralized email sending** with template support
- **Scheduled notifications** (activation reminders, expiry warnings)
- **Multi-channel delivery**: Both email and WhatsApp
- **Template variables**: Process templates with user-specific data

```javascript
// Example: Sending a notification
await notificationService.sendNotification({
  userId: member.id,
  templateName: 'subscription_expiry_warning',
  variables: { days_remaining: daysRemaining },
  recipientType: 'email' // or 'whatsapp', 'both'
});
```

### Subscription Management
The subscription service (`src/services/subscriptionService.js`) handles:
- **Plan configuration**: Basic (₦5,000), Premium (₦15,000), Pro (₦25,000)
- **Admin approval workflow** for renewals and upgrades
- **Expiration tracking** and automated warnings
- **Payment integration** with status tracking

```javascript
// Example: Approving a subscription request
await subscriptionService.approveRequest(requestId, adminId);
```

## Critical Workflows

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Database Migrations
1. Run migrations in Supabase SQL Editor (in order by timestamp)
2. Always verify migrations using `verify_migration.sql`
3. Check RLS policies after schema changes
4. Use `clean` migrations for fresh environments

### Admin Account Management
- Create admin users with service role key only
- Never expose service role key client-side
- Admin password changes happen in `/admin/settings`

## Project Structure Patterns

### Service Layer Pattern
```
src/
├── services/
│   ├── adminService.js    # Admin-only operations
│   ├── notificationService.js  # Email/notification delivery
│   ├── subscriptionService.js  # Plan management
│   ├── userService.js     # User profile operations
│   └── systemService.js   # System health monitoring
```

### Component Organization
```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── lib/           # Supabase clients & utilities
├── pages/         # Route-level components
│   ├── admin-dashboard/   # Admin-specific pages
│   ├── student-dashboard/ # Student-specific pages
│   └── auth/            # Login/registration
└── utils/         # Helper functions
```

## Integration Points & Environment

### Supabase Integration
- **Client setup**: `src/lib/supabase.js` for normal user operations
- **Admin client**: `src/lib/supabaseAdmin.js` for privileged operations
- **Environment variables**:
  - `VITE_SUPABASE_URL`: Project URL
  - `VITE_SUPABASE_ANON_KEY`: Public anon key
  - `VITE_SUPABASE_SERVICE_ROLE_KEY`: Admin operations (server-side only)
  - `VITE_RESEND_API_KEY`: Email delivery

### Email Integration
- **Resend API** for transactional emails
- **Template system** in `notification_templates` table
- **Fallback logging** in `email_logs` table
- **Error handling** with graceful degradation

## Common Implementation Tasks

### Adding New Routes
1. Update `Routes.jsx` with new route definition
2. Create page component in appropriate directory
   - Admin routes in `pages/admin-dashboard/`
   - Student routes in `pages/student-dashboard/`
3. Add navigation link in relevant sidebar component
   - `components/ui/AdminSidebar.jsx` for admin navigation
   - `components/ui/StudentDashboardNav.jsx` for student navigation

### Implementing Role-Based Features
1. Use `userProfile.role === 'admin'` for UI conditionals
2. Use database RLS policies for data access control
3. Include role verification in admin components:
```jsx
// Check if user is admin
const { data: isAdmin, error } = await supabase.rpc('has_admin_role');
if (!isAdmin) { navigate('/'); }
```

### Managing Notifications
1. Add template to `notification_templates` table
2. Implement delivery in `notificationService.js`
3. Trigger notifications from appropriate workflow
4. Test with notification wizard for admins

## Security Guidelines
- All database operations must use RLS policies
- Admin functions should call `has_admin_role()` check
- Use service role key only for admin operations, never expose client-side
- Always validate user inputs on both client and server
- Verify security after schema changes