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
      {/* Mobile Header - Enhanced */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b-2 border-gray-200 h-16 flex items-center justify-between px-4 shadow-md">
          <Link to="/admin-dashboard" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-extrabold text-sm">BI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-gray-900 leading-tight">
                  Admin Panel
                </span>
                <span className="text-xs text-gray-600 font-medium leading-tight">
                  Basic Intelligence
                </span>
              </div>
            </div>
          </Link>
        
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
          aria-label="Toggle admin menu"
        >
          <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
        </button>
      </div>
      
      {/* Desktop Sidebar - Enhanced with Gradients */}
      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex-col bg-white border-r-2 border-gray-200 transition-all duration-300 shadow-xl ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}>
        {/* Sidebar Header - Enhanced with Gradient */}
        <div className="relative overflow-hidden h-16 border-b-2 border-gray-200">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative flex items-center justify-between h-full px-4">
            {!isCollapsed && (
              <Link to="/admin-dashboard" className="flex items-center space-x-2 group">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                  <span className="text-white font-extrabold text-sm">BI</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-white leading-tight">
                    Admin Panel
                  </span>
                  <span className="text-xs text-white/80 font-medium leading-tight">
                    Basic Intelligence
                  </span>
                </div>
              </Link>
            )}
            
            {isCollapsed && (
              <Link to="/admin-dashboard" className="flex items-center justify-center mx-auto group">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                  <span className="text-white font-extrabold text-sm">BI</span>
                </div>
              </Link>
            )}

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation - Enhanced with Gradients and Glow */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`group flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                isActivePath(item?.path)
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50 scale-[1.02]' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-[1.01]'
              }`}
              title={isCollapsed ? item?.name : ''}
            >
              <div className={`flex-shrink-0 ${isActivePath(item?.path) ? 'animate-pulse' : ''}`}>
                <Icon name={item?.icon} size={20} />
              </div>
              {!isCollapsed && (
                <div className="ml-3 flex-1">
                  <div className="text-sm font-bold">{item?.name}</div>
                  <div className={`text-xs ${isActivePath(item?.path) ? 'text-white/80' : 'text-gray-500'}`}>
                    {item?.description}
                  </div>
                </div>
              )}
              {isActivePath(item?.path) && !isCollapsed && (
                <div className="w-1.5 h-8 bg-white rounded-full shadow-lg"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Quick Actions - Enhanced */}
        {!isCollapsed && (
          <div className="px-3 py-4 border-t-2 border-gray-200">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
              <div className="w-1 h-3 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-2"></div>
              Quick Actions
            </div>
            <div className="space-y-1">
              {quickActions?.map((action) => (
                <button
                  key={action?.action}
                  onClick={() => handleQuickAction(action?.action)}
                  className="group w-full flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 transition-all duration-200 hover:scale-[1.02]"
                >
                  <Icon name={action?.icon} size={18} className="mr-3 group-hover:scale-110 transition-transform" />
                  {action?.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Profile & Logout - Enhanced */}
        <div className="px-3 py-4 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
          {!isCollapsed && (
            <div className="flex items-center px-3 py-2 mb-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon name="User" size={18} color="white" />
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-bold text-gray-900">Admin User</div>
                <div className="text-xs text-gray-600">admin@basicintelligence.com</div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-2.5 rounded-xl text-sm font-bold text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-[1.02]`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <Icon name="LogOut" size={18} className={`${isCollapsed ? '' : 'mr-3'} group-hover:scale-110 transition-transform`} />
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </aside>
      
      {/* Mobile Bottom Navigation - Enhanced */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={toggleMobileMenu}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t-2 border-gray-200 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              {/* Handle Bar */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6"></div>
              
              {/* Mobile Navigation Items - Enhanced */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {navigationItems?.map((item, index) => (
                  <Link
                    key={item?.path}
                    to={item?.path}
                    onClick={toggleMobileMenu}
                    className={`group flex flex-col items-center p-5 rounded-2xl text-center transition-all duration-300 ${
                      isActivePath(item?.path)
                        ? 'text-white bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50 scale-[1.02]' 
                        : 'text-gray-700 bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 hover:scale-[1.02] border-2 border-gray-200'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`w-12 h-12 ${isActivePath(item?.path) ? 'bg-white/20' : 'bg-white'} rounded-2xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon name={item?.icon} size={24} className={isActivePath(item?.path) ? 'text-white' : 'text-blue-600'} />
                    </div>
                    <span className="text-sm font-bold mb-1">{item?.name}</span>
                    <span className={`text-xs ${isActivePath(item?.path) ? 'text-white/80' : 'text-gray-600'}`}>
                      {item?.description}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Mobile Quick Actions - Enhanced */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-2"></div>
                  <span className="text-sm font-bold text-gray-900">Quick Actions</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {quickActions?.map((action) => (
                    <button
                      key={action?.action}
                      onClick={() => handleQuickAction(action?.action)}
                      className="group flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 border-2 border-emerald-200 hover:from-emerald-100 hover:to-cyan-100 hover:scale-105 transition-all duration-300"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform">
                        <Icon name={action?.icon} size={20} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">{action?.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile User Profile - Enhanced */}
              <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex items-center mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Icon name="User" size={24} color="white" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-bold text-gray-900">Admin User</div>
                    <div className="text-xs text-gray-600">admin@basicintelligence.com</div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="group w-full flex items-center justify-center px-6 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-glow-md hover:scale-105 transition-all duration-300"
                >
                  <Icon name="LogOut" size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
