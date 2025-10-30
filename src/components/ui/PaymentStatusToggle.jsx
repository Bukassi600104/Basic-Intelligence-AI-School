import React, { useState } from 'react';
import Modal from './Modal';
import Icon from '../AppIcon';
import Button from './Button';

const PaymentStatusToggle = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentStatus,
  userName,
  loading = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = [
    {
      value: 'active',
      label: 'Active',
      description: 'User has paid and has access to platform',
      icon: 'CheckCircle',
      color: 'green'
    },
    {
      value: 'inactive',
      label: 'Inactive',
      description: 'User does not have active membership',
      icon: 'XCircle',
      color: 'gray'
    },
    {
      value: 'pending',
      label: 'Pending',
      description: 'Payment verification in progress',
      icon: 'Clock',
      color: 'yellow'
    },
    {
      value: 'expired',
      label: 'Expired',
      description: 'Membership period has ended',
      icon: 'AlertCircle',
      color: 'red'
    }
  ];

  const getColorClasses = (color, isSelected) => {
    const colors = {
      green: isSelected 
        ? 'bg-green-50 border-green-500 ring-2 ring-green-500' 
        : 'border-green-200 hover:border-green-400',
      gray: isSelected 
        ? 'bg-gray-50 border-gray-500 ring-2 ring-gray-500' 
        : 'border-gray-200 hover:border-gray-400',
      yellow: isSelected 
        ? 'bg-yellow-50 border-yellow-500 ring-2 ring-yellow-500' 
        : 'border-yellow-200 hover:border-yellow-400',
      red: isSelected 
        ? 'bg-red-50 border-red-500 ring-2 ring-red-500' 
        : 'border-red-200 hover:border-red-400'
    };
    return colors[color] || colors.gray;
  };

  const getIconColor = (color) => {
    const colors = {
      green: 'text-green-600',
      gray: 'text-gray-600',
      yellow: 'text-yellow-600',
      red: 'text-red-600'
    };
    return colors[color] || colors.gray;
  };

  const handleConfirm = () => {
    onConfirm(selectedStatus);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Change Payment Status"
      maxWidth="max-w-xl"
      closeOnOverlayClick={!loading}
    >
      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-sm text-gray-600">
                Current Status: <span className="font-medium capitalize">{currentStatus}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Status Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select New Payment Status
          </label>
          <div className="grid grid-cols-1 gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`text-left p-4 border-2 rounded-xl transition-all ${getColorClasses(option.color, selectedStatus === option.value)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 mt-0.5 ${getIconColor(option.color)}`}>
                    <Icon name={option.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{option.label}</h4>
                      {selectedStatus === option.value && (
                        <Icon name="Check" size={16} className="text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Warning for status change */}
        {selectedStatus !== currentStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Status Change Notice</p>
                <p>
                  Changing from <span className="font-semibold capitalize">{currentStatus}</span> to{' '}
                  <span className="font-semibold capitalize">{selectedStatus}</span> will update the user's access permissions immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={selectedStatus === currentStatus || loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentStatusToggle;
