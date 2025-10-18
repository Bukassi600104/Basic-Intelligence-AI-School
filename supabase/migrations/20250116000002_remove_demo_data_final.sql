-- Location: supabase/migrations/20250116000002_remove_demo_data_final.sql
-- Purpose: Remove all demo/test data with proper deletion order and variable naming
-- Target: Remove demo users, courses, testimonials, enrollments, and payments

-- IMPORTANT: This migration must be executed in the exact order below to respect foreign key constraints

-- 1. First, identify demo user IDs with unique variable names
DO $$
DECLARE
    v_admin_id UUID;
    v_instructor_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
BEGIN
    -- Get the UUIDs of demo users
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@basicintelligence.com';
    SELECT id INTO v_instructor_id FROM auth.users WHERE email = 'instructor@basicintelligence.com';
    SELECT id INTO v_student1_id FROM auth.users WHERE email = 'adebayo@example.com';
    SELECT id INTO v_student2_id FROM auth.users WHERE email = 'fatima@example.com';

    RAISE NOTICE 'Found demo users - Admin: %, Instructor: %, Student1: %, Student2: %', 
        v_admin_id, v_instructor_id, v_student1_id, v_student2_id;

    -- 2. Remove system settings that reference demo users (SET NULL the updated_by field)
    UPDATE public.system_settings 
    SET updated_by = NULL 
    WHERE updated_by IN (v_admin_id, v_instructor_id, v_student1_id, v_student2_id);

    -- 3. Delete testimonials created by demo users
    DELETE FROM public.testimonials 
    WHERE user_id IN (v_admin_id, v_instructor_id, v_student1_id, v_student2_id);

    -- 4. Delete course enrollments for demo users
    DELETE FROM public.course_enrollments 
    WHERE user_id IN (v_admin_id, v_instructor_id, v_student1_id, v_student2_id);

    -- 5. Delete payments made by demo users
    DELETE FROM public.payments 
    WHERE user_id IN (v_admin_id, v_instructor_id, v_student1_id, v_student2_id);

    -- 6. Delete courses created by demo instructors (SET NULL the instructor_id first)
    UPDATE public.courses 
    SET instructor_id = NULL 
    WHERE instructor_id IN (v_admin_id, v_instructor_id, v_student1_id, v_student2_id);

    -- 7. Now delete the courses that were created by demo users
    DELETE FROM public.courses 
    WHERE title IN ('AI Fundamentals', 'Natural Language Processing', 'Computer Vision');

    -- 8. Delete user profiles for demo users
    DELETE FROM public.user_profiles 
    WHERE id IN (v_admin_id, v_instructor_id, v_student1_id, v_student2_id);

    -- 9. Finally, delete the auth users (this should now work since all references are removed)
    IF v_admin_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = v_admin_id;
    END IF;
    
    IF v_instructor_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = v_instructor_id;
    END IF;
    
    IF v_student1_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = v_student1_id;
    END IF;
    
    IF v_student2_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = v_student2_id;
    END IF;

    RAISE NOTICE 'Demo data cleanup completed successfully';
END $$;

-- 10. Update system settings with your actual information
UPDATE public.system_settings 
SET 
    value = '"Basic Intelligence Community School"'::jsonb,
    description = 'Official platform name'
WHERE key = 'platform_name';

UPDATE public.system_settings 
SET 
    value = '"your-actual-admin-email@basicintelligence.com"'::jsonb,
    description = 'Primary admin contact email'
WHERE key = 'admin_email';

UPDATE public.system_settings 
SET 
    value = '"+2349062284074"'::jsonb,
    description = 'WhatsApp contact number'
WHERE key = 'whatsapp_number';

UPDATE public.system_settings 
SET 
    value = '{"bank_name": "Your Bank Name", "account_name": "Basic Intelligence Community School", "account_number": "YOUR_ACCOUNT_NUMBER", "sort_code": "YOUR_SORT_CODE"}'::jsonb,
    description = 'Payment bank details'
WHERE key = 'bank_details';

-- 11. Verify cleanup was successful
DO $$
DECLARE
    demo_user_count INTEGER;
    demo_course_count INTEGER;
    remaining_profiles INTEGER;
BEGIN
    -- Check for remaining demo users in auth.users
    SELECT COUNT(*) INTO demo_user_count 
    FROM auth.users 
    WHERE email IN ('admin@basicintelligence.com', 'instructor@basicintelligence.com', 'adebayo@example.com', 'fatima@example.com');
    
    -- Check for remaining demo courses
    SELECT COUNT(*) INTO demo_course_count 
    FROM public.courses 
    WHERE title IN ('AI Fundamentals', 'Natural Language Processing', 'Computer Vision');
    
    -- Check for remaining user profiles
    SELECT COUNT(*) INTO remaining_profiles 
    FROM public.user_profiles up
    JOIN auth.users au ON up.id = au.id
    WHERE au.email IN ('admin@basicintelligence.com', 'instructor@basicintelligence.com', 'adebayo@example.com', 'fatima@example.com');
    
    RAISE NOTICE 'Cleanup verification - Remaining demo users: %, Remaining demo courses: %, Remaining profiles: %', 
        demo_user_count, demo_course_count, remaining_profiles;
END $$;
