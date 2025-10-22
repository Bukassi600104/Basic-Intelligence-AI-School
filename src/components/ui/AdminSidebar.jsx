import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const AdminSidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: 'LayoutDashboard',
      path: '/admin-dashboard',
      description: 'Overview and metrics'
    },
    {
      name: 'User Management',
      icon: 'Users',
      path: '/admin-users',
      description: 'All users, approvals, tiers'
    },
    {
      name: 'Course Management',
      icon: 'BookOpen', 
      path: '/admin-courses',
      description: 'Courses, modules, lessons'
    },
    {
      name: 'Content Library',
      icon: 'FolderOpen',
      path: '/admin-content',
      description: 'Media, prompts, resources'
    },
    {
      name: 'Notification Wizard',
      icon: 'Send',
      path: '/admin-notification-wizard',
      description: 'Send & schedule notifications'
    },
    {
      name: 'Analytics',
      icon: 'BarChart3',
      path: '/admin-analytics',
      description: 'Reports and insights'
    },
    {
      name: 'Settings',
      icon: 'Settings',
      path: '/admin-settings',
      description: 'System configuration'
    },
    {
      name: 'Password Settings',
      icon: 'Lock',
      path: '/admin-dashboard/settings',
      description: 'Change password'
    }
  ];

  const quickActions = [
    { label: 'Add User', icon: 'UserPlus', action: 'add-user' },
    { label: 'New Course', icon: 'Plus', action: 'add-course' },
    { label: 'Reports', icon: 'FileText', action: 'reports' },
  ];

  const isActivePath = (path) => location?.pathname === path;

  const handleQuickAction = (action) => {
    try {
      switch (action) {
        case 'add-user': navigate('/admin-users?action=create');
          break;
        case 'add-course': navigate('/admin-courses?action=create');
          break;
        case 'reports': navigate('/admin-dashboard?tab=analytics');
          break;
        default:
          console.log(`Unknown quick action: ${action}`);
      }
    } catch (error) {
      console.error('Quick action failed:', error);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        alert('Logout failed: ' + error);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error?.message);
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center justify-between px-4">
          <Link to="/admin-dashboard" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-foreground leading-tight">
                  Admin Panel
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  Basic Intelligence
                </span>
              </div>
            </div>
          </Link>
        
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
          aria-label="Toggle admin menu"
        >
          <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
        </button>
      </div>
      
      {/* Desktop Sidebar - Optimized spacing for logout icon visibility */}
      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex-col bg-card border-r border-border transition-all duration-300 ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {!isCollapsed && (
            <Link to="/admin-dashboard" className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BI</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    Admin Panel
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">
                    Basic Intelligence
                  </span>
                </div>
              </div>
            </Link>
          )}
          
          {isCollapsed && (
            <Link to="/admin-dashboard" className="flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BI</span>
              </div>
            </Link>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
            </button>
          )}
        </div>

        {/* Navigation - Reduced spacing */}
        <nav className="flex-1 px-3 py-3 space-y-1">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 group ${
                isActivePath(item?.path)
                  ? 'text-primary bg-primary/10 border-r-2 border-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={isCollapsed ? item?.name : ''}
            >
              <Icon name={item?.icon} size={18} className="flex-shrink-0" />
              {!isCollapsed && (
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium">{item?.name}</div>
                  <div className="text-xs text-muted-foreground">{item?.description}</div>
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Quick Actions - Reduced spacing and padding */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Quick Actions
            </div>
            <div className="space-y-1">
              {quickActions?.map((action) => (
                <button
                  key={action?.action}
                  onClick={() => handleQuickAction(action?.action)}
                  className="w-full flex items-center px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                >
                  <Icon name={action?.icon} size={16} className="mr-3" />
                  {action?.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Profile & Logout - Compact design to ensure logout is visible */}
        <div className="px-3 py-3 border-t border-border">
          {!isCollapsed && (
            <div className="flex items-center px-3 py-1.5 mb-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-foreground">Admin User</div>
                <div className="text-xs text-muted-foreground">admin@basicintelligence.com</div>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={`w-full ${isCollapsed ? 'px-2' : 'justify-start'}`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <Icon name="LogOut" size={16} className={isCollapsed ? '' : 'mr-3'} />
            {!isCollapsed && 'Logout'}
          </Button>
        </div>
      </aside>
      
      {/* Mobile Bottom Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={toggleMobileMenu}>
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              {/* Mobile Navigation Items */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {navigationItems?.map((item) => (
                  <Link
                    key={item?.path}
                    to={item?.path}
                    onClick={toggleMobileMenu}
                    className={`flex flex-col items-center p-4 rounded-lg text-center transition-colors duration-200 ${
                      isActivePath(item?.path)
                        ? 'text-primary bg-primary/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={24} className="mb-2" />
                    <span className="text-sm font-medium">{item?.name}</span>
                    <span className="text-xs text-muted-foreground">{item?.description}</span>
                  </Link>
                ))}
              </div>

              {/* Mobile Quick Actions */}
              <div className="mb-6">
                <div className="text-sm font-medium text-foreground mb-3">Quick Actions</div>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions?.map((action) => (
                    <button
                      key={action?.action}
                      onClick={() => handleQuickAction(action?.action)}
                      className="flex flex-col items-center p-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                    >
                      <Icon name={action?.icon} size={20} className="mb-1" />
                      <span className="text-xs">{action?.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile User Profile */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <Icon name="User" size={20} color="white" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-foreground">Admin User</div>
                    <div className="text-xs text-muted-foreground">admin@basicintelligence.com</div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleLogout}
                  className="justify-start"
                >
                  <Icon name="LogOut" size={16} className="mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
