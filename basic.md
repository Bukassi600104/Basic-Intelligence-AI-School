# Product Requirements Document (PRD)
## Basic Intelligence Community School Platform

**Version:** 1.0  
**Last Updated:** October 28, 2025  
**Project Status:** Production-Ready (Pending Database Migration)  
**Document Owner:** Product & Engineering Team

---

## Executive Summary

Basic Intelligence Community School is a **subscription-based AI education platform** delivering tiered learning content to Nigerian students through a web-based portal. The platform features automated membership management, role-based access control, and comprehensive admin workflows for managing courses, content, and user communications.

**Core Value Proposition:** Democratize AI education in Nigeria through affordable, structured learning pathways with automated subscription management and personalized content access.

**Current Status:** 
- ✅ Frontend application complete and deployed
- ✅ Database schema fully designed
- ⚠️ **BLOCKING ISSUE:** Database migration `PHASE_2_NUCLEAR_FIX.sql` pending execution
- 🔴 **Admin user creation blocked** by missing `must_change_password` and `password_changed_at` columns

---

## 1. Product Vision & Goals

### Vision Statement
Create Nigeria's leading AI education platform that empowers students with practical AI skills through structured, tier-based learning while providing administrators seamless tools for content and user management.

### Business Goals
- **Revenue Generation:** Recurring subscription revenue through 3-tier membership model (₦5k-₦25k/month)
- **User Acquisition:** Onboard 1,000+ active students within first 6 months
- **Content Delivery:** Maintain 95%+ uptime for educational content access
- **Automation:** Reduce admin workload by 60% through automated workflows

### Success Metrics
- Monthly Recurring Revenue (MRR)
- Student enrollment and retention rates
- Content engagement (video completion, PDF downloads)
- Subscription renewal rates
- Admin operational efficiency (time saved on manual tasks)

---

## 2. User Personas

### Persona 1: Student (Primary User)
**Demographics:**
- Age: 18-35 years
- Location: Nigeria (primarily Lagos, Abuja, Port Harcourt)
- Tech-savvy, seeking AI skills for career advancement

**Goals:**
- Learn practical AI tools (ChatGPT, Claude, prompt engineering)
- Access high-quality educational content affordably
- Upgrade skills to unlock career opportunities

**Pain Points:**
- Limited access to quality AI education in Nigeria
- High cost of international courses
- Need flexible learning schedules

**User Journey:**
1. Discover platform → Sign up (pending status)
2. Subscribe to tier (starter/pro/elite)
3. Access content based on membership tier
4. Complete courses → Renew subscription
5. Upgrade tier for advanced content

---

### Persona 2: Platform Administrator
**Role:** Super Admin / Content Manager

**Responsibilities:**
- User management (create, approve, deactivate accounts)
- Content library curation (videos, PDFs, courses)
- Subscription approval workflow
- System notifications and communications
- Platform health monitoring

**Goals:**
- Streamline user onboarding and approvals
- Maintain organized content library
- Monitor platform health and user activity
- Ensure timely communications (expiry warnings, renewals)

**Pain Points:**
- Manual user creation processes
- Tracking subscription expirations
- Content organization across tiers
- Email/notification management

---

## 3. Product Architecture

### Technology Stack

#### Frontend
- **Framework:** React 18 with Vite 5.4.20
- **Routing:** React Router v6 (role-based navigation)
- **State Management:** Context API (AuthContext)
- **Styling:** TailwindCSS 3.4.6 with custom design tokens
- **Data Visualization:** D3.js + Recharts
- **Forms:** React Hook Form (validation)

#### Backend
- **BaaS Provider:** Supabase (PostgreSQL + Auth + Storage)
- **Authentication:** Supabase Auth with custom profile system
- **Database:** PostgreSQL 15+ with Row Level Security (RLS)
- **Storage:** Supabase Storage (3 buckets: prompt-library, course-materials, user-uploads)
- **Email Delivery:** Resend API

#### Infrastructure
- **Hosting:** Vercel (optimized for React SPA)
- **CDN:** Vercel Edge Network
- **Environment:** Production + Development environments
- **Version Control:** Git/GitHub

---

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React 18)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Student UI   │  │  Admin UI    │  │  Auth UI     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │  AuthContext    │                       │
│                   │  (State Mgmt)   │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │ Service Layer   │                       │
│                   │ (API Abstraction)│                      │
│                   └────────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                  SUPABASE BACKEND LAYER                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │  PostgreSQL  │  │   Storage    │     │
│  │  (JWT Auth)  │  │   (RLS)      │  │   Buckets    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │  Edge Functions │                       │
│                   │  (Serverless)   │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Resend API     │
                    │  (Email Delivery)│
                    └─────────────────┘
```

---

## 4. Core Features & Functionality

### 4.1 Authentication & User Management

#### User Registration
**Flow:**
1. User signs up via `/signup` page
2. Account created in `auth.users` with `pending` status
3. Trigger auto-creates profile in `user_profiles` table
4. Admin receives notification of new signup
5. Admin approves → status changes to `active`

**Technical Details:**
- **Database Trigger:** `on_auth_user_created` on `auth.users`
- **Function:** `handle_new_user()` creates profile automatically
- **Required Fields:** email, full_name, phone, location (optional)
- **Default Role:** `student`
- **Default Status:** `pending` (requires admin approval)

#### Role-Based Access Control (RBAC)

**Roles:**
| Role | Access Level | Permissions |
|------|--------------|-------------|
| `admin` | Full platform access | User management, content CRUD, system settings, analytics |
| `student` | Tier-based content access | Dashboard, courses, content (based on membership tier) |

**Implementation:**
- **Client-side checks:** `userProfile?.role === 'admin'` for UI rendering
- **Server-side enforcement:** RLS policies on all tables
- **Database function:** `has_admin_role()` for programmatic verification

#### Admin User Creation Workflow
```javascript
// Service: adminService.createUser()
1. Generate secure temporary password (passwordService)
2. Create auth user via supabaseAdmin (service role key)
3. Insert user_profiles with must_change_password = true
4. Send welcome email with temporary credentials
5. User forced to change password on first login
```

**Current Status:** ⚠️ **BLOCKED** - Requires `PHASE_2_NUCLEAR_FIX.sql` migration

---

### 4.2 Subscription Management System

#### Membership Tiers

| Tier | Price (₦/month) | Access Level | Content Unlocked |
|------|-----------------|--------------|------------------|
| **Starter** | ₦5,000 | Basic | Foundational courses, intro videos, starter PDFs |
| **Pro** | ₦15,000 | Intermediate | Starter + Advanced courses, pro prompt library |
| **Elite** | ₦25,000 | Premium | Full catalog, 1-on-1 mentorship, exclusive resources |

**Database Schema:**
```sql
-- user_profiles table
membership_status: ENUM('pending', 'active', 'expired', 'suspended')
membership_tier: TEXT('starter', 'pro', 'elite')
subscription_start_date: TIMESTAMPTZ
subscription_end_date: TIMESTAMPTZ
```

#### Subscription Lifecycle

**State Machine:**
```
pending → active → expired → renewed (active)
            ↓
        suspended (admin action)
```

**Renewal Workflow:**
1. Student requests renewal via dashboard
2. Row created in `subscription_requests` table
3. Admin reviews and approves/rejects
4. Approval triggers:
   - Update `user_profiles` (extend subscription_end_date)
   - Send confirmation notification
   - Log transaction in `subscription_requests`

#### Automated Notifications

**Trigger Events:**
| Event | Timing | Template | Recipient |
|-------|--------|----------|-----------|
| Expiry Warning | 7 days before expiry | `subscription_expiry_warning` | Student |
| Expiry Reminder | 3 days before expiry | `subscription_expiry_reminder` | Student |
| Expired Status | Day of expiry | `subscription_expired` | Student |
| Renewal Confirmation | After approval | `subscription_renewed` | Student |

**Technical Implementation:**
- Cron job checks `subscription_end_date` daily
- Calls `notificationService.sendNotification()` with template variables
- Logs sent notifications in `notification_logs` table

---

### 4.3 Content Management System

#### Content Types

**Supported Formats:**
1. **Videos:** MP4 (Google Drive embeds or Supabase storage)
2. **PDFs:** Prompt libraries, guides, worksheets
3. **Documents:** Text-based tutorials
4. **Images:** Infographics, diagrams

**Database Schema:**
```sql
content_library (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type ENUM('video', 'pdf', 'document', 'image'),
  file_path TEXT,              -- Supabase storage path
  google_drive_id TEXT,        -- Google Drive file ID
  google_drive_embed_url TEXT, -- Iframe URL
  access_level ENUM('starter', 'pro', 'elite'),
  status ENUM('active', 'inactive', 'archived'),
  category TEXT,
  tags TEXT[],
  uploader_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

#### Tier-Based Access Control

**Access Rules:**
- **Starter:** Access only `access_level = 'starter'` content
- **Pro:** Access `starter` + `pro` content
- **Elite:** Access ALL content (starter + pro + elite)

**Implementation:**
- **Database Function:** `user_has_access_level(required_level TEXT)`
- **RLS Policy:** Enforces tier checks on SELECT queries
- **Client-side:** `canAccessContent(tierLevel)` from AuthContext

**Example Access Matrix:**
| User Tier | Can Access |
|-----------|------------|
| Starter | Starter content only |
| Pro | Starter + Pro content |
| Elite | Starter + Pro + Elite content |

#### Storage Buckets

| Bucket Name | Purpose | File Size Limit | Allowed Types |
|-------------|---------|-----------------|---------------|
| `prompt-library` | PDF resources | 50MB | application/pdf |
| `course-materials` | Videos, images | 100MB | video/*, image/*, application/pdf |
| `user-uploads` | Profile pics, assignments | 10MB | image/jpeg, image/png |

**RLS Policies:**
- Admins: Full CRUD on all buckets
- Students: Read-only on prompt-library and course-materials
- Students: CRUD on own files in user-uploads

---

### 4.4 Course Management

#### Course Structure

```sql
courses (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level ENUM('beginner', 'intermediate', 'advanced'),
  status ENUM('draft', 'published', 'archived'),
  instructor_id UUID REFERENCES user_profiles(id),
  is_featured BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  duration_hours DECIMAL,
  rating DECIMAL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Course-Video Linkage
course_videos (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  video_id UUID REFERENCES content_library(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true
)

-- Enrollment Tracking
user_enrollments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status ENUM('enrolled', 'in_progress', 'completed'),
  progress_percentage DECIMAL DEFAULT 0,
  completed_at TIMESTAMPTZ
)
```

#### Student Enrollment Flow

1. Student browses courses on dashboard
2. Clicks "Enroll" → Creates row in `user_enrollments`
3. Course appears in student's "My Courses" section
4. Video progress tracked via `user_content_access` table
5. Course marked "completed" when progress_percentage = 100%

---

### 4.5 Notification System

#### Architecture

**Components:**
1. **Template Engine:** Stores reusable email templates with variable substitution
2. **Delivery Service:** Sends emails via Resend API
3. **Logging System:** Tracks all sent notifications
4. **Scheduling:** Automated triggers based on date conditions

**Database Schema:**
```sql
notification_templates (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,         -- Supports {{variables}}
  content TEXT NOT NULL,          -- HTML with {{variables}}
  category ENUM('subscription', 'course', 'system'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)

notification_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  template_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  status ENUM('pending', 'sent', 'failed'),
  channel ENUM('email', 'whatsapp', 'both'),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
```

#### Template Variables

**Global Variables (Available in all templates):**
- `{{full_name}}`: User's full name
- `{{email}}`: User's email
- `{{member_id}}`: User's UUID
- `{{membership_tier}}`: Current tier (starter/pro/elite)
- `{{dashboard_url}}`: Link to user dashboard

**Template-Specific Variables:**
```javascript
// Subscription Expiry Warning
{
  days_remaining: 7,
  renewal_link: 'https://platform.com/renew',
  support_email: 'support@basicic.com'
}

// Course Completion
{
  course_title: 'ChatGPT Mastery',
  completion_date: '2025-10-28',
  certificate_url: 'https://platform.com/cert/12345'
}
```

---

## 5. User Flows

### 5.1 Student Registration & Onboarding

```
┌─────────────────┐
│ 1. Visit /signup│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ 2. Fill registration form   │
│    - Email                  │
│    - Full Name              │
│    - Phone (optional)       │
│    - Location (optional)    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 3. Submit → Account created │
│    Status: PENDING          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 4. Admin receives alert     │
│    "New signup awaiting     │
│     approval"               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 5. Admin reviews profile    │
│    /admin/users             │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    │ Approve │ Reject
    ▼         ▼
┌────────┐ ┌────────┐
│ Active │ │Deleted │
└────┬───┘ └────────┘
     │
     ▼
┌──────────────────────────────┐
│ 6. Student receives email    │
│    "Account approved!"       │
│    + Login instructions      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ 7. Login → Redirect to       │
│    /dashboard                │
└──────────────────────────────┘
```

---

### 5.2 Admin User Creation Workflow

```
┌─────────────────────────────┐
│ 1. Admin → /admin/users     │
│    Clicks "Create User"     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 2. Fill user details form   │
│    - Email                  │
│    - Full Name              │
│    - Role (admin/student)   │
│    - Membership Tier        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 3. Submit → Service layer   │
│    adminService.createUser()│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 4. Generate temp password   │
│    passwordService.generate()│
│    (e.g., "Temp@12345")     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 5. Create auth user         │
│    supabaseAdmin.auth       │
│    .admin.createUser()      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 6. Trigger creates profile  │
│    handle_new_user()        │
│    Sets: must_change_       │
│    password = TRUE          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 7. Send welcome email       │
│    Template: user_created   │
│    Variables: temp_password │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ 8. User logs in with temp   │
│    password → Forced to     │
│    /change-password page    │
└──────────────────────────────┘
```

**Security Features:**
- Temporary passwords auto-generated (16 chars, complex)
- `must_change_password` flag enforced at login
- Password change updates `password_changed_at` timestamp
- Email sent via secure Resend API (no password in logs)

**Current Status:** ⚠️ **BLOCKED** - Step 6 fails without database migration

---

## 6. Database Schema

### Core Tables

#### 6.1 user_profiles
**Purpose:** Extended user information beyond Supabase auth

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  role public.user_role NOT NULL DEFAULT 'student',
  is_active BOOLEAN DEFAULT true,
  
  -- Membership fields
  membership_status public.membership_status DEFAULT 'pending',
  membership_tier TEXT DEFAULT 'starter',
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  
  -- Password management (for admin-created users)
  must_change_password BOOLEAN DEFAULT FALSE,
  password_changed_at TIMESTAMPTZ,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_membership_status ON user_profiles(membership_status);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
```

**RLS Policies:**
- `users_read_own_profile`: Users can read their own profile
- `users_update_own_profile`: Users can update their own profile (except role)
- `admin_full_access_user_profiles`: Admins have full CRUD access
- `trigger_can_insert_profiles`: Service role can insert (for trigger)

**Current Status:** ⚠️ Missing `must_change_password` and `password_changed_at` columns

---

### Database Functions

#### has_admin_role()
**Purpose:** Verify if current user is an admin

```sql
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'::public.user_role
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### user_has_access_level(required_level TEXT)
**Purpose:** Check if user can access content at specific tier

```sql
CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  user_status TEXT;
BEGIN
  SELECT membership_tier, membership_status 
  INTO user_tier, user_status
  FROM public.user_profiles
  WHERE id = auth.uid();
  
  -- Admins always have access
  IF user_status = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Check active membership
  IF user_status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- Tier hierarchy: starter < pro < elite
  IF required_level = 'starter' THEN
    RETURN user_tier IN ('starter', 'pro', 'elite');
  ELSIF required_level = 'pro' THEN
    RETURN user_tier IN ('pro', 'elite');
  ELSIF required_level = 'elite' THEN
    RETURN user_tier = 'elite';
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. Current Project Status

### ✅ Completed Components

1. **Frontend Application**
   - All pages and components implemented
   - Routing configured with role-based redirects
   - AuthContext fully functional
   - Admin and student dashboards complete

2. **Service Layer**
   - All services implemented and tested
   - Error handling and logging in place
   - Resend API integration working

3. **Database Design**
   - Complete schema designed
   - RLS policies defined
   - Triggers and functions written

4. **Infrastructure**
   - Vercel deployment configured
   - Environment variables set up
   - CDN and build optimization complete

---

### 🔴 Blocking Issues

#### Critical: Database Migration Required

**File:** `PHASE_2_NUCLEAR_FIX.sql` (382 lines)

**Issue:** Missing database columns prevent admin user creation workflow

**Missing Columns in `user_profiles`:**
- `must_change_password` BOOLEAN
- `password_changed_at` TIMESTAMPTZ

**Impact:**
- Admin cannot create new users
- `adminService.createUser()` throws 500 error
- User registration trigger fails on INSERT

**Error Trace:**
```
406 - user_profiles query
500 - auth/v1/admin/users
[ERROR] ❌ AUTH USER CREATION FAILED
AuthApiError: Database error creating new user
```

**Resolution Steps:**
1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/eremjpneqofidtktsfya/sql
2. Copy entire `PHASE_2_NUCLEAR_FIX.sql` script
3. Paste and click **RUN**
4. Wait for success notifications
5. Hard refresh browser (Ctrl+Shift+R)
6. Retry user creation

**Migration Contents:**
- Adds missing columns with IF NOT EXISTS checks
- Recreates `handle_new_user()` trigger function with error handling
- Updates RLS policies for proper access control
- Includes comprehensive verification queries

---

### ⚠️ Known Issues (Non-Blocking)

1. **Console Warnings**
   - Multiple GoTrueClient instances (benign Supabase warning)
   - USER_INTERACTION messages from Rocket.new hosting (platform noise)
   - These do not affect functionality

2. **Optimization Opportunities**
   - Add Redis caching for frequently accessed content
   - Implement CDN for video streaming
   - Add pagination to admin user list (performance at scale)

---

## 8. Admin Dashboard Features

### 8.1 User Management (`/admin/users`)

**Capabilities:**
- View all users in searchable, filterable table
- Create new users (admin or student)
- Edit user profiles (role, tier, status)
- Deactivate/reactivate accounts
- Delete users (with confirmation + audit log)
- View user activity logs

**Key Metrics:**
- Total users
- Active members
- Pending approvals
- Expired subscriptions

**Filters:**
- Role (admin/student)
- Membership status
- Membership tier
- Join date range

---

### 8.2 Content Management (`/admin-content`)

**Capabilities:**
- Upload new content (PDFs, videos, images)
- Edit existing content (title, description, tier)
- Delete content (soft delete to archived status)
- Organize content by category and tags
- Set tier-based access levels
- Bulk actions (batch tier assignment)

---

### 8.3 Notification Wizard (`/admin/notification-wizard`)

**Capabilities:**
- Select recipients: individual, all users, tier-based
- Choose template from `notification_templates`
- Preview with real data before sending
- Schedule future notifications
- Track delivery status in real-time

---

### 8.4 Analytics Dashboard (`/admin/dashboard`)

**Key Metrics:**
- User growth (daily/weekly/monthly)
- Revenue tracking (MRR by tier)
- Content engagement (views, downloads, completion rates)
- Subscription renewals and churn

**Visualizations:**
- Line chart: User growth over time
- Pie chart: Membership tier distribution
- Bar chart: Content access by category
- Table: Top 10 engaged users

---

## 9. Student Dashboard Features

### 9.1 Main Dashboard (`/dashboard`)

**Layout:**
- Welcome message with user's name
- Membership status widget (expiry countdown)
- Quick access buttons (Courses, PDFs, Videos, Prompts)
- Recent activity feed
- Recommended content based on tier

---

### 9.2 Content Sections

**PDFs** (`/student-dashboard/pdfs`)
- Browse by category
- Download via signed URLs
- Tier-based access control

**Videos** (`/student-dashboard/videos`)
- Google Drive embeds
- Progress tracking
- Continue watching section

**Prompts** (`/student-dashboard/prompts`)
- Curated prompt library
- Copy-to-clipboard functionality
- Category filtering

---

### 9.3 Subscription Management

**Features:**
- Current plan overview
- Upgrade/renew options
- Payment history
- Expiry notifications
- Tier comparison table

---

## 10. Security & Compliance

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce role-based access
- Service role key used only for admin operations

### Data Privacy
- Email used only for login and notifications
- Phone and location optional
- Activity logs retained for 90 days
- GDPR-compliant data export/deletion

### File Upload Security
- MIME type validation
- File size limits enforced
- Signed URLs with 1-hour expiry
- Virus scanning (future enhancement)

---

## 11. Deployment Guide

### Production Deployment Checklist

#### Pre-Deployment
- [ ] Run `PHASE_2_NUCLEAR_FIX.sql` in Supabase
- [ ] Verify all environment variables in Vercel
- [ ] Test admin user creation workflow
- [ ] Verify RLS policies in Supabase dashboard
- [ ] Test content upload and access
- [ ] Verify email delivery (Resend API)

#### Deployment Steps
1. **Build Application**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Vercel**
   - Push to `main` branch (auto-deploys via GitHub integration)
   - Or manual deploy: `vercel --prod`

3. **Post-Deployment Verification**
   - Test login flow
   - Create test user as admin
   - Upload test content
   - Verify subscription workflow
   - Check email notifications

#### Environment Variables (Vercel)
```bash
VITE_SUPABASE_URL=https://eremjpneqofidtktsfya.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SECURE!)
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
```

---

## 12. Future Enhancements

### Phase 2 (Q1 2026)
- Payment integration (Paystack/Flutterwave)
- Certificate generation on course completion
- Mobile app (React Native)
- Gamification (points, badges, leaderboards)
- AI chatbot for student support

### Phase 3 (Q2-Q3 2026)
- Live classes integration (Zoom/Google Meet)
- Community forums and peer reviews
- Advanced analytics with AI insights
- Multi-language support (Yoruba, Igbo, Hausa)
- WhatsApp bot for notifications

---

## 13. Support & Troubleshooting

### Common Issues

**Auth State Not Loading**
- Check RLS policies on `user_profiles`
- Verify `AuthContext` wraps routes
- Check browser console for errors

**Content Not Visible**
- Verify user's membership tier
- Check content access level
- Confirm subscription is active

**File Upload Failures**
- Check storage bucket limits
- Verify MIME types
- Review Supabase storage quota

**Migration Issues**
- Run migrations in timestamp order
- Use Supabase SQL Editor (not local psql)
- Check for conflicting definitions
- Review error logs in dashboard

---

## 14. API Reference

### Service Methods

#### adminService
```javascript
// Create new user (admin only)
await adminService.createUser({
  email: 'user@email.com',
  full_name: 'John Doe',
  role: 'student',
  membership_tier: 'starter'
});

// Delete user (soft delete)
await adminService.deleteUser(userId);

// Get dashboard statistics
const stats = await adminService.getDashboardStats();
```

---

#### contentService
```javascript
// Get accessible content by type
const { data } = await contentService.getAccessibleContent('pdf', 'Prompts');

// Upload file to storage
const { data } = await contentService.uploadFile(
  'prompt-library',
  'path/to/file.pdf',
  fileObject
);

// Create content library entry
await contentService.createContent({
  title: 'Guide Title',
  content_type: 'pdf',
  file_path: 'path/to/file.pdf',
  access_level: 'pro',
  category: 'Guides'
});

// Log user content access
await contentService.logContentAccess(contentId, durationMinutes, completionPercent);
```

---

#### notificationService
```javascript
// Send notification
await notificationService.sendNotification({
  userId: 'uuid',
  templateName: 'subscription_expiry_warning',
  variables: { days_remaining: 7 },
  recipientType: 'email' // 'whatsapp' | 'both'
});

// Get notification logs
const logs = await notificationService.getNotificationLogs(userId);
```

---

#### subscriptionService
```javascript
// Create subscription request
await subscriptionService.createRequest({
  user_id: userId,
  request_type: 'renewal',
  requested_tier: 'pro'
});

// Approve request (admin only)
await subscriptionService.approveRequest(requestId, adminId);

// Get user's subscription history
const history = await subscriptionService.getSubscriptionHistory(userId);
```

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **RLS** | Row Level Security - PostgreSQL table-level access control |
| **BaaS** | Backend as a Service (Supabase, Firebase) |
| **Service Role Key** | Admin key that bypasses RLS policies |
| **Anon Key** | Public Supabase key with RLS enforcement |
| **JWT** | JSON Web Token for session authentication |
| **Tier** | Membership level (starter, pro, elite) |
| **MRR** | Monthly Recurring Revenue |
| **Churn Rate** | Percentage of users who cancel subscriptions |
| **Signed URL** | Temporary URL with authentication token for file access |

---

## 16. Contact & Support

**Development Team:** Bukassi600104  
**Repository:** https://github.com/Bukassi600104/Basic-Intelligence-AI-School  
**Supabase Project:** https://supabase.com/dashboard/project/eremjpneqofidtktsfya  
**Production URL:** https://basicic.vercel.app

---

## 17. Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-28 | 1.0 | Initial PRD created from codebase analysis |
| TBD | 1.1 | Post-migration update after PHASE_2_NUCLEAR_FIX |
| TBD | 1.2 | Payment integration specifications |

---

## Appendices

### Appendix A: Database ERD

```
┌──────────────┐         ┌──────────────┐
│ auth.users   │────────>│user_profiles │
│ (Supabase)   │  1:1    │              │
└──────────────┘         └──────┬───────┘
                                │
                                │ 1:N
                                ▼
                         ┌──────────────┐
                    ┌───>│subscription_ │
                    │    │  requests    │
                    │    └──────────────┘
                    │
                    │    ┌──────────────┐
                    └───>│notification_ │
                         │   logs       │
                         └──────────────┘

┌──────────────┐         ┌──────────────┐
│   courses    │────────>│course_videos │
│              │  1:N    │              │
└──────┬───────┘         └──────┬───────┘
       │                        │
       │ 1:N                    │ N:1
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│user_         │         │content_      │
│enrollments   │         │library       │
└──────────────┘         └──────────────┘
```

---

### Appendix B: Content Categories

**Prompt Library:**
- ChatGPT Prompts
- Claude Prompts
- Midjourney Prompts
- Business Prompts
- Technical Prompts
- Marketing Prompts

**Courses:**
- AI Fundamentals
- Prompt Engineering 101
- Business with AI
- Advanced AI Techniques

**Guides:**
- Getting Started Guide
- Subscription Management
- Content Access Guide

---

### Appendix C: Email Templates

**Available Templates:**
1. `user_created` - New user welcome
2. `subscription_expiry_warning` - 7-day warning
3. `subscription_expiry_reminder` - 3-day reminder
4. `subscription_expired` - Account expired
5. `subscription_renewed` - Renewal confirmation
6. `course_completion` - Certificate notification

---

**Document Status:** ✅ Complete and Ready for Review  
**Next Action:** Execute `PHASE_2_NUCLEAR_FIX.sql` to unblock production deployment

---

**End of Product Requirements Document**
