/**
 * Security utilities for input sanitization and validation
 */

/**
 * Escape HTML entities to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text safe for HTML rendering
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Sanitize user input for safe display in HTML
 * @param {string} input - User input to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} - Sanitized HTML safe for rendering
 */
export const sanitizeHtml = (input, options = {}) => {
  const {
    allowLineBreaks = true,
    allowLinks = false,
    maxLength = 10000
  } = options;

  if (typeof input !== 'string') return '';

  // Truncate input if too long
  let sanitized = input.substring(0, maxLength);

  // Escape HTML entities
  sanitized = escapeHtml(sanitized);

  // Optionally allow line breaks
  if (allowLineBreaks) {
    sanitized = sanitized.replace(/\n/g, '<br>');
  }

  // Optionally allow basic links (additional security risk)
  if (allowLinks) {
    // Simple URL regex - use with caution
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    sanitized = sanitized.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  return sanitized;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with details
 */
export const validatePassword = (password) => {
  const validations = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const strength = Object.values(validations).filter(Boolean).length;
  const maxStrength = Object.keys(validations).length;

  return {
    isValid: strength === maxStrength && password.length >= 12,
    strength: (strength / maxStrength) * 100,
    validations,
    suggestions: [
      !validations.length && 'Use at least 12 characters',
      !validations.lowercase && 'Include lowercase letters',
      !validations.uppercase && 'Include uppercase letters',
      !validations.number && 'Include numbers',
      !validations.special && 'Include special characters'
    ].filter(Boolean)
  };
};

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of the random string
 * @param {string} charset - Character set to use
 * @returns {string} - Random string
 */
export const generateSecureRandom = (length = 32, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  const values = new Uint32Array(length);
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(values);
  } else {
    // Fallback for older browsers (less secure)
    for (let i = 0; i < length; i++) {
      values[i] = Math.random() * 0xFFFFFFFF;
    }
  }

  for (let i = 0; i < length; i++) {
    result += charset[values[i] % charset.length];
  }

  return result;
};

/**
 * Check if a URL is safe (same origin or allowlisted)
 * @param {string} url - URL to check
 * @param {string[]} allowedDomains - Array of allowed domains
 * @returns {boolean} - True if URL is safe
 */
export const isSafeUrl = (url, allowedDomains = []) => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    
    // Allow same origin
    if (parsedUrl.origin === window.location.origin) {
      return true;
    }

    // Check allowlist
    return allowedDomains.some(domain => {
      try {
        const allowedUrl = new URL(domain);
        return parsedUrl.origin === allowedUrl.origin;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
};

/**
 * Create a safe redirect URL
 * @param {string} url - Potential redirect URL
 * @param {string} fallback - Fallback URL if unsafe
 * @returns {string} - Safe redirect URL
 */
export const createSafeRedirect = (url, fallback = '/') => {
  if (isSafeUrl(url)) {
    return url;
  }
  return fallback;
};

/**
 * Sanitize filename to prevent directory traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return '';

  // Remove path separators and dangerous characters
  return filename
    .replace(/[\\/]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/[<>:"|?*]/g, '_')
    .substring(0, 255); // Limit length
};

/**
 * Rate limiting utility for client-side operations
 */
export class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  isAllowed() {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  reset() {
    this.requests = [];
  }

  timeUntilNextRequest() {
    const now = Date.now();
    const oldestRequest = this.requests[0];
    if (!oldestRequest || this.requests.length < this.maxRequests) {
      return 0;
    }
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }
}

/**
 * Security constants
 */
export const SECURITY_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  PASSWORD_MIN_LENGTH: 12,
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000 // 5 minutes
};