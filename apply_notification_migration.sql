-- Apply Notification Migration Script
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

        -- 2. Create notification templates table
        CREATE TABLE IF NOT EXISTS public.notification_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            subject TEXT NOT NULL, -- This is the correct schema
            content TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp', 'both')),
            category TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Table notification_templates checked/created.';

        -- 3. Create notification logs table
        CREATE TABLE IF NOT EXISTS public.notification_logs (
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
        RAISE NOTICE 'Table notification_logs checked/created.';

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
        RAISE NOTICE 'RLS policies for notifications checked/created.';

        -- 6. Create updated_at triggers for new tables
        DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON public.notification_templates;
        CREATE TRIGGER update_notification_templates_updated_at
            BEFORE UPDATE ON public.notification_templates
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
        RAISE NOTICE 'Triggers for notifications checked/created.';

        -- 7. Insert default notification templates
        INSERT INTO public.notification_templates (name, subject, content, type, category, is_active) VALUES
            ('Welcome Email', 'Welcome to Basic Intelligence AI School!', 
             'Dear {{full_name}},\n\nWelcome to Basic Intelligence AI School! We are excited to have you join our community of AI learners and professionals.\n\nYour account has been created successfully:\n- Email: {{email}}\n- Member ID: {{member_id}}\n- Membership Tier: {{membership_tier}}\n- Subscription Expiry: {{subscription_expiry}}\n\nYou can access your dashboard here: {{dashboard_url}}\n\nIf you have any questions, please don''t hesitate to contact our support team.\n\nBest regards,\nBasic Intelligence AI School Team',
             'email', 'welcome', true),
             
            ('Welcome WhatsApp', 'Welcome to Basic Intelligence AI School!', 
             'Welcome {{full_name}} to Basic Intelligence AI School! 🎉\n\nYour account has been created:\n📧 Email: {{email}}\n🆔 Member ID: {{member_id}}\n🎯 Tier: {{membership_tier}}\n📅 Expiry: {{subscription_expiry}}\n\nAccess your dashboard: {{dashboard_url}}\n\nNeed help? Contact our support team.',
             'whatsapp', 'welcome', true),
             
            ('Password Reset', 'Password Reset Instructions', 
             'Dear {{full_name}},\n\nYou have requested to reset your password. Please use the following temporary password to login:\n\nTemporary Password: {{temporary_password}}\n\nAfter logging in, please change your password immediately for security.\n\nIf you did not request this reset, please contact our support team immediately.\n\nBest regards,\nBasic Intelligence AI School Team',
             'email', 'password_reset', true),
             
            ('Subscription Reminder', 'Subscription Renewal Reminder', 
             'Dear {{full_name}},\n\nThis is a friendly reminder that your subscription to Basic Intelligence AI School will expire on {{subscription_expiry}}.\n\nTo continue enjoying our premium content and features, please renew your subscription before the expiry date.\n\nYou can renew your subscription from your dashboard: {{dashboard_url}}\n\nBest regards,\nBasic Intelligence AI School Team',
             'both', 'subscription', true);
             'both', 'subscription', true)
        ON CONFLICT (name) DO NOTHING;

        -- 8. Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON public.notification_templates(type);
        CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON public.notification_templates(category);
        CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON public.notification_templates(is_active);

        CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
        CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_type ON public.notification_logs(recipient_type);
        CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs(sent_at);
        RAISE NOTICE 'Indexes for notifications checked/created.';

        RAISE NOTICE 'Notification migration applied successfully!';
END $$;
