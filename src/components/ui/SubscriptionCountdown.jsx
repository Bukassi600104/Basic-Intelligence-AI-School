import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const SubscriptionCountdown = ({ 
  endDate, 
  periodType = 'monthly',
  onRenew,
  className = '' 
}) => {
  const [remainingDays, setRemainingDays] = useState(0);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    const calculateRemainingDays = () => {
      if (!endDate) return;
      
      const now = new Date();
      const end = new Date(endDate);
      const diffTime = end - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setRemainingDays(diffDays);
      
      // Determine status
      if (diffDays <= 0) {
        setStatus('expired');
      } else if (diffDays <= 7) {
        setStatus('expiring');
      } else {
        setStatus('active');
      }
    };

    calculateRemainingDays();
    
    // Update every hour
    const interval = setInterval(calculateRemainingDays, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [endDate]);

  const getStatusConfig = () => {
    switch (status) {
      case 'expired':
        return {
          icon: 'AlertTriangle',
          color: 'error',
          bgColor: 'bg-error/10',
          textColor: 'text-error',
          borderColor: 'border-error/20',
          message: 'Membership expired',
          actionText: 'Renew Now'
        };
      case 'expiring':
        return {
          icon: 'Clock',
          color: 'warning',
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/20',
          message: `${remainingDays} days left`,
          actionText: 'Renew'
        };
      default:
        return {
          icon: 'CheckCircle',
          color: 'success',
          bgColor: 'bg-success/10',
          textColor: 'text-success',
          borderColor: 'border-success/20',
          message: `${remainingDays} days left`,
          actionText: 'Manage'
        };
    }
  };

  const config = getStatusConfig();
  const periodLabel = periodType === 'monthly' ? 'month' : 'year';

  if (!endDate) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Status Badge */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <Icon name={config.icon} size={16} className={config.textColor} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.message}
        </span>
      </div>

      {/* Period Info */}
      <div className="text-sm text-muted-foreground">
        {status === 'expired' ? (
          <span>Your {periodLabel}ly membership has ended</span>
        ) : (
          <span>{remainingDays} days left this {periodLabel}</span>
        )}
      </div>

      {/* Action Button */}
      {(status === 'expired' || status === 'expiring') && onRenew && (
        <button
          onClick={onRenew}
          className={`text-sm font-medium ${config.textColor} hover:underline`}
        >
          {config.actionText}
        </button>
      )}
    </div>
  );
};

export default SubscriptionCountdown;
