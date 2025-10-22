import React from 'react';
import Icon from '../AppIcon';

/**
 * Stat card component for displaying key metrics
 * Modern AI-inspired design with animated gradients
 */
const StatCard = ({
  label,
  value,
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon,
  trend,
  color = 'blue',
  loading = false,
  onClick,
  className = '',
}) => {
  const colorSchemes = {
    blue: {
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      iconBg: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
    },
    purple: {
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      iconBg: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
    },
    emerald: {
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      iconBg: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
    },
    amber: {
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      iconBg: 'bg-amber-500',
      lightBg: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
    },
    pink: {
      gradient: 'from-pink-500 via-rose-600 to-red-600',
      iconBg: 'bg-pink-500',
      lightBg: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
    },
    cyan: {
      gradient: 'from-cyan-500 via-sky-600 to-blue-600',
      iconBg: 'bg-cyan-500',
      lightBg: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      textColor: 'text-cyan-700',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;
  const isClickable = !!onClick;

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-emerald-600 bg-emerald-50';
    if (changeType === 'negative') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 border ${scheme.borderColor} ${className}`}>
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
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
        group relative bg-white rounded-2xl p-6 border ${scheme.borderColor}
        transition-all duration-300 ease-out overflow-hidden
        hover:shadow-card-hover hover:-translate-y-1
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Animated gradient background */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-10
        bg-gradient-to-br ${scheme.gradient}
        transition-opacity duration-500
      `} />

      {/* Decorative circle */}
      <div className={`
        absolute -right-6 -top-6 w-24 h-24 rounded-full
        bg-gradient-to-br ${scheme.gradient}
        opacity-5 group-hover:opacity-10
        transition-opacity duration-500
      `} />

      <div className="relative">
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-2xl mb-4
          flex items-center justify-center
          bg-gradient-to-br ${scheme.gradient}
          shadow-lg
          transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6
        `}>
          <Icon name={icon} size={28} className="text-white" />
        </div>

        {/* Value */}
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {value}
        </div>

        {/* Label */}
        <div className="text-sm font-medium text-gray-600 mb-3">
          {label}
        </div>

        {/* Change indicator */}
        {change && (
          <div className={`
            inline-flex items-center space-x-1 px-2.5 py-1 rounded-full
            ${getChangeColor()}
          `}>
            <Icon name={getChangeIcon()} size={14} />
            <span className="text-xs font-medium">
              {change}
            </span>
          </div>
        )}

        {/* Trend visualization */}
        {trend && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Trend</span>
              <span className="font-medium">{trend}</span>
            </div>
          </div>
        )}

        {/* Click indicator */}
        {isClickable && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon name="ArrowUpRight" size={16} className="text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
