-- Migration: Add member reviews and referral system
-- This migration creates tables for member reviews and referral tracking

-- Create member_reviews table
CREATE TABLE IF NOT EXISTS member_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure users can only submit one review
    UNIQUE(user_id)
);

-- Add referral fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Create referral_analytics table
CREATE TABLE IF NOT EXISTS referral_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(referred_user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_member_reviews_user_id ON member_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_member_reviews_status ON member_reviews(status);
CREATE INDEX IF NOT EXISTS idx_member_reviews_featured ON member_reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_member_reviews_created_at ON member_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by ON user_profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_referral_analytics_referrer_id ON referral_analytics(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_analytics_referral_code ON referral_analytics(referral_code);

-- Create function to generate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate a unique referral code (6 characters)
    LOOP
        new_code := UPPER(SUBSTRING(MD5(random()::text || NEW.id::text) FROM 1 FOR 6));
        
        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE referral_code = new_code) THEN
            EXIT;
        END IF;
        
        counter := counter + 1;
        IF counter > 10 THEN
            RAISE EXCEPTION 'Unable to generate unique referral code after 10 attempts';
        END IF;
    END LOOP;
    
    NEW.referral_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate referral codes for new users
DROP TRIGGER IF EXISTS trigger_generate_referral_code ON user_profiles;
CREATE TRIGGER trigger_generate_referral_code
    BEFORE INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();

-- Create function to update referral count
CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update referrer's referral count
    UPDATE user_profiles 
    SET referral_count = referral_count + 1
    WHERE id = NEW.referrer_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update referral count
DROP TRIGGER IF EXISTS trigger_update_referral_count ON referral_analytics;
CREATE TRIGGER trigger_update_referral_count
    AFTER INSERT ON referral_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_count();

-- Create function to get average rating
CREATE OR REPLACE FUNCTION get_average_rating()
RETURNS DECIMAL AS $$
DECLARE
    avg_rating DECIMAL;
BEGIN
    SELECT AVG(rating)::DECIMAL(3,2)
    INTO avg_rating
    FROM member_reviews
    WHERE status = 'approved';
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get total reviews count
CREATE OR REPLACE FUNCTION get_total_reviews()
RETURNS INTEGER AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM member_reviews
    WHERE status = 'approved';
    
    RETURN COALESCE(total_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get featured reviews for homepage
CREATE OR REPLACE FUNCTION get_featured_reviews(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    rating INTEGER,
    review_text TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mr.id,
        mr.user_id,
        mr.rating,
        mr.review_text,
        up.full_name,
        mr.created_at
    FROM member_reviews mr
    JOIN user_profiles up ON mr.user_id = up.id
    WHERE mr.status = 'approved' 
      AND mr.is_featured = true
    ORDER BY mr.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE member_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for member_reviews
-- Users can view their own reviews and approved reviews
CREATE POLICY "Users can view own reviews" ON member_reviews
    FOR SELECT USING (auth.uid() = user_id OR status = 'approved');

-- Users can insert their own reviews
CREATE POLICY "Users can insert own reviews" ON member_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews if pending
CREATE POLICY "Users can update own pending reviews" ON member_reviews
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins have full access
CREATE POLICY "Admins have full access to reviews" ON member_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- RLS Policies for referral_analytics
-- Users can view their own referral analytics
CREATE POLICY "Users can view own referral analytics" ON referral_analytics
    FOR SELECT USING (auth.uid() = referrer_id);

-- Admins have full access to referral analytics
CREATE POLICY "Admins have full access to referral analytics" ON referral_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Insert some sample approved reviews for testing
INSERT INTO member_reviews (user_id, rating, review_text, status, is_featured, created_at) VALUES
(
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1),
    5,
    'Basic Intelligence AI School has completely transformed my understanding of AI. The hands-on projects and expert guidance helped me build real-world applications that impressed my employer!',
    'approved',
    true,
    NOW() - INTERVAL '5 days'
),
(
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1),
    4,
    'The course structure is well-organized and the instructors are incredibly knowledgeable. I especially loved the practical approach to learning AI concepts.',
    'approved',
    true,
    NOW() - INTERVAL '3 days'
),
(
    (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1),
    5,
    'As a complete beginner, I was nervous about learning AI, but the step-by-step approach made it accessible. The community support is amazing too!',
    'approved',
    true,
    NOW() - INTERVAL '1 day'
)
ON CONFLICT DO NOTHING;
