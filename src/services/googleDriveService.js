/**
 * Google Drive Service
 * Handles Google Drive URL validation, file ID extraction, and embed URL generation
 */

const googleDriveService = {
  /**
   * Validates Google Drive URL format
   * @param {string} url - Google Drive URL
   * @returns {object} - { isValid: boolean, error: string }
   */
  validateDriveUrl: (url) => {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    const trimmedUrl = url.trim();

    // Check if it's a Google Drive URL
    if (!trimmedUrl.includes('drive.google.com')) {
      return { isValid: false, error: 'URL must be from drive.google.com' };
    }

    // Valid Google Drive URL patterns
    const validPatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /^https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
      /^https:\/\/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/
    ];

    const isValid = validPatterns.some(pattern => pattern.test(trimmedUrl));

    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid Google Drive URL format. Use a direct file link.'
      };
    }

    return { isValid: true, error: null };
  },

  /**
   * Extracts file ID from Google Drive URL
   * @param {string} url - Google Drive URL
   * @returns {string|null} - File ID or null if not found
   */
  extractFileId: (url) => {
    if (!url) return null;

    const trimmedUrl = url.trim();

    // Pattern 1: /file/d/{fileId}/
    const pattern1 = /\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match1 = trimmedUrl.match(pattern1);
    if (match1) return match1[1];

    // Pattern 2: ?id={fileId}
    const pattern2 = /[?&]id=([a-zA-Z0-9_-]+)/;
    const match2 = trimmedUrl.match(pattern2);
    if (match2) return match2[1];

    return null;
  },

  /**
   * Generates embed URL from file ID
   * @param {string} fileId - Google Drive file ID
   * @param {string} contentType - Type of content ('video', 'pdf', 'prompt')
   * @returns {string} - Embed URL
   */
  generateEmbedUrl: (fileId, contentType) => {
    if (!fileId) return '';

    switch (contentType) {
      case 'video':
        return `https://drive.google.com/file/d/${fileId}/preview`;
      case 'pdf':
        return `https://drive.google.com/file/d/${fileId}/preview`;
      case 'prompt':
        // For Google Docs/Sheets, use the viewer
        return `https://docs.google.com/document/d/${fileId}/preview`;
      default:
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  },

  /**
   * Generates thumbnail URL from file ID
   * @param {string} fileId - Google Drive file ID
   * @param {string} size - Thumbnail size ('small'|'medium'|'large')
   * @returns {string} - Thumbnail URL
   */
  generateThumbnailUrl: (fileId, size = 'medium') => {
    if (!fileId) return '';

    const sizeMap = {
      small: 's220',
      medium: 's400',
      large: 's800'
    };

    const sizeParam = sizeMap[size] || sizeMap.medium;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${sizeParam}`;
  },

  /**
   * Generates direct download URL (opens in new tab)
   * @param {string} fileId - Google Drive file ID
   * @returns {string} - Download URL
   */
  generateDownloadUrl: (fileId) => {
    if (!fileId) return '';
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  },

  /**
   * Generates view URL (opens file in Google Drive viewer)
   * @param {string} fileId - Google Drive file ID
   * @returns {string} - View URL
   */
  generateViewUrl: (fileId) => {
    if (!fileId) return '';
    return `https://drive.google.com/file/d/${fileId}/view`;
  },

  /**
   * Checks if URL is a valid Google Drive file link
   * @param {string} url - URL to check
   * @returns {boolean}
   */
  isGoogleDriveUrl: (url) => {
    if (!url) return false;
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  },

  /**
   * Sanitizes Google Drive URL (removes tracking parameters)
   * @param {string} url - Google Drive URL
   * @returns {string} - Sanitized URL
   */
  sanitizeUrl: (url) => {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      // Remove unnecessary query parameters
      const allowedParams = ['id'];
      const params = new URLSearchParams();
      
      for (const [key, value] of urlObj.searchParams) {
        if (allowedParams.includes(key)) {
          params.set(key, value);
        }
      }

      urlObj.search = params.toString();
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  },

  /**
   * Converts various Google Drive URL formats to standard format
   * @param {string} url - Google Drive URL
   * @returns {string} - Standardized URL
   */
  standardizeUrl: (url) => {
    const fileId = googleDriveService.extractFileId(url);
    if (!fileId) return url;
    
    return `https://drive.google.com/file/d/${fileId}/view`;
  },

  /**
   * Validates that the file ID format is correct
   * @param {string} fileId - File ID to validate
   * @returns {boolean}
   */
  isValidFileId: (fileId) => {
    if (!fileId) return false;
    // Google Drive file IDs are typically alphanumeric with hyphens and underscores
    const fileIdPattern = /^[a-zA-Z0-9_-]{25,40}$/;
    return fileIdPattern.test(fileId);
  },

  /**
   * Gets the appropriate MIME type based on content type
   * @param {string} contentType - Content type ('video', 'pdf', 'prompt')
   * @returns {string} - MIME type
   */
  getMimeType: (contentType) => {
    const mimeTypes = {
      video: 'video/mp4',
      pdf: 'application/pdf',
      prompt: 'application/vnd.google-apps.document'
    };
    return mimeTypes[contentType] || 'application/octet-stream';
  },

  /**
   * Generates sharing instructions for users
   * @returns {object} - Instructions object
   */
  getSharingInstructions: () => {
    return {
      title: 'How to Share Google Drive Files',
      steps: [
        '1. Open the file in Google Drive',
        '2. Click the "Share" button',
        '3. Click "Change to anyone with the link"',
        '4. Set permission to "Viewer"',
        '5. Click "Copy link"',
        '6. Paste the link here'
      ],
      important: 'Make sure the file is set to "Anyone with the link can view"'
    };
  }
};

export { googleDriveService };
