/**
 * Google Drive Utilities
 * Handles extraction of FILE_ID from various Google Drive URL formats
 * and generates proper thumbnail URLs for display
 */

/**
 * Extract Google Drive FILE_ID from various URL formats
 * Supported formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/file/d/FILE_ID/preview
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://docs.google.com/file/d/FILE_ID/view
 * 
 * @param {string} url - Google Drive URL
 * @returns {string|null} - Extracted FILE_ID or null if not found
 */
export const extractGoogleDriveId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove whitespace
  url = url.trim();

  // Pattern matchers for different URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,           // /file/d/FILE_ID
    /\/d\/([a-zA-Z0-9_-]+)/,                 // /d/FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/,               // ?id=FILE_ID or &id=FILE_ID
    /\/open\?id=([a-zA-Z0-9_-]+)/,           // /open?id=FILE_ID
    /\/uc\?id=([a-zA-Z0-9_-]+)/,             // /uc?id=FILE_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generate Google Drive thumbnail URL from FILE_ID
 * Uses Google Drive's thumbnail API with size parameter
 * 
 * @param {string} fileId - Google Drive FILE_ID
 * @param {number} size - Thumbnail width in pixels (default: 400)
 * @returns {string} - Thumbnail URL
 */
export const generateThumbnailUrl = (fileId, size = 400) => {
  if (!fileId) {
    return null;
  }
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
};

/**
 * Generate Google Drive embed URL from FILE_ID
 * Used for iframe embeds and full video playback
 * 
 * @param {string} fileId - Google Drive FILE_ID
 * @returns {string} - Embed URL for preview
 */
export const generateEmbedUrl = (fileId) => {
  if (!fileId) {
    return null;
  }
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

/**
 * Process Google Drive URL and return both FILE_ID and generated URLs
 * This is the main function to use when handling Drive URLs
 * 
 * @param {string} url - Original Google Drive URL from user
 * @param {number} thumbnailSize - Thumbnail width (default: 400)
 * @returns {object} - Object containing fileId, embedUrl, and thumbnailUrl
 */
export const processGoogleDriveUrl = (url, thumbnailSize = 400) => {
  const fileId = extractGoogleDriveId(url);
  
  if (!fileId) {
    return {
      valid: false,
      fileId: null,
      embedUrl: null,
      thumbnailUrl: null,
      error: 'Invalid Google Drive URL format. Please use a sharing link from Google Drive.'
    };
  }

  return {
    valid: true,
    fileId,
    embedUrl: generateEmbedUrl(fileId),
    thumbnailUrl: generateThumbnailUrl(fileId, thumbnailSize),
    error: null
  };
};

/**
 * Validate if a URL is a valid Google Drive URL
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid Google Drive URL
 */
export const isValidGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const drivePatterns = [
    /^https?:\/\/drive\.google\.com/,
    /^https?:\/\/docs\.google\.com/
  ];

  return drivePatterns.some(pattern => pattern.test(url.trim()));
};

/**
 * Get responsive thumbnail sizes for different use cases
 */
export const THUMBNAIL_SIZES = {
  SMALL: 200,    // For grid thumbnails
  MEDIUM: 400,   // Default size
  LARGE: 800,    // For detail views
  XLARGE: 1200   // For full screen
};

/**
 * Generate multiple thumbnail URLs at different sizes
 * Useful for responsive images with srcset
 * 
 * @param {string} fileId - Google Drive FILE_ID
 * @returns {object} - Object with thumbnail URLs at different sizes
 */
export const generateResponsiveThumbnails = (fileId) => {
  if (!fileId) {
    return null;
  }

  return {
    small: generateThumbnailUrl(fileId, THUMBNAIL_SIZES.SMALL),
    medium: generateThumbnailUrl(fileId, THUMBNAIL_SIZES.MEDIUM),
    large: generateThumbnailUrl(fileId, THUMBNAIL_SIZES.LARGE),
    xlarge: generateThumbnailUrl(fileId, THUMBNAIL_SIZES.XLARGE)
  };
};
