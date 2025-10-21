# AI Agent Instructions for Basic Intelligence Community School

## Project Overview
This is a React-based educational platform with Supabase backend, focusing on subscription management and automated notifications. The system handles user subscriptions, automated notifications, and admin workflows.

## Key Architecture Components

### Frontend (React + Vite)
- React 18 with Vite for build tooling
- TailwindCSS for styling (with multiple plugins: forms, typography, container-queries)
- Redux Toolkit for state management
- React Router v6 for routing
- Key visualizations using D3.js and Recharts

### Backend (Supabase)
- Database tables with Row Level Security (RLS)
- Key tables:
  - `notification_templates`: Email templates
  - `notification_logs`: Notification history
  - `user_profiles`: User data (includes WhatsApp integration)
  - `subscription_requests`: Subscription management
  - `automated_notifications`: System notifications

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
1. Run migrations in Supabase SQL Editor
2. Always verify migrations using `verify_migration.sql`
3. Check RLS policies and indexes after migrations

### Notification System
The notification service (`src/services/notificationService.js`) handles:
- Activation reminders (48h)
- Subscription expiry warnings (10d, 7d, 2d)
- Renewal/upgrade confirmations
- Integration with Resend email service

## Project-Specific Patterns

### Component Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route-level components
├── services/      # Backend service integrations
└── styles/        # Global styles + Tailwind config
```

### State Management
- Use Redux for global state (subscriptions, user data)
- Local state with React hooks for component-level state
- Async operations through service layer

### Styling Conventions
- Use Tailwind utility classes (configured in `tailwind.config.js`)
- Fluid typography for responsive text
- Container queries for component-specific responsiveness

## Integration Points
1. Supabase Integration
   - `@supabase/supabase-js` for database operations
   - RLS policies control data access
   - Verify changes with `verify_migration.sql`

2. Email Service
   - Resend integration for transactional emails
   - Templates in `notification_templates` table
   - Fallback logging in `email_logs`

## Common Tasks
1. Adding New Routes:
   - Update `Routes.jsx`
   - Create page component in `pages/`
   - Add navigation in relevant components

2. Notification Changes:
   - Update templates in `notification_templates` table
   - Verify using notification wizard
   - Test automated workflows

3. Subscription Updates:
   - Modify subscription plans in service
   - Update admin approval workflows
   - Test renewal/upgrade paths

## Security Notes
- All database operations must use RLS policies
- Admin functions require `has_admin_role()` checks
- Verify security after schema changes