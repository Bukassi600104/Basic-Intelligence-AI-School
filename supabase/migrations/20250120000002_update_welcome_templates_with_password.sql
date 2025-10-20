-- Migration: Update welcome notification templates to include password
-- This migration updates the existing welcome templates to include the generated password

-- Update Welcome Email template to include password
UPDATE public.notification_templates 
SET content = 'Dear {{full_name}},

Welcome to Basic Intelligence AI School! We are excited to have you join our community of AI learners and professionals.

Your account has been created successfully:
- Email: {{email}}
- Password: {{temporary_password}}
- Member ID: {{member_id}}
- Membership Tier: {{membership_tier}}
- Subscription Expiry: {{subscription_expiry}}

**Important Security Notice:**
- This is your temporary password
- Please change your password immediately after first login
- Keep your login credentials secure

You can access your dashboard here: {{dashboard_url}}

If you have any questions, please don''t hesitate to contact our support team.

Best regards,
Basic Intelligence AI School Team',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Welcome Email';

-- Update Welcome WhatsApp template to include password
UPDATE public.notification_templates 
SET content = 'Welcome {{full_name}} to Basic Intelligence AI School! 🎉

Your account has been created:
📧 Email: {{email}}
🔑 Password: {{temporary_password}}
🆔 Member ID: {{member_id}}
🎯 Tier: {{membership_tier}}
📅 Expiry: {{subscription_expiry}}

🔒 Security: Please change your password after first login.

Access your dashboard: {{dashboard_url}}

Need help? Contact our support team.',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Welcome WhatsApp';

-- Verify the updates
SELECT name, content FROM public.notification_templates WHERE name IN ('Welcome Email', 'Welcome WhatsApp');
