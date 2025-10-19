import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export const referralService = {
  // Get user's referral information
  getUserReferralInfo: async (userId) => {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('referral_code, referral_count, referred_by')
        ?.eq('id', userId)
        ?.single();

      if (error) {
        return { data: null, error: error?.message };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('getUserReferralInfo error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get user's referral analytics
  getUserReferralAnalytics: async (userId) => {
    try {
      const { data, error } = await supabase
        ?.from('referral_analytics')
        ?.select(`
          *,
          referred_user:user_profiles!referred_user_id(full_name, email, created_at, membership_status)
        `)
        ?.eq('referrer_id', userId)
        ?.order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error?.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('getUserReferralAnalytics error:', error);
      return { data: [], error: error?.message };
    }
  },

  // Generate referral link
  generateReferralLink: (referralCode) => {
    const baseUrl = 'https://www.basicai.fit';
    return `${baseUrl}?ref=${referralCode}`;
  },

  // Get pre-written referral messages
  getReferralMessages: (referralLink) => {
    return [
      {
        id: 1,
        title: 'Transform Your AI Skills',
        message: `🚀 Transform your AI skills! Join me at Basic Intelligence AI School - the best platform for practical AI education. Get started: ${referralLink}`,
        platforms: ['whatsapp', 'twitter', 'linkedin', 'facebook']
      },
      {
        id: 2,
        title: 'Level Up Your AI Knowledge',
        message: `💡 Level up your AI knowledge! I'm learning cutting-edge AI skills at Basic Intelligence AI School. Join me: ${referralLink}`,
        platforms: ['whatsapp', 'twitter', 'linkedin']
      },
      {
        id: 3,
        title: 'Master AI with Hands-on Projects',
        message: `🎯 Master AI with hands-on projects! Basic Intelligence AI School helped me build real AI applications. Start your journey: ${referralLink}`,
        platforms: ['whatsapp', 'linkedin', 'facebook']
      },
      {
        id: 4,
        title: 'Build Real AI Applications',
        message: `🤖 Build real AI applications! Join Basic Intelligence AI School and learn from industry experts. Your AI journey starts here: ${referralLink}`,
        platforms: ['twitter', 'linkedin']
      },
      {
        id: 5,
        title: 'Join the AI Revolution',
        message: `🌟 Join the AI revolution! Basic Intelligence AI School makes learning AI accessible and practical. Don't get left behind: ${referralLink}`,
        platforms: ['whatsapp', 'facebook']
      }
    ];
  },

  // Share to social media
  shareToSocialMedia: (platform, message) => {
    const encodedMessage = encodeURIComponent(message);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://www.basicai.fit')}&summary=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://www.basicai.fit')}&quote=${encodedMessage}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  },

  // Copy referral link to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard?.writeText(text);
      return { success: true, error: null };
    } catch (error) {
      logger.error('copyToClipboard error:', error);
      return { success: false, error: 'Failed to copy to clipboard' };
    }
  },

  // Track referral signup
  trackReferralSignup: async (referredUserId, referralCode) => {
    try {
      // Find referrer by referral code
      const { data: referrer, error: referrerError } = await supabase
        ?.from('user_profiles')
        ?.select('id')
        ?.eq('referral_code', referralCode)
        ?.single();

      if (referrerError || !referrer) {
        return { data: null, error: 'Invalid referral code' };
      }

      // Record the referral
      const { data, error } = await supabase
        ?.from('referral_analytics')
        ?.insert([{
          referrer_id: referrer?.id,
          referred_user_id: referredUserId,
          referral_code: referralCode
        }])
        ?.select()
        ?.single();

      if (error) {
        return { data: null, error: error?.message };
      }

      // Update referred user's profile
      const { error: updateError } = await supabase
        ?.from('user_profiles')
        ?.update({ referred_by: referrer?.id })
        ?.eq('id', referredUserId);

      if (updateError) {
        logger.error('Failed to update referred_by field:', updateError);
      }

      logger.info(`Referral tracked: ${referrer?.id} referred ${referredUserId}`);
      return { data, error: null };
    } catch (error) {
      logger.error('trackReferralSignup error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get all referral analytics (admin only)
  getAllReferralAnalytics: async (filters = {}) => {
    try {
      let query = supabase
        ?.from('referral_analytics')
        ?.select(`
          *,
          referrer:user_profiles!referrer_id(full_name, email, member_id),
          referred_user:user_profiles!referred_user_id(full_name, email, member_id, membership_status, created_at)
        `)
        ?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.referrerId) {
        query = query?.eq('referrer_id', filters?.referrerId);
      }

      if (filters?.dateRange) {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters?.dateRange) {
          case 'today':
            startDate?.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate?.setDate(now?.getDate() - 7);
            break;
          case 'month':
            startDate?.setMonth(now?.getMonth() - 1);
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          query = query?.gte('created_at', startDate?.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error?.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('getAllReferralAnalytics error:', error);
      return { data: [], error: error?.message };
    }
  },

  // Get referral statistics (admin only)
  getReferralStats: async () => {
    try {
      const [
        totalReferralsResult,
        topReferrersResult,
        recentReferralsResult
      ] = await Promise.all([
        supabase?.from('referral_analytics')?.select('id')?.then(result => ({ data: result?.data?.length || 0 })),
        supabase?.from('user_profiles')?.select('full_name, email, referral_count')?.order('referral_count', { ascending: false })?.limit(10),
        supabase?.from('referral_analytics')?.select('created_at')?.order('created_at', { ascending: false })?.limit(50)
      ]);

      const stats = {
        totalReferrals: totalReferralsResult?.data || 0,
        topReferrers: topReferrersResult?.data || [],
        recentReferrals: recentReferralsResult?.data || []
      };

      // Calculate daily referral trend (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo?.setDate(sevenDaysAgo?.getDate() - 7);
      
      const { data: trendData } = await supabase
        ?.from('referral_analytics')
        ?.select('created_at')
        ?.gte('created_at', sevenDaysAgo?.toISOString());

      if (trendData) {
        const dailyCounts = {};
        trendData?.forEach(referral => {
          const date = new Date(referral?.created_at)?.toDateString();
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        stats.dailyTrend = dailyCounts;
      }

      return { data: stats, error: null };
    } catch (error) {
      logger.error('getReferralStats error:', error);
      return { data: null, error: error?.message };
    }
  }
};
