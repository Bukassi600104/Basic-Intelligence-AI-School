import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CourseTable = ({ 
  courses, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onToggleStatus,
  onSort,
  sortField,
  sortDirection,
  selectedCourses,
  onSelectCourse,
  onSelectAll
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'published':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20',
          label: 'Published',
          icon: 'Eye'
        };
      case 'draft':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20',
          label: 'Draft',
          icon: 'FileText'
        };
      case 'archived':
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          label: 'Archived',
          icon: 'Archive'
        };
      default:
        return {
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-border',
          label: 'Unknown',
          icon: 'HelpCircle'
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

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSort = (field) => {
    onSort(field);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const isAllSelected = courses?.length > 0 && selectedCourses?.length === courses?.length;
  const isIndeterminate = selectedCourses?.length > 0 && selectedCourses?.length < courses?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                  className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
              </th>
              <th className="w-20 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Thumbnail
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <span>Course Title</span>
                  <Icon name={getSortIcon('title')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <span>Category</span>
                  <Icon name={getSortIcon('category')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('difficulty')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <span>Difficulty</span>
                  <Icon name={getSortIcon('difficulty')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('enrollmentCount')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <span>Enrolled</span>
                  <Icon name={getSortIcon('enrollmentCount')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <span>Status</span>
                  <Icon name={getSortIcon('status')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('createdAt')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <span>Created</span>
                  <Icon name={getSortIcon('createdAt')} size={14} />
                </button>
              </th>
              <th className="w-32 px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses?.map((course) => {
              const statusConfig = getStatusConfig(course?.status);
              const isSelected = selectedCourses?.includes(course?.id);
              const isHovered = hoveredRow === course?.id;

              return (
                <tr
                  key={course?.id}
                  className={`hover:bg-muted/30 transition-colors duration-200 ${isSelected ? 'bg-primary/5' : ''}`}
                  onMouseEnter={() => setHoveredRow(course?.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectCourse(course?.id, e?.target?.checked)}
                      className="rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop'}
                        alt={course?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="max-w-xs">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                        {course?.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {course?.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Icon name="Tag" size={12} />
                      <span>{course?.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${getDifficultyColor(course?.difficulty)}`}>
                      {course?.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Icon name="Users" size={12} />
                      <span>{course?.enrollmentCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${statusConfig?.color} ${statusConfig?.bgColor} ${statusConfig?.borderColor} border`}>
                      <Icon name={statusConfig?.icon} size={12} />
                      <span>{statusConfig?.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(course?.createdAt)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {course?.duration}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`flex items-center justify-end space-x-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-60'}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(course)}
                        iconName="Edit"
                        iconSize={14}
                        className="h-8 w-8 p-0"
                        title="Edit course"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicate(course)}
                        iconName="Copy"
                        iconSize={14}
                        className="h-8 w-8 p-0"
                        title="Duplicate course"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStatus(course)}
                        iconName={course?.status === 'published' ? 'EyeOff' : 'Eye'}
                        iconSize={14}
                        className={`h-8 w-8 p-0 ${course?.status === 'published' ? 'text-warning hover:text-warning' : 'text-success hover:text-success'}`}
                        title={course?.status === 'published' ? 'Unpublish' : 'Publish'}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(course)}
                        iconName="Trash2"
                        iconSize={14}
                        className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
                        title="Delete course"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {courses?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="BookOpen" size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first course
          </p>
          <Button variant="default" iconName="Plus">
            Create New Course
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseTable;