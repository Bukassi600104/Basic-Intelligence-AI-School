-- Drop RLS policies that depend on the role column
DROP POLICY IF EXISTS admin_full_access_content_library ON public.content_library;
DROP POLICY IF EXISTS student_read_access_content_library ON public.content_library;
DROP POLICY IF EXISTS admin_full_access ON public.user_profiles;
DROP POLICY IF EXISTS student_read_own ON public.user_profiles;
DROP POLICY IF EXISTS admin_full_access_course_videos ON public.course_videos;
DROP POLICY IF EXISTS student_read_access_course_videos ON public.course_videos;
DROP POLICY IF EXISTS admin_view_all_content_access ON public.user_content_access;
DROP POLICY IF EXISTS student_view_own_content_access ON public.user_content_access;
DROP POLICY IF EXISTS admins_manage_prompt_library ON storage.objects;
DROP POLICY IF EXISTS students_read_content ON storage.objects;
DROP POLICY IF EXISTS admins_manage_course_materials ON storage.objects;
DROP POLICY IF EXISTS students_read_course_materials ON storage.objects;
DROP POLICY IF EXISTS admin_full_access_memberships ON public.memberships;
DROP POLICY IF EXISTS student_read_own_membership ON public.memberships;
DROP POLICY IF EXISTS admin_full_access_analytics_events ON public.analytics_events;
DROP POLICY IF EXISTS student_write_own_analytics ON public.analytics_events;
DROP POLICY IF EXISTS admin_full_access_notifications ON public.notifications;
DROP POLICY IF EXISTS student_read_own_notifications ON public.notifications;
DROP POLICY IF EXISTS admin_full_access_admin_settings ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can manage all subscription requests" ON public.subscription_requests;
DROP POLICY IF EXISTS "Students can view and create own requests" ON public.subscription_requests;
DROP POLICY IF EXISTS "Only admins can manage scheduled notifications" ON public.scheduled_notifications;
DROP POLICY IF EXISTS "Admins can view all automated notifications" ON public.automated_notifications;
DROP POLICY IF EXISTS "Students can view own automated notifications" ON public.automated_notifications;
DROP POLICY IF EXISTS "Allow admins to manage all reviews" ON public.member_reviews;
DROP POLICY IF EXISTS "Allow students to manage own reviews" ON public.member_reviews;

-- First alter the column to text type temporarily
ALTER TABLE public.user_profiles 
ALTER COLUMN role TYPE text 
USING role::text;

-- Update all instructor roles to student
UPDATE public.user_profiles 
SET role = 'student'
WHERE role = 'instructor';

-- Update any other invalid roles to student
UPDATE public.user_profiles 
SET role = 'student'
WHERE role NOT IN ('admin', 'student');

-- Drop and recreate the enum type
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('admin', 'student');

-- Convert the column back to enum type
ALTER TABLE public.user_profiles 
ALTER COLUMN role TYPE public.user_role 
USING role::public.user_role;

-- Update the handle_new_user trigger function to use 'student' as default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
BEGIN
    -- Check if user is specified as admin in metadata, default to student
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        user_role := 'admin'::public.user_role;
    ELSE
        user_role := 'student'::public.user_role;
    END IF;

    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name, 
        role, 
        is_active,
        membership_status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        user_role,
        true,
        'inactive'::public.membership_status,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cast all existing roles to the new enum type
UPDATE public.user_profiles
SET role = CASE 
    WHEN role::text = 'admin' THEN 'admin'::public.user_role
    ELSE 'student'::public.user_role
END;

-- Verify trigger function and role updates
DO $$
DECLARE
    invalid_roles INTEGER;
BEGIN
    -- Check for any invalid roles
    SELECT COUNT(*) INTO invalid_roles
    FROM public.user_profiles
    WHERE role::text NOT IN ('admin', 'student');
    
    IF invalid_roles > 0 THEN
        RAISE EXCEPTION 'Found % user(s) with invalid roles. All roles should be either admin or student.', invalid_roles;
    END IF;
END $$;

-- Display the current role distribution
SELECT role::text, COUNT(*) as count
FROM public.user_profiles
GROUP BY role
ORDER BY role;

-- Recreate RLS policies
CREATE POLICY admin_full_access_content_library ON public.content_library
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY student_read_access_content_library ON public.content_library
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'student'::public.user_role
    ));

CREATE POLICY admin_full_access ON public.user_profiles
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY student_read_own ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id 
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Recreate course_videos policies
CREATE POLICY admin_full_access_course_videos ON public.course_videos
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY student_read_access_course_videos ON public.course_videos
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'student'::public.user_role
    ));

-- Recreate user_content_access policies
CREATE POLICY admin_view_all_content_access ON public.user_content_access
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY student_view_own_content_access ON public.user_content_access
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Recreate storage policies
CREATE POLICY admins_manage_prompt_library ON storage.objects
    FOR ALL 
    TO authenticated
    USING (
        bucket_id = 'prompt-library'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'::public.user_role
        )
    );

CREATE POLICY students_read_content ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'prompt-library'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Add course materials storage policies
CREATE POLICY admins_manage_course_materials ON storage.objects
    FOR ALL 
    TO authenticated
    USING (
        bucket_id = 'course-materials'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'admin'::public.user_role
        )
    );

CREATE POLICY students_read_course_materials ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'course-materials'
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Recreate membership policies
CREATE POLICY admin_full_access_memberships ON public.memberships
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY student_read_own_membership ON public.memberships
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Recreate analytics policies
CREATE POLICY admin_full_access_analytics_events ON public.analytics_events
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY student_write_own_analytics ON public.analytics_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Recreate notifications policies
CREATE POLICY admin_full_access_notifications ON public.notifications
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY student_read_own_notifications ON public.notifications
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Recreate admin settings policies
CREATE POLICY admin_full_access_admin_settings ON public.admin_settings
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

-- Recreate subscription requests policies
CREATE POLICY "Admins can manage all subscription requests" ON public.subscription_requests
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY "Students can view and create own requests" ON public.subscription_requests
    FOR ALL
    TO authenticated
    USING (
        member_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Recreate scheduled notifications policies
CREATE POLICY "Only admins can manage scheduled notifications" ON public.scheduled_notifications
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

-- Recreate automated notifications policies
CREATE POLICY "Admins can view all automated notifications" ON public.automated_notifications
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY "Students can view own automated notifications" ON public.automated_notifications
    FOR SELECT
    TO authenticated
    USING (
        member_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );

-- Recreate member reviews policies
CREATE POLICY "Allow admins to manage all reviews" ON public.member_reviews
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() 
        AND up.role = 'admin'::public.user_role
    ));

CREATE POLICY "Allow students to manage own reviews" ON public.member_reviews
    FOR ALL
    TO authenticated
    USING (
        user_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.user_profiles up
            WHERE up.id = auth.uid() 
            AND up.role = 'student'::public.user_role
        )
    );