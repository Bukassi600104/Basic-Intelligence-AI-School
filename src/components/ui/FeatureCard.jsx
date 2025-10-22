import React from 'react';
import Icon from '../AppIcon';

/**
 * Feature card for displaying content, courses, or features
 * AI-inspired design with glass morphism effect
 */
const FeatureCard = ({
  title,
  description,
  icon,
  image,
  badge,
  tags = [],
  onClick,
  actionText = 'View',
  color = 'blue',
  variant = 'default', // 'default', 'glass', 'gradient'
  loading = false,
  className = '',
}) => {
  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-100 text-blue-600',
      badgeBg: 'bg-blue-500',
      tagBg: 'bg-blue-50 text-blue-700',
    },
    purple: {
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-100 text-purple-600',
      badgeBg: 'bg-purple-500',
      tagBg: 'bg-purple-50 text-purple-700',
    },
    emerald: {
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100 text-emerald-600',
      badgeBg: 'bg-emerald-500',
      tagBg: 'bg-emerald-50 text-emerald-700',
    },
    amber: {
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-amber-100 text-amber-600',
      badgeBg: 'bg-amber-500',
      tagBg: 'bg-amber-50 text-amber-700',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  const variantStyles = {
    default: 'bg-white border border-gray-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
    gradient: `bg-gradient-to-br ${scheme.gradient} text-white border-0`,
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-6 ${variantStyles.default} ${className}`}>
        <div className="animate-pulse space-y-4">
          {image && <div className="w-full h-40 bg-gray-200 rounded-xl"></div>}
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
          <div className="w-full h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const isGradient = variant === 'gradient';
  const textColor = isGradient ? 'text-white' : 'text-gray-900';
  const descColor = isGradient ? 'text-white/90' : 'text-gray-600';

  return (
    <div
      onClick={onClick}
      className={`
        group relative rounded-2xl p-6 overflow-hidden
        transition-all duration-300 ease-out
        hover:shadow-card-hover hover:-translate-y-1
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Decorative elements for gradient variant */}
      {variant === 'gradient' && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
        </>
      )}

      <div className="relative">
        {/* Image if provided */}
        {image && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-40 object-cover transform transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        )}

        {/* Icon and badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center
            ${isGradient ? 'bg-white/20 text-white' : scheme.iconBg}
            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6
          `}>
            <Icon name={icon} size={28} />
          </div>
          
          {badge && (
            <span className={`
              px-3 py-1 rounded-full text-xs font-medium text-white
              ${scheme.badgeBg}
            `}>
              {badge}
            </span>
          )}
        </div>

        {/* Title and description */}
        <h3 className={`text-xl font-bold mb-2 ${textColor}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed mb-4 ${descColor}`}>
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={`
                  px-2.5 py-1 rounded-lg text-xs font-medium
                  ${isGradient ? 'bg-white/20 text-white' : scheme.tagBg}
                `}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action area */}
        {onClick && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className={`text-sm font-medium ${isGradient ? 'text-white' : scheme.iconBg.split(' ')[1]}`}>
              {actionText}
            </span>
            <Icon
              name="ArrowRight"
              size={16}
              className={`
                transform transition-transform duration-300 group-hover:translate-x-1
                ${isGradient ? 'text-white' : 'text-gray-400'}
              `}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureCard;
