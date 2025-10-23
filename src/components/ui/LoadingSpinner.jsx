import React from 'react';
import Icon from '../AppIcon';

/**
 * Centered loading spinner with icon
 * @param {string} size - Size of spinner: 'sm' (24px), 'md' (32px), 'lg' (48px)
 * @param {string} message - Optional loading message to display
 */
const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <Icon 
        name="Loader" 
        size={iconSizes[size]} 
        className="animate-spin text-blue-600 mb-4" 
      />
      {message && (
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
