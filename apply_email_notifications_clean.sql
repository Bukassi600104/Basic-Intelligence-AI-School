-- Email Notifications Migration - Clean version
-- This creates the email notifications system tables

-- 1. Create email_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template TEXT NOT NULL DEFAULT 'default',
    status TEXT NOT NULL DEFAULT 'sent',
    error_message TEXT,
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_email_logs_member_id ON public.email_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- 3. Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies if they don't exist
CREATE POLICY IF NOT EXISTS "admin_full_access_email_logs"
ON public.email_logs
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

CREATE POLICY IF NOT EXISTS "users_view_own_email_logs"
ON public.email_logs
FOR SELECT
TO authenticated
USING (
    member_id = auth.uid()
);

-- 5. Create email_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    template_type TEXT NOT NULL DEFAULT 'default',
    category TEXT NOT NULL DEFAULT 'general',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create indexes for email_templates if they don't exist
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON public.email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON public.email_templates(category);

-- 7. Enable RLS for email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policy for email_templates if it doesn't exist
CREATE POLICY IF NOT EXISTS "admin_full_access_email_templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- 9. Insert default email templates if they don't exist
INSERT INTO public.email_templates (
    name,
    subject,
    content,
    template_type,
    category
) VALUES 
    (
        'welcome_new_member',
        'Welcome to Basic Intelligence Community!',
        '<p>Welcome to the Basic Intelligence Community! We''re excited to have you join our platform for premium AI education and intelligence training.</p><p>As a new member, you now have access to:</p><ul><li>Comprehensive AI courses and materials</li><li>Community discussions and networking</li><li>Expert-led training sessions</li><li>Regular updates and new content</li></ul><p>To get started, please visit your dashboard and explore the available courses.</p><p>If you have any questions, don''t hesitate to reach out to our support team.</p>',
        'default',
        'onboarding'
    ),
    (
        'course_announcement',
        'New Course Available: {{course_name}}',
        '<p>We''re excited to announce a new course: <strong>{{course_name}}</strong>!</p><p>{{course_description}}</p><p>This course covers:</p><ul>{{course_features}}</ul><p>You can access this course immediately from your dashboard. We hope you find it valuable for your AI learning journey!</p>',
        'course_update',
        'content'
    ),
    (
        'system_announcement',
        'Important System Update',
        '<p>We have an important system update to share with you.</p><p>{{announcement_content}}</p><p>This update will help improve your learning experience on our platform.</p><p>If you experience any issues, please contact our support team.</p>',
        'announcement',
        'system'
    ),
    (
        'membership_renewal_reminder',
        'Membership Renewal Reminder',
        '<p>This is a friendly reminder that your Basic Intelligence Community membership will be expiring soon.</p><p>Your current membership expires on: <strong>{{expiry_date}}</strong></p><p>To continue enjoying uninterrupted access to all our courses and features, please renew your membership before the expiration date.</p><p>You can renew your membership directly from your dashboard.</p>',
        'default',
        'membership'
    )
ON CONFLICT (name) DO NOTHING;

-- 10. Create updated_at trigger for email_templates if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS update_email_templates_updated_at
    BEFORE UPDATE ON public.email_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 11. Create helper function to get email template by name if it doesn't exist
CREATE OR REPLACE FUNCTION public.get_email_template(template_name TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    subject TEXT,
    content TEXT,
    template_type TEXT,
    category TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT id, name, subject, content, template_type, category
    FROM public.email_templates
    WHERE name = template_name AND is_active = true;
$$;

-- 12. Verify tables were created
SELECT 'Email notifications system tables created successfully' as status;
