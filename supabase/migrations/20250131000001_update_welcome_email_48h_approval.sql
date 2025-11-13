-- Migration: Update welcome email template with 48-hour approval message
-- This migration updates the welcome email to include the 48-hour approval countdown message

-- Update Welcome Email template to include 48-hour approval message
UPDATE public.notification_templates 
SET content = 'Dear {{full_name}},

Welcome to Basic Intelligence AI School! We are excited to have you join our community of AI learners and professionals.

Your account has been created successfully:
- Email: {{email}}
- Member ID: {{member_id}}
- Membership Tier: {{membership_tier}}
- Membership Status: Pending Approval

**Important Next Steps:**
Your account will be approved within 48 hours after payment confirmation by our admin team. You can immediately log in to your personal dashboard where you will see a countdown timer showing the remaining time until approval.

Access your dashboard here: {{dashboard_url}}

**What happens next:**
1. Your payment is being verified by our admin team
2. Once confirmed, your account will be approved within 48 hours
3. You''ll receive full access to all AI courses and content
4. You can track your approval status on your dashboard

**Immediate Access:**
- ✅ You can log in right away
- ✅ Access your personal dashboard
- ⏳ Wait for approval (48-hour countdown)
- 🎯 Get full access to premium content

If you have any questions, please don''t hesitate to contact our support team.

Best regards,
Basic Intelligence AI School Team',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Welcome Email';

-- Update Welcome WhatsApp template to include 48-hour approval message
UPDATE public.notification_templates 
SET content = 'Welcome {{full_name}} to Basic Intelligence AI School! 🎉

Your account has been created:
📧 Email: {{email}}
🆔 Member ID: {{member_id}}
🎯 Tier: {{membership_tier}}
📋 Status: Pending Approval

⏰ **Approval Timeline:**
Your account will be approved within 48 hours after payment confirmation by our admin team.

🚀 **Immediate Access:**
✅ You can log in right away
✅ Access your personal dashboard
⏳ See 48-hour approval countdown
🎯 Get full access to premium content

Dashboard: {{dashboard_url}}

Need help? Contact our support team.',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Welcome WhatsApp';

-- Verify the updates
SELECT name, subject, LEFT(content, 100) as content_preview FROM public.notification_templates WHERE name IN ('Welcome Email', 'Welcome WhatsApp');