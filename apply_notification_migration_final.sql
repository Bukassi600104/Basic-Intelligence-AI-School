-- Apply Notification Migration Script (FINAL VERSION)
-- This script applies the enhanced user notifications migration

DO $$
BEGIN
    RAISE NOTICE 'Applying notification migration...';
    
    -- 1. Add WhatsApp phone field to user_profiles table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'whatsapp_phone'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN whatsapp_phone TEXT;
        RAISE NOTICE 'Column whatsapp_phone added to user_profiles.';
    END IF;

    -- Create index for WhatsApp phone searches
    CREATE INDEX IF NOT EXISTS idx_user_profiles_whatsapp_phone 
    ON public.user_profiles(whatsapp_phone);

    -- 2. Drop and recreate notification templates table to ensure correct schema
    DROP TABLE IF EXISTS public.notification_templates CASCADE;
    CREATE TABLE public.notification_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'both')),
        category TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    RAISE NOTICE 'Table notification_templates created.';

    -- 3. Drop and recreate notification logs table
    DROP TABLE IF EXISTS public.notification_logs CASCADE;
    CREATE TABLE public.notification_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
        recipient_type TEXT NOT NULL CHECK (recipient_type IN ('email', 'whatsapp', 'both')),
        recipient_email TEXT,
        recipient_phone TEXT,
        subject TEXT,
        content TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
        error_message TEXT,
        sent_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    RAISE NOTICE 'Table notification_logs created.';

    -- 4. Enable RLS on new tables
    ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

    -- 5. RLS Policies for notification tables
    DROP POLICY IF EXISTS "admin_only_notification_templates" ON public.notification_templates;
    CREATE POLICY "admin_only_notification_templates"
    ON public.notification_templates
    FOR ALL
    TO authenticated
    USING (public.has_admin_role())
    WITH CHECK (public.has_admin_role());

    DROP POLICY IF EXISTS "admin_only_notification_logs" ON public.notification_logs;
    CREATE POLICY "admin_only_notification_logs"
    ON public.notification_logs
    FOR ALL
    TO authenticated
    USING (public.has_admin_role())
    WITH CHECK (public.has_admin_role());
    RAISE NOTICE 'RLS policies for notifications created.';

    -- 6. Create updated_at triggers for new tables
    DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON public.notification_templates;
    CREATE TRIGGER update_notification_templates_updated_at
        BEFORE UPDATE ON public.notification_templates
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
    RAISE NOTICE 'Triggers for notifications created.';

    -- 7. Insert default notification templates (using dollar-quoted strings to avoid quote issues)
    INSERT INTO public.notification_templates (name, subject, content, type, category, is_active) VALUES
        ('Welcome Email', 'Welcome to Basic Intelligence AI School!', 
         $template$Dear {{full_name}},

Welcome to Basic Intelligence AI School! We are excited to have you join our community of AI learners and professionals.

Your account has been created successfully:
- Email: {{email}}
- Member ID: {{member_id}}
- Membership Tier: {{membership_tier}}
- Subscription Expiry: {{subscription_expiry}}

You can access your dashboard here: {{dashboard_url}}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
Basic Intelligence AI School Team$template$,
         'email', 'welcome', true),
         
        ('Welcome WhatsApp', 'Welcome to Basic Intelligence AI School!', 
         $template$Welcome {{full_name}} to Basic Intelligence AI School! 🎉

Your account has been created:
📧 Email: {{email}}
🆔 Member ID: {{member_id}}
🎯 Tier: {{membership_tier}}
📅 Expiry: {{subscription_expiry}}

Access your dashboard: {{dashboard_url}}

Need help? Contact our support team.$template$,
         'whatsapp', 'welcome', true),
         
        ('Password Reset', 'Password Reset Instructions', 
         $template$Dear {{full_name}},

You have requested to reset your password. Please use the following temporary password to login:

Temporary Password: {{temporary_password}}

After logging in, please change your password immediately for security.

If you did not request this reset, please contact our support team immediately.

Best regards,
Basic Intelligence AI School Team$template$,
         'email', 'password_reset', true),
         
        ('Subscription Reminder', 'Subscription Renewal Reminder', 
         $template$Dear {{full_name}},

This is a friendly reminder that your subscription to Basic Intelligence AI School will expire on {{subscription_expiry}}.

To continue enjoying our premium content and features, please renew your subscription before the expiry date.

You can renew your subscription from your dashboard: {{dashboard_url}}

Best regards,
Basic Intelligence AI School Team$template$,
         'both', 'subscription', true);

    RAISE NOTICE 'Default notification templates inserted.';

    -- 8. Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(type);
    CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON public.notification_templates(category);
    CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(is_active);

    CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
    CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_type ON public.notification_logs(recipient_type);
    CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs(sent_at);
    RAISE NOTICE 'Indexes for notifications created.';

    RAISE NOTICE 'Notification migration applied successfully!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Migration failed: %', SQLERRM;
        RAISE;
END $$;
