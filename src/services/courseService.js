import { supabase } from '../lib/supabase';

export const courseService = {
  // Get all courses (admin/instructor access)
  async getAllCourses() {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.select(`
          *,
          instructor:user_profiles!instructor_id(
            id,
            full_name,
            email,
            avatar_url
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
      return { data: null, error: error?.message || 'Failed to fetch courses' }
    }
  },

  // Get published courses only (public access)
  async getPublishedCourses() {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.select(`
          *,
          instructor:user_profiles!instructor_id(
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        ?.eq('status', 'published')
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
      return { data: null, error: error?.message || 'Failed to fetch published courses' }
    }
  },

  // Get featured courses
  async getFeaturedCourses() {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.select(`
          *,
          instructor:user_profiles!instructor_id(
            id,
            full_name,
            avatar_url,
            bio
          )
        `)
        ?.eq('status', 'published')
        ?.eq('is_featured', true)
        ?.order('rating', { ascending: false })
        ?.limit(6)
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch featured courses' }
    }
  },

  // Get course by ID
  async getCourseById(courseId) {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.select(`
          *,
          instructor:user_profiles!instructor_id(
            id,
            full_name,
            avatar_url,
            bio,
            location
          )
        `)
        ?.eq('id', courseId)
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
      return { data: null, error: error?.message || 'Failed to fetch course details' }
    }
  },

  // Create new course (admin/instructor only)
  async createCourse(courseData) {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.insert([courseData])
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
      return { data: null, error: error?.message || 'Failed to create course' }
    }
  },

  // Update course
  async updateCourse(courseId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', courseId)
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
      return { data: null, error: error?.message || 'Failed to update course' }
    }
  },

  // Delete course
  async deleteCourse(courseId) {
    try {
      const { error } = await supabase
        ?.from('courses')
        ?.delete()
        ?.eq('id', courseId)
      
      if (error) {
        return { error: error?.message };
      }
      
      return { error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { error: error?.message || 'Failed to delete course' }
    }
  },

  // Get user's enrolled courses
  async getUserEnrollments(userId) {
    try {
      const { data, error } = await supabase
        ?.from('course_enrollments')
        ?.select(`
          *,
          course:courses(
            *,
            instructor:user_profiles!instructor_id(
              id,
              full_name,
              avatar_url
            )
          )
        `)
        ?.eq('user_id', userId)
        ?.order('enrolled_at', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to fetch user enrollments' }
    }
  },

  // Enroll user in course
  async enrollInCourse(userId, courseId) {
    try {
      const { data, error } = await supabase
        ?.from('course_enrollments')
        ?.insert([{
          user_id: userId,
          course_id: courseId,
          status: 'enrolled'
        }])
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
      return { data: null, error: error?.message || 'Failed to enroll in course' }
    }
  },

  // Get courses by instructor
  async getCoursesByInstructor(instructorId) {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.select('*')
        ?.eq('instructor_id', instructorId)
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
      return { data: null, error: error?.message || 'Failed to fetch instructor courses' }
    }
  },

  // Search courses
  async searchCourses(searchTerm) {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.select(`
          *,
          instructor:user_profiles!instructor_id(
            id,
            full_name,
            avatar_url
          )
        `)
        ?.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,topics.cs.{${searchTerm}}`)
        ?.eq('status', 'published')
        ?.order('rating', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || 'Failed to search courses' }
    }
  },

  // Get course statistics
  async getCourseStats(courseId) {
    try {
      // Get enrollments for this course
      const { data: enrollments, error: enrollmentError } = await supabase
        ?.from('course_enrollments')
        ?.select('status')
        ?.eq('course_id', courseId)
      
      if (enrollmentError) {
        return { data: null, error: enrollmentError?.message };
      }

      // Get testimonials for this course
      const { data: testimonials, error: testimonialError } = await supabase
        ?.from('testimonials')
        ?.select('rating')
        ?.eq('course_id', courseId)
        ?.eq('is_approved', true)
      
      if (testimonialError) {
        return { data: null, error: testimonialError?.message };
      }

      const stats = {
        totalEnrollments: enrollments?.length || 0,
        completedEnrollments: enrollments?.filter(e => e?.status === 'completed')?.length || 0,
        inProgressEnrollments: enrollments?.filter(e => e?.status === 'in_progress')?.length || 0,
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
      return { data: null, error: error?.message || 'Failed to fetch course statistics' }
    }
  },

  // Get courses by level
  async getCoursesByLevel(level) {
    try {
      const { data, error } = await supabase
        ?.from('courses')
        ?.select(`
          *,
          instructor:user_profiles!instructor_id(
            id,
            full_name,
            avatar_url
          )
        `)
        ?.eq('level', level)
        ?.eq('status', 'published')
        ?.order('rating', { ascending: false })
      
      if (error) {
        return { data: null, error: error?.message };
      }
      
      return { data: data || [], error: null }
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { data: null, error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' }
      }
      return { data: null, error: error?.message || `Failed to fetch ${level} courses` }
    }
  }
}