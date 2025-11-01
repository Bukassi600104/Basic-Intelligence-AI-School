import React from 'react';
import Icon from '../AppIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';

/**
 * Professional dashboard card component with AI-inspired design
 * Features: Gradient backgrounds, hover effects, shadows, icons
 */
const DashboardCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendDirection = 'neutral', 
  color = 'primary',
  onClick,
  loading = false,
  className = '',
  children
}) => {
  const colorConfig = {
    primary: {
      bg: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trendUp: 'text-blue-600',
      trendDown: 'text-red-600',
    },
    secondary: {
      bg: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trendUp: 'text-purple-600',
      trendDown: 'text-red-600',
    },
    success: {
      bg: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trendUp: 'text-emerald-600',
      trendDown: 'text-red-600',
    },
    warning: {
      bg: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trendUp: 'text-amber-600',
      trendDown: 'text-red-600',
    },
    error: {
      bg: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      trendUp: 'text-red-600',
      trendDown: 'text-red-700',
    },
    info: {
      bg: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      trendUp: 'text-cyan-600',
      trendDown: 'text-red-600',
    },
  };

  const config = colorConfig[color] || colorConfig.primary;
  const isClickable = !!onClick;

  const getTrendColor = () => {
    if (trendDirection === 'up') return config.trendUp;
    if (trendDirection === 'down') return config.trendDown;
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trendDirection === 'up') return 'TrendingUp';
    if (trendDirection === 'down') return 'TrendingDown';
    return 'Minus';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`
        group relative bg-white rounded-2xl p-6 border border-gray-200
        transition-all duration-300 ease-out
        hover:shadow-card-hover hover:-translate-y-1
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Gradient overlay on hover */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5
        transition-opacity duration-300
        bg-gradient-to-br ${config.bg}
      `} />

      <div className="relative">
        {/* Header with icon and trend */}
        <div className="flex items-center justify-between mb-4">
          {icon && (
            <div className={`
              w-12 h-12 ${config.iconBg} rounded-xl
              flex items-center justify-center
              transition-transform duration-300 group-hover:scale-110
            `}>
              <Icon name={icon} size={24} className={config.iconColor} />
            </div>
          )}
          
          {trend && (
            <div className="flex items-center space-x-1">
              <Icon name={getTrendIcon()} size={16} className={getTrendColor()} />
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {children || (
          <>
            {/* Main value */}
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {value}
            </div>

            {/* Title and subtitle */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          </>
        )}

        {/* Click indicator */}
        {isClickable && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon name="ArrowRight" size={16} className="text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
