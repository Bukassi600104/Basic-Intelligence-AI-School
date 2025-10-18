import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import UserStatusBadge from './UserStatusBadge';

const UserTableRow = ({ 
  user, 
  isSelected, 
  onSelect, 
  onEdit, 
  onTogglePaymentStatus, 
  onAssignMemberId, 
  onViewPayments 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatWhatsApp = (phone) => {
    if (!phone) return 'Not provided';
    return phone?.replace(/(\d{4})(\d{3})(\d{4})/, '+234 $1 $2 $3');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
  };

  // Desktop Table Row
  const DesktopRow = () => (
    <tr className={`border-b border-border hover:bg-muted/50 transition-colors duration-200 ${isSelected ? 'bg-primary/5' : ''}`}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(user?.id, e?.target?.checked)}
          className="rounded border-border text-primary focus:ring-primary"
        />
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground">{user?.name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      </td>
      
      <td className="px-4 py-3">
        <div className="text-sm text-foreground">{formatWhatsApp(user?.whatsapp)}</div>
      </td>
      
      <td className="px-4 py-3">
        <div className="text-sm text-foreground">{formatDate(user?.registrationDate)}</div>
      </td>
      
      <td className="px-4 py-3">
        <UserStatusBadge status={user?.paymentStatus} size="sm" />
      </td>
      
      <td className="px-4 py-3">
        {user?.memberId ? (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm font-medium text-foreground">{user?.memberId}</span>
            <button
              onClick={() => copyToClipboard(user?.memberId)}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors duration-200"
              title="Copy Member ID"
            >
              <Icon name="Copy" size={12} />
            </button>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Not assigned</span>
        )}
      </td>
      
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
            title="Edit user"
          >
            <Icon name="Edit" size={14} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePaymentStatus(user)}
            title="Toggle payment status"
          >
            <Icon name="CreditCard" size={14} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAssignMemberId(user)}
            title="Assign Member ID"
          >
            <Icon name="Hash" size={14} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewPayments(user)}
            title="View payment submissions"
          >
            <Icon name="Receipt" size={14} />
          </Button>
        </div>
      </td>
    </tr>
  );

  // Mobile Card Layout
  const MobileCard = () => (
    <div className={`bg-card border border-border rounded-lg p-4 ${isSelected ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(user?.id, e?.target?.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground">{user?.name}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
        >
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <UserStatusBadge status={user?.paymentStatus} size="sm" />
        {user?.memberId && (
          <div className="flex items-center space-x-1 bg-muted px-2 py-1 rounded text-xs">
            <Icon name="Hash" size={12} className="text-muted-foreground" />
            <span className="font-mono font-medium">{user?.memberId}</span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">WhatsApp:</span>
              <div className="font-medium">{formatWhatsApp(user?.whatsapp)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Registered:</span>
              <div className="font-medium">{formatDate(user?.registrationDate)}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Icon name="Edit" size={14} className="mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onTogglePaymentStatus(user)}>
              <Icon name="CreditCard" size={14} className="mr-1" />
              Payment
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAssignMemberId(user)}>
              <Icon name="Hash" size={14} className="mr-1" />
              Member ID
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewPayments(user)}>
              <Icon name="Receipt" size={14} className="mr-1" />
              Payments
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden lg:contents">
        <DesktopRow />
      </div>
      <div className="lg:hidden">
        <MobileCard />
      </div>
    </>
  );
};

export default UserTableRow;