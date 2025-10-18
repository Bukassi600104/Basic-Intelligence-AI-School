import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CourseFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  courseCount = 0,
  className = '' 
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
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

  const difficultyOptions = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'enrollmentCount-desc', label: 'Most Enrolled' },
    { value: 'enrollmentCount-asc', label: 'Least Enrolled' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = () => {
    return filters?.search || 
           filters?.status || 
           filters?.category || 
           filters?.difficulty || 
           (filters?.sortBy && filters?.sortBy !== 'createdAt-desc');
  };

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-foreground">Course Filters</h3>
            <p className="text-sm text-muted-foreground">
              {courseCount} course{courseCount !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              className="text-muted-foreground hover:text-foreground"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="text"
              placeholder="Search courses by title or description..."
              value={filters?.search || ''}
              onChange={(e) => handleFilterChange('search', e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Status"
            options={statusOptions}
            value={filters?.status || ''}
            onChange={(value) => handleFilterChange('status', value)}
            placeholder="Filter by status"
          />

          <Select
            label="Category"
            options={categoryOptions}
            value={filters?.category || ''}
            onChange={(value) => handleFilterChange('category', value)}
            placeholder="Filter by category"
          />

          <Select
            label="Difficulty"
            options={difficultyOptions}
            value={filters?.difficulty || ''}
            onChange={(value) => handleFilterChange('difficulty', value)}
            placeholder="Filter by difficulty"
          />

          <Select
            label="Sort By"
            options={sortOptions}
            value={filters?.sortBy || 'createdAt-desc'}
            onChange={(value) => handleFilterChange('sortBy', value)}
          />
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Filter" size={14} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Active Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters?.search && (
              <div className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                <Icon name="Search" size={12} />
                <span>Search: "{filters?.search}"</span>
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            )}

            {filters?.status && (
              <div className="inline-flex items-center space-x-1 px-2 py-1 bg-secondary/10 text-secondary rounded text-xs">
                <Icon name="Circle" size={12} />
                <span>Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}</span>
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="ml-1 hover:bg-secondary/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            )}

            {filters?.category && (
              <div className="inline-flex items-center space-x-1 px-2 py-1 bg-accent/10 text-accent rounded text-xs">
                <Icon name="Tag" size={12} />
                <span>Category: {categoryOptions?.find(opt => opt?.value === filters?.category)?.label}</span>
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="ml-1 hover:bg-accent/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            )}

            {filters?.difficulty && (
              <div className="inline-flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded text-xs">
                <Icon name="BarChart" size={12} />
                <span>Level: {difficultyOptions?.find(opt => opt?.value === filters?.difficulty)?.label}</span>
                <button
                  onClick={() => handleFilterChange('difficulty', '')}
                  className="ml-1 hover:bg-success/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            )}

            {filters?.sortBy && filters?.sortBy !== 'createdAt-desc' && (
              <div className="inline-flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning rounded text-xs">
                <Icon name="ArrowUpDown" size={12} />
                <span>Sort: {sortOptions?.find(opt => opt?.value === filters?.sortBy)?.label}</span>
                <button
                  onClick={() => handleFilterChange('sortBy', 'createdAt-desc')}
                  className="ml-1 hover:bg-warning/20 rounded-full p-0.5"
                >
                  <Icon name="X" size={10} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseFilters;