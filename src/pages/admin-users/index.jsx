import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PhoneInput from '../../components/ui/PhoneInput';
import UserFilters from './components/UserFilters';
import BulkActions from './components/BulkActions';
import UserTable from './components/UserTable';
import { userService } from '../../services/userService';
import { adminService } from '../../services/adminService';
import { paymentService } from '../../services/paymentService';
import { passwordService } from '../../services/passwordService';

const AdminUsersPage = () => {
  const { userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    paymentStatus: '',
    dateRange: '',
    memberId: '',
    membershipStatus: '',
    role: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (userProfile && userProfile?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [userProfile, navigate]);

  // Parse URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location?.search);
    const filterParam = urlParams?.get('filter');
    const tabParam = urlParams?.get('tab');
    
    if (filterParam) {
      switch(filterParam) {
        case 'pending':
          setFilters(prev => ({ ...prev, paymentStatus: 'pending' }));
          break;
        case 'active':
          setFilters(prev => ({ ...prev, membershipStatus: 'active' }));
          break;
        case 'overdue':
          setFilters(prev => ({ ...prev, paymentStatus: 'overdue' }));
          break;
        default:
          break;
      }
    }
    
    // Handle tab parameter if needed
    if (tabParam === 'payments') {
      setFilters(prev => ({ ...prev, paymentStatus: 'pending' }));
    }
  }, [location?.search]);

  // Load users data
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data: usersData, error: usersError } = await userService?.getAllUsers();
      
      if (usersError) {
        setError(usersError);
      } else {
        setUsers(usersData || []);
      }
    } catch (err) {
      setError('Failed to load users data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort users
  const processedUsers = useMemo(() => {
    let filtered = [...users];

    // Apply filters
    if (filters?.search) {
      const searchTerm = filters?.search?.toLowerCase();
      filtered = filtered?.filter(user => 
        user?.full_name?.toLowerCase()?.includes(searchTerm) ||
        user?.email?.toLowerCase()?.includes(searchTerm) ||
        user?.member_id?.toLowerCase()?.includes(searchTerm)
      );
    }

    if (filters?.paymentStatus) {
      if (filters?.paymentStatus === 'pending') {
        // Users who don't have active membership but have payments
        filtered = filtered?.filter(user => 
          user?.membership_status !== 'active'
        );
      } else if (filters?.paymentStatus === 'overdue') {
        // Users with pending status for more than 48 hours
        filtered = filtered?.filter(user => {
          if (user?.membership_status === 'active') return false;
          const joinDate = new Date(user?.created_at);
          const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
          return joinDate < fortyEightHoursAgo;
        });
      }
    }

    if (filters?.membershipStatus) {
      filtered = filtered?.filter(user => user?.membership_status === filters?.membershipStatus);
    }

    if (filters?.role) {
      filtered = filtered?.filter(user => user?.role === filters?.role);
    }

    if (filters?.memberId) {
      const memberIdTerm = filters?.memberId?.toLowerCase();
      filtered = filtered?.filter(user => 
        user?.member_id && user?.member_id?.toLowerCase()?.includes(memberIdTerm)
      );
    }

    if (filters?.dateRange) {
      const now = new Date();
      let filterDate = new Date();
      
      switch (filters?.dateRange) {
        case 'today':
          filterDate?.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate?.setDate(now?.getDate() - 7);
          break;
        case 'month':
          filterDate?.setMonth(now?.getMonth() - 1);
          break;
        case 'quarter':
          filterDate?.setMonth(now?.getMonth() - 3);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        filtered = filtered?.filter(user => 
          new Date(user?.created_at) >= filterDate
        );
      }
    }

    // Apply sorting
    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        let aValue = a?.[sortConfig?.key];
        let bValue = b?.[sortConfig?.key];

        // Handle null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortConfig?.direction === 'asc' ? 1 : -1;
        if (bValue === null) return sortConfig?.direction === 'asc' ? -1 : 1;

        // Handle date sorting
        if (sortConfig?.key === 'created_at' || sortConfig?.key === 'last_active_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        // Handle string sorting
        if (typeof aValue === 'string') {
          aValue = aValue?.toLowerCase();
          bValue = bValue?.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [users, filters, sortConfig]);

  useEffect(() => {
    setFilteredUsers(processedUsers);
  }, [processedUsers]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setSelectedUsers([]); // Clear selection when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      paymentStatus: '',
      dateRange: '',
      memberId: '',
      membershipStatus: '',
      role: ''
    });
  };

  const handleSelectUser = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev?.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (isSelected, currentUsers) => {
    if (isSelected) {
      const currentUserIds = currentUsers?.map(user => user?.id);
      setSelectedUsers(prev => [...new Set([...prev, ...currentUserIds])]);
    } else {
      const currentUserIds = currentUsers?.map(user => user?.id);
      setSelectedUsers(prev => prev?.filter(id => !currentUserIds?.includes(id)));
    }
  };

  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentModal, setPaymentModal] = useState(false);
  const [userPayments, setUserPayments] = useState([]);

  const handleUserAction = async (action, user) => {
    setActionLoading(true);
    
    try {
      switch (action) {
        case 'activate':
          // Activate pending account
          if (user?.membership_status === 'pending') {
            if (window?.confirm(`Activate ${user?.full_name}'s account? This will grant them 30 days of access.`)) {
              const { data, error: activateError } = await adminService?.activateUserAccount(user?.id, 30, userProfile?.id);
              if (activateError) {
                alert('Failed to activate account: ' + activateError);
              } else {
                alert(`Account activated successfully! ${user?.full_name} will receive a confirmation email.`);
                await loadUsers(); // Reload users
              }
            }
          } else {
            alert('User account is not pending activation');
          }
          break;
          
        case 'edit':
          // Open edit user modal
          setSelectedUser(user);
          setEditUserModal(true);
          break;
          
        case 'togglePayment':
          // Toggle membership status
          const newStatus = user?.membership_status === 'active' ? 'inactive' : 'active';
          const { error: updateError } = await userService?.updateMembershipStatus(user?.id, newStatus);
          if (updateError) {
            alert('Failed to update membership status: ' + updateError);
          } else {
            alert(`Membership status updated to ${newStatus}`);
            await loadUsers(); // Reload users
          }
          break;
          
        case 'assignMemberId':
          if (!user?.member_id) {
            const { error: assignError } = await adminService?.assignMemberId(user?.id);
            if (assignError) {
              alert('Failed to assign member ID: ' + assignError);
            } else {
              alert('Member ID assigned successfully');
              await loadUsers(); // Reload users
            }
          } else {
            alert('User already has a member ID: ' + user?.member_id);
          }
          break;
          
        case 'viewPayments':
          // Load and show user payments
          const { data: payments, error: paymentsError } = await paymentService?.getUserPayments(user?.id);
          if (paymentsError) {
            alert('Failed to load payments: ' + paymentsError);
          } else {
            setSelectedUser(user);
            setUserPayments(payments || []);
            setPaymentModal(true);
          }
          break;
          
        case 'toggleActive':
          // Toggle active status
          const newActiveStatus = !user?.is_active;
          if (window?.confirm(`Are you sure you want to ${newActiveStatus ? 'activate' : 'deactivate'} ${user?.full_name}?`)) {
            const { error: activeError } = await adminService?.updateUserActiveStatus(user?.id, newActiveStatus);
            if (activeError) {
              alert('Failed to update active status: ' + activeError);
            } else {
              alert(`User ${newActiveStatus ? 'activated' : 'deactivated'} successfully`);
              await loadUsers(); // Reload users
            }
          }
          break;
          
        case 'delete':
          // Delete user
          if (window?.confirm(`Are you sure you want to delete ${user?.full_name}? This action cannot be undone.`)) {
            const { error: deleteError } = await adminService?.deleteUser(user?.id);
            if (deleteError) {
              alert('Failed to delete user: ' + deleteError);
            } else {
              alert('User deleted successfully');
              await loadUsers(); // Reload users
            }
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      alert('Action failed: ' + error?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (userData) => {
    setActionLoading(true);
    try {
      const { error } = await userService?.updateUserProfile(selectedUser?.id, userData);
      if (error) {
        alert('Failed to update user: ' + error);
      } else {
        alert('User updated successfully');
        setEditUserModal(false);
        setSelectedUser(null);
        await loadUsers(); // Reload users
      }
    } catch (error) {
      alert('Failed to update user: ' + error?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditUserModal(false);
    setSelectedUser(null);
  };

  const handleClosePaymentModal = () => {
    setPaymentModal(false);
    setSelectedUser(null);
    setUserPayments([]);
  };

  const handleBulkAction = async (action, userIds) => {
    if (userIds?.length === 0) return;
    
    setActionLoading(true);
    
    try {
      switch (action) {
        case 'verify_payment':
          // Bulk approve membership status
          for (const userId of userIds) {
            await userService?.updateMembershipStatus(userId, 'active');
          }
          break;
          
        case 'reject_payment':
          // Bulk reject membership status
          for (const userId of userIds) {
            await userService?.updateMembershipStatus(userId, 'inactive');
          }
          break;
          
        case 'assign_member_ids':
          // Bulk assign member IDs
          const { error: bulkError } = await adminService?.bulkAssignMemberIds(userIds);
          if (bulkError) {
            alert('Bulk assign failed: ' + bulkError);
          }
          break;
          
        case 'send_welcome_email':
          // Handle bulk welcome email
          console.log('Send welcome email to:', userIds);
          break;
          
        case 'export_selected':
          // Handle export selected users
          console.log('Export selected users:', userIds);
          break;
          
        case 'delete_users':
          if (window?.confirm(`Are you sure you want to delete ${userIds?.length} users? This action cannot be undone.`)) {
            const { error: deleteError } = await adminService?.bulkDeleteUsers(userIds);
            if (deleteError) {
              alert('Failed to delete users: ' + deleteError);
            } else {
              alert(`${userIds?.length} users deleted successfully`);
            }
          }
          break;
          
        default:
          break;
      }
      
      await loadUsers(); // Reload users after bulk action
      setSelectedUsers([]);
      
    } catch (error) {
      alert('Bulk action failed: ' + error?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedUsers([]);
  };

  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: '',
    full_name: '',
    role: 'student',
    membership_tier: 'starter',
    membership_status: 'pending',
    phone: '',
    whatsapp_phone: '',
    location: '',
    bio: '',
    is_active: true
  });

  const handleCreateUser = () => {
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    // Reset form data
    setUserFormData({
      email: '',
      full_name: '',
      role: 'student',
      membership_tier: 'starter',
      membership_status: 'pending',
      phone: '',
      location: '',
      bio: '',
      is_active: true
    });
  };

  const handleUserFormChange = (field, value) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserFormSubmit = async (e) => {
    e?.preventDefault();
    
    // Validate required fields
    if (!userFormData?.email || !userFormData?.full_name) {
      alert('Please fill in all required fields (Email and Full Name)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(userFormData?.email)) {
      alert('Please enter a valid email address');
      return;
    }

    const success = await createNewUser(userFormData);
    // Only close modal if user creation was successful
    if (success) {
      handleCloseUserModal();
    }
  };

  const createNewUser = async (userData) => {
    setActionLoading(true);
    
    try {
      const { data, error } = await adminService?.createUser(userData);
      
      if (error) {
        alert('Failed to create user: ' + error);
        return false; // Return false to keep modal open
      } else {
        // Show success message with temporary password
        const password = data?.temp_password || 'Not available';
        const message = `✅ User created successfully!\n\n` +
          `📧 Email: ${userData.email}\n` +
          `🔑 Temporary Password: ${password}\n\n` +
          `⚠️ IMPORTANT:\n` +
          `• Save this password - it won't be shown again\n` +
          `• Share it securely with the user\n` +
          `• User should change it after first login\n` +
          `• Password has also been sent via email`;
        
        // Use a custom alert or you can create a modal for better UX
        if (window.confirm(message + '\n\nClick OK to copy password to clipboard')) {
          navigator.clipboard.writeText(password);
        }
        
        await loadUsers(); // Reload users list
        return true; // Return true on success
      }
    } catch (error) {
      alert('Failed to create user: ' + error?.message);
      return false; // Return false to keep modal open
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadUsers();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 transition-all duration-300 lg:ml-60">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Users" size={24} color="white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Users</div>
                <div className="text-sm text-muted-foreground">Please wait while we fetch user data...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && users?.length === 0) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 transition-all duration-300 lg:ml-60">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Icon name="AlertCircle" size={32} className="mx-auto text-red-500 mb-4" />
                <div className="text-lg font-medium text-foreground mb-2">Failed to Load Users</div>
                <div className="text-sm text-muted-foreground mb-4">{error}</div>
                <Button onClick={handleRefresh}>Try Again</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-orange-100 flex">
      <AdminSidebar />
      <div className="flex-1 transition-all duration-300 lg:ml-60">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {/* Page Header - Enhanced */}
          <div className="relative overflow-hidden rounded-3xl mb-8 animate-fadeIn">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <Icon name="Users" size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white">User Management</h1>
                  </div>
                  <p className="text-white/90 ml-15">
                    Manage user accounts, payment verification, and Member ID assignments
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={handleRefresh}
                    loading={isLoading}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={handleCreateUser}
                    className="bg-white text-orange-600 hover:bg-white/90 font-bold shadow-lg"
                  >
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Stats Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-orange-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">{users?.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="Users" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Members</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {users?.filter(u => u?.membership_status === 'active')?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="CheckCircle" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-amber-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {users?.filter(u => u?.membership_status === 'pending')?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="Clock" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-red-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Inactive Users</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                    {users?.filter(u => !u?.is_active)?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="XCircle" size={28} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <UserFilters
            onFiltersChange={handleFiltersChange}
            totalUsers={users?.length}
            filteredUsers={filteredUsers?.length}
            onClearFilters={handleClearFilters}
          />

          {/* Bulk Actions */}
          <BulkActions
            selectedUsers={selectedUsers}
            onBulkAction={handleBulkAction}
            onClearSelection={handleClearSelection}
            loading={actionLoading}
          />

          {/* Users Table */}
          <UserTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            sortConfig={sortConfig}
            onUserAction={handleUserAction}
            loading={actionLoading}
          />

          {/* Enhanced User Creation Modal */}
          {showUserModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
              <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-200 animate-slideUp">
                {/* Gradient Header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 p-6">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Icon name="UserPlus" size={28} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-white">Create New User</h2>
                        <p className="text-white/90 mt-1">
                          Add a new user to the platform. Required fields are marked with *
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseUserModal}
                      className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
                    >
                      <Icon name="X" size={24} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleUserFormSubmit} className="p-6 bg-gradient-to-br from-gray-50 to-orange-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enhanced Left Column - Required Fields */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-orange-400 transition-colors">
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                          <Icon name="Mail" size={16} className="mr-2 text-orange-600" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          autoComplete="email"
                          value={userFormData.email}
                          onChange={(e) => handleUserFormChange('email', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          placeholder="user@example.com"
                          required
                        />
                      </div>

                      <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-orange-400 transition-colors">
                        <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                          <Icon name="User" size={16} className="mr-2 text-orange-600" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={userFormData.full_name}
                          onChange={(e) => handleUserFormChange('full_name', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-blue-400 transition-colors">
                        <label htmlFor="user-role" className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                          <Icon name="Shield" size={16} className="mr-2 text-orange-600" />
                          Role
                        </label>
                        <select
                          id="user-role"
                          name="role"
                          value={userFormData.role}
                          onChange={(e) => handleUserFormChange('role', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-blue-400 transition-colors">
                        <label htmlFor="user-membership-tier" className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                          <Icon name="Award" size={16} className="mr-2 text-orange-600" />
                          Membership Tier
                        </label>
                        <select
                          id="user-membership-tier"
                          name="membershipTier"
                          value={userFormData.membership_tier}
                          onChange={(e) => handleUserFormChange('membership_tier', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                        >
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="elite">Elite</option>
                        </select>
                      </div>
                    </div>

                    {/* Enhanced Right Column - Optional Fields */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-blue-400 transition-colors">
                        <label htmlFor="user-membership-status" className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                          <Icon name="CheckCircle" size={16} className="mr-2 text-orange-600" />
                          Membership Status
                        </label>
                        <select
                          id="user-membership-status"
                          name="membershipStatus"
                          value={userFormData.membership_status}
                          onChange={(e) => handleUserFormChange('membership_status', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>

                      <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-blue-400 transition-colors">
                        <PhoneInput
                          label="Phone Number"
                          name="phone"
                          value={userFormData.phone}
                          onChange={(e) => handleUserFormChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          defaultCountryCode="+234"
                        />
                      </div>

                      <div className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-blue-400 transition-colors">
                        <PhoneInput
                          label="WhatsApp Phone"
                          name="whatsapp_phone"
                          value={userFormData.whatsapp_phone}
                          onChange={(e) => handleUserFormChange('whatsapp_phone', e.target.value)}
                          placeholder="Enter WhatsApp number"
                          defaultCountryCode="+234"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          For WhatsApp notifications (international format)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={userFormData.location}
                          onChange={(e) => handleUserFormChange('location', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Lagos, Nigeria"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Bio
                        </label>
                        <textarea
                          value={userFormData.bio}
                          onChange={(e) => handleUserFormChange('bio', e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          placeholder="Brief description about the user"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Generation Section */}
                  {/* Info message about automatic password generation */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-lg font-medium text-foreground mb-4">Password Information</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Icon name="Info" size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-2">
                            Automatic Password Generation
                          </p>
                          <ul className="text-xs text-blue-600 space-y-1">
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>A secure temporary password will be automatically generated when you create the user</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>The password will be shown to you in a popup after user creation</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>The user will be required to change this password on their first login</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>The password will also be sent to the user's email address</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Form Actions */}
                  <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseUserModal}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <Icon name="UserPlus" size={20} className="mr-2" />
                      {actionLoading ? 'Creating User...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {editUserModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">Edit User</h2>
                    <button
                      onClick={handleCloseEditModal}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name="X" size={24} />
                    </button>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Update user information. Required fields are marked with *
                  </p>
                </div>

                <form data-form="edit-user" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const userData = {
                    full_name: formData.get('full_name'),
                    email: formData.get('email'),
                    role: formData.get('role'),
                    membership_tier: formData.get('membership_tier'),
                    membership_status: formData.get('membership_status'),
                    phone: formData.get('phone'),
                    location: formData.get('location'),
                    bio: formData.get('bio'),
                    is_active: formData.get('is_active') === 'true'
                  };
                  handleEditUser(userData);
                }} className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Required Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          autoComplete="email"
                          name="email"
                          defaultValue={selectedUser.email}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="user@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          defaultValue={selectedUser.full_name}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-user-role" className="block text-sm font-medium text-foreground mb-2">
                          Role
                        </label>
                        <select
                          id="edit-user-role"
                          name="role"
                          defaultValue={selectedUser.role}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="edit-user-tier" className="block text-sm font-medium text-foreground mb-2">
                          Membership Tier
                        </label>
                        <select
                          id="edit-user-tier"
                          name="membership_tier"
                          defaultValue={selectedUser.membership_tier}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="starter">Starter</option>
                          <option value="pro">Pro</option>
                          <option value="elite">Elite</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column - Optional Fields */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="edit-user-status" className="block text-sm font-medium text-foreground mb-2">
                          Membership Status
                        </label>
                        <select
                          id="edit-user-status"
                          name="membership_status"
                          defaultValue={selectedUser.membership_status}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="expired">Expired</option>
                        </select>
                      </div>

                      <div>
                        <PhoneInput
                          label="Phone Number"
                          name="phone_display"
                          value={selectedUser.phone || ''}
                          onChange={(e) => {
                            const formEl = document.querySelector('form[data-form="edit-user"]');
                            if (formEl) {
                              const phoneInput = formEl.querySelector('input[name="phone"]');
                              if (phoneInput) phoneInput.value = e.target.value;
                            }
                          }}
                          placeholder="Enter phone number"
                          defaultCountryCode="+234"
                        />
                        {/* Hidden input for form submission */}
                        <input type="hidden" name="phone" defaultValue={selectedUser.phone || ''} />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          name="location"
                          defaultValue={selectedUser.location || ''}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Lagos, Nigeria"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          defaultValue={selectedUser.bio || ''}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          placeholder="Brief description about the user"
                          rows={3}
                        />
                      </div>

                      <div>
                        <label htmlFor="edit-user-active" className="block text-sm font-medium text-foreground mb-2">
                          Active Status
                        </label>
                        <select
                          id="edit-user-active"
                          name="is_active"
                          defaultValue={selectedUser.is_active ? 'true' : 'false'}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseEditModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={actionLoading}
                    >
                      <Icon name="Save" size={16} className="mr-2" />
                      Update User
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Payment Viewing Modal */}
          {paymentModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                      Payment Submissions - {selectedUser.full_name}
                    </h2>
                    <button
                      onClick={handleClosePaymentModal}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name="X" size={24} />
                    </button>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    View and manage payment submissions for this user
                  </p>
                </div>

                <div className="p-6">
                  {userPayments.length === 0 ? (
                    <div className="text-center py-8">
                      <Icon name="CreditCard" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Payment Submissions</h3>
                      <p className="text-muted-foreground">
                        This user hasn't submitted any payments yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPayments.map((payment) => (
                        <div key={payment.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-foreground">
                                Payment #{payment.id.slice(0, 8)}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payment.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-medium">₦{payment.amount_naira?.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Payment Method</p>
                              <p className="font-medium">{payment.payment_method || 'Bank Transfer'}</p>
                            </div>
                            {payment.course && (
                              <div>
                                <p className="text-muted-foreground">Course</p>
                                <p className="font-medium">{payment.course.title}</p>
                              </div>
                            )}
                            {payment.admin_notes && (
                              <div>
                                <p className="text-muted-foreground">Admin Notes</p>
                                <p className="font-medium">{payment.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-border">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={handleClosePaymentModal}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;

