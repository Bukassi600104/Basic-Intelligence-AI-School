-- Location: supabase/migrations/20250116000004_enhanced_admin_dashboard.sql
-- Schema Analysis: Enhanced admin dashboard with course builder, media manager, and analytics
-- Integration Type: COMPREHENSIVE - Complete admin dashboard enhancement
-- Dependencies: Existing tables from previous migrations

-- 1. Create new ENUM types for enhanced features
CREATE TYPE public.module_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.lesson_type AS ENUM ('video', 'text', 'quiz', 'assignment');
CREATE TYPE public.prompt_pack_type AS ENUM ('basic', 'advanced', 'specialized');
CREATE TYPE public.admin_activity_type AS ENUM ('user_created', 'course_created', 'content_uploaded', 'payment_approved', 'user_approved', 'settings_updated');

-- 2. Course modules table for organizing course content
CREATE TABLE public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sequence_order INTEGER NOT NULL DEFAULT 1,
    status public.module_status DEFAULT 'draft'::public.module_status,
    estimated_duration_minutes INTEGER DEFAULT 0,
    prerequisites TEXT[],
    learning_objectives TEXT[],
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course lessons table for individual learning units
CREATE TABLE public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    lesson_type public.lesson_type NOT NULL,
    content_id UUID REFERENCES public.content_library(id) ON DELETE SET NULL,
    sequence_order INTEGER NOT NULL DEFAULT 1,
    estimated_duration_minutes INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    access_level public.access_level DEFAULT 'starter'::public.access_level,
    quiz_questions JSONB, -- For quiz lessons
    assignment_instructions TEXT, -- For assignment lessons
    text_content TEXT, -- For text-based lessons
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Prompt packs table for organized prompt collections
CREATE TABLE public.prompt_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    pack_type public.prompt_pack_type DEFAULT 'basic'::public.prompt_pack_type,
    access_level public.access_level DEFAULT 'starter'::public.access_level,
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    file_path TEXT,
    file_size_bytes INTEGER,
    uploader_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Admin activities table for dashboard activity feed
CREATE TABLE public.admin_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type public.admin_activity_type NOT NULL,
    admin_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    target_course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    target_content_id UUID REFERENCES public.content_library(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Enhanced payment approvals workflow
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS admin_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_approved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- 7. Enhanced user profiles for better analytics
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS total_courses_enrolled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_content_accessed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_completion_rate DECIMAL(5,2) DEFAULT 0.0;

-- 8. Enhanced courses table for better management
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS total_modules INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_lessons INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS total_enrollments INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 0.0;

-- 9. Create indexes for performance
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_modules_sequence ON public.course_modules(course_id, sequence_order);
CREATE INDEX idx_course_lessons_module_id ON public.course_lessons(module_id);
CREATE INDEX idx_course_lessons_sequence ON public.course_lessons(module_id, sequence_order);
CREATE INDEX idx_course_lessons_content_id ON public.course_lessons(content_id);
CREATE INDEX idx_prompt_packs_type ON public.prompt_packs(pack_type);
CREATE INDEX idx_prompt_packs_access_level ON public.prompt_packs(access_level);
CREATE INDEX idx_prompt_packs_featured ON public.prompt_packs(is_featured);
CREATE INDEX idx_admin_activities_type ON public.admin_activities(activity_type);
CREATE INDEX idx_admin_activities_created_at ON public.admin_activities(created_at DESC);
CREATE INDEX idx_admin_activities_admin_user ON public.admin_activities(admin_user_id);
CREATE INDEX idx_payments_approved_at ON public.payments(admin_approved_at);
CREATE INDEX idx_user_profiles_last_login ON public.user_profiles(last_login_at DESC);
CREATE INDEX idx_user_profiles_enrollment_count ON public.user_profiles(total_courses_enrolled DESC);

-- 10. Enable RLS on new tables
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;

-- 11. Helper functions for dashboard metrics

-- Function to get total users count
CREATE OR REPLACE FUNCTION public.get_total_users()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true;
$$;

-- Function to get pending payments count
CREATE OR REPLACE FUNCTION public.get_pending_payments_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COUNT(*) FROM public.payments WHERE status = 'pending'::public.payment_status;
$$;

-- Function to get active members count
CREATE OR REPLACE FUNCTION public.get_active_members_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COUNT(*) FROM public.user_profiles 
WHERE membership_status = 'active'::public.membership_status AND is_active = true;
$$;

-- Function to get total revenue (this month)
CREATE OR REPLACE FUNCTION public.get_total_revenue_this_month()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(SUM(amount_naira), 0) FROM public.payments 
WHERE status = 'completed'::public.payment_status 
AND created_at >= date_trunc('month', CURRENT_DATE);
$$;

-- Function to get recent admin activities
CREATE OR REPLACE FUNCTION public.get_recent_admin_activities(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    activity_type public.admin_activity_type,
    description TEXT,
    created_at TIMESTAMPTZ,
    admin_name TEXT,
    target_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT 
    aa.id,
    aa.activity_type,
    aa.description,
    aa.created_at,
    admin_up.full_name as admin_name,
    target_up.full_name as target_name
FROM public.admin_activities aa
LEFT JOIN public.user_profiles admin_up ON aa.admin_user_id = admin_up.id
LEFT JOIN public.user_profiles target_up ON aa.target_user_id = target_up.id
ORDER BY aa.created_at DESC
LIMIT limit_count;
$$;

-- 12. RLS Policies

-- Course modules - admin only
CREATE POLICY "admin_full_access_course_modules"
ON public.course_modules
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Course lessons - admin only
CREATE POLICY "admin_full_access_course_lessons"
ON public.course_lessons
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Prompt packs - admin full access, users view based on tier
CREATE POLICY "admin_full_access_prompt_packs"
ON public.prompt_packs
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

CREATE POLICY "users_view_accessible_prompt_packs"
ON public.prompt_packs
FOR SELECT
TO authenticated
USING (public.user_has_access_level(access_level));

-- Admin activities - admin only
CREATE POLICY "admin_only_admin_activities"
ON public.admin_activities
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- 13. Triggers for automatic updates

-- Update course module count when modules change
CREATE OR REPLACE FUNCTION public.update_course_module_count()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        UPDATE public.courses 
        SET total_modules = (
            SELECT COUNT(*) FROM public.course_modules 
            WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
            AND status = 'published'::public.module_status
        )
        WHERE id = COALESCE(NEW.course_id, OLD.course_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_course_module_change
    AFTER INSERT OR DELETE ON public.course_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_course_module_count();

-- Update course lesson count when lessons change
CREATE OR REPLACE FUNCTION public.update_course_lesson_count()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        UPDATE public.courses c
        SET total_lessons = (
            SELECT COUNT(*) FROM public.course_lessons cl
            JOIN public.course_modules cm ON cl.module_id = cm.id
            WHERE cm.course_id = COALESCE(NEW.module_id, OLD.module_id)
        )
        FROM public.course_modules cm
        WHERE cm.id = COALESCE(NEW.module_id, OLD.module_id)
        AND c.id = cm.course_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_course_lesson_change
    AFTER INSERT OR DELETE ON public.course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_course_lesson_count();

-- Updated_at triggers
CREATE TRIGGER update_course_modules_updated_at
    BEFORE UPDATE ON public.course_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_course_lessons_updated_at
    BEFORE UPDATE ON public.course_lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_prompt_packs_updated_at
    BEFORE UPDATE ON public.prompt_packs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 14. Sample data for testing enhanced features

DO $$
DECLARE
    admin_user_id UUID;
    course1_id UUID;
    module1_id UUID := gen_random_uuid();
    module2_id UUID := gen_random_uuid();
    video1_id UUID;
    video2_id UUID;
BEGIN
    -- Get existing IDs
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    SELECT id INTO course1_id FROM public.courses LIMIT 1;
    SELECT id INTO video1_id FROM public.content_library WHERE content_type = 'video' LIMIT 1;
    SELECT id INTO video2_id FROM public.content_library WHERE content_type = 'video' AND id != video1_id LIMIT 1;

    -- Insert sample course modules
    INSERT INTO public.course_modules (id, course_id, title, description, sequence_order, status) VALUES
        (
            module1_id,
            course1_id,
            'Introduction to AI',
            'Learn the fundamentals of artificial intelligence and its applications',
            1,
            'published'::public.module_status
        ),
        (
            module2_id,
            course1_id,
            'Machine Learning Basics',
            'Understand core machine learning concepts and algorithms',
            2,
            'published'::public.module_status
        );

    -- Insert sample lessons
    INSERT INTO public.course_lessons (module_id, title, description, lesson_type, content_id, sequence_order) VALUES
        (
            module1_id,
            'What is Artificial Intelligence?',
            'Introduction to AI concepts and history',
            'text'::public.lesson_type,
            NULL,
            1
        ),
        (
            module1_id,
            'AI Fundamentals Video',
            'Comprehensive video on AI basics',
            'video'::public.lesson_type,
            video1_id,
            2
        ),
        (
            module2_id,
            'Introduction to Machine Learning',
            'Understanding ML algorithms and applications',
            'text'::public.lesson_type,
            NULL,
            1
        ),
        (
            module2_id,
            'ML Algorithms Deep Dive',
            'Advanced video on machine learning techniques',
            'video'::public.lesson_type,
            video2_id,
            2
        );

    -- Insert sample prompt packs
    INSERT INTO public.prompt_packs (title, description, pack_type, access_level, tags, is_featured) VALUES
        (
            'Basic ChatGPT Prompts',
            'Essential prompts for everyday AI interactions',
            'basic'::public.prompt_pack_type,
            'starter'::public.access_level,
            ARRAY['ChatGPT', 'Basic', 'Everyday'],
            true
        ),
        (
            'Advanced AI Writing Assistant',
            'Professional writing and content creation prompts',
            'advanced'::public.prompt_pack_type,
            'pro'::public.access_level,
            ARRAY['Writing', 'Content', 'Professional'],
            true
        ),
        (
            'Data Analysis & Visualization',
            'Specialized prompts for data science and analytics',
            'specialized'::public.prompt_pack_type,
            'elite'::public.access_level,
            ARRAY['Data', 'Analytics', 'Visualization'],
            false
        );

    -- Insert sample admin activities
    INSERT INTO public.admin_activities (activity_type, admin_user_id, description, metadata) VALUES
        (
            'user_created'::public.admin_activity_type,
            admin_user_id,
            'New user registered: John Doe',
            '{"user_email": "john@example.com", "role": "student"}'
        ),
        (
            'course_created'::public.admin_activity_type,
            admin_user_id,
            'New course published: Advanced Machine Learning',
            '{"course_title": "Advanced Machine Learning", "instructor": "Dr. Smith"}'
        ),
        (
            'content_uploaded'::public.admin_activity_type,
            admin_user_id,
            'New video uploaded: AI Fundamentals Introduction',
            '{"content_type": "video", "file_size": "150MB"}'
        ),
        (
            'payment_approved'::public.admin_activity_type,
            admin_user_id,
            'Payment approved for user: Jane Smith',
            '{"amount": 5000, "currency": "NGN"}'
        );

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error in sample data: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
END $$;

-- 15. Update existing courses with enhanced data
UPDATE public.courses 
SET 
    total_modules = (
        SELECT COUNT(*) FROM public.course_modules 
        WHERE course_id = courses.id AND status = 'published'::public.module_status
    ),
    total_lessons = (
        SELECT COUNT(*) FROM public.course_lessons cl
        JOIN public.course_modules cm ON cl.module_id = cm.id
        WHERE cm.course_id = courses.id
    )
WHERE id IN (SELECT course_id FROM public.course_modules);

-- 16. Update existing user profiles with enhanced data
UPDATE public.user_profiles 
SET 
    total_courses_enrolled = (
        SELECT COUNT(*) FROM public.course_enrollments 
        WHERE user_id = user_profiles.id
    ),
    total_content_accessed = (
        SELECT COUNT(*) FROM public.user_content_access 
        WHERE user_id = user_profiles.id
    )
WHERE id IN (SELECT user_id FROM public.course_enrollments);

-- 17. Create storage bucket for prompt packs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'prompt-packs',
        'prompt-packs', 
        false, 
        10485760, -- 10MB limit
        ARRAY['application/pdf', 'text/plain', 'application/json']
    )
ON CONFLICT (id) DO NOTHING;

-- 18. Storage policies for prompt packs
CREATE POLICY "admins_manage_prompt_packs"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'prompt-packs'
    AND public.has_admin_role()
)
WITH CHECK (
    bucket_id = 'prompt-packs'
    AND public.has_admin_role()
);

CREATE POLICY "users_access_prompt_packs_by_tier"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'prompt-packs'
    AND EXISTS (
        SELECT 1 FROM public.prompt_packs pp
        JOIN public.user_profiles up ON auth.uid() = up.id
        WHERE pp.file_path = name
        AND public.user_has_access_level(pp.access_level)
    )
);
