import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ 
  title, 
  value, 
  icon, 
  trend = null, 
  trendDirection = 'up', 
  subtitle = null,
  color = 'primary',
  onClick = null 
}) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'success':
        return {
          bg: 'bg-success/10',
          border: 'border-success/20',
          icon: 'text-success',
          text: 'text-success'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/20',
          icon: 'text-warning',
          text: 'text-warning'
        };
      case 'error':
        return {
          bg: 'bg-error/10',
          border: 'border-error/20',
          icon: 'text-error',
          text: 'text-error'
        };
      case 'secondary':
        return {
          bg: 'bg-secondary/10',
          border: 'border-secondary/20',
          icon: 'text-secondary',
          text: 'text-secondary'
        };
      default:
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/20',
          icon: 'text-primary',
          text: 'text-primary'
        };
    }
  };

  const colorClasses = getColorClasses(color);
  const isClickable = onClick !== null;

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 transition-all duration-200 ${
        isClickable ? 'hover:shadow-md hover:border-primary/30 cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-10 h-10 ${colorClasses?.bg} ${colorClasses?.border} border rounded-lg flex items-center justify-center`}>
              <Icon name={icon} size={20} className={colorClasses?.icon} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-foreground">{value}</span>
            {trend && (
              <div className={`flex items-center space-x-1 text-sm ${
                trendDirection === 'up' ? 'text-success' : 
                trendDirection === 'down' ? 'text-error' : 'text-muted-foreground'
              }`}>
                <Icon 
                  name={trendDirection === 'up' ? 'TrendingUp' : 
                        trendDirection === 'down' ? 'TrendingDown' : 'Minus'} 
                  size={14} 
                />
                <span>{trend}</span>
              </div>
            )}
          </div>
        </div>
        
        {isClickable && (
          <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

export default MetricsCard;