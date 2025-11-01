# Email Service Investigation Report

**Date:** November 1, 2025  
**Status:** CRITICAL ISSUES IDENTIFIED  
**Priority:** HIGH - Production Site Active on Vercel

---

## Executive Summary

The email service infrastructure has significant gaps preventing functional email delivery across 8 key user scenarios. The system has core components but they are not properly connected or configured.

---

## Current Architecture

### Components in Place ✅
1. **emailService.js** - Full email service with Resend API integration
2. **notificationService.js** - Bulk notification and template processing
3. **send-email Edge Function** - Supabase edge function for server-side email sending
4. **Database Tables** - notification_templates (9), notification_logs (6 entries), user_profiles, etc.
5. **Admin UI** - Notification wizard with broadcast capability
6. **Notification Templates** - 8 basic templates exist

### Critical Issues ❌

#### 1. **Edge Function Not Deployed**
- **Issue**: `send-email/index.ts` exists but is NOT in Supabase Edge Functions
- **Impact**: Emails cannot be sent - Edge Function is the server-side component
- **Resend**: Function calls `https://api.resend.com/emails` but needs RESEND_API_KEY secret set
- **Evidence**: `mcp_supabase_list_edge_functions` returns empty array `[]`

#### 2. **Missing Notification Templates**
Current templates (8):
- ✅ Welcome Email
- ✅ Welcome WhatsApp
- ✅ Registration Thank You
- ✅ Email Verification OTP
- ✅ Account Activated
- ✅ Password Reset
- ✅ Subscription Reminder
- ✅ General Announcement
- ✅ Online Class Reminder

Missing templates (3):
- ❌ Admin New Payment Notification
- ❌ New Material Uploaded Notification
- ❌ Subscription Renewal Confirmation
- ❌ Subscription Upgrade Confirmation
- ❌ Password Reset Link (has temp password instead)

#### 3. **RLS Security Issue**
- **Problem**: `notification_logs` table has RLS **DISABLED**
- **Risk**: Any authenticated user can view all notifications sent by anyone
- **Impact**: Privacy violation, security concern
- **Status**: Must enable RLS and add proper policies

#### 4. **No WhatsApp Integration**
- **Current**: Placeholder function in notificationService.js
- **Implementation**: TODO comment with no actual integration
- **Recommendation**: Use Twilio or WhatsApp Business API

#### 5. **Circular Dependency Risk**
- **Location**: notificationService.js imports emailService, emailService imports notificationService?
- **Need to verify**: Import patterns to ensure no circular dependencies

#### 6. **Edge Function Secrets Not Configured**
- **RESEND_API_KEY** not set in Supabase Edge Function secrets
- **Location**: Project settings → Edge Function secrets
- **Impact**: Emails will fail with "email service not configured" error

#### 7. **No Automated Triggers**
- **Missing**: Server-side triggers for:
  - New registration (send welcome email)
  - Password reset initiated (send reset link)
  - Admin approves account (send activation confirmation)
  - Subscription expiring in 14, 7, 1 days (send reminder)
  - Renewal/upgrade processed (send confirmation)
  - Admin uploads content (notify subscribed members)
  - New payment notification to admin

#### 8. **Email Verification Flow Issues**
- **Current**: emailService.logEmail() uses `email_logs` table (RLS not enabled)
- **Problem**: No distinction between user email logs and notification logs
- **Recommend**: Consolidate or clarify logging strategy

---

## 8 Required Email Scenarios

### 1. **User Registration - Welcome Email** ❌
- **Trigger**: New user registers
- **Template**: Welcome Email / Welcome WhatsApp
- **Recipients**: New user email/WhatsApp
- **Content**: Account details, member ID, next steps
- **Status**: Template exists, no automated trigger
- **Variable**: {{full_name}}, {{email}}, {{member_id}}, {{dashboard_url}}

### 2. **Forgot Password - Reset Link** ⚠️
- **Trigger**: User clicks "Forgot Password"
- **Template**: Password Reset (exists but sends temp password, not reset link)
- **Recipients**: User email
- **Content**: Should be reset link, not temporary password
- **Status**: Template incorrect, no password reset handler
- **Action**: Create new template with reset link

### 3. **Admin Activates Account - Confirmation** ❌
- **Trigger**: Admin approves user account
- **Template**: Account Activated (exists)
- **Recipients**: User email
- **Content**: Account now active, start exploring
- **Status**: Template exists, no automated trigger
- **Variable**: {{full_name}}, {{member_id}}, {{dashboard_url}}

### 4. **Subscription Expiring - Renewal Reminder** ⚠️
- **Trigger**: 14, 7, 1 day before expiry
- **Template**: Subscription Reminder (exists but incomplete)
- **Recipients**: User email
- **Content**: Days remaining, renewal link, upgrade options
- **Status**: Template exists, no automated trigger/scheduler
- **Variable**: {{full_name}}, {{days_remaining}}, {{dashboard_url}}

### 5. **Renewal/Upgrade Processed - Confirmation** ❌
- **Trigger**: Subscription renewed or upgraded
- **Template**: Subscription Renewal Confirmation (MISSING)
- **Recipients**: User email
- **Content**: Confirmation of renewal/upgrade, new expiry date
- **Status**: No template, no trigger

### 6. **New Payment Registered - Admin Notification** ❌
- **Trigger**: User makes payment
- **Template**: Admin New Payment (MISSING)
- **Recipients**: Admin email (tonyorjiako@outlook.com)
- **Content**: Payment details, member info, approval needed
- **Status**: No template, no trigger, hardcoded admin email
- **Variable**: {{payer_name}}, {{amount}}, {{member_id}}, {{payment_method}}

### 7. **New Material Uploaded - Member Notification** ❌
- **Trigger**: Admin uploads PDF/VIDEO/PROMPTS
- **Template**: New Material Uploaded (MISSING)
- **Recipients**: Subscribed members (matching access level)
- **Content**: Material title, description, access link
- **Status**: No template, no trigger
- **Variable**: {{material_title}}, {{material_type}}, {{access_url}}

### 8. **Broadcast Message - Admin to Members** ✅
- **Trigger**: Admin uses notification wizard
- **Template**: Custom message or template selection
- **Recipients**: Selected members or broadcast
- **Content**: Admin-defined message
- **Status**: UI exists, but emails not sending (Edge Function not deployed)

---

## Database Analysis

### notification_templates Table
```
id: UUID (9 rows)
name: TEXT UNIQUE
subject: TEXT
content: TEXT
type: ENUM (email | whatsapp | both)
category: TEXT
is_active: BOOLEAN DEFAULT true
created_by: UUID (FK to user_profiles)
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
RLS: ENABLED ✅
```

### notification_logs Table
```
id: UUID (6 rows)
template_id: UUID (FK to notification_templates)
recipient_type: TEXT (email | whatsapp | both)
recipient_email: TEXT
recipient_phone: TEXT
subject: TEXT
content: TEXT
status: TEXT (pending | sent | failed | delivered)
error_message: TEXT
sent_at: TIMESTAMPTZ
delivered_at: TIMESTAMPTZ
created_by: UUID (FK to user_profiles)
created_at: TIMESTAMPTZ
recipient_id: UUID (FK to user_profiles)
RLS: DISABLED ❌ SECURITY RISK
```

### automated_notifications Table
```
id: UUID
notification_type: TEXT
member_id: UUID
subject: TEXT
content: TEXT
template: TEXT
status: TEXT
sent_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ
metadata: JSONB
RLS: ENABLED ✅
Purpose: For automatic triggered notifications
Status: Created but unused
```

### scheduled_notifications Table
```
id: UUID
title, subject, content: TEXT
notification_type: TEXT
template: TEXT
audience_type: TEXT (all | filtered | specific)
audience_filters: JSONB
specific_members: UUID[]
send_immediately: BOOLEAN
scheduled_for: TIMESTAMPTZ
status: TEXT (scheduled | processing | sent | failed | cancelled)
created_by: UUID
RLS: ENABLED ✅
Purpose: For scheduled future notifications
Status: Created but unused
```

---

## Service Layer Analysis

### emailService.js ✅ Good Structure
```
- sendEmailToMember(memberId, subject, content, template)
- sendBulkEmail(memberIds, subject, content, template)
- sendEmailToAllMembers(filters, subject, content, template)
- sendEmail({to, subject, html, from})
- sendEmailViaResend(emailData) ← Calls Edge Function
- generateEmailTemplate(content, template, member)
- logEmail(emailData)
- getEmailHistory(memberId)
- getEmailStats()
```
**Status**: Well-designed, waiting for Edge Function deployment

### notificationService.js ✅ Good Structure
```
- sendNotificationByEmail(email, templateName, variables)
- sendNotification({userId, templateName, variables, recipientType})
- sendBulkNotifications({userIds, templateName, variables, recipientType})
- sendEmailNotification({email, subject, content, logId})
- sendWhatsAppNotification({phone, message, logId}) ← Placeholder only
- processTemplate(template, variables)
- getTemplates(category)
- createTemplate(templateData)
- updateTemplate(templateId, updates)
- getNotificationLogs(filters)
- getNotificationStats(timeRange)
```
**Status**: Functions exist, but triggers and WhatsApp missing

---

## Edge Function Status

### File: supabase/functions/send-email/index.ts
- **Status**: Code written, NOT deployed
- **Functionality**:
  - Accepts POST with `{to, from, subject, html, replyTo}`
  - Checks RESEND_API_KEY environment variable
  - Sends to Resend API
  - Returns success/error response
- **CORS**: Configured for all origins
- **Errors**: Proper error handling with messages

**Required Action**: Deploy this function to Supabase

---

## Admin UI - Notification Wizard

### AdminNotificationWizard Component ✅ Good UI
- **Features**:
  - User selection (select all, individual)
  - Template selection from database
  - Custom message compose
  - Subject line editing
  - Send via Email/WhatsApp/Both
  - Loading states
  - Error display
  - Success/failure results
  - Toast notifications (sonner)

- **Issues**:
  - Emails not actually sending (Edge Function not deployed)
  - No WhatsApp support (placeholder function)
  - No content preview
  - No scheduled sending option

---

## Environment Variables & Secrets

### Frontend (.env.example)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=
VITE_RESEND_API_KEY= ← Should NOT be in frontend!
```

### Backend (Supabase Edge Function Secrets)
- **Missing**: RESEND_API_KEY
- **Location**: Project Settings → Edge Function Secrets
- **Action**: Add secret

### Vercel Environment Variables
- **Needs**: VITE_RESEND_API_KEY only (NOT service role key)
- **Status**: Unknown if set

---

## Current Test Results

**Last 6 Entries in notification_logs:**
1. Status: pending/sent/failed (unclear from test)
2. Most are from admin notification wizard tests
3. No successful deliveries recorded

---

## Recommendations (Priority Order)

### Phase 1: Critical Infrastructure (Today)
1. ✅ Deploy send-email Edge Function
2. ✅ Set RESEND_API_KEY in Edge Function secrets
3. ✅ Test Edge Function with curl/Postman
4. ✅ Enable RLS on notification_logs table
5. ✅ Create missing notification templates (3)

### Phase 2: Fix Services (Today)
1. ✅ Verify no circular dependencies
2. ✅ Create automated trigger functions (PostgreSQL functions)
3. ✅ Link triggers to user workflows
4. ✅ Add WhatsApp integration (choose: Twilio/WhatsApp Business API)

### Phase 3: Testing & Validation (Today)
1. ✅ Manual end-to-end test each scenario
2. ✅ Verify email deliverability
3. ✅ Check notification_logs for records
4. ✅ Security audit (no secrets in logs)
5. ✅ Vercel environment variable check

### Phase 4: Enhancement (Optional)
1. Scheduled notifications UI
2. Email templates with rich HTML
3. Bounce/complaint handling from Resend
4. Analytics dashboard for email stats

---

## Security Checklist

- [ ] No Resend API key in client code
- [ ] No Resend API key in Git history
- [ ] RLS enabled on all notification tables
- [ ] Edge Function secrets properly set
- [ ] No raw SQL injection risks
- [ ] Email logs don't expose sensitive data
- [ ] Admin email hardcoding reviewed
- [ ] Vercel secrets properly configured

---

## Next Steps

1. **Immediate**: Deploy Edge Function
2. **Immediate**: Set RESEND_API_KEY
3. **Today**: Create missing templates
4. **Today**: Enable RLS on notification_logs
5. **Today**: Test end-to-end
6. **Today**: Deploy to production

---

## Appendix: File Locations

- **Email Service**: `/src/services/emailService.js`
- **Notification Service**: `/src/services/notificationService.js`
- **Notification Wizard UI**: `/src/pages/admin-notification-wizard/index.jsx`
- **Edge Function**: `/supabase/functions/send-email/index.ts`
- **Database Tables**: Supabase Dashboard → SQL Editor
- **Notification Templates**: Supabase Dashboard → notification_templates table
- **Template Migrations**: `/supabase/migrations/` (multiple files)

---

## Contact & Support

- **Admin Email**: tonyorjiako@outlook.com
- **Project**: Basic Intelligence Community School
- **Site**: https://basicintelligence.ng (live on Vercel)
- **Status**: Production (HIGH PRIORITY)

