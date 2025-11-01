import React from 'react';
import Icon from '../AppIcon';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';

/**
 * Action card component for quick access features
 * AI-inspired design with gradient accents
 */
const ActionCard = ({
  title,
  description,
  icon,
  iconColor = 'primary',
  buttonText = 'Action',
  buttonVariant = 'default',
  onClick,
  badge,
  loading = false,
  disabled = false,
  className = '',
}) => {
  const iconColors = {
    primary: 'text-blue-600 bg-blue-100',
    secondary: 'text-purple-600 bg-purple-100',
    success: 'text-emerald-600 bg-emerald-100',
    warning: 'text-amber-600 bg-amber-100',
    error: 'text-red-600 bg-red-100',
    info: 'text-cyan-600 bg-cyan-100',
  };

  const gradients = {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-purple-500 to-purple-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    error: 'from-red-500 to-red-600',
    info: 'from-cyan-500 to-cyan-600',
  };

  const colorClass = iconColors[iconColor] || iconColors.primary;
  const gradientClass = gradients[iconColor] || gradients.primary;

  return (
    <div 
      className={`
        group relative bg-white rounded-2xl p-6 border border-gray-200
        transition-all duration-300 ease-out
        hover:shadow-card-hover hover:-translate-y-1
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Gradient accent bar */}
      <div className={`
        absolute top-0 left-0 right-0 h-1 rounded-t-2xl
        bg-gradient-to-r ${gradientClass}
        transform scale-x-0 group-hover:scale-x-100
        transition-transform duration-300 origin-left
      `} />

      {/* Content */}
      <div className="relative">
        {/* Icon and badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center
            ${colorClass}
            transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
          `}>
            <Icon name={icon} size={28} />
          </div>
          
          {badge && (
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-full">
              {badge}
            </span>
          )}
        </div>

        {/* Text content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action button */}
        <Button
          onClick={onClick}
          variant={buttonVariant}
          loading={loading}
          disabled={disabled}
          className="w-full"
          iconName="ArrowRight"
          iconPosition="right"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default ActionCard;
