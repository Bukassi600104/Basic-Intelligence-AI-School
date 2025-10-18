-- Location: supabase/migrations/20250116000000_remove_demo_data.sql
-- Purpose: Remove all demo/test data while preserving database schema
-- Target: Remove demo users, courses, testimonials, enrollments, and payments

-- 1. First, identify and delete demo users from auth.users table
-- This will cascade to user_profiles due to foreign key constraints
DO $$
DECLARE
    admin_id UUID;
    instructor_id UUID;
    student1_id UUID;
    student2_id UUID;
BEGIN
    -- Get the UUIDs of demo users
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@basicintelligence.com';
    SELECT id INTO instructor_id FROM auth.users WHERE email = 'instructor@basicintelligence.com';
    SELECT id INTO student1_id FROM auth.users WHERE email = 'adebayo@example.com';
    SELECT id INTO student2_id FROM auth.users WHERE email = 'fatima@example.com';

    -- Delete demo users from auth.users (this cascades to user_profiles)
    IF admin_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = admin_id;
    END IF;
    
    IF instructor_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = instructor_id;
    END IF;
    
    IF student1_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = student1_id;
    END IF;
    
    IF student2_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = student2_id;
    END IF;
END $$;

-- 2. Delete any remaining demo courses (in case they weren't cascade deleted)
DELETE FROM public.courses 
WHERE title IN ('AI Fundamentals', 'Natural Language Processing', 'Computer Vision');

-- 3. Delete any remaining demo testimonials
DELETE FROM public.testimonials 
WHERE content LIKE '%Basic Intelligence transformed%' 
   OR content LIKE '%The courses are well-structured%';

-- 4. Delete any remaining demo enrollments
DELETE FROM public.course_enrollments 
WHERE progress_percentage IN (100, 75, 45);

-- 5. Delete any remaining demo payments
DELETE FROM public.payments 
WHERE transaction_reference LIKE 'TXN-AI-%';

-- 6. Update system settings with your actual information
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

-- 7. Verify cleanup was successful
DO $$
DECLARE
    demo_user_count INTEGER;
    demo_course_count INTEGER;
BEGIN
    -- Check for remaining demo users
    SELECT COUNT(*) INTO demo_user_count 
    FROM auth.users 
    WHERE email IN ('admin@basicintelligence.com', 'instructor@basicintelligence.com', 'adebayo@example.com', 'fatima@example.com');
    
    -- Check for remaining demo courses
    SELECT COUNT(*) INTO demo_course_count 
    FROM public.courses 
    WHERE title IN ('AI Fundamentals', 'Natural Language Processing', 'Computer Vision');
    
    RAISE NOTICE 'Cleanup completed. Remaining demo users: %, Remaining demo courses: %', demo_user_count, demo_course_count;
END $$;
