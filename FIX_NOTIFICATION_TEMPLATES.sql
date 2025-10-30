-- FIX NOTIFICATION TEMPLATES - Add Missing Templates
-- Run this in Supabase SQL Editor to fix "Template not found" errors

BEGIN;

-- ============================================================
-- Check existing templates
-- ============================================================
DO $$
DECLARE
    template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO template_count FROM notification_templates;
    RAISE NOTICE 'Current templates in database: %', template_count;
END $$;

-- ============================================================
-- Insert common notification templates if they don't exist
-- ============================================================

-- Template 1: Welcome Email (for new users)
INSERT INTO notification_templates (name, subject, content, category, is_active)
VALUES (
    'welcome_email',
    'Welcome to Basic Intelligence Community School!',
    'Hello {{full_name}},

Welcome to Basic Intelligence Community School! We''re excited to have you join our AI learning community.

Your account details:
- Email: {{email}}
- Member ID: {{member_id}}
- Membership Tier: {{membership_tier}}

Get started by logging in to your dashboard:
{{dashboard_url}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The Basic Intelligence Team',
    'user_management',
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

-- Template 2: User Created by Admin (with temporary password)
INSERT INTO notification_templates (name, subject, content, category, is_active)
VALUES (
    'user_created_by_admin',
    'Your Account Has Been Created',
    'Hello {{full_name}},

An administrator has created an account for you at Basic Intelligence Community School.

Your login credentials:
- Email: {{email}}
- Temporary Password: {{temporary_password}}

IMPORTANT: You will be required to change your password on first login for security reasons.

Login here: {{dashboard_url}}

Your account details:
- Member ID: {{member_id}}
- Membership Tier: {{membership_tier}}
- Role: {{role}}

If you did not expect this account or have any questions, please contact support immediately.

Best regards,
The Basic Intelligence Team',
    'user_management',
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

-- Template 3: Password Changed Successfully
INSERT INTO notification_templates (name, subject, content, category, is_active)
VALUES (
    'password_changed',
    'Password Changed Successfully',
    'Hello {{full_name}},

Your password was successfully changed on {{date}}.

If you did not make this change, please contact support immediately.

Login to your dashboard: {{dashboard_url}}

Best regards,
The Basic Intelligence Team',
    'security',
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

-- Template 4: Subscription Expiry Warning
INSERT INTO notification_templates (name, subject, content, category, is_active)
VALUES (
    'subscription_expiry_warning',
    'Your Subscription Expires Soon',
    'Hello {{full_name}},

Your {{membership_tier}} subscription will expire in {{days_remaining}} days.

To continue accessing premium content and features, please renew your subscription.

Renew now: {{dashboard_url}}/subscription

Questions? Contact our support team.

Best regards,
The Basic Intelligence Team',
    'subscription',
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

-- Template 5: Subscription Renewed
INSERT INTO notification_templates (name, subject, content, category, is_active)
VALUES (
    'subscription_renewed',
    'Subscription Renewed Successfully',
    'Hello {{full_name}},

Your {{membership_tier}} subscription has been renewed successfully!

Your new expiry date: {{expiry_date}}

Access your dashboard: {{dashboard_url}}

Thank you for being a valued member!

Best regards,
The Basic Intelligence Team',
    'subscription',
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

-- Template 6: Account Activated
INSERT INTO notification_templates (name, subject, content, category, is_active)
VALUES (
    'account_activated',
    'Your Account is Now Active',
    'Hello {{full_name}},

Great news! Your account has been activated.

You now have full access to:
- {{membership_tier}} tier content
- AI learning resources
- Community features
- Course materials

Access your dashboard: {{dashboard_url}}

Start learning today!

Best regards,
The Basic Intelligence Team',
    'user_management',
    true
)
ON CONFLICT (name) DO UPDATE SET
    subject = EXCLUDED.subject,
    content = EXCLUDED.content,
    updated_at = NOW();

COMMIT;

-- ============================================================
-- Verify templates were created
-- ============================================================
SELECT 
    name as "Template Name",
    subject as "Email Subject",
    category as "Category",
    is_active as "Active",
    created_at as "Created"
FROM notification_templates
ORDER BY category, name;

-- Show count
DO $$
DECLARE
    template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO template_count FROM notification_templates;
    RAISE NOTICE '✅ Total templates now: %', template_count;
    RAISE NOTICE '✅ Templates ready for use!';
END $$;

-- Final message
SELECT 
    '🎉 NOTIFICATION TEMPLATES FIXED!' as status,
    'All common templates have been added' as message,
    'You can now send notifications without errors' as next_action;
