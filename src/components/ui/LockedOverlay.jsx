import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const LockedOverlay = ({ 
  message = "Your payment is being verified. Full access coming soon!", 
  type = 'pending',
  onRenew,
  onContactSupport,
  registrationDate = null
}) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Calculate time remaining for 48-hour countdown
  useEffect(() => {
    if (type === 'pending' && registrationDate) {
      const calculateTimeRemaining = () => {
        try {
          const now = new Date();
          const registration = new Date(registrationDate);
          
          // Validate registration date
          if (isNaN(registration.getTime())) {
            console.warn('Invalid registration date:', registrationDate);
            setIsExpired(true);
            setTimeRemaining(null);
            return;
          }
          
          const expiryTime = new Date(registration.getTime() + 48 * 60 * 60 * 1000); // 48 hours from registration
          const remaining = expiryTime - now;

          if (remaining <= 0) {
            setIsExpired(true);
            setTimeRemaining(null);
          } else {
            setIsExpired(false);
            const totalHours = Math.floor(remaining / (1000 * 60 * 60));
            const totalMinutes = Math.floor(remaining / (1000 * 60));
            const hours = Math.floor(totalHours);
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            
            setTimeRemaining({
              hours,
              minutes,
              seconds,
              totalHours,
              totalMinutes,
              percentage: Math.max(0, Math.min(100, (totalHours / 48) * 100))
            });
          }
        } catch (error) {
          console.error('Error calculating countdown:', error);
          setIsExpired(true);
          setTimeRemaining(null);
        }
      };

      calculateTimeRemaining();
      const interval = setInterval(calculateTimeRemaining, 1000);

      return () => clearInterval(interval);
    }
  }, [type, registrationDate]);
  const getLockedContent = () => {
    switch (type) {
      case 'pending':
        return {
          icon: isExpired ? 'AlertCircle' : 'Clock',
          title: isExpired ? 'Approval Time Expired' : 'Account Pending Approval',
          message: isExpired 
            ? 'Your 48-hour approval window has expired. Please contact support for assistance.'
            : 'Your payment has been received and is being verified by our admin team. You\'ll get full access within 48 hours.',
          color: isExpired ? 'error' : 'warning',
          actionText: 'Contact Support',
          actionIcon: 'MessageCircle'
        };
      case 'expired':
        return {
          icon: 'Lock',
          title: 'Membership Expired',
          message: 'Your membership has expired. Renew now to continue accessing premium content.',
          color: 'error',
          actionText: 'Renew Membership',
          actionIcon: 'CreditCard'
        };
      case 'inactive':
        return {
          icon: 'UserX',
          title: 'Membership Inactive',
          message: 'Your membership is currently inactive. Please contact support to reactivate.',
          color: 'muted',
          actionText: 'Contact Support',
          actionIcon: 'MessageCircle'
        };
      default:
        return {
          icon: 'Lock',
          title: 'Access Restricted',
          message,
          color: 'warning',
          actionText: 'Contact Support',
          actionIcon: 'MessageCircle'
        };
    }
  };

  const content = getLockedContent();

  const getColorClasses = (color) => {
    const colors = {
      warning: {
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        text: 'text-warning',
        icon: 'text-warning'
      },
      error: {
        bg: 'bg-error/10',
        border: 'border-error/20',
        text: 'text-error',
        icon: 'text-error'
      },
      muted: {
        bg: 'bg-muted/30',
        border: 'border-border',
        text: 'text-muted-foreground',
        icon: 'text-muted-foreground'
      }
    };
    return colors[color] || colors.warning;
  };

  const colorClasses = getColorClasses(content.color);

  const handleAction = () => {
    if (type === 'expired' && onRenew) {
      onRenew();
    } else if (onContactSupport) {
      onContactSupport();
    } else {
      // Default action - open WhatsApp support
      const whatsappUrl = 'https://wa.me/2349062284074';
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`max-w-md w-full ${colorClasses.bg} ${colorClasses.border} border-2 rounded-2xl p-8 text-center shadow-2xl`}>
        {/* Icon */}
        <div className={`w-20 h-20 ${colorClasses.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <Icon name={content.icon} size={40} className={colorClasses.icon} />
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-bold ${colorClasses.text} mb-4`}>
          {content.title}
        </h2>

        {/* Message */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {content.message}
        </p>

        {/* 48-Hour Countdown Timer for Pending Status */}
        {type === 'pending' && !isExpired && timeRemaining && (
          <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border/50">
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Time Remaining Until Approval
              </div>
              <div className="flex justify-center items-center space-x-2 mb-3">
                <div className="bg-background border border-border rounded-lg px-3 py-2 min-w-[60px]">
                  <div className="text-2xl font-bold text-foreground">
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">Hours</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">:</div>
                <div className="bg-background border border-border rounded-lg px-3 py-2 min-w-[60px]">
                  <div className="text-2xl font-bold text-foreground">
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
                <div className="text-2xl font-bold text-muted-foreground">:</div>
                <div className="bg-background border border-border rounded-lg px-3 py-2 min-w-[60px]">
                  <div className="text-2xl font-bold text-foreground">
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-muted-foreground">Seconds</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${timeRemaining.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {timeRemaining.totalHours}h {timeRemaining.totalMinutes % 60}m remaining out of 48 hours
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-3">
          <Button
            variant="default"
            size="lg"
            onClick={handleAction}
            className="w-full"
          >
            <Icon name={content.actionIcon} size={20} className="mr-2" />
            {content.actionText}
          </Button>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground">
            {type === 'pending' && (
              <p>You can still browse the dashboard while waiting for verification</p>
            )}
            {type === 'expired' && (
              <p>Renew now to restore access to all premium content</p>
            )}
          </div>
        </div>

        {/* Support Contact */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-3">
            Need immediate assistance?
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
            className="w-full"
          >
            <Icon name="MessageCircle" size={16} className="mr-2" />
            WhatsApp Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LockedOverlay;
