import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export const reviewService = {
  // Get approved reviews
  getApprovedReviews: async () => {
    try {
      const { data, error } = await supabase
        ?.from('member_reviews')
        ?.select(`
          *,
          user_profiles(full_name, email)
        `)
        ?.eq('status', 'approved')
        ?.order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error?.message };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('getApprovedReviews error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get user's review
  getUserReview: async (userId) => {
    try {
      const { data, error } = await supabase
        ?.from('member_reviews')
        ?.select('*')
        ?.eq('user_id', userId)
        ?.single();

      if (error && error?.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { data: null, error: error?.message };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('getUserReview error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Submit a new review
  submitReview: async (userId, reviewData) => {
    try {
      // Check if user already has a review
      const { data: existingReview } = await reviewService.getUserReview(userId);
      
      if (existingReview) {
        return { data: null, error: 'You have already submitted a review' };
      }

      const { data, error } = await supabase
        ?.from('member_reviews')
        ?.insert([{
          user_id: userId,
          rating: reviewData?.rating,
          review_text: reviewData?.reviewText,
          status: 'pending',
          is_featured: false
        }])
        ?.select()
        ?.single();

      if (error) {
        return { data: null, error: error?.message };
      }

      logger.info(`User ${userId} submitted review with rating ${reviewData?.rating}`);
      return { data, error: null };
    } catch (error) {
      logger.error('submitReview error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Update user's review (only if pending)
  updateReview: async (userId, reviewData) => {
    try {
      const { data, error } = await supabase
        ?.from('member_reviews')
        ?.update({
          rating: reviewData?.rating,
          review_text: reviewData?.reviewText,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('user_id', userId)
        ?.eq('status', 'pending')
        ?.select()
        ?.single();

      if (error) {
        return { data: null, error: error?.message };
      }

      logger.info(`User ${userId} updated their review`);
      return { data, error: null };
    } catch (error) {
      logger.error('updateReview error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get featured reviews for homepage
  getFeaturedReviews: async (limit = 10) => {
    try {
      const { data, error } = await supabase
        ?.rpc('get_featured_reviews', { limit_count: limit });

      if (error) {
        return { data: [], error: error?.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('getFeaturedReviews error:', error);
      return { data: [], error: error?.message };
    }
  },

  // Get all reviews (admin only)
  getAllReviews: async (filters = {}) => {
    try {
      let query = supabase
        ?.from('member_reviews')
        ?.select(`
          *,
          user_profiles(full_name, email, member_id)
        `)
        ?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.rating) {
        query = query?.eq('rating', filters?.rating);
      }

      if (filters?.search) {
        query = query?.or(`review_text.ilike.%${filters?.search}%,user_profiles.full_name.ilike.%${filters?.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error?.message };
      }

      return { data: data || [], error: null };
    } catch (error) {
      logger.error('getAllReviews error:', error);
      return { data: [], error: error?.message };
    }
  },

  // Update review status (admin only)
  updateReviewStatus: async (reviewId, status, isFeatured = null) => {
    try {
      const updateData = {
        status,
        updated_at: new Date()?.toISOString()
      };

      if (isFeatured !== null) {
        updateData.is_featured = isFeatured;
      }

      const { data, error } = await supabase
        ?.from('member_reviews')
        ?.update(updateData)
        ?.eq('id', reviewId)
        ?.select(`
          *,
          user_profiles(full_name, email, member_id)
        `)
        ?.single();

      if (error) {
        return { data: null, error: error?.message };
      }

      logger.info(`Review ${reviewId} status updated to ${status}`);
      return { data, error: null };
    } catch (error) {
      logger.error('updateReviewStatus error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Delete review (admin only)
  deleteReview: async (reviewId) => {
    try {
      const { error } = await supabase
        ?.from('member_reviews')
        ?.delete()
        ?.eq('id', reviewId);

      if (error) {
        return { data: null, error: error?.message };
      }

      logger.info(`Review ${reviewId} deleted`);
      return { data: { message: 'Review deleted successfully' }, error: null };
    } catch (error) {
      logger.error('deleteReview error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Get review statistics (admin only)
  getReviewStats: async () => {
    try {
      const [
        totalReviewsResult,
        pendingReviewsResult,
        approvedReviewsResult,
        averageRatingResult,
        featuredReviewsResult
      ] = await Promise.all([
        supabase?.rpc('get_total_reviews'),
        supabase?.from('member_reviews')?.select('id')?.eq('status', 'pending')?.then(result => ({ data: result?.data?.length || 0 })),
        supabase?.from('member_reviews')?.select('id')?.eq('status', 'approved')?.then(result => ({ data: result?.data?.length || 0 })),
        supabase?.rpc('get_average_rating'),
        supabase?.from('member_reviews')?.select('id')?.eq('is_featured', true)?.eq('status', 'approved')?.then(result => ({ data: result?.data?.length || 0 }))
      ]);

      const stats = {
        totalReviews: totalReviewsResult?.data || 0,
        pendingReviews: pendingReviewsResult?.data || 0,
        approvedReviews: approvedReviewsResult?.data || 0,
        averageRating: averageRatingResult?.data || 0,
        featuredReviews: featuredReviewsResult?.data || 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      };

      // Get rating distribution
      const { data: ratingData } = await supabase
        ?.from('member_reviews')
        ?.select('rating')
        ?.eq('status', 'approved');

      if (ratingData) {
        ratingData?.forEach(review => {
          if (stats?.ratingDistribution[review?.rating] !== undefined) {
            stats.ratingDistribution[review?.rating]++;
          }
        });
      }

      return { data: stats, error: null };
    } catch (error) {
      logger.error('getReviewStats error:', error);
      return { data: null, error: error?.message };
    }
  },

  // Bulk update review status (admin only)
  bulkUpdateReviewStatus: async (reviewIds, status) => {
    try {
      if (!reviewIds || reviewIds?.length === 0) {
        return { data: null, error: 'No reviews selected' };
      }

      const { error } = await supabase
        ?.from('member_reviews')
        ?.update({
          status,
          updated_at: new Date()?.toISOString()
        })
        ?.in('id', reviewIds);

      if (error) {
        return { data: null, error: error?.message };
      }

      logger.info(`Bulk updated ${reviewIds?.length} reviews to ${status}`);
      return { data: { message: `${reviewIds?.length} reviews updated successfully` }, error: null };
    } catch (error) {
      logger.error('bulkUpdateReviewStatus error:', error);
      return { data: null, error: error?.message };
    }
  }
};
