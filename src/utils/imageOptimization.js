/**
 * Image Optimization Utilities
 * Provides utilities for responsive images, modern formats, and performance
 */

/**
 * OptimizedImage component props helper
 * @param {string} src - Original image source
 * @param {string} alt - Alt text for accessibility
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} className - Additional CSS classes
 * @param {boolean} lazy - Enable lazy loading (default: true)
 * @param {string} priority - Priority hint: 'high' | 'low' | 'auto'
 * @returns {object} Props object for img element
 */
export const getOptimizedImageProps = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  priority = 'auto',
}) => {
  const props = {
    src,
    alt,
    className,
    // Always include dimensions to prevent layout shift
    width,
    height,
    // Modern decoding attribute
    decoding: priority === 'high' ? 'sync' : 'async',
  };

  // Add lazy loading for non-critical images
  if (lazy && priority !== 'high') {
    props.loading = 'lazy';
  }

  // Add fetchpriority for critical images
  if (priority === 'high') {
    props.fetchpriority = 'high';
  } else if (priority === 'low') {
    props.fetchpriority = 'low';
  }

  return props;
};

/**
 * Generate srcset for responsive images
 * @param {string} basePath - Base image path without extension
 * @param {string} extension - Image extension (jpg, png, etc)
 * @param {Array<number>} widths - Array of widths for srcset
 * @returns {string} srcset string
 */
export const generateSrcSet = (basePath, extension, widths = [320, 640, 960, 1280, 1920]) => {
  return widths
    .map((width) => `${basePath}-${width}w.${extension} ${width}w`)
    .join(', ');
};

/**
 * Get WebP source with fallback
 * @param {string} src - Original image source
 * @returns {object} Picture element sources
 */
export const getWebPSource = (src) => {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const avifSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.avif');
  
  return {
    avif: avifSrc,
    webp: webpSrc,
    fallback: src,
  };
};

/**
 * Preload critical images
 * @param {string} src - Image source
 * @param {string} type - Image MIME type
 */
export const preloadImage = (src, type = 'image/jpeg') => {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  link.type = type;
  document.head.appendChild(link);
};

/**
 * Image placeholder for lazy loading
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Data URL for placeholder
 */
export const getImagePlaceholder = (width, height) => {
  const aspectRatio = height / width;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Check if browser supports modern image formats
 */
export const checkImageFormatSupport = () => {
  if (typeof window === 'undefined') return { webp: false, avif: false };
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return {
    webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
    avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
  };
};

export default {
  getOptimizedImageProps,
  generateSrcSet,
  getWebPSource,
  preloadImage,
  getImagePlaceholder,
  checkImageFormatSupport,
};
