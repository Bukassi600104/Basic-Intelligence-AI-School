import React from 'react';

/**
 * Geometric Background with scattered squares pattern
 * Used for hero sections and auth pages
 */
export default function GeometricBackground({ children, className = '' }) {
  return (
    <div className={`relative bg-gradient-to-br from-dark-800 to-dark-900 overflow-hidden ${className}`}>
      {/* Base gradient overlays */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-3/5 h-3/5 bg-gradient-radial from-orange-500/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-2/5 h-2/5 bg-gradient-radial from-orange-600/5 to-transparent"></div>
      </div>
      
      {/* Scattered geometric squares - Top right cluster */}
      <div className="absolute top-20 right-32 w-12 h-12 bg-orange-500/20 rounded animate-float"></div>
      <div className="absolute top-40 right-64 w-8 h-8 bg-orange-400/25 rounded animate-float-delayed"></div>
      <div className="absolute top-60 right-20 w-16 h-16 bg-orange-600/15 rounded animate-float"></div>
      <div className="absolute top-32 right-96 w-10 h-10 bg-brand-primary/20 rounded animate-float"></div>
      <div className="absolute top-72 right-48 w-14 h-14 bg-orange-700/10 rounded animate-float-delayed"></div>
      
      {/* Scattered geometric squares - Bottom left cluster */}
      <div className="absolute bottom-40 left-32 w-10 h-10 bg-orange-500/20 rounded animate-float-delayed"></div>
      <div className="absolute bottom-20 left-64 w-14 h-14 bg-orange-400/15 rounded animate-float"></div>
      <div className="absolute bottom-60 left-20 w-12 h-12 bg-orange-600/20 rounded animate-float-delayed"></div>
      <div className="absolute bottom-32 left-96 w-8 h-8 bg-brand-primary/25 rounded animate-float"></div>
      <div className="absolute bottom-72 left-48 w-16 h-16 bg-orange-700/15 rounded animate-float-delayed"></div>
      
      {/* Additional scattered elements */}
      <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-orange-300/20 rounded animate-float"></div>
      <div className="absolute top-1/3 left-1/3 w-10 h-10 bg-orange-800/15 rounded animate-float-delayed"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
