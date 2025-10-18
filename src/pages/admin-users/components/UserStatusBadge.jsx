import React from 'react';


const UserStatusBadge = ({ status = 'pending', size = 'default', showIcon = true }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified',
          icon: 'CheckCircle',
          bgColor: 'bg-success/10',
          textColor: 'text-success',
          borderColor: 'border-success/20',
          dotColor: 'bg-success'
        };
      case 'pending':
        return {
          label: 'Pending',
          icon: 'Clock',
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/20',
          dotColor: 'bg-warning'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: 'XCircle',
          bgColor: 'bg-error/10',
          textColor: 'text-error',
          borderColor: 'border-error/20',
          dotColor: 'bg-error'
        };
      case 'expired':
        return {
          label: 'Expired',
          icon: 'AlertTriangle',
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          borderColor: 'border-warning/20',
          dotColor: 'bg-warning'
        };
      case 'no_payment':
        return {
          label: 'No Payment',
          icon: 'Minus',
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          borderColor: 'border-border',
          dotColor: 'bg-muted-foreground'
        };
      default:
        return {
          label: 'Unknown',
          icon: 'HelpCircle',
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          borderColor: 'border-border',
          dotColor: 'bg-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(status);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 12,
          dot: 'w-1.5 h-1.5'
        };
      case 'lg':
        return {
          container: 'px-3 py-2 text-sm',
          icon: 16,
          dot: 'w-3 h-3'
        };
      default:
        return {
          container: 'px-2.5 py-1.5 text-xs',
          icon: 14,
          dot: 'w-2 h-2'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`inline-flex items-center space-x-1.5 rounded-full border ${config?.bgColor} ${config?.textColor} ${config?.borderColor} ${sizeClasses?.container} font-medium`}>
      {showIcon && (
        <div className={`${sizeClasses?.dot} ${config?.dotColor} rounded-full flex-shrink-0`}></div>
      )}
      <span className="whitespace-nowrap">{config?.label}</span>
    </div>
  );
};

export default UserStatusBadge;