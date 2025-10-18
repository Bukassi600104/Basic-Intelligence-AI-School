import { supabase } from '../lib/supabase';

export const testimonialService = {
  // Get featured testimonials (public access)
  async getFeaturedTestimonials() {
    try {
      const { data, error } = await supabase
        ?.from('testimonials')
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            avatar_url,
            location,
            bio
          ),
          course:courses!course_id(
            id,
            title
          )
        `)
        ?.eq('is_featured', true)
        ?.eq('is_approved', true)
        ?.order('created_at', { ascending: false })
        ?.limit(10)
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch testimonials' }
    }
  },

  // Get all approved testimonials (public access)
  async getApprovedTestimonials() {
    try {
      const { data, error } = await supabase
        ?.from('testimonials')
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            avatar_url,
            location,
            bio
          ),
          course:courses!course_id(
            id,
            title
          )
        `)
        ?.eq('is_approved', true)
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
      return { data: null, error: error?.message || 'Failed to fetch testimonials' }
    }
  },

  // Get testimonials for a specific course
  async getCourseTestimonials(courseId) {
    try {
      const { data, error } = await supabase
        ?.from('testimonials')
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            avatar_url,
            location,
            bio
          )
        `)
        ?.eq('course_id', courseId)
        ?.eq('is_approved', true)
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
      return { data: null, error: error?.message || 'Failed to fetch course testimonials' }
    }
  },

  // Create new testimonial
  async createTestimonial(testimonialData) {
    try {
      const { data, error } = await supabase
        ?.from('testimonials')
        ?.insert([testimonialData])
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            avatar_url,
            location
          ),
          course:courses!course_id(
            id,
            title
          )
        `)
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
      return { data: null, error: error?.message || 'Failed to create testimonial' }
    }
  },

  // Update testimonial
  async updateTestimonial(testimonialId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('testimonials')
        ?.update(updates)
        ?.eq('id', testimonialId)
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            avatar_url,
            location
          ),
          course:courses!course_id(
            id,
            title
          )
        `)
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
      return { data: null, error: error?.message || 'Failed to update testimonial' }
    }
  },

  // Delete testimonial
  async deleteTestimonial(testimonialId) {
    try {
      const { error } = await supabase
        ?.from('testimonials')
        ?.delete()
        ?.eq('id', testimonialId)
      
      if (error) {
        return { error: error?.message };
      }
      
      return { error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { error: error?.message || 'Failed to delete testimonial' }
    }
  },

  // Get user's testimonials
  async getUserTestimonials(userId) {
    try {
      const { data, error } = await supabase
        ?.from('testimonials')
        ?.select(`
          *,
          course:courses!course_id(
            id,
            title,
            image_url
          )
        `)
        ?.eq('user_id', userId)
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
      return { data: null, error: error?.message || 'Failed to fetch user testimonials' }
    }
  },

  // Admin: Get all testimonials
  async getAllTestimonials() {
    try {
      const { data, error } = await supabase
        ?.from('testimonials')
        ?.select(`
          *,
          user:user_profiles!user_id(
            id,
            full_name,
            avatar_url,
            location,
            email
          ),
          course:courses!course_id(
            id,
            title
          )
        `)
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
      return { data: null, error: error?.message || 'Failed to fetch all testimonials' }
    }
  },

  // Admin: Approve testimonial
  async approveTestimonial(testimonialId) {
    return this.updateTestimonial(testimonialId, { is_approved: true })
  },

  // Admin: Feature testimonial
  async featureTestimonial(testimonialId) {
    return this.updateTestimonial(testimonialId, { 
      is_featured: true,
      is_approved: true 
    })
  }
}