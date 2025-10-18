import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickActionCard = ({
  title,
  description,
  icon,
  buttonText,
  buttonVariant = 'outline',
  badge,
  onClick,
  loading = false
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {badge && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-warning/10 text-warning rounded-full mt-1">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        {description}
      </p>
      
      <div className="flex justify-end">
        <Button
          variant={buttonVariant}
          size="sm"
          onClick={onClick}
          loading={loading}
          className="font-medium"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default QuickActionCard;