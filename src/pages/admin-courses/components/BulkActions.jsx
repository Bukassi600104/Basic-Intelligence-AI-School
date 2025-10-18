import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActions = ({ 
  selectedCourses, 
  onBulkAction, 
  onClearSelection,
  className = '' 
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActionOptions = [
    { value: '', label: 'Select bulk action...', disabled: true },
    { value: 'publish', label: 'Publish Courses', description: 'Make courses live and accessible' },
    { value: 'unpublish', label: 'Unpublish Courses', description: 'Remove courses from public access' },
    { value: 'archive', label: 'Archive Courses', description: 'Move courses to archived status' },
    { value: 'duplicate', label: 'Duplicate Courses', description: 'Create copies of selected courses' },
    { value: 'export', label: 'Export Course Data', description: 'Download course information as CSV' },
    { value: 'delete', label: 'Delete Courses', description: 'Permanently remove courses (cannot be undone)' }
  ];

  const categoryOptions = [
    { value: 'ai-fundamentals', label: 'AI Fundamentals' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'deep-learning', label: 'Deep Learning' },
    { value: 'natural-language-processing', label: 'Natural Language Processing' },
    { value: 'computer-vision', label: 'Computer Vision' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'robotics', label: 'Robotics' },
    { value: 'ai-ethics', label: 'AI Ethics' },
    { value: 'business-ai', label: 'Business AI' },
    { value: 'practical-applications', label: 'Practical Applications' }
  ];

  const handleBulkAction = async () => {
    if (!selectedAction || selectedCourses?.length === 0) return;

    setIsProcessing(true);

    try {
      // Handle different bulk actions
      switch (selectedAction) {
        case 'publish': await onBulkAction('updateStatus', { status: 'published', courseIds: selectedCourses });
          break;
        case 'unpublish': await onBulkAction('updateStatus', { status: 'draft', courseIds: selectedCourses });
          break;
        case 'archive': await onBulkAction('updateStatus', { status: 'archived', courseIds: selectedCourses });
          break;
        case 'duplicate': await onBulkAction('duplicate', { courseIds: selectedCourses });
          break;
        case 'export':
          await onBulkAction('export', { courseIds: selectedCourses });
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedCourses?.length} course(s)? This action cannot be undone.`)) {
            await onBulkAction('delete', { courseIds: selectedCourses });
          }
          break;
        default:
          break;
      }

      // Reset selection after action
      setSelectedAction('');
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'publish':
        return 'Eye';
      case 'unpublish':
        return 'EyeOff';
      case 'archive':
        return 'Archive';
      case 'duplicate':
        return 'Copy';
      case 'export':
        return 'Download';
      case 'delete':
        return 'Trash2';
      default:
        return 'Settings';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'publish':
        return 'text-success hover:bg-success/10';
      case 'unpublish':
        return 'text-warning hover:bg-warning/10';
      case 'archive':
        return 'text-muted-foreground hover:bg-muted';
      case 'duplicate':
        return 'text-primary hover:bg-primary/10';
      case 'export':
        return 'text-accent hover:bg-accent/10';
      case 'delete':
        return 'text-error hover:bg-error/10';
      default:
        return 'text-foreground hover:bg-muted';
    }
  };

  if (selectedCourses?.length === 0) {
    return null;
  }

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="CheckSquare" size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              {selectedCourses?.length} course{selectedCourses?.length !== 1 ? 's' : ''} selected
            </h3>
            <p className="text-xs text-muted-foreground">
              Choose an action to apply to selected courses
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          iconName="X"
          className="text-muted-foreground hover:text-foreground"
        >
          Clear Selection
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="flex-1">
          <Select
            label="Bulk Action"
            options={bulkActionOptions}
            value={selectedAction}
            onChange={setSelectedAction}
            placeholder="Choose an action..."
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            onClick={handleBulkAction}
            disabled={!selectedAction || isProcessing}
            loading={isProcessing}
            iconName={selectedAction ? getActionIcon(selectedAction) : 'Settings'}
            className={selectedAction ? getActionColor(selectedAction) : ''}
          >
            {isProcessing ? 'Processing...' : 'Apply Action'}
          </Button>
        </div>
      </div>
      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedAction('publish');
            handleBulkAction();
          }}
          iconName="Eye"
          className="text-success hover:bg-success/10"
          disabled={isProcessing}
        >
          Publish All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedAction('unpublish');
            handleBulkAction();
          }}
          iconName="EyeOff"
          className="text-warning hover:bg-warning/10"
          disabled={isProcessing}
        >
          Unpublish All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedAction('duplicate');
            handleBulkAction();
          }}
          iconName="Copy"
          className="text-primary hover:bg-primary/10"
          disabled={isProcessing}
        >
          Duplicate All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedAction('export');
            handleBulkAction();
          }}
          iconName="Download"
          className="text-accent hover:bg-accent/10"
          disabled={isProcessing}
        >
          Export Data
        </Button>
      </div>
      {/* Action Preview */}
      {selectedAction && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Icon 
              name="Info" 
              size={16} 
              className="text-muted-foreground mt-0.5 flex-shrink-0" 
            />
            <div>
              <p className="text-sm text-foreground font-medium">
                Action Preview: {bulkActionOptions?.find(opt => opt?.value === selectedAction)?.label}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {bulkActionOptions?.find(opt => opt?.value === selectedAction)?.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This will affect {selectedCourses?.length} course{selectedCourses?.length !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;