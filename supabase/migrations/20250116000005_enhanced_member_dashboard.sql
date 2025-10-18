-- Location: supabase/migrations/20250116000005_enhanced_member_dashboard.sql
-- Schema Analysis: Existing AI education platform with user_profiles, payments, content_library tables
-- Integration Type: addition - Enhanced member dashboard with monthly/yearly subscriptions, countdown timers, and locked states
-- Dependencies: user_profiles, payments, content_library tables already exist

-- 1. Create new ENUM types for enhanced membership system
CREATE TYPE public.period_type AS ENUM ('monthly', 'yearly');
CREATE TYPE public.notification_type AS ENUM ('payment_verified', 'new_content', 'membership_expiring', 'general');

-- 2. Create memberships table for subscription management
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tier public.access_level NOT NULL,
    period_type public.period_type NOT NULL DEFAULT 'monthly'::public.period_type,
    start_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMPTZ NOT NULL,
    status public.membership_status DEFAULT 'active'::public.membership_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, status) -- Only one active membership per user
);

-- 3. Add period_type to payments table
ALTER TABLE public.payments 
ADD COLUMN period_type public.period_type DEFAULT 'monthly'::public.period_type,
ADD COLUMN verified_at TIMESTAMPTZ;

-- 4. Create analytics_events table for member activity tracking
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    content_id UUID REFERENCES public.content_library(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create notifications table for in-app alerts
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    seen BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add membership_tier to user_profiles if not exists (for backward compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_profiles' AND column_name='membership_tier'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN membership_tier public.access_level DEFAULT 'starter'::public.access_level;
    END IF;
END $$;

-- 7. Create indexes for performance
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_memberships_end_date ON public.memberships(end_date);
CREATE INDEX idx_payments_period_type ON public.payments(period_type);
CREATE INDEX idx_payments_verified_at ON public.payments(verified_at);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_seen ON public.notifications(seen);

-- 8. Helper function to calculate end date based on period type
CREATE OR REPLACE FUNCTION public.calculate_membership_end_date(
    start_date TIMESTAMPTZ,
    period_type public.period_type
)
RETURNS TIMESTAMPTZ
LANGUAGE sql
STABLE
AS $$
    SELECT CASE 
        WHEN period_type = 'monthly' THEN start_date + INTERVAL '30 days'
        WHEN period_type = 'yearly' THEN start_date + INTERVAL '365 days'
        ELSE start_date + INTERVAL '30 days'
    END;
$$;

-- 9. Helper function to get user's active membership
CREATE OR REPLACE FUNCTION public.get_user_active_membership(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    tier public.access_level,
    period_type public.period_type,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status public.membership_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT 
        m.id,
        m.tier,
        m.period_type,
        m.start_date,
        m.end_date,
        m.status
    FROM public.memberships m
    WHERE m.user_id = user_uuid 
    AND m.status = 'active'::public.membership_status
    LIMIT 1;
$$;

-- 10. Helper function to check if user can access content
CREATE OR REPLACE FUNCTION public.user_can_access_content(
    user_uuid UUID,
    required_access_level public.access_level
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.memberships m
        JOIN public.user_profiles up ON m.user_id = up.id
        WHERE m.user_id = user_uuid
        AND m.status = 'active'::public.membership_status
        AND m.end_date > CURRENT_TIMESTAMP
        AND (
            (required_access_level = 'starter'::public.access_level) OR
            (required_access_level = 'pro'::public.access_level AND m.tier IN ('pro', 'elite')) OR
            (required_access_level = 'elite'::public.access_level AND m.tier = 'elite')
        )
    );
$$;

-- 11. Function to create membership from approved payment
CREATE OR REPLACE FUNCTION public.create_membership_from_payment()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    user_tier public.access_level;
    membership_end_date TIMESTAMPTZ;
BEGIN
    -- Only trigger when payment status changes to 'completed'
    IF NEW.status = 'completed'::public.payment_status AND OLD.status != 'completed'::public.payment_status THEN
        -- Determine tier based on payment amount
        user_tier := CASE 
            WHEN NEW.amount_naira >= 25000 THEN 'elite'::public.access_level
            WHEN NEW.amount_naira >= 15000 THEN 'pro'::public.access_level
            ELSE 'starter'::public.access_level
        END;
        
        -- Calculate end date based on period type
        membership_end_date := public.calculate_membership_end_date(
            CURRENT_TIMESTAMP,
            COALESCE(NEW.period_type, 'monthly'::public.period_type)
        );
        
        -- Deactivate any existing active membership
        UPDATE public.memberships 
        SET status = 'inactive'::public.membership_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id 
        AND status = 'active'::public.membership_status;
        
        -- Create new active membership
        INSERT INTO public.memberships (
            user_id,
            tier,
            period_type,
            start_date,
            end_date,
            status
        ) VALUES (
            NEW.user_id,
            user_tier,
            COALESCE(NEW.period_type, 'monthly'::public.period_type),
            CURRENT_TIMESTAMP,
            membership_end_date,
            'active'::public.membership_status
        );
        
        -- Update user profile with tier and active status
        UPDATE public.user_profiles 
        SET membership_tier = user_tier,
            membership_status = 'active'::public.membership_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id;
        
        -- Create notification for user
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            action_url
        ) VALUES (
            NEW.user_id,
            'payment_verified'::public.notification_type,
            'Payment Verified!',
            'Your payment has been verified and your membership is now active. Welcome to Basic Intelligence!',
            '/student-dashboard'
        );
        
        -- Set verified_at timestamp
        NEW.verified_at := CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 12. Function to handle membership expiry
CREATE OR REPLACE FUNCTION public.handle_membership_expiry()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Check if membership has expired
    IF NEW.end_date < CURRENT_TIMESTAMP AND NEW.status = 'active'::public.membership_status THEN
        -- Update membership status to expired
        NEW.status := 'expired'::public.membership_status;
        NEW.updated_at := CURRENT_TIMESTAMP;
        
        -- Update user profile status
        UPDATE public.user_profiles 
        SET membership_status = 'expired'::public.membership_status,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id;
        
        -- Create expiry notification
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            action_url
        ) VALUES (
            NEW.user_id,
            'membership_expiring'::public.notification_type,
            'Membership Expired',
            'Your membership has expired. Renew now to continue accessing premium content.',
            '/student-dashboard/subscription'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 13. Enable RLS on new tables
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 14. RLS Policies

-- Memberships: Users can view their own memberships
CREATE POLICY "users_view_own_memberships"
ON public.memberships
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admin_full_access_memberships"
ON public.memberships
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

-- Analytics Events: Users can only insert their own events
CREATE POLICY "users_insert_own_analytics_events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_view_own_analytics_events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admin_full_access_analytics_events"
ON public.analytics_events
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- Notifications: Users can view and update their own notifications
CREATE POLICY "users_manage_own_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_full_access_notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- 15. Triggers

-- Trigger to create membership when payment is approved
CREATE TRIGGER create_membership_on_payment_approval
    AFTER UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.create_membership_from_payment();

-- Trigger to handle membership expiry
CREATE TRIGGER check_membership_expiry
    BEFORE UPDATE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_membership_expiry();

-- Updated_at triggers
CREATE TRIGGER update_memberships_updated_at
    BEFORE UPDATE ON public.memberships
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_analytics_events_updated_at
    BEFORE UPDATE ON public.analytics_events
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 16. Sample data for testing
DO $$
DECLARE
    admin_user_id UUID;
    student_user_id UUID;
BEGIN
    -- Get existing admin and student user IDs
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO student_user_id FROM public.user_profiles WHERE role = 'student' AND membership_status = 'active' LIMIT 1;
    
    -- Create sample active membership for testing
    IF student_user_id IS NOT NULL THEN
        INSERT INTO public.memberships (
            user_id,
            tier,
            period_type,
            start_date,
            end_date,
            status
        ) VALUES (
            student_user_id,
            'pro'::public.access_level,
            'monthly'::public.period_type,
            CURRENT_TIMESTAMP - INTERVAL '15 days',
            CURRENT_TIMESTAMP + INTERVAL '15 days',
            'active'::public.membership_status
        ) ON CONFLICT DO NOTHING;
        
        -- Create sample analytics events
        INSERT INTO public.analytics_events (
            user_id,
            event_type,
            metadata
        ) VALUES 
            (student_user_id, 'dashboard_visited', '{"duration_minutes": 5}'),
            (student_user_id, 'video_play_start', '{"video_id": "sample-video-1", "title": "AI Fundamentals"}'),
            (student_user_id, 'pdf_opened', '{"pdf_id": "sample-pdf-1", "title": "ChatGPT Prompts"}');
        
        -- Create sample notifications
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            action_url
        ) VALUES 
            (student_user_id, 'payment_verified'::public.notification_type, 'Welcome!', 'Your payment has been verified and your membership is active.', '/student-dashboard'),
            (student_user_id, 'new_content'::public.notification_type, 'New Content Available', 'Check out our latest video on advanced AI techniques.', '/student-dashboard/videos');
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
END $$;
