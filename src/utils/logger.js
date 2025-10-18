/**
 * Logger utility for consistent logging across the application
 * Provides environment-aware logging to prevent logs in production
 */

export const logger = {
  /**
   * Info level logging - only in development
   * @param {...any} args - Arguments to log
   */
  info: (...args) => {
    if (import.meta.env.MODE !== 'production') {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Debug level logging - only when DEBUG=true
   * @param {...any} args - Arguments to log
   */
  debug: (...args) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Warning level logging - always enabled
   * @param {...any} args - Arguments to log
   */
  warn: (...args) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error level logging - always enabled
   * @param {...any} args - Arguments to log
   */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Check if logging is enabled for current environment
   * @returns {boolean} True if logging is enabled
   */
  isEnabled: () => {
    return import.meta.env.MODE !== 'production' || import.meta.env.VITE_DEBUG === 'true';
  }
};

export default logger;
