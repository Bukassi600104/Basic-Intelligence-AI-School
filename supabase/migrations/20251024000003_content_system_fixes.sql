-- Migration: Content Management System Fixes & Enhancements
-- Date: 2025-10-24
-- Description: Fix missing columns, update access_level to support multiple tiers, increase featured_description limit
-- Issues Fixed: #1-5, #10

-- =====================================================
-- PHASE 1: UPDATE FEATURED DESCRIPTION CONSTRAINT
-- =====================================================

-- 1. Drop existing constraint and add new one with 120 char limit
DO $$
BEGIN
    -- Drop old constraint if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'featured_description_length' 
        AND table_name = 'content_library'
    ) THEN
        ALTER TABLE public.content_library 
        DROP CONSTRAINT featured_description_length;
    END IF;

    -- Add new constraint with 120 character limit
    ALTER TABLE public.content_library 
    ADD CONSTRAINT featured_description_length 
    CHECK (featured_description IS NULL OR LENGTH(featured_description) <= 120);
END $$;

-- =====================================================
-- PHASE 2: CONVERT ACCESS_LEVEL TO JSONB ARRAY
-- =====================================================

-- 2. Add new column for multi-tier access (temporary)
ALTER TABLE public.content_library 
ADD COLUMN IF NOT EXISTS access_levels JSONB;

-- 3. Migrate existing access_level data to access_levels array
-- Convert single ENUM to JSONB array with inclusive tiers
UPDATE public.content_library
SET access_levels = CASE 
    -- Starter tier: Only accessible to starter (and higher tiers)
    WHEN access_level::text = 'starter' THEN '["starter"]'::jsonb
    
    -- Pro tier: Accessible to pro AND starter
    WHEN access_level::text = 'pro' THEN '["pro", "starter"]'::jsonb
    
    -- Elite tier: Accessible to all tiers
    WHEN access_level::text = 'elite' THEN '["elite", "pro", "starter"]'::jsonb
    
    -- Default fallback (should not happen)
    ELSE '["starter"]'::jsonb
END
WHERE access_levels IS NULL;

-- 4. Add validation constraint
ALTER TABLE public.content_library 
ADD CONSTRAINT valid_access_levels 
CHECK (
    jsonb_typeof(access_levels) = 'array' 
    AND jsonb_array_length(access_levels) > 0
);

-- 5. Add comment for documentation
COMMENT ON COLUMN public.content_library.access_levels IS 
'JSONB array of membership tiers that can access this content. Examples: ["starter"], ["pro", "starter"], ["elite", "pro", "starter"]';

-- 6. Create index for efficient tier-based queries
CREATE INDEX IF NOT EXISTS idx_content_library_access_levels 
ON public.content_library USING GIN (access_levels);

-- =====================================================
-- PHASE 3: UPDATE HELPER FUNCTIONS
-- =====================================================

-- 7. Create improved access check function for JSONB arrays
CREATE OR REPLACE FUNCTION public.user_has_access_to_content(
    p_content_id UUID,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_content_access_levels JSONB;
    v_user_tier TEXT;
    v_user_status TEXT;
    v_is_admin BOOLEAN;
BEGIN
    -- Get user profile
    SELECT 
        membership_tier,
        membership_status,
        (role = 'admin')
    INTO 
        v_user_tier,
        v_user_status,
        v_is_admin
    FROM public.user_profiles
    WHERE id = p_user_id;

    -- Admin override: admins can access everything
    IF v_is_admin THEN
        RETURN TRUE;
    END IF;

    -- Check if user exists and has active membership
    IF v_user_tier IS NULL OR v_user_status != 'active' THEN
        RETURN FALSE;
    END IF;

    -- Get content access levels
    SELECT access_levels INTO v_content_access_levels
    FROM public.content_library
    WHERE id = p_content_id;

    -- If content doesn't exist or has no access levels, deny
    IF v_content_access_levels IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if user's tier is in the content's access_levels array
    RETURN access_levels @> to_jsonb(ARRAY[v_user_tier]);
END;
$$;

-- 8. Create function to get accessible content for a user
CREATE OR REPLACE FUNCTION public.get_user_accessible_content(
    p_content_type public.content_type DEFAULT NULL,
    p_category TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    content_type public.content_type,
    access_levels JSONB,
    is_featured BOOLEAN,
    featured_description TEXT,
    thumbnail_url TEXT,
    google_drive_embed_url TEXT,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_tier TEXT;
    v_user_status TEXT;
    v_is_admin BOOLEAN;
BEGIN
    -- Get user profile
    SELECT 
        membership_tier,
        membership_status,
        (role = 'admin')
    INTO 
        v_user_tier,
        v_user_status,
        v_is_admin
    FROM public.user_profiles
    WHERE id = p_user_id;

    -- Return content based on user access
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.content_type,
        c.access_levels,
        c.is_featured,
        c.featured_description,
        c.thumbnail_url,
        c.google_drive_embed_url,
        c.category,
        c.tags,
        c.created_at,
        c.updated_at
    FROM public.content_library c
    WHERE 
        -- Admin sees everything
        (v_is_admin = TRUE OR
        -- Regular users see content they have access to
        (
            v_user_status = 'active' AND
            c.access_levels @> to_jsonb(ARRAY[v_user_tier])
        ))
        -- Filter by content type if specified
        AND (p_content_type IS NULL OR c.content_type = p_content_type)
        -- Filter by category if specified
        AND (p_category IS NULL OR c.category = p_category)
        -- Only show active content
        AND c.status = 'active'
    ORDER BY 
        -- Featured content first
        c.is_featured DESC NULLS LAST,
        c.featured_order ASC NULLS LAST,
        -- Then by creation date (newest first)
        c.created_at DESC;
END;
$$;

-- =====================================================
-- PHASE 4: UPDATE RLS POLICIES
-- =====================================================

-- 9. Drop existing RLS policies for content_library
DROP POLICY IF EXISTS "users_view_accessible_content" ON public.content_library;
DROP POLICY IF EXISTS "students_view_accessible_content" ON public.content_library;

-- 10. Create new RLS policy for content access with JSONB support
CREATE POLICY "users_view_accessible_content_v2" 
ON public.content_library
FOR SELECT
USING (
    -- Content must be active
    status = 'active'
    AND
    (
        -- Admin users can see everything
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        -- Regular users can see content matching their tier
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE 
                id = auth.uid() 
                AND membership_status = 'active'
                AND content_library.access_levels @> to_jsonb(ARRAY[membership_tier])
        )
    )
);

-- 11. Admin full access policy remains unchanged
CREATE POLICY "admins_full_access_content" 
ON public.content_library
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- PHASE 5: CREATE HELPER VIEW FOR EASIER QUERIES
-- =====================================================

-- 12. Create view for featured content (for homepage)
CREATE OR REPLACE VIEW public.featured_content AS
SELECT 
    id,
    title,
    description,
    featured_description,
    thumbnail_url,
    content_type,
    access_levels,
    category,
    tags,
    google_drive_embed_url,
    featured_order,
    created_at
FROM public.content_library
WHERE 
    is_featured = TRUE 
    AND status = 'active'
ORDER BY 
    featured_order ASC NULLS LAST,
    created_at DESC;

-- Grant access to authenticated users
GRANT SELECT ON public.featured_content TO authenticated;

-- =====================================================
-- PHASE 6: DATA INTEGRITY CHECKS
-- =====================================================

-- 13. Verify all content has valid access_levels
DO $$
DECLARE
    v_invalid_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_invalid_count
    FROM public.content_library
    WHERE access_levels IS NULL OR jsonb_array_length(access_levels) = 0;
    
    IF v_invalid_count > 0 THEN
        RAISE WARNING '% content items have invalid access_levels', v_invalid_count;
    ELSE
        RAISE NOTICE 'All content items have valid access_levels ✅';
    END IF;
END $$;

-- 14. Add helpful comments
COMMENT ON FUNCTION public.user_has_access_to_content(UUID, UUID) IS 
'Checks if a user has access to specific content based on their membership tier and the content access_levels array';

COMMENT ON FUNCTION public.get_user_accessible_content(public.content_type, TEXT, UUID) IS 
'Returns all content accessible to a user based on their membership tier, filtered by optional content_type and category';

COMMENT ON POLICY "users_view_accessible_content_v2" ON public.content_library IS 
'Allows users to view content where their membership tier is included in the content access_levels JSONB array';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Output success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration completed successfully! ✅';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Changes applied:';
    RAISE NOTICE '1. Featured description limit increased to 120 chars';
    RAISE NOTICE '2. Access level converted to JSONB array for multi-tier support';
    RAISE NOTICE '3. Helper functions updated for JSONB queries';
    RAISE NOTICE '4. RLS policies updated with JSONB support';
    RAISE NOTICE '5. Featured content view created';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run verification script: 20251024000004_verify_content_fixes.sql';
    RAISE NOTICE '2. Update frontend code to use access_levels array';
    RAISE NOTICE '3. Test multi-tier content access';
    RAISE NOTICE '========================================';
END $$;
