-- Create member_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.member_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS member_reviews_user_id_idx ON public.member_reviews(user_id);
CREATE INDEX IF NOT EXISTS member_reviews_status_idx ON public.member_reviews(status);
CREATE INDEX IF NOT EXISTS member_reviews_created_at_idx ON public.member_reviews(created_at);

-- Enable RLS on member_reviews table
ALTER TABLE public.member_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to approved reviews" ON public.member_reviews;
DROP POLICY IF EXISTS "Allow authenticated users to manage their own reviews" ON public.member_reviews;
DROP POLICY IF EXISTS "Allow admins to manage all reviews" ON public.member_reviews;

-- Create new policies
-- Allow public read access to approved reviews
CREATE POLICY "Allow public read access to approved reviews" 
ON public.member_reviews 
FOR SELECT 
USING (status = 'approved');

-- Allow authenticated users to manage their own reviews
CREATE POLICY "Allow authenticated users to manage their own reviews" 
ON public.member_reviews 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins full access
CREATE POLICY "Allow admins to manage all reviews" 
ON public.member_reviews 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role = 'admin'
))
WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = auth.uid() 
    AND up.role = 'admin'
));

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_member_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_member_reviews_updated_at_trigger ON public.member_reviews;
CREATE TRIGGER update_member_reviews_updated_at_trigger
    BEFORE UPDATE ON public.member_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_member_reviews_updated_at();

-- Create function to get approved reviews with user info
CREATE OR REPLACE FUNCTION get_approved_reviews()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    rating INTEGER,
    review_text TEXT,
    status TEXT,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    user_name TEXT,
    user_email TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mr.id,
        mr.user_id,
        mr.rating,
        mr.review_text,
        mr.status,
        mr.is_featured,
        mr.created_at,
        mr.updated_at,
        up.full_name as user_name,
        up.email as user_email
    FROM member_reviews mr
    LEFT JOIN user_profiles up ON mr.user_id = up.id
    WHERE mr.status = 'approved'
    ORDER BY mr.is_featured DESC, mr.created_at DESC;
END;
$$ LANGUAGE plpgsql;