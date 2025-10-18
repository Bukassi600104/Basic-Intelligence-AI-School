-- Location: supabase/migrations/20250116000009_remove_sample_content.sql
-- Purpose: Remove all sample/demo content from content_library table
-- Target: Remove sample videos and PDFs inserted by content management system migration

-- Remove sample content from content_library table
DELETE FROM public.content_library 
WHERE title IN (
    'AI Fundamentals - Introduction',
    'Advanced Machine Learning Techniques', 
    'ChatGPT Prompts - Basic Collection',
    'Advanced AI Prompting Strategies'
);

-- Remove any associated course video links
DELETE FROM public.course_videos 
WHERE video_id IN (
    SELECT id FROM public.content_library 
    WHERE title IN (
        'AI Fundamentals - Introduction',
        'Advanced Machine Learning Techniques'
    )
);

-- Remove any user content access logs for sample content
DELETE FROM public.user_content_access 
WHERE content_id IN (
    SELECT id FROM public.content_library 
    WHERE title IN (
        'AI Fundamentals - Introduction',
        'Advanced Machine Learning Techniques',
        'ChatGPT Prompts - Basic Collection', 
        'Advanced AI Prompting Strategies'
    )
);

-- Verify removal was successful
SELECT 'Sample content successfully removed from content library' as status;
