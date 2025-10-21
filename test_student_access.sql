-- Create test student user
INSERT INTO auth.users (id, email, instance_id, aud, role, email_confirmed_at, encrypted_password, confirmation_sent_at, created_at, updated_at) 
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test.student@example.com',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    NOW(),
    '-----dummy-password-hash-----',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (instance_id, email) DO NOTHING;

-- Verify user_profiles entry was created by trigger with correct role
SELECT id, email, role, is_active, membership_status
FROM public.user_profiles
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Test content access policies (student should only see published content)
SET auth.uid = '11111111-1111-1111-1111-111111111111';

-- Test content_library access
SELECT COUNT(*) as visible_content_count 
FROM public.content_library;

-- Test user_profiles access (student should only see their own)
SELECT COUNT(*) as visible_profiles_count
FROM public.user_profiles;

-- Test course_videos access (student should have read-only)
SELECT COUNT(*) as visible_videos_count
FROM public.course_videos;

-- Test memberships access (student should only see their own)
SELECT COUNT(*) as visible_memberships_count
FROM public.memberships
WHERE user_id = auth.uid();

-- Test notifications access (student should only see their own)
SELECT COUNT(*) as visible_notifications_count
FROM public.notifications
WHERE user_id = auth.uid();

-- Test review creation (student should be able to create their own review)
INSERT INTO public.member_reviews (
    user_id,
    rating,
    review_text,
    status
) VALUES (
    auth.uid(),
    5,
    'Test review from student user',
    'pending'
) ON CONFLICT (user_id) DO NOTHING
RETURNING id, user_id, rating, status;

-- Reset auth context
RESET auth.uid;

-- Clean up test data (only if this is a temporary test)
-- DELETE FROM auth.users WHERE id = '11111111-1111-1111-1111-111111111111';