-- First ensure we can find or create a test user
WITH existing_user AS (
    SELECT id
    FROM auth.users
    WHERE email = 'test@example.com'
    LIMIT 1
),
create_test_user AS (
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        role,
        instance_id,
        aud,
        confirmation_token
    )
    SELECT
        gen_random_uuid(),
        'test@example.com',
        crypt('testpassword123', gen_salt('bf')),
        now(),
        'authenticated',
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        encode(gen_random_bytes(32), 'hex')
    WHERE NOT EXISTS (SELECT 1 FROM existing_user)
    RETURNING id
),
test_user AS (
    SELECT id FROM existing_user
    UNION
    SELECT id FROM create_test_user
),
user_profile_insert AS (
    INSERT INTO public.user_profiles (id, full_name, email, role, is_active, membership_status)
    SELECT 
        id,
        'Test User',
        'test@example.com',
        'student'::public.user_role,
        true,
        'active'::public.membership_status
    FROM test_user
    ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role
    RETURNING id
)
-- Insert test reviews
INSERT INTO public.member_reviews (
    user_id,
    rating,
    review_text,
    status,
    is_featured
)
SELECT 
    id,
    5,
    'This is a test review to verify the functionality. The course content is excellent!',
    'approved',
    true
FROM user_profile_insert;

-- Verify the insertion
SELECT 
    mr.*,
    up.full_name,
    up.email
FROM public.member_reviews mr
LEFT JOIN user_profiles up ON mr.user_id = up.id
WHERE mr.status = 'approved';