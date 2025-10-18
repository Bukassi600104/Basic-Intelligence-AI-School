import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CourseCard = ({ 
  course, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onToggleStatus,
  className = '' 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'published':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          label: 'Published'
        };
      case 'draft':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          label: 'Draft'
        };
      case 'archived':
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          label: 'Archived'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          label: 'Unknown'
        };
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return 'text-success bg-success/10';
      case 'intermediate':
        return 'text-warning bg-warning/10';
      case 'advanced':
        return 'text-error bg-error/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const statusConfig = getStatusConfig(course?.status);

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Course Thumbnail */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <Image
          src={course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'}
          alt={course?.title}
          className="w-full h-full object-cover"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color} ${statusConfig?.bgColor} ${statusConfig?.borderColor} border`}>
          {statusConfig?.label}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(course)}
            iconName="Edit"
            className="bg-white/90 hover:bg-white text-foreground"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(course)}
            iconName="Copy"
            className="bg-white/90 hover:bg-white text-foreground border-white/50"
          >
            Duplicate
          </Button>
        </div>
      </div>
      {/* Course Content */}
      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
            {course?.title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Tag" size={14} />
            <span>{course?.category}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
          {course?.description}
        </p>

        {/* Course Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Clock" size={12} />
              <span>{course?.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={12} />
              <span>{course?.enrollmentCount} enrolled</span>
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded text-xs font-medium capitalize ${getDifficultyColor(course?.difficulty)}`}>
            {course?.difficulty}
          </div>
        </div>

        {/* Creation Date */}
        <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="Calendar" size={12} />
            <span>Created {formatDate(course?.createdAt)}</span>
          </div>
          {course?.lastModified && (
            <div className="flex items-center space-x-1">
              <Icon name="Edit3" size={12} />
              <span>Modified {formatDate(course?.lastModified)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(course)}
              iconName="Edit"
              iconSize={14}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDuplicate(course)}
              iconName="Copy"
              iconSize={14}
            >
              Duplicate
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(course)}
              iconName={course?.status === 'published' ? 'EyeOff' : 'Eye'}
              iconSize={14}
              className={course?.status === 'published' ? 'text-warning hover:text-warning' : 'text-success hover:text-success'}
            >
              {course?.status === 'published' ? 'Unpublish' : 'Publish'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(course)}
              iconName="Trash2"
              iconSize={14}
              className="text-error hover:text-error hover:bg-error/10"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;