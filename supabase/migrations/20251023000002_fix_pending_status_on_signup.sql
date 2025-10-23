-- Fix handle_new_user to set pending status from metadata
-- This ensures new signups get 'pending' status as set in SignUpPage

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.user_role;
    user_status public.membership_status;
    user_tier TEXT;
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
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates user profile on signup with metadata including pending status and membership tier';
