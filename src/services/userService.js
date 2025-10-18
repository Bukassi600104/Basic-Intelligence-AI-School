import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export const userService = {
  // Get all users (admin only)
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.order('created_at', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch users' }
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('id', userId)
        ?.single()
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch user profile' }
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update(updates)
        ?.eq('id', userId)
        ?.select()
        ?.single()
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to update user profile' }
    }
  },

  // Get users by role
  async getUsersByRole(role) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('role', role)
        ?.order('created_at', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || `Failed to fetch ${role} users` }
    }
  },

  // Get active members
  async getActiveMembers() {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.eq('membership_status', 'active')
        ?.order('joined_at', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch active members' }
    }
  },

  // Update membership status
  async updateMembershipStatus(userId, status) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update({ 
          membership_status: status,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', userId)
        ?.select()
        ?.single()
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to update membership status' }
    }
  },

  // Update user role (admin only)
  async updateUserRole(userId, role) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.update({ 
          role: role,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', userId)
        ?.select()
        ?.single()
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to update user role' }
    }
  },

  // Get user dashboard stats
  async getUserStats(userId) {
    try {
      // Get user enrollments
      const { data: enrollments, error: enrollmentError } = await supabase
        ?.from('course_enrollments')
        ?.select('status')
        ?.eq('user_id', userId)
      
      if (enrollmentError) {
        return { data: null, error: enrollmentError?.message };
      }

      // Get user testimonials
      const { data: testimonials, error: testimonialError } = await supabase
        ?.from('testimonials')
        ?.select('rating')
        ?.eq('user_id', userId)
      
      if (testimonialError) {
        return { data: null, error: testimonialError?.message };
      }

      const stats = {
        totalEnrollments: enrollments?.length || 0,
        completedCourses: enrollments?.filter(e => e?.status === 'completed')?.length || 0,
        inProgressCourses: enrollments?.filter(e => e?.status === 'in_progress')?.length || 0,
        totalTestimonials: testimonials?.length || 0,
        averageRating: testimonials?.length > 0 
          ? (testimonials?.reduce((sum, t) => sum + (t?.rating || 0), 0) / testimonials?.length)?.toFixed(1)
          : '0.0'
      }
      
      return { data: stats, error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch user statistics' }
    }
  },

  // Search users
  async searchUsers(searchTerm) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('*')
        ?.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,member_id.ilike.%${searchTerm}%`)
        ?.order('created_at', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to search users' }
    }
  },

  // Update last active timestamp
  async updateLastActive(userId) {
    try {
      const { error } = await supabase
        ?.from('user_profiles')
        ?.update({ last_active_at: new Date()?.toISOString() })
        ?.eq('id', userId)
      
      if (error) {
        logger.error('Update last active error:', error?.message)
      }
    } catch (error) {
      logger.error('Update last active failed:', error?.message)
    }
  }
}
