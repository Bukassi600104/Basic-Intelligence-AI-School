-- Location: supabase/migrations/20250115152519_content_management_system.sql
-- Schema Analysis: Existing AI education platform with user_profiles, courses, payments tables
-- Integration Type: addition - Adding content management for videos and PDFs
-- Dependencies: user_profiles, courses tables already exist

-- 1. Create new ENUM types for content management
CREATE TYPE public.content_type AS ENUM ('video', 'pdf', 'document', 'image');
CREATE TYPE public.access_level AS ENUM ('starter', 'pro', 'elite');
CREATE TYPE public.content_status AS ENUM ('active', 'inactive', 'archived');

-- 2. Content library table for managing all digital assets
CREATE TABLE public.content_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content_type public.content_type NOT NULL,
    file_path TEXT, -- For Supabase storage files
    google_drive_id TEXT, -- For Google Drive videos
    google_drive_embed_url TEXT, -- For embedding videos
    access_level public.access_level NOT NULL DEFAULT 'starter'::public.access_level,
    status public.content_status DEFAULT 'active'::public.content_status,
    file_size_bytes INTEGER,
    mime_type TEXT,
    category TEXT,
    tags TEXT[],
    uploader_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course videos junction table for linking videos to courses
CREATE TABLE public.course_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE,
    sequence_order INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, video_id)
);

-- 4. User content access log for analytics
CREATE TABLE public.user_content_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE,
    accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    access_duration_minutes INTEGER,
    completion_percentage INTEGER DEFAULT 0
);

-- 5. Add missing membership tier column to user_profiles if needed
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

-- 6. Create indexes for performance
CREATE INDEX idx_content_library_type ON public.content_library(content_type);
CREATE INDEX idx_content_library_access_level ON public.content_library(access_level);
CREATE INDEX idx_content_library_status ON public.content_library(status);
CREATE INDEX idx_content_library_uploader ON public.content_library(uploader_id);
CREATE INDEX idx_course_videos_course_id ON public.course_videos(course_id);
CREATE INDEX idx_course_videos_video_id ON public.course_videos(video_id);
CREATE INDEX idx_user_content_access_user_id ON public.user_content_access(user_id);
CREATE INDEX idx_user_content_access_content_id ON public.user_content_access(content_id);

-- 7. Create storage buckets for file management
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    (
        'prompt-library',
        'prompt-library', 
        false, 
        52428800, -- 50MB limit
        ARRAY['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ),
    (
        'course-materials',
        'course-materials',
        false,
        104857600, -- 100MB limit  
        ARRAY['application/pdf', 'image/jpeg', 'image/png', 'video/mp4', 'video/webm']
    ),
    (
        'user-uploads',
        'user-uploads',
        false,
        10485760, -- 10MB limit
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    )
ON CONFLICT (id) DO NOTHING;

-- 8. Enable RLS on new tables
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_access ENABLE ROW LEVEL SECURITY;

-- 9. Helper function to check user access level
CREATE OR REPLACE FUNCTION public.user_has_access_level(required_level public.access_level)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
    AND (
        (required_level = 'starter'::public.access_level) OR
        (required_level = 'pro'::public.access_level AND up.membership_tier IN ('pro', 'elite')) OR  
        (required_level = 'elite'::public.access_level AND up.membership_tier = 'elite')
    )
    AND up.membership_status = 'active'::public.membership_status
)
$$;

-- 10. RLS Policies for content_library (admin can manage all, users can view based on tier)
CREATE POLICY "admin_full_access_content_library"
ON public.content_library
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

CREATE POLICY "users_view_accessible_content"
ON public.content_library
FOR SELECT
TO authenticated
USING (
    status = 'active'::public.content_status 
    AND public.user_has_access_level(access_level)
);

-- 11. RLS Policies for course_videos
CREATE POLICY "admin_full_access_course_videos"
ON public.course_videos
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

CREATE POLICY "users_view_course_videos"
ON public.course_videos
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.courses c
        WHERE c.id = course_id AND c.status = 'published'::public.course_status
    )
);

-- 12. RLS Policies for user_content_access
CREATE POLICY "users_manage_own_content_access"
ON public.user_content_access
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_view_all_content_access"
ON public.user_content_access
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- 13. Storage policies for prompt library (tier-based access)
CREATE POLICY "admins_manage_prompt_library"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'prompt-library'
    AND EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
)
WITH CHECK (
    bucket_id = 'prompt-library'
    AND EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

CREATE POLICY "users_access_prompt_library_by_tier"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'prompt-library'
    AND EXISTS (
        SELECT 1 FROM public.content_library cl
        JOIN public.user_profiles up ON auth.uid() = up.id
        WHERE cl.file_path = name
        AND cl.status = 'active'::public.content_status
        AND (
            (cl.access_level = 'starter'::public.access_level) OR
            (cl.access_level = 'pro'::public.access_level AND up.membership_tier IN ('pro', 'elite')) OR
            (cl.access_level = 'elite'::public.access_level AND up.membership_tier = 'elite')
        )
        AND up.membership_status = 'active'::public.membership_status
    )
);

-- 14. Storage policies for course materials
CREATE POLICY "admins_manage_course_materials"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'course-materials'
    AND EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
)
WITH CHECK (
    bucket_id = 'course-materials'
    AND EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

CREATE POLICY "enrolled_users_access_course_materials"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'course-materials'
    AND EXISTS (
        SELECT 1 FROM public.course_enrollments ce
        JOIN public.user_profiles up ON ce.user_id = up.id
        WHERE up.id = auth.uid()
        AND up.membership_status = 'active'::public.membership_status
        AND ce.status IN ('enrolled', 'in_progress', 'completed')
    )
);

-- 15. Storage policies for user uploads
CREATE POLICY "users_manage_own_uploads"
ON storage.objects
FOR ALL
TO authenticated
USING (
    bucket_id = 'user-uploads'
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'user-uploads'
    AND owner = auth.uid()
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 16. Functions for tier upgrades (automatically grant access to new content)
CREATE OR REPLACE FUNCTION public.handle_tier_upgrade()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
    -- Log tier change
    INSERT INTO public.user_content_access (user_id, content_id, accessed_at, access_duration_minutes, completion_percentage)
    SELECT NEW.id, cl.id, CURRENT_TIMESTAMP, 0, 0
    FROM public.content_library cl
    WHERE cl.access_level = NEW.membership_tier::public.access_level
    AND cl.status = 'active'::public.content_status
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$func$;

-- 17. Trigger for automatic tier upgrade handling
CREATE TRIGGER on_user_tier_upgrade
    AFTER UPDATE OF membership_tier ON public.user_profiles
    FOR EACH ROW
    WHEN (OLD.membership_tier IS DISTINCT FROM NEW.membership_tier)
    EXECUTE FUNCTION public.handle_tier_upgrade();

-- 18. Update trigger for content_library
CREATE TRIGGER update_content_library_updated_at
    BEFORE UPDATE ON public.content_library
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 19. Sample content data for testing
DO $$
DECLARE
    admin_user_id UUID;
    video1_id UUID := gen_random_uuid();
    video2_id UUID := gen_random_uuid();
    pdf1_id UUID := gen_random_uuid();
    pdf2_id UUID := gen_random_uuid();
    course1_id UUID;
BEGIN
    -- Get existing admin user ID
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE role = 'admin' LIMIT 1;
    
    -- Get existing course ID
    SELECT id INTO course1_id FROM public.courses LIMIT 1;
    
    -- Insert sample video content
    INSERT INTO public.content_library (
        id, title, description, content_type, google_drive_id, google_drive_embed_url,
        access_level, uploader_id, category, tags
    ) VALUES
        (
            video1_id,
            'AI Fundamentals - Introduction',
            'Welcome video introducing AI concepts for beginners',
            'video'::public.content_type,
            '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', -- Sample Google Drive ID
            'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview',
            'starter'::public.access_level,
            admin_user_id,
            'Introduction',
            ARRAY['AI', 'Fundamentals', 'Beginner']
        ),
        (
            video2_id,
            'Advanced Machine Learning Techniques',
            'Deep dive into advanced ML algorithms and implementations',
            'video'::public.content_type,
            '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms', -- Sample Google Drive ID
            'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview',
            'elite'::public.access_level,
            admin_user_id,
            'Advanced',
            ARRAY['Machine Learning', 'Advanced', 'Algorithms']
        );

    -- Insert sample PDF prompt content
    INSERT INTO public.content_library (
        id, title, description, content_type, file_path, access_level, uploader_id, category, tags
    ) VALUES
        (
            pdf1_id,
            'ChatGPT Prompts - Basic Collection',
            'Essential prompts for everyday AI interactions',
            'pdf'::public.content_type,
            'prompts/basic/chatgpt-basic-prompts.pdf',
            'pro'::public.access_level,
            admin_user_id,
            'Prompts',
            ARRAY['ChatGPT', 'Basic', 'Prompts']
        ),
        (
            pdf2_id,
            'Advanced AI Prompting Strategies',
            'Professional-level prompting techniques for complex tasks',
            'pdf'::public.content_type,
            'prompts/elite/advanced-ai-prompting.pdf',
            'elite'::public.access_level,
            admin_user_id,
            'Prompts',
            ARRAY['Advanced', 'Strategy', 'Professional']
        );

    -- Link videos to existing course
    IF course1_id IS NOT NULL THEN
        INSERT INTO public.course_videos (course_id, video_id, sequence_order) VALUES
            (course1_id, video1_id, 1),
            (course1_id, video2_id, 2);
    END IF;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error in sample data: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample data: %', SQLERRM;
END $$;