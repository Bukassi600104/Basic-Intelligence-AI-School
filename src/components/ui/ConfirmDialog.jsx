import React from 'react';
import Modal from './Modal';
import Icon from '../AppIcon';
import { Button } from '@/components/ui/button.tsx';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default', // 'default', 'danger', 'warning', 'success'
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'AlertTriangle',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonVariant: 'destructive'
        };
      case 'warning':
        return {
          icon: 'AlertCircle',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonVariant: 'default'
        };
      case 'success':
        return {
          icon: 'CheckCircle',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonVariant: 'default'
        };
      default:
        return {
          icon: 'Info',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonVariant: 'default'
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      maxWidth="max-w-lg"
      closeOnOverlayClick={!loading}
    >
      <div className="space-y-4">
        {/* Icon */}
        <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center mx-auto`}>
          <Icon name={styles.icon} size={24} className={styles.iconColor} />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-6"
          >
            {cancelText}
          </Button>
          <Button
            variant={styles.buttonVariant}
            onClick={handleConfirm}
            loading={loading}
            className="w-full sm:w-auto px-6"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
