-- Fix admin user role for bukassi@gmail.com
-- Check current role
DO $$
DECLARE
    current_role text;
    admin_user_id uuid;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    -- Check current role
    SELECT role::text INTO current_role
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    RAISE NOTICE 'Current role for bukassi@gmail.com: %', current_role;
    
    -- Update to admin role if needed
    IF current_role != 'admin' THEN
        UPDATE public.user_profiles 
        SET role = 'admin'::public.user_role,
            membership_status = 'active'::public.membership_status,
            updated_at = NOW()
        WHERE email = 'bukassi@gmail.com';
        
        RAISE NOTICE 'Updated bukassi@gmail.com to admin role';
    ELSE
        RAISE NOTICE 'bukassi@gmail.com already has admin role';
    END IF;
    
    -- Verify the update
    SELECT role::text INTO current_role
    FROM public.user_profiles 
    WHERE email = 'bukassi@gmail.com';
    
    RAISE NOTICE 'Final role for bukassi@gmail.com: %', current_role;
    
    -- Check if user exists in auth.users
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'bukassi@gmail.com') THEN
        RAISE NOTICE 'User exists in auth.users table';
    ELSE
        RAISE NOTICE 'User does not exist in auth.users table';
    END IF;
    
END $$;
