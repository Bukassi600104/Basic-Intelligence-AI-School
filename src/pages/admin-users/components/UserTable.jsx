import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import UserTableRow from './UserTableRow';

const UserTable = ({ 
  users = [], 
  selectedUsers = [], 
  onSelectUser, 
  onSelectAll, 
  onSort,
  sortConfig = { key: null, direction: 'asc' },
  onUserAction
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' }
  ];

  // Pagination calculations
  const totalPages = Math.ceil(users?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users?.slice(startIndex, endIndex);

  const handleSort = (key) => {
    const direction = sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  const isAllSelected = currentUsers?.length > 0 && currentUsers?.every(user => selectedUsers?.includes(user?.id));
  const isIndeterminate = selectedUsers?.length > 0 && !isAllSelected;

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages?.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages?.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => onSelectAll(e?.target?.checked, currentUsers)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  <span>User</span>
                  {getSortIcon('name')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('whatsapp')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  <span>WhatsApp</span>
                  {getSortIcon('whatsapp')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  <span>Registration</span>
                  {getSortIcon('registrationDate')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('paymentStatus')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  <span>Payment Status</span>
                  {getSortIcon('paymentStatus')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('memberId')}
                  className="flex items-center space-x-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  <span>Member ID</span>
                  {getSortIcon('memberId')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {currentUsers?.map((user) => (
              <UserTableRow
                key={user?.id}
                user={user}
                isSelected={selectedUsers?.includes(user?.id)}
                onSelect={onSelectUser}
                onEdit={(user) => onUserAction('edit', user)}
                onTogglePaymentStatus={(user) => onUserAction('togglePayment', user)}
                onAssignMemberId={(user) => onUserAction('assignMemberId', user)}
                onViewPayments={(user) => onUserAction('viewPayments', user)}
                onDelete={(user) => onUserAction('delete', user)}
                onToggleActiveStatus={(user) => onUserAction('toggleActive', user)}
                onActivateAccount={(user) => onUserAction('activate', user)}
              />
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-4 p-4">
        {currentUsers?.map((user) => (
          <UserTableRow
            key={user?.id}
            user={user}
            isSelected={selectedUsers?.includes(user?.id)}
            onSelect={onSelectUser}
            onEdit={(user) => onUserAction('edit', user)}
            onTogglePaymentStatus={(user) => onUserAction('togglePayment', user)}
            onAssignMemberId={(user) => onUserAction('assignMemberId', user)}
            onViewPayments={(user) => onUserAction('viewPayments', user)}
            onDelete={(user) => onUserAction('delete', user)}
            onToggleActiveStatus={(user) => onUserAction('toggleActive', user)}
            onActivateAccount={(user) => onUserAction('activate', user)}
          />
        ))}
      </div>
      {/* Empty State */}
      {users?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Users" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
          <p className="text-muted-foreground mb-4">
            No users match your current filters. Try adjusting your search criteria.
          </p>
          <Button variant="outline">
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Refresh Users
          </Button>
        </div>
      )}
      {/* Pagination */}
      {users?.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Items per page */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e?.target?.value));
                  setCurrentPage(1);
                }}
                className="text-sm border border-border rounded px-2 py-1 bg-background text-foreground"
              >
                {itemsPerPageOptions?.map(option => (
                  <option key={option?.value} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pagination info */}
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, users?.length)} of {users?.length} users
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon name="ChevronLeft" size={16} />
              </Button>

              {generatePageNumbers()?.map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
