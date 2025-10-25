-- Update handle_new_user trigger to set must_change_password for admin-created users
-- Date: 2025-10-25

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
    user_status public.membership_status;
    user_tier TEXT;
    created_by_admin_flag BOOLEAN;
BEGIN
    -- Check if user is specified as admin in metadata, default to student
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        user_role := 'admin'::public.user_role;
    ELSE
        user_role := 'student'::public.user_role;
    END IF;

    -- Get membership status from metadata, default to pending for new students
    IF NEW.raw_user_meta_data->>'membership_status' IS NOT NULL THEN
        user_status := (NEW.raw_user_meta_data->>'membership_status')::public.membership_status;
    ELSE
        -- Default to pending for students, active for admins
        IF user_role = 'admin'::public.user_role THEN
            user_status := 'active'::public.membership_status;
        ELSE
            user_status := 'pending'::public.membership_status;
        END IF;
    END IF;

    -- Get membership tier from metadata, default to pro
    user_tier := COALESCE(NEW.raw_user_meta_data->>'membership_tier', 'pro');

    -- Check if created by admin (admin will set this flag in metadata)
    created_by_admin_flag := COALESCE((NEW.raw_user_meta_data->>'created_by_admin')::BOOLEAN, FALSE);

    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name,
        phone,
        location,
        role, 
        is_active,
        membership_status,
        membership_tier,
        must_change_password,
        password_changed_at,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'location',
        user_role,
        true,
        user_status,
        user_tier,
        created_by_admin_flag,  -- Force password change if created by admin
        CASE WHEN created_by_admin_flag THEN NULL ELSE NOW() END,  -- NULL if never changed
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user profile on signup with metadata including pending status, membership tier, and password change requirement for admin-created users';
