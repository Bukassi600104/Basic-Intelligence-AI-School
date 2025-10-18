import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const UserFilters = ({ 
  onFiltersChange, 
  totalUsers = 0, 
  filteredUsers = 0,
  onClearFilters 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    paymentStatus: '',
    dateRange: '',
    memberId: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const paymentStatusOptions = [
    { value: '', label: 'All Payment Status' },
    { value: 'pending', label: 'Pending Verification' },
    { value: 'verified', label: 'Verified Members' },
    { value: 'rejected', label: 'Rejected Payments' },
    { value: 'expired', label: 'Expired Submissions' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      search: '',
      paymentStatus: '',
      dateRange: '',
      memberId: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span className="flex items-center space-x-2">
            <Icon name="Filter" size={16} />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </span>
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Button>
      </div>
      {/* Filter Controls */}
      <div className={`space-y-4 lg:space-y-0 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Primary Search Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <Input
              type="search"
              placeholder="Search by name, email, or WhatsApp..."
              value={filters?.search}
              onChange={(e) => handleFilterChange('search', e?.target?.value)}
              className="w-full"
            />
          </div>
          
          <Select
            placeholder="Payment Status"
            options={paymentStatusOptions}
            value={filters?.paymentStatus}
            onChange={(value) => handleFilterChange('paymentStatus', value)}
          />
          
          <Select
            placeholder="Registration Date"
            options={dateRangeOptions}
            value={filters?.dateRange}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
        </div>

        {/* Secondary Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Input
            type="search"
            placeholder="Search by Member ID (e.g., BI0001)"
            value={filters?.memberId}
            onChange={(e) => handleFilterChange('memberId', e?.target?.value)}
          />
          
          <div className="lg:col-span-2 flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredUsers}</span> of{' '}
              <span className="font-medium text-foreground">{totalUsers}</span> users
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={14} className="mr-1" />
                Clear All
              </Button>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Icon name="Download" size={14} className="mr-2" />
              Export Users
            </Button>
          </div>
        </div>
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            
            {filters?.search && (
              <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                <span>Search: "{filters?.search}"</span>
                <button onClick={() => handleFilterChange('search', '')}>
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}
            
            {filters?.paymentStatus && (
              <div className="flex items-center space-x-1 bg-secondary/10 text-secondary px-2 py-1 rounded text-xs">
                <span>Status: {paymentStatusOptions?.find(opt => opt?.value === filters?.paymentStatus)?.label}</span>
                <button onClick={() => handleFilterChange('paymentStatus', '')}>
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}
            
            {filters?.dateRange && (
              <div className="flex items-center space-x-1 bg-accent/10 text-accent px-2 py-1 rounded text-xs">
                <span>Date: {dateRangeOptions?.find(opt => opt?.value === filters?.dateRange)?.label}</span>
                <button onClick={() => handleFilterChange('dateRange', '')}>
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}
            
            {filters?.memberId && (
              <div className="flex items-center space-x-1 bg-success/10 text-success px-2 py-1 rounded text-xs">
                <span>Member ID: "{filters?.memberId}"</span>
                <button onClick={() => handleFilterChange('memberId', '')}>
                  <Icon name="X" size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;