import { supabase } from '../lib/supabase';
import { processGoogleDriveUrl } from '../utils/googleDriveUtils';

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
      // Process Google Drive URL if provided
      let processedData = { ...contentData };
      
      if (contentData?.google_drive_embed_url) {
        const driveResult = processGoogleDriveUrl(contentData.google_drive_embed_url);
        
        if (driveResult.valid) {
          processedData.google_drive_id = driveResult.fileId;
          processedData.google_drive_embed_url = driveResult.embedUrl;
          processedData.google_drive_thumbnail_url = driveResult.thumbnailUrl;
        } else {
          return { data: null, error: driveResult.error };
        }
      }

      const { data, error } = await supabase?.from('content_library')?.insert([{
          title: processedData?.title,
          description: processedData?.description,
          content_type: processedData?.content_type,
          file_path: processedData?.file_path,
          google_drive_id: processedData?.google_drive_id,
          google_drive_embed_url: processedData?.google_drive_embed_url,
          google_drive_thumbnail_url: processedData?.google_drive_thumbnail_url,
          access_level: processedData?.access_level,
          category: processedData?.category,
          tags: processedData?.tags || [],
          mime_type: processedData?.mime_type,
          file_size_bytes: processedData?.file_size_bytes
        }])?.select()?.single();

      return { data, error: error?.message };
    } catch (error) {
      return { data: null, error: error?.message };
    }
  },

  // Update content
  updateContent: async (contentId, updates) => {
    try {
      // Process Google Drive URL if being updated
      let processedUpdates = { ...updates };
      
      if (updates?.google_drive_embed_url) {
        const driveResult = processGoogleDriveUrl(updates.google_drive_embed_url);
        
        if (driveResult.valid) {
          processedUpdates.google_drive_id = driveResult.fileId;
          processedUpdates.google_drive_embed_url = driveResult.embedUrl;
          processedUpdates.google_drive_thumbnail_url = driveResult.thumbnailUrl;
        } else {
          return { data: null, error: driveResult.error };
        }
      }

      const { data, error } = await supabase?.from('content_library')?.update({
          ...processedUpdates,
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
  },

  // Create content with wizard (enhanced method for new wizard)
  createContentWithWizard: async (contentData) => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Process Google Drive URL if provided
      let processedData = { ...contentData };
      
      if (contentData?.google_drive_embed_url) {
        const driveResult = processGoogleDriveUrl(contentData.google_drive_embed_url);
        
        if (driveResult.valid) {
          processedData.google_drive_id = driveResult.fileId;
          processedData.google_drive_embed_url = driveResult.embedUrl;
          processedData.google_drive_thumbnail_url = driveResult.thumbnailUrl;
        } else {
          return { success: false, error: driveResult.error };
        }
      }

      const insertData = {
        title: processedData?.title,
        description: processedData?.description,
        content_type: processedData?.content_type,
        google_drive_id: processedData?.google_drive_id,
        google_drive_embed_url: processedData?.google_drive_embed_url,
        google_drive_thumbnail_url: processedData?.google_drive_thumbnail_url,
        access_level: processedData?.access_level,
        category: processedData?.category,
        tags: processedData?.tags || [],
        status: processedData?.status || 'active',
        is_featured: processedData?.is_featured || false,
        featured_description: processedData?.featured_description || null,
        thumbnail_url: processedData?.thumbnail_url || processedData?.google_drive_thumbnail_url || null,
        featured_order: processedData?.featured_order || null,
        prompt_type: processedData?.prompt_type || null,
        use_case_tags: processedData?.use_case_tags || null,
        uploader_id: user?.id
      };

      const { data, error } = await supabase
        ?.from('content_library')
        ?.insert([insertData])
        ?.select()
        ?.single();

      if (error) {
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  // Get featured content for homepage
  getFeaturedContent: async (limit = 6) => {
    try {
      const { data, error } = await supabase
        ?.rpc('get_featured_content', { p_limit: limit });

      if (error) {
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  // Update featured status
  updateFeaturedStatus: async (contentId, featuredData) => {
    try {
      const updates = {
        is_featured: featuredData?.is_featured,
        featured_description: featuredData?.featured_description || null,
        thumbnail_url: featuredData?.thumbnail_url || null,
        featured_order: featuredData?.featured_order || null,
        updated_at: new Date()?.toISOString()
      };

      const { data, error } = await supabase
        ?.from('content_library')
        ?.update(updates)
        ?.eq('id', contentId)
        ?.select()
        ?.single();

      if (error) {
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  // Log featured content click
  logFeaturedClick: async (contentId, redirectedToLogin = false, sessionId = null, referrer = null) => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();

      const { data, error } = await supabase
        ?.rpc('log_featured_content_click', {
          p_content_id: contentId,
          p_user_id: user?.id || null,
          p_redirected_to_login: redirectedToLogin,
          p_session_id: sessionId,
          p_referrer: referrer
        });

      if (error) {
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  },

  // Check if user can access featured content
  canAccessFeaturedContent: async (contentId) => {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();

      const { data, error } = await supabase
        ?.rpc('can_access_featured_content', {
          p_content_id: contentId,
          p_user_id: user?.id || null
        });

      if (error) {
        return { success: false, hasAccess: false, error: error?.message };
      }

      return { success: true, hasAccess: data };
    } catch (error) {
      return { success: false, hasAccess: false, error: error?.message };
    }
  },

  // Get featured content analytics (admin only)
  getFeaturedAnalytics: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.p_start_date = startDate;
      if (endDate) params.p_end_date = endDate;

      const { data, error } = await supabase
        ?.rpc('get_featured_content_analytics', params);

      if (error) {
        return { success: false, error: error?.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }
};