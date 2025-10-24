-- Migration: Enhanced Content Management System
-- Date: 2025-10-24
-- Description: Adds featured content capabilities, prompt type support, Google Drive integration enhancements, and analytics tracking

-- =====================================================
-- PHASE 1: ENUM UPDATES
-- =====================================================

-- 1. Add 'prompt' to content_type enum if not exists
DO $$
BEGIN
    -- Check if 'prompt' value already exists in content_type enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'prompt'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'content_type')
    ) THEN
        ALTER TYPE public.content_type ADD VALUE 'prompt';
    END IF;
END $$;

-- =====================================================
-- PHASE 2: CONTENT LIBRARY ENHANCEMENTS
-- =====================================================

-- 2. Add featured content fields to content_library
DO $$
BEGIN
    -- Add is_featured column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='content_library' AND column_name='is_featured'
    ) THEN
        ALTER TABLE public.content_library 
        ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- Add featured_order column for sorting
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='content_library' AND column_name='featured_order'
    ) THEN
        ALTER TABLE public.content_library 
        ADD COLUMN featured_order INTEGER;
    END IF;

    -- Add featured_description for homepage cards
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='content_library' AND column_name='featured_description'
    ) THEN
        ALTER TABLE public.content_library 
        ADD COLUMN featured_description TEXT;
        
        -- Add constraint for featured description length (100 chars)
        ALTER TABLE public.content_library 
        ADD CONSTRAINT featured_description_length 
        CHECK (featured_description IS NULL OR LENGTH(featured_description) <= 100);
    END IF;

    -- Add thumbnail_url for homepage card images
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='content_library' AND column_name='thumbnail_url'
    ) THEN
        ALTER TABLE public.content_library 
        ADD COLUMN thumbnail_url TEXT;
    END IF;

    -- Add prompt_type for categorizing prompts
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='content_library' AND column_name='prompt_type'
    ) THEN
        ALTER TABLE public.content_library 
        ADD COLUMN prompt_type TEXT;
    END IF;

    -- Add use_case_tags for advanced filtering
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='content_library' AND column_name='use_case_tags'
    ) THEN
        ALTER TABLE public.content_library 
        ADD COLUMN use_case_tags TEXT[];
    END IF;
END $$;

-- 3. Create indexes for featured content queries
CREATE INDEX IF NOT EXISTS idx_content_library_featured 
ON public.content_library(is_featured, featured_order) 
WHERE is_featured = true AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_content_library_prompt_type 
ON public.content_library(prompt_type) 
WHERE content_type = 'prompt';

-- =====================================================
-- PHASE 3: ANALYTICS TRACKING
-- =====================================================

-- 4. Create featured content clicks tracking table
CREATE TABLE IF NOT EXISTS public.featured_content_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content_id UUID REFERENCES public.content_library(id) ON DELETE CASCADE,
    clicked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    redirected_to_login BOOLEAN DEFAULT false,
    user_had_access BOOLEAN DEFAULT false,
    session_id TEXT,
    referrer TEXT,
    user_agent TEXT
);

-- 5. Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_featured_clicks_content_id 
ON public.featured_content_clicks(content_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_featured_clicks_user_id 
ON public.featured_content_clicks(user_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_featured_clicks_date 
ON public.featured_content_clicks(clicked_at DESC);

-- =====================================================
-- PHASE 4: ROW LEVEL SECURITY
-- =====================================================

-- 6. Enable RLS on featured_content_clicks
ALTER TABLE public.featured_content_clicks ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policy: Users can insert their own click tracking
CREATE POLICY "users_log_own_featured_clicks"
ON public.featured_content_clicks
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 8. RLS Policy: Users can view their own click history
CREATE POLICY "users_view_own_featured_clicks"
ON public.featured_content_clicks
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 9. RLS Policy: Admins can view all click analytics
CREATE POLICY "admin_view_all_featured_clicks"
ON public.featured_content_clicks
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'::public.user_role
    )
);

-- 10. RLS Policy: Public can view featured content metadata (for homepage preview)
CREATE POLICY "public_view_featured_content_metadata"
ON public.content_library
FOR SELECT
TO anon
USING (
    is_featured = true 
    AND status = 'active'::public.content_status
);

-- =====================================================
-- PHASE 5: HELPER FUNCTIONS
-- =====================================================

-- 11. Function to check if user can access featured content
CREATE OR REPLACE FUNCTION public.can_access_featured_content(
    p_content_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_content_access_level public.access_level;
    v_user_tier public.access_level;
    v_user_status public.membership_status;
    v_user_role public.user_role;
BEGIN
    -- Get content access level
    SELECT access_level INTO v_content_access_level
    FROM public.content_library
    WHERE id = p_content_id AND status = 'active'::public.content_status;

    -- If content not found or inactive, return false
    IF v_content_access_level IS NULL THEN
        RETURN false;
    END IF;

    -- If no user provided, return false (not logged in)
    IF p_user_id IS NULL THEN
        RETURN false;
    END IF;

    -- Get user details
    SELECT membership_tier, membership_status, role
    INTO v_user_tier, v_user_status, v_user_role
    FROM public.user_profiles
    WHERE id = p_user_id;

    -- Admins always have access
    IF v_user_role = 'admin'::public.user_role THEN
        RETURN true;
    END IF;

    -- Check if user is active member
    IF v_user_status != 'active'::public.membership_status THEN
        RETURN false;
    END IF;

    -- Check tier-based access
    IF v_content_access_level = 'starter'::public.access_level THEN
        RETURN true;
    ELSIF v_content_access_level = 'pro'::public.access_level THEN
        RETURN v_user_tier IN ('pro'::public.access_level, 'elite'::public.access_level);
    ELSIF v_content_access_level = 'elite'::public.access_level THEN
        RETURN v_user_tier = 'elite'::public.access_level;
    END IF;

    RETURN false;
END;
$$;

COMMENT ON FUNCTION public.can_access_featured_content IS 'Checks if a user can access specific featured content based on tier and membership status';

-- 12. Function to log featured content clicks
CREATE OR REPLACE FUNCTION public.log_featured_content_click(
    p_content_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_redirected_to_login BOOLEAN DEFAULT false,
    p_session_id TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_click_id UUID;
    v_user_has_access BOOLEAN;
BEGIN
    -- Check if user has access to this content
    v_user_has_access := public.can_access_featured_content(p_content_id, p_user_id);

    -- Insert click record
    INSERT INTO public.featured_content_clicks (
        user_id,
        content_id,
        redirected_to_login,
        user_had_access,
        session_id,
        referrer
    )
    VALUES (
        p_user_id,
        p_content_id,
        p_redirected_to_login,
        v_user_has_access,
        p_session_id,
        p_referrer
    )
    RETURNING id INTO v_click_id;

    RETURN v_click_id;
END;
$$;

COMMENT ON FUNCTION public.log_featured_content_click IS 'Logs when a user clicks on featured content for analytics';

-- 13. Function to get featured content for homepage
CREATE OR REPLACE FUNCTION public.get_featured_content(
    p_limit INTEGER DEFAULT 6
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    featured_description TEXT,
    thumbnail_url TEXT,
    content_type public.content_type,
    access_level public.access_level,
    category TEXT,
    featured_order INTEGER
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        id,
        title,
        featured_description,
        thumbnail_url,
        content_type,
        access_level,
        category,
        featured_order
    FROM public.content_library
    WHERE is_featured = true 
    AND status = 'active'::public.content_status
    ORDER BY featured_order ASC NULLS LAST, created_at DESC
    LIMIT p_limit;
$$;

COMMENT ON FUNCTION public.get_featured_content IS 'Returns featured content for homepage display';

-- 14. Function to get featured content analytics
CREATE OR REPLACE FUNCTION public.get_featured_content_analytics(
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    content_id UUID,
    content_title TEXT,
    total_clicks BIGINT,
    unique_users BIGINT,
    login_redirects BIGINT,
    users_with_access BIGINT,
    conversion_rate NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        cl.id AS content_id,
        cl.title AS content_title,
        COUNT(fcc.id) AS total_clicks,
        COUNT(DISTINCT fcc.user_id) AS unique_users,
        COUNT(CASE WHEN fcc.redirected_to_login THEN 1 END) AS login_redirects,
        COUNT(CASE WHEN fcc.user_had_access THEN 1 END) AS users_with_access,
        CASE 
            WHEN COUNT(fcc.id) > 0 
            THEN ROUND((COUNT(CASE WHEN fcc.user_had_access THEN 1 END)::NUMERIC / COUNT(fcc.id)::NUMERIC) * 100, 2)
            ELSE 0 
        END AS conversion_rate
    FROM public.content_library cl
    LEFT JOIN public.featured_content_clicks fcc ON cl.id = fcc.content_id
        AND fcc.clicked_at BETWEEN p_start_date AND p_end_date
    WHERE cl.is_featured = true
    GROUP BY cl.id, cl.title
    ORDER BY total_clicks DESC;
$$;

COMMENT ON FUNCTION public.get_featured_content_analytics IS 'Returns analytics data for featured content performance';

-- =====================================================
-- PHASE 6: VALIDATION CONSTRAINTS
-- =====================================================

-- 15. Add constraint: featured content must have thumbnail and description
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'featured_content_requirements'
    ) THEN
        ALTER TABLE public.content_library
        ADD CONSTRAINT featured_content_requirements
        CHECK (
            (is_featured = false) OR
            (is_featured = true AND thumbnail_url IS NOT NULL AND featured_description IS NOT NULL)
        );
    END IF;
END $$;

-- 16. Add constraint: Google Drive URLs must be valid format
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'valid_google_drive_url'
    ) THEN
        ALTER TABLE public.content_library
        ADD CONSTRAINT valid_google_drive_url
        CHECK (
            google_drive_embed_url IS NULL OR
            google_drive_embed_url ~ '^https://drive\.google\.com/(file|open)\?id=[a-zA-Z0-9_-]+(/preview|/view)?$'
            OR google_drive_embed_url ~ '^https://drive\.google\.com/file/d/[a-zA-Z0-9_-]+/(preview|view|edit)?$'
        );
    END IF;
END $$;

-- =====================================================
-- PHASE 7: UPDATE TRIGGERS
-- =====================================================

-- 17. Trigger to auto-set featured_order if not provided
CREATE OR REPLACE FUNCTION public.set_featured_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.is_featured = true AND NEW.featured_order IS NULL THEN
        -- Set to max + 1
        SELECT COALESCE(MAX(featured_order), 0) + 1 
        INTO NEW.featured_order
        FROM public.content_library
        WHERE is_featured = true AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_featured_order
    BEFORE INSERT OR UPDATE OF is_featured ON public.content_library
    FOR EACH ROW
    WHEN (NEW.is_featured = true)
    EXECUTE FUNCTION public.set_featured_order();

-- =====================================================
-- PHASE 8: GRANT PERMISSIONS
-- =====================================================

-- 18. Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION public.can_access_featured_content TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.log_featured_content_click TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_featured_content TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_featured_content_analytics TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Enhanced Content System Migration Completed Successfully';
    RAISE NOTICE 'Added: Featured content support, prompt type, analytics tracking';
    RAISE NOTICE 'New Tables: featured_content_clicks';
    RAISE NOTICE 'New Functions: can_access_featured_content, log_featured_content_click, get_featured_content, get_featured_content_analytics';
END $$;
