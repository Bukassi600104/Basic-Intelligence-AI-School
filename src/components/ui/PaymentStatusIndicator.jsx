import React from 'react';
import Icon from '../AppIcon';

const PaymentStatusIndicator = ({ 
  status = 'pending', 
  amount = null, 
  memberId = null, 
  className = '',
  showDetails = true 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'verified':
        return {
          icon: 'CheckCircle',
          iconColor: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          textColor: 'text-success',
          title: 'Payment Verified',
          message: 'Your payment has been confirmed and your membership is active.',
        };
      case 'pending':
        return {
          icon: 'Clock',
          iconColor: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          textColor: 'text-warning',
          title: 'Payment Pending',
          message: 'Your payment is being verified. This usually takes 24-48 hours.',
        };
      case 'rejected':
        return {
          icon: 'XCircle',
          iconColor: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20',
          textColor: 'text-error',
          title: 'Payment Rejected',
          message: 'There was an issue with your payment. Please contact support.',
        };
      case 'expired':
        return {
          icon: 'AlertTriangle',
          iconColor: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          textColor: 'text-warning',
          title: 'Payment Expired',
          message: 'Your payment verification period has expired. Please resubmit.',
        };
      default:
        return {
          icon: 'Info',
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          textColor: 'text-muted-foreground',
          title: 'Unknown Status',
          message: 'Payment status is unclear. Please contact support.',
        };
    }
  };

  const config = getStatusConfig(status);

  const formatAmount = (amount) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    })?.format(amount);
  };

  return (
    <div className={`rounded-lg border ${config?.borderColor} ${config?.bgColor} p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${config?.iconColor}`}>
          <Icon name={config?.icon} size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${config?.textColor}`}>
              {config?.title}
            </h3>
            {status === 'verified' && memberId && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-card rounded text-xs font-mono">
                <Icon name="Hash" size={12} className="text-muted-foreground" />
                <span className="text-foreground">{memberId}</span>
              </div>
            )}
          </div>
          
          {showDetails && (
            <p className="mt-1 text-sm text-muted-foreground">
              {config?.message}
            </p>
          )}
          
          {amount && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Amount:</span>
              <span className="text-sm font-medium font-mono text-foreground">
                {formatAmount(amount)}
              </span>
            </div>
          )}
          
          {status === 'pending' && (
            <div className="mt-3 flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Info" size={12} />
              <span>
                You will receive WhatsApp confirmation once verified
              </span>
            </div>
          )}
          
          {status === 'rejected' && (
            <div className="mt-3">
              <button className="inline-flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors duration-200">
                <Icon name="MessageCircle" size={12} />
                <span>Contact Support via WhatsApp</span>
              </button>
            </div>
          )}
          
          {status === 'expired' && (
            <div className="mt-3">
              <button className="inline-flex items-center space-x-1 text-xs text-primary hover:text-primary/80 transition-colors duration-200">
                <Icon name="RefreshCw" size={12} />
                <span>Resubmit Payment</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusIndicator;