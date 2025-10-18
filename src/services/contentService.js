import { supabase } from '../lib/supabase';

export const contentService = {
  // Get content based on user's tier access
  getAccessibleContent: async (contentType = null, category = null) => {
    try {
      let query = supabase?.from('content_library')?.select(`*,uploader:user_profiles!uploader_id(full_name)`)?.eq('status', 'active');

      if (contentType) {
        query = query?.eq('content_type', contentType);
      }

      if (category) {
        query = query?.eq('category', category);
      }

      const { data, error } = await query?.order('created_at', { ascending: false });

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get all content (admin only)
  getAllContent: async () => {
    try {
      const { data, error } = await supabase?.from('content_library')?.select(`
          *,
          uploader:user_profiles!uploader_id(full_name)
        `)?.order('created_at', { ascending: false });

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Create new content
  createContent: async (contentData) => {
    try {
      const { data, error } = await supabase?.from('content_library')?.insert([{
          title: contentData?.title,
          description: contentData?.description,
          content_type: contentData?.content_type,
          file_path: contentData?.file_path,
          google_drive_id: contentData?.google_drive_id,
          google_drive_embed_url: contentData?.google_drive_embed_url,
          access_level: contentData?.access_level,
          category: contentData?.category,
          tags: contentData?.tags || [],
          mime_type: contentData?.mime_type,
          file_size_bytes: contentData?.file_size_bytes
        }])?.select()?.single();

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Update content
  updateContent: async (contentId, updates) => {
    try {
      const { data, error } = await supabase?.from('content_library')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', contentId)?.select()?.single();

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Delete content
  deleteContent: async (contentId) => {
    try {
      const { error } = await supabase?.from('content_library')?.delete()?.eq('id', contentId);

      return { data: true, error: error?.message };
    } catch (error) {
      return { data: false, error: error?.message };
    }
  },

  // Upload file to Supabase storage
  uploadFile: async (bucket, filePath, file, options = {}) => {
    try {
      const { data, error } = await supabase?.storage?.from(bucket)?.upload(filePath, file, {
          cacheControl: '3600',
          upsert: options?.upsert || false,
          ...options
        });

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get signed URL for private files
  getSignedUrl: async (bucket, filePath, expirySeconds = 3600) => {
    try {
      const { data, error } = await supabase?.storage?.from(bucket)?.createSignedUrl(filePath, expirySeconds);

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // List files in storage bucket
  listFiles: async (bucket, folderPath = '', options = {}) => {
    try {
      const { data, error } = await supabase?.storage?.from(bucket)?.list(folderPath, {
          limit: options?.limit || 100,
          offset: options?.offset || 0,
          sortBy: options?.sortBy || { column: 'name', order: 'asc' }
        });

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Link video to course
  addVideoToCourse: async (courseId, videoId, sequenceOrder = 1) => {
    try {
      const { data, error } = await supabase?.from('course_videos')?.insert([{
          course_id: courseId,
          video_id: videoId,
          sequence_order: sequenceOrder
        }])?.select()?.single();

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get videos for a course
  getCourseVideos: async (courseId) => {
    try {
      const { data, error } = await supabase?.from('course_videos')?.select(`
          *,
          video:content_library(*)
        `)?.eq('course_id', courseId)?.order('sequence_order', { ascending: true });

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Log user content access
  logContentAccess: async (contentId, durationMinutes = 0, completionPercentage = 0) => {
    try {
      const { data, error } = await supabase?.from('user_content_access')?.insert([{
          content_id: contentId,
          access_duration_minutes: durationMinutes,
          completion_percentage: completionPercentage
        }])?.select()?.single();

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Get user's content access history
  getUserContentAccess: async (userId = null) => {
    try {
      let query = supabase?.from('user_content_access')?.select(`
          *,
          content:content_library(title, content_type, category)
        `)?.order('accessed_at', { ascending: false });

      if (userId) {
        query = query?.eq('user_id', userId);
      }

      const { data, error } = await query;

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  }
};