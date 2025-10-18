-- Location: supabase/migrations/20250116000007_admin_settings_only.sql
-- Schema Analysis: Existing AI education platform with user_profiles, payments, content_library tables
-- Integration Type: addition - Admin settings table for system configuration
-- Dependencies: No dependencies on other tables

-- 1. Create admin_settings table for system configuration (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL DEFAULT '{}',
    setting_type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, object, array
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes for performance (only if they don't exist)
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(setting_key);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON public.admin_settings(category);
EXCEPTION
    WHEN duplicate_table THEN NULL;
END $$;

-- 3. Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies - Only admins can access admin settings (only if policy doesn't exist)
DO $$ BEGIN
    CREATE POLICY "admin_full_access_admin_settings"
    ON public.admin_settings
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
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 5. Helper function to get setting value (only if it doesn't exist)
CREATE OR REPLACE FUNCTION public.get_admin_setting(setting_key_param TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT setting_value 
    FROM public.admin_settings 
    WHERE setting_key = setting_key_param;
$$;

-- 6. Helper function to set setting value (only if it doesn't exist)
CREATE OR REPLACE FUNCTION public.set_admin_setting(
    setting_key_param TEXT,
    setting_value_param JSONB,
    setting_type_param TEXT DEFAULT 'string',
    category_param TEXT DEFAULT 'general',
    description_param TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    setting_id UUID;
BEGIN
    INSERT INTO public.admin_settings (
        setting_key,
        setting_value,
        setting_type,
        category,
        description
    ) VALUES (
        setting_key_param,
        setting_value_param,
        setting_type_param,
        category_param,
        description_param
    )
    ON CONFLICT (setting_key) 
    DO UPDATE SET
        setting_value = EXCLUDED.setting_value,
        setting_type = EXCLUDED.setting_type,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO setting_id;
    
    RETURN setting_id;
END;
$$;

-- 7. Updated_at trigger (only if it doesn't exist)
DO $$ BEGIN
    CREATE TRIGGER update_admin_settings_updated_at
        BEFORE UPDATE ON public.admin_settings
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 8. Insert default admin settings (only if they don't exist)
INSERT INTO public.admin_settings (
    setting_key,
    setting_value,
    setting_type,
    category,
    description
) VALUES 
    ('site_name', '"Basic Intelligence Community School"', 'string', 'general', 'Website name displayed throughout the platform'),
    ('site_description', '"Premium intelligence and analytical training platform"', 'string', 'general', 'Website description for SEO and branding'),
    ('contact_email', '"admin@basicintelligence.com"', 'string', 'general', 'Primary contact email for the platform'),
    ('support_phone', '"+2349062284074"', 'string', 'general', 'Support phone number for WhatsApp and contact'),
    ('membership_plans', '{
        "basic": {"price": 5000, "features": ["Basic PDF Access", "Community Access"]},
        "premium": {"price": 15000, "features": ["Full PDF Library", "Video Content", "Priority Support"]},
        "pro": {"price": 25000, "features": ["Everything", "One-on-One Sessions", "Custom Content"]}
    }', 'object', 'membership', 'Membership plans configuration with pricing and features'),
    ('notifications', '{
        "email_notifications": true,
        "sms_notifications": false,
        "push_notifications": true
    }', 'object', 'notifications', 'Default notification settings for the platform'),
    ('security_settings', '{
        "session_timeout": 24,
        "max_concurrent_sessions": 3,
        "password_min_length": 8
    }', 'object', 'security', 'Security and authentication settings'),
    ('system_settings', '{
        "maintenance_mode": false,
        "registration_enabled": true,
        "payment_enabled": true
    }', 'object', 'system', 'System-wide configuration settings')
ON CONFLICT (setting_key) DO NOTHING;
