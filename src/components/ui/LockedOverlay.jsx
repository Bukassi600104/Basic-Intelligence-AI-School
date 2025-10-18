import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const LockedOverlay = ({ 
  message = "Your payment is being verified. Full access coming soon!", 
  type = 'pending',
  onRenew,
  onContactSupport 
}) => {
  const getLockedContent = () => {
    switch (type) {
      case 'pending':
        return {
          icon: 'Clock',
          title: 'Payment Verification in Progress',
          message: 'Your payment has been received and is being verified by our admin team. You\'ll get full access within 24-48 hours.',
          color: 'warning',
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
