import React from 'react';
import { getOptimizedImageProps, getWebPSource } from '../utils/imageOptimization';

/**
 * OptimizedImage Component
 * Automatically handles modern image formats, lazy loading, and responsive images
 * 
 * @example
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   width={1200}
 *   height={600}
 *   priority="high"
 * />
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  priority = 'auto',
  useModernFormats = true,
  ...rest
}) => {
  // If modern formats are enabled and it's a standard image
  if (useModernFormats && /\.(jpg|jpeg|png)$/i.test(src)) {
    const sources = getWebPSource(src);
    
    return (
      <picture>
        {/* AVIF format - best compression */}
        <source srcSet={sources.avif} type="image/avif" />
        
        {/* WebP format - good compression, wide support */}
        <source srcSet={sources.webp} type="image/webp" />
        
        {/* Fallback to original format */}
        <img
          {...getOptimizedImageProps({
            src: sources.fallback,
            alt,
            width,
            height,
            className,
            lazy,
            priority,
          })}
          {...rest}
        />
      </picture>
    );
  }

  // Standard image without format optimization
  return (
    <img
      {...getOptimizedImageProps({
        src,
        alt,
        width,
        height,
        className,
        lazy,
        priority,
      })}
      {...rest}
    />
  );
};

export default OptimizedImage;
