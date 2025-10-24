-- Migration: Fix missing columns in user_profiles table
-- This migration adds missing columns that services are trying to query
-- Date: 2025-10-24

BEGIN;

-- Add referral columns if they don't exist (from member_reviews_and_referrals migration)
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.user_profiles(id),
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Add subscription tracking columns (if not using membership_tier system)
-- Note: These are legacy columns that some services still reference
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- Create indexes for referral fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON public.user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by ON public.user_profiles(referred_by);

-- Create referral_analytics table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referral_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(referred_user_id)
);

-- Create indexes for referral_analytics
CREATE INDEX IF NOT EXISTS idx_referral_analytics_referrer_id ON public.referral_analytics(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_analytics_referred_user_id ON public.referral_analytics(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_analytics_referral_code ON public.referral_analytics(referral_code);

-- Enable RLS on referral_analytics if not already enabled
ALTER TABLE public.referral_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_analytics
-- Users can view their own referral analytics
DROP POLICY IF EXISTS "Users can view own referral analytics" ON public.referral_analytics;
CREATE POLICY "Users can view own referral analytics" ON public.referral_analytics
    FOR SELECT USING (auth.uid() = referrer_id);

-- Users can insert their own referral analytics
DROP POLICY IF EXISTS "Users can insert referral analytics" ON public.referral_analytics;
CREATE POLICY "Users can insert referral analytics" ON public.referral_analytics
    FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Admins have full access to referral analytics
DROP POLICY IF EXISTS "Admins have full access to referral analytics" ON public.referral_analytics;
CREATE POLICY "Admins have full access to referral analytics" ON public.referral_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

COMMIT;
