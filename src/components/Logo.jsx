                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ 
  size = 'medium', 
  showText = true, 
  linkTo = '/', 
  className = '', 
  textClassName = '',
  imageClassName = ''
}) => {
  const sizes = {
    small: 'h-6',
    medium: 'h-8', 
    large: 'h-12',
    xlarge: 'h-16'
  };

  const logoContent = (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        {/* Enhanced transparency container */}
        <div className="absolute inset-0 bg-transparent rounded-lg opacity-0"></div>
        <img 
          src="/assets/images/logo-bg.png" 
          alt="Basic Intelligence Community School Logo - BKO with technological network design elements featuring transparent background" 
          className={`w-auto ${sizes?.[size]} object-contain ${imageClassName} relative z-10`}
          style={{ 
            backgroundColor: 'transparent',
            // Enhanced transparency and visibility
            mixBlendMode: 'multiply',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1)) drop-shadow(0 1px 1px rgba(0,0,0,0.06))',
            isolation: 'isolate',
            // Ensure proper transparency handling
            imageRendering: 'crisp-edges',
            WebkitMaskImage: 'linear-gradient(black, black)',
            maskImage: 'linear-gradient(black, black)'
          }}
          onError={(e) => {
            // Fallback if image fails to load
            e.target.style.display = 'none';
          }}
          onLoad={(e) => {
            // Ensure transparency after load
            e.target.style.backgroundColor = 'transparent';
          }}
        />
      </div>
      {showText && (
        <div className={`flex flex-col ${textClassName}`}>
          <span className="font-bold text-foreground leading-tight">
            Basic Intelligence
          </span>
          <span className="text-xs text-muted-foreground leading-tight">
            Community School
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
