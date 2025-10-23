import React from 'react';

/**
 * Centered loading spinner using the app logo
 * @param {string} size - Size of the logo: 'sm' (40px), 'md' (64px), 'lg' (96px)
 * @param {string} message - Optional loading message to display
 */
const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className={`${sizeClasses[size]} animate-pulse mb-4`}>
        <img 
          src="/assets/images/logo-bg.png" 
          alt="Loading..." 
          className="w-full h-full object-contain"
        />
      </div>
      {message && (
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
