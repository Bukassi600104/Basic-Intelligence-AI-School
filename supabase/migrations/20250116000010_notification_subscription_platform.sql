-- Migration: Enhanced Notification and Subscription Platform
-- This migration adds tables for subscription requests, scheduled notifications, and automated notifications

-- Create subscription_requests table for renewal and upgrade requests
CREATE TABLE IF NOT EXISTS public.subscription_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL CHECK (request_type IN ('renewal', 'upgrade')),
    current_plan TEXT NOT NULL,
    requested_plan TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    payment_amount DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.user_profiles(id)
);

-- Create scheduled_notifications table for admin scheduled notifications
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'email' CHECK (notification_type IN ('email', 'sms', 'in_app')),
    template TEXT DEFAULT 'default',
    audience_type TEXT NOT NULL DEFAULT 'all' CHECK (audience_type IN ('all', 'filtered', 'specific')),
    audience_filters JSONB DEFAULT '{}',
    specific_members UUID[] DEFAULT '{}',
    send_immediately BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'processing', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create automated_notifications table for system-generated notifications
CREATE TABLE IF NOT EXISTS public.automated_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('activation_reminder', 'activation_confirmation', 'subscription_expiry', 'renewal_confirmation', 'upgrade_confirmation')),
    member_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template TEXT DEFAULT 'default',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create notification_templates table for reusable templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template_type TEXT NOT NULL DEFAULT 'email' CHECK (template_type IN ('email', 'sms', 'in_app')),
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'announcement', 'course_update', 'subscription', 'activation')),
    is_system_template BOOLEAN DEFAULT FALSE,
    variables JSONB DEFAULT '{}',
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_requests_member_id ON public.subscription_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_status ON public.subscription_requests(status);
CREATE INDEX IF NOT EXISTS idx_subscription_requests_created_at ON public.subscription_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_status ON public.scheduled_notifications(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for ON public.scheduled_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_automated_notifications_member_id ON public.automated_notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_automated_notifications_type ON public.automated_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_automated_notifications_status ON public.automated_notifications(status);

-- Add RLS policies
ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automated_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_requests
CREATE POLICY "Members can view their own subscription requests" ON public.subscription_requests
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Admins can manage all subscription requests" ON public.subscription_requests
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for scheduled_notifications
CREATE POLICY "Only admins can manage scheduled notifications" ON public.scheduled_notifications
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for automated_notifications
CREATE POLICY "Members can view their own automated notifications" ON public.automated_notifications
    FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Admins can view all automated notifications" ON public.automated_notifications
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLS Policies for notification_templates
CREATE POLICY "Anyone can view notification templates" ON public.notification_templates
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage notification templates" ON public.notification_templates
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Insert default notification templates
INSERT INTO public.notification_templates (name, subject, content, category, is_system_template) VALUES
('activation_reminder', 'Account Activation Reminder - Basic Intelligence Community', '
Dear {member_name},

This is a reminder that your account is still awaiting activation. Please complete your registration process to access all our premium AI education content.

If you have any questions, please contact our support team.

Best regards,
The Basic Intelligence Team
', 'activation', true),

('activation_confirmation', 'Welcome to Basic Intelligence Community!', '
Dear {member_name},

Congratulations! Your account has been successfully activated. You now have full access to our premium AI education platform.

Explore our courses, connect with other members, and start your AI learning journey today!

Best regards,
The Basic Intelligence Team
', 'activation', true),

('subscription_expiry_10', 'Subscription Expiring in 10 Days', '
Dear {member_name},

Your current subscription will expire in 10 days. To continue enjoying uninterrupted access to our premium content, please renew your subscription.

You can renew from your dashboard to ensure seamless access.

Best regards,
The Basic Intelligence Team
', 'subscription', true),

('subscription_expiry_7', 'Subscription Expiring in 7 Days', '
Dear {member_name},

Your subscription is expiring in 7 days. Don''t miss out on our premium AI education content!

Renew now to maintain access to all courses and features.

Best regards,
The Basic Intelligence Team
', 'subscription', true),

('subscription_expiry_2', 'Subscription Expiring in 2 Days - Urgent', '
Dear {member_name},

URGENT: Your subscription expires in 2 days! 

Renew immediately to avoid interruption in your learning journey. You can renew directly from your dashboard.

Best regards,
The Basic Intelligence Team
', 'subscription', true),

('renewal_confirmation', 'Subscription Renewal Confirmed', '
Dear {member_name},

Great news! Your subscription renewal has been confirmed. Your access to our premium AI education platform has been extended.

Thank you for continuing your learning journey with us!

Best regards,
The Basic Intelligence Team
', 'subscription', true),

('upgrade_confirmation', 'Subscription Upgrade Confirmed', '
Dear {member_name},

Congratulations! Your subscription upgrade to {new_plan} has been confirmed. You now have access to enhanced features and content.

Enjoy your upgraded learning experience!

Best regards,
The Basic Intelligence Team
', 'subscription', true);

-- Update trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_requests_updated_at BEFORE UPDATE ON public.subscription_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduled_notifications_updated_at BEFORE UPDATE ON public.scheduled_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON public.notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
