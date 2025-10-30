import React from 'react';
import Modal from './Modal';
import Icon from '../AppIcon';
import Button from './Button';

const AlertDialog = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  buttonText = 'OK',
  variant = 'default' // 'default', 'success', 'error', 'warning', 'info'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          icon: 'CheckCircle',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: 'XCircle',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-200'
        };
      case 'warning':
        return {
          icon: 'AlertTriangle',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200'
        };
      case 'info':
        return {
          icon: 'Info',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: 'Info',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Icon */}
        <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto`}>
          <Icon name={styles.icon} size={24} className={styles.iconColor} />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-gray-600 whitespace-pre-line">{message}</p>
        </div>

        {/* Action */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={onClose}
            className="px-8"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertDialog;
