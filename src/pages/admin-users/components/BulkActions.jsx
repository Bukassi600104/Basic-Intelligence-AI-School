import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ 
  selectedUsers = [], 
  onBulkAction, 
  onClearSelection 
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActionOptions = [
    { value: '', label: 'Choose bulk action...' },
    { value: 'verify_payment', label: 'Verify Payment Status' },
    { value: 'reject_payment', label: 'Reject Payment Status' },
    { value: 'assign_member_ids', label: 'Assign Member IDs' },
    { value: 'send_welcome_email', label: 'Send Welcome Email' },
    { value: 'export_selected', label: 'Export Selected Users' },
    { value: 'delete_users', label: 'Delete Users' }
  ];

  const handleBulkAction = async () => {
    if (!selectedAction || selectedUsers?.length === 0) return;

    setIsProcessing(true);
    
    try {
      await onBulkAction(selectedAction, selectedUsers);
      setSelectedAction('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionButtonVariant = () => {
    switch (selectedAction) {
      case 'verify_payment':
        return 'success';
      case 'reject_payment': case'delete_users':
        return 'destructive';
      case 'assign_member_ids': case'send_welcome_email':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getActionButtonText = () => {
    if (isProcessing) return 'Processing...';
    
    switch (selectedAction) {
      case 'verify_payment':
        return `Verify ${selectedUsers?.length} Users`;
      case 'reject_payment':
        return `Reject ${selectedUsers?.length} Users`;
      case 'assign_member_ids':
        return `Assign IDs to ${selectedUsers?.length} Users`;
      case 'send_welcome_email':
        return `Email ${selectedUsers?.length} Users`;
      case 'export_selected':
        return `Export ${selectedUsers?.length} Users`;
      case 'delete_users':
        return `Delete ${selectedUsers?.length} Users`;
      default:
        return 'Apply Action';
    }
  };

  if (selectedUsers?.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Selection Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Icon name="Check" size={14} color="white" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {selectedUsers?.length} user{selectedUsers?.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            <Icon name="X" size={14} className="mr-1" />
            Clear Selection
          </Button>
        </div>

        {/* Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="min-w-0 sm:w-64">
            <Select
              placeholder="Choose bulk action..."
              options={bulkActionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
            />
          </div>
          
          <Button
            variant={getActionButtonVariant()}
            onClick={handleBulkAction}
            disabled={!selectedAction || isProcessing}
            loading={isProcessing}
            className="whitespace-nowrap"
          >
            {!isProcessing && selectedAction && (
              <Icon 
                name={
                  selectedAction === 'verify_payment' ? 'CheckCircle' :
                  selectedAction === 'reject_payment' ? 'XCircle' :
                  selectedAction === 'assign_member_ids' ? 'Hash' :
                  selectedAction === 'send_welcome_email' ? 'Mail' :
                  selectedAction === 'export_selected' ? 'Download' :
                  selectedAction === 'delete_users' ? 'Trash2' : 'Play'
                } 
                size={14} 
                className="mr-2" 
              />
            )}
            {getActionButtonText()}
          </Button>
        </div>
      </div>
      {/* Action Confirmation */}
      {selectedAction === 'delete_users' && (
        <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} className="text-error mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-error mb-1">Permanent Action Warning</div>
              <div className="text-muted-foreground">
                This will permanently delete {selectedUsers?.length} user{selectedUsers?.length !== 1 ? 's' : ''} and all associated data. 
                This action cannot be undone.
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedAction === 'assign_member_ids' && (
        <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="Info" size={16} className="text-accent mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-accent mb-1">Member ID Assignment</div>
              <div className="text-muted-foreground">
                This will automatically assign sequential Member IDs (BI0001, BI0002, etc.) to selected users who don't already have one.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;