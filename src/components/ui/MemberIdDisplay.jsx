import React, { useState } from 'react';
import Icon from '../AppIcon';

const MemberIdDisplay = ({ 
  memberId = 'BI0001', 
  memberName = 'John Doe',
  status = 'verified',
  variant = 'default',
  showCopy = true,
  showStatus = true,
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(memberId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy member ID:', err);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'verified':
        return {
          color: 'text-success',
          bgColor: 'bg-success',
          label: 'Verified',
          icon: 'CheckCircle'
        };
      case 'pending':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning',
          label: 'Pending',
          icon: 'Clock'
        };
      case 'suspended':
        return {
          color: 'text-error',
          bgColor: 'bg-error',
          label: 'Suspended',
          icon: 'AlertTriangle'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted-foreground',
          label: 'Unknown',
          icon: 'HelpCircle'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'inline-flex items-center space-x-2 px-2 py-1 bg-muted rounded text-xs',
          memberId: 'font-mono font-medium text-foreground',
          memberName: 'hidden',
          statusDot: 'w-1.5 h-1.5',
          copyButton: 'p-0.5',
          copyIcon: 10
        };
      case 'card':
        return {
          container: 'flex items-center justify-between p-4 bg-card border border-border rounded-lg',
          memberId: 'text-lg font-mono font-bold text-foreground',
          memberName: 'text-sm text-muted-foreground mt-1',
          statusDot: 'w-2 h-2',
          copyButton: 'p-2 hover:bg-muted rounded-md transition-colors duration-200',
          copyIcon: 16
        };
      case 'badge':
        return {
          container: 'inline-flex items-center space-x-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full',
          memberId: 'text-sm font-mono font-semibold text-primary',
          memberName: 'hidden',
          statusDot: 'w-2 h-2',
          copyButton: 'p-1 hover:bg-primary/20 rounded-full transition-colors duration-200',
          copyIcon: 12
        };
      default:
        return {
          container: 'flex items-center space-x-3 px-3 py-2 bg-muted rounded-md',
          memberId: 'text-sm font-mono font-medium text-foreground',
          memberName: 'text-sm text-muted-foreground',
          statusDot: 'w-2 h-2',
          copyButton: 'p-1 hover:bg-background rounded transition-colors duration-200',
          copyIcon: 14
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles?.container} ${className}`}>
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <Icon name="Hash" size={styles?.copyIcon} className="text-muted-foreground flex-shrink-0" />
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className={styles?.memberId}>{memberId}</span>
            {showStatus && (
              <div className="flex items-center space-x-1">
                <div className={`${styles?.statusDot} ${statusConfig?.bgColor} rounded-full`}></div>
                {variant !== 'compact' && (
                  <span className={`text-xs ${statusConfig?.color} capitalize`}>
                    {statusConfig?.label}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {memberName && styles?.memberName !== 'hidden' && (
            <div className={styles?.memberName}>{memberName}</div>
          )}
        </div>
      </div>
      {showCopy && (
        <button
          onClick={handleCopy}
          className={`${styles?.copyButton} text-muted-foreground hover:text-foreground transition-colors duration-200 flex-shrink-0`}
          title={copied ? 'Copied!' : 'Copy Member ID'}
          disabled={copied}
        >
          <Icon 
            name={copied ? 'Check' : 'Copy'} 
            size={styles?.copyIcon}
            className={copied ? 'text-success' : ''} 
          />
        </button>
      )}
    </div>
  );
};

export default MemberIdDisplay;