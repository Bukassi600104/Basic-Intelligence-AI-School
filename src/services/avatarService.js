import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export const avatarService = {
  /**
   * Upload avatar to Supabase Storage
   * @param {File} file - The image file to upload
   * @param {string} userId - The user's ID
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async uploadAvatar(file, userId) {
    try {
      // Validate file
      const validation = this.validateAvatarFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Create unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        logger.error('Avatar upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      // Update user profile with avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        logger.error('Profile update error:', updateError);
        return { success: false, error: updateError.message };
      }

      logger.info('Avatar uploaded successfully:', publicUrl);
      return { success: true, url: publicUrl };
    } catch (error) {
      logger.error('Avatar upload exception:', error);
      return { success: false, error: error.message || 'Failed to upload avatar' };
    }
  },

  /**
   * Delete avatar from Supabase Storage
   * @param {string} avatarUrl - The current avatar URL
   * @param {string} userId - The user's ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteAvatar(avatarUrl, userId) {
    try {
      if (!avatarUrl) {
        return { success: true };
      }

      // Extract file path from URL
      const urlParts = avatarUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'user-avatars');
      if (bucketIndex === -1) {
        return { success: false, error: 'Invalid avatar URL' };
      }

      const filePath = urlParts.slice(bucketIndex + 1).join('/');

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('user-avatars')
        .remove([filePath]);

      if (deleteError) {
        logger.error('Avatar deletion error:', deleteError);
        return { success: false, error: deleteError.message };
      }

      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        logger.error('Profile update error:', updateError);
        return { success: false, error: updateError.message };
      }

      logger.info('Avatar deleted successfully');
      return { success: true };
    } catch (error) {
      logger.error('Avatar deletion exception:', error);
      return { success: false, error: error.message || 'Failed to delete avatar' };
    }
  },

  /**
   * Validate avatar file
   * @param {File} file - The file to validate
   * @returns {{isValid: boolean, error?: string}}
   */
  validateAvatarFile(file) {
    // Check file existence
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' };
    }

    return { isValid: true };
  },

  /**
   * Get avatar preview URL from file
   * @param {File} file - The image file
   * @returns {string} - Data URL for preview
   */
  getPreviewUrl(file) {
    return URL.createObjectURL(file);
  },

  /**
   * Revoke preview URL to free memory
   * @param {string} url - The preview URL to revoke
   */
  revokePreviewUrl(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
};
