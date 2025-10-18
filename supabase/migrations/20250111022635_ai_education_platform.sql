-- Location: supabase/migrations/20250111022635_ai_education_platform.sql
-- Schema Analysis: Fresh project - no existing schema
-- Integration Type: NEW_MODULE - Complete AI education platform with authentication
-- Dependencies: Creating fresh schema for AI education platform

-- 1. Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE public.membership_status AS ENUM ('active', 'inactive', 'pending', 'expired');
CREATE TYPE public.course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.enrollment_status AS ENUM ('enrolled', 'completed', 'dropped', 'in_progress');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 2. Core Tables

-- User profiles table (critical intermediary for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'student'::public.user_role,
    membership_status public.membership_status DEFAULT 'inactive'::public.membership_status,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    phone TEXT,
    member_id TEXT UNIQUE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    instructor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    level public.course_level NOT NULL,
    duration_weeks INTEGER NOT NULL,
    status public.course_status DEFAULT 'draft'::public.course_status,
    topics TEXT[] NOT NULL DEFAULT '{}',
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    price_naira INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Testimonials table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Course enrollments table
CREATE TABLE public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    status public.enrollment_status DEFAULT 'enrolled'::public.enrollment_status,
    enrolled_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    UNIQUE(user_id, course_id)
);

-- Payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    amount_naira INTEGER NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_method TEXT,
    transaction_reference TEXT UNIQUE,
    bank_details JSONB,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- System settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_membership_status ON public.user_profiles(membership_status);
CREATE INDEX idx_user_profiles_member_id ON public.user_profiles(member_id);

CREATE INDEX idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX idx_courses_level ON public.courses(level);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_featured ON public.courses(is_featured);

CREATE INDEX idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX idx_testimonials_course_id ON public.testimonials(course_id);
CREATE INDEX idx_testimonials_featured ON public.testimonials(is_featured);
CREATE INDEX idx_testimonials_approved ON public.testimonials(is_approved);

CREATE INDEX idx_course_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_course_enrollments_status ON public.course_enrollments(status);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_reference ON public.payments(transaction_reference);

-- 4. Helper Functions (Must come BEFORE RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
)
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Pattern 1: Core user table (user_profiles) - Simple only, no functions
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admin access to all user profiles
CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- Pattern 4: Public read, private write for courses
CREATE POLICY "public_can_read_courses"
ON public.courses
FOR SELECT
TO public
USING (status = 'published'::public.course_status);

CREATE POLICY "instructors_manage_own_courses"
ON public.courses
FOR ALL
TO authenticated
USING (instructor_id = auth.uid())
WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "admin_full_access_courses"
ON public.courses
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Pattern 4: Public read for approved testimonials, private write
CREATE POLICY "public_can_read_approved_testimonials"
ON public.testimonials
FOR SELECT
TO public
USING (is_approved = true);

CREATE POLICY "users_manage_own_testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_full_access_testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Pattern 2: Simple user ownership for enrollments
CREATE POLICY "users_manage_own_enrollments"
ON public.course_enrollments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_full_access_enrollments"
ON public.course_enrollments
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Pattern 2: Simple user ownership for payments
CREATE POLICY "users_manage_own_payments"
ON public.payments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin_full_access_payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- Admin only access to system settings
CREATE POLICY "admin_only_system_settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.has_admin_role())
WITH CHECK (public.has_admin_role());

-- 7. Triggers for automatic profile creation and updated_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, member_id)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::public.user_role,
    'BASIC-' || UPPER(SUBSTRING(NEW.id::text, 1, 8))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 8. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    instructor_uuid UUID := gen_random_uuid();
    student1_uuid UUID := gen_random_uuid();
    student2_uuid UUID := gen_random_uuid();
    
    course1_uuid UUID := gen_random_uuid();
    course2_uuid UUID := gen_random_uuid();
    course3_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with complete fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@basicintelligence.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin User", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (instructor_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'instructor@basicintelligence.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Dr. Funmi Adeyemi", "role": "instructor"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (student1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'adebayo@example.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Adebayo Ogundimu", "role": "student"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (student2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'fatima@example.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Fatima Abdullahi", "role": "student"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Additional user profile data will be created by trigger
    UPDATE public.user_profiles SET
        bio = 'AI Education Platform Administrator',
        location = 'Lagos, Nigeria',
        membership_status = 'active'::public.membership_status
    WHERE id = admin_uuid;

    UPDATE public.user_profiles SET
        bio = 'AI Research Scientist and Education Specialist with over 10 years experience',
        location = 'Abuja, Nigeria',
        membership_status = 'active'::public.membership_status
    WHERE id = instructor_uuid;

    UPDATE public.user_profiles SET
        bio = 'Software Developer passionate about AI',
        location = 'Lagos, Nigeria',
        membership_status = 'active'::public.membership_status
    WHERE id = student1_uuid;

    UPDATE public.user_profiles SET
        bio = 'Data Analyst transitioning to AI',
        location = 'Abuja, Nigeria',
        membership_status = 'active'::public.membership_status
    WHERE id = student2_uuid;

    -- Insert courses
    INSERT INTO public.courses (id, title, description, image_url, instructor_id, level, duration_weeks, status, topics, enrollment_count, rating, is_featured) VALUES
        (course1_uuid, 'AI Fundamentals', 'Master the basics of artificial intelligence, machine learning algorithms, and neural networks.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop', instructor_uuid, 'beginner'::public.course_level, 4, 'published'::public.course_status, ARRAY['Machine Learning', 'Neural Networks', 'Data Analysis'], 120, 4.8, true),
        (course2_uuid, 'Natural Language Processing', 'Learn to build chatbots, sentiment analysis tools, and language understanding systems.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop', instructor_uuid, 'intermediate'::public.course_level, 6, 'published'::public.course_status, ARRAY['Text Processing', 'Chatbots', 'Language Models'], 85, 4.9, true),
        (course3_uuid, 'Computer Vision', 'Develop image recognition, object detection, and visual AI applications.', 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop', instructor_uuid, 'advanced'::public.course_level, 5, 'published'::public.course_status, ARRAY['Image Recognition', 'Object Detection', 'Visual AI'], 65, 4.7, true);

    -- Insert testimonials
    INSERT INTO public.testimonials (user_id, course_id, content, rating, is_featured, is_approved) VALUES
        (student1_uuid, course1_uuid, 'Basic Intelligence transformed my understanding of AI. The practical approach and community support made complex concepts easy to grasp.', 5, true, true),
        (student2_uuid, course2_uuid, 'The courses are well-structured and the instructors are knowledgeable. I have successfully implemented AI solutions in my workplace.', 5, true, true);

    -- Insert enrollments
    INSERT INTO public.course_enrollments (user_id, course_id, status, progress_percentage) VALUES
        (student1_uuid, course1_uuid, 'completed'::public.enrollment_status, 100),
        (student1_uuid, course2_uuid, 'in_progress'::public.enrollment_status, 75),
        (student2_uuid, course2_uuid, 'completed'::public.enrollment_status, 100),
        (student2_uuid, course3_uuid, 'in_progress'::public.enrollment_status, 45);

    -- Insert payments
    INSERT INTO public.payments (user_id, course_id, amount_naira, status, payment_method, transaction_reference) VALUES
        (student1_uuid, course1_uuid, 5000, 'completed'::public.payment_status, 'Bank Transfer', 'TXN-AI-001-2024'),
        (student1_uuid, course2_uuid, 5000, 'completed'::public.payment_status, 'Bank Transfer', 'TXN-AI-002-2024'),
        (student2_uuid, course2_uuid, 5000, 'completed'::public.payment_status, 'Bank Transfer', 'TXN-AI-003-2024'),
        (student2_uuid, course3_uuid, 5000, 'completed'::public.payment_status, 'Bank Transfer', 'TXN-AI-004-2024');

    -- Insert system settings
    INSERT INTO public.system_settings (key, value, description, updated_by) VALUES
        ('membership_price_naira', '5000', 'Standard membership price in Nigerian Naira', admin_uuid),
        ('platform_name', '"Basic Intelligence Community School"', 'Official platform name', admin_uuid),
        ('admin_email', '"admin@basicintelligence.com"', 'Primary admin contact email', admin_uuid),
        ('whatsapp_number', '"+234 901 234 5678"', 'WhatsApp contact number', admin_uuid),
        ('bank_details', '{"bank_name": "First Bank of Nigeria", "account_name": "Basic Intelligence Community School", "account_number": "1234567890", "sort_code": "011"}', 'Payment bank details', admin_uuid);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;