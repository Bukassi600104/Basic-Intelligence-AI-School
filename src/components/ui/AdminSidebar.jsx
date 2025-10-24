import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const AdminSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    }
  ];

  const isActivePath = (path) => location?.pathname === path;

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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-3 shadow-md">
          <Link to="/admin-dashboard" className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-xs">BI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-gray-900 leading-tight">
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
          className="p-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
          aria-label="Toggle admin menu"
        >
          <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={20} />
        </button>
      </div>
      
      {/* Desktop Sidebar - Enhanced with Gradients - Static with Collapse */}
      <aside className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 shadow-xl ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}`}>
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={14} className="text-gray-600" />
        </button>
        {/* Sidebar Header - Enhanced with Gradient */}
        <div className="relative overflow-hidden h-14 border-b border-gray-200">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative flex items-center h-full px-3">
            {!isCollapsed && (
              <Link to="/admin-dashboard" className="flex items-center space-x-1.5 group">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/30 group-hover:scale-110 transition-transform">
                  <span className="text-white font-extrabold text-xs">BI</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-white leading-tight">
                    Admin Panel
                  </span>
                  <span className="text-xs text-white/80 font-medium leading-tight">
                    Basic Intelligence
                  </span>
                </div>
              </Link>
            )}
            {isCollapsed && (
              <Link to="/admin-dashboard" className="flex items-center justify-center w-full group">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-white/30 group-hover:scale-110 transition-transform">
                  <span className="text-white font-extrabold text-xs">BI</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Navigation - Enhanced with Gradients and Glow */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`group flex items-center ${isCollapsed ? 'justify-center' : 'px-2.5'} py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                isActivePath(item?.path)
                  ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-md shadow-blue-500/50 scale-[1.02]' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-[1.01]'
              }`}
              title={isCollapsed ? item?.name : ''}
            >
              <div className={`flex-shrink-0 ${isActivePath(item?.path) ? 'animate-pulse' : ''}`}>
                <Icon name={item?.icon} size={18} />
              </div>
              {!isCollapsed && (
                <div className="ml-2 flex-1">
                  <div className="text-xs font-bold">{item?.name}</div>
                  <div className={`text-xs ${isActivePath(item?.path) ? 'text-white/80' : 'text-gray-500'}`}>
                    {item?.description}
                  </div>
                </div>
              )}
              {!isCollapsed && isActivePath(item?.path) && (
                <div className="w-1 h-6 bg-white rounded-full shadow-md"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Profile & Logout - Enhanced */}
        <div className="px-2 py-3 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50">
          {!isCollapsed && (
            <div className="flex items-center px-2 py-1.5 mb-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Icon name="User" size={16} color="white" />
              </div>
              <div className="ml-2 flex-1">
                <div className="text-xs font-bold text-gray-900">Admin User</div>
                <div className="text-xs text-gray-600">admin@basicintelligence.com</div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-2.5'} py-2 rounded-lg text-xs font-bold text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:shadow-md hover:shadow-red-500/50 transition-all duration-300 hover:scale-[1.02]`}
            title={isCollapsed ? "Logout" : ""}
          >
            <Icon name="LogOut" size={16} className={`${!isCollapsed && 'mr-2'} group-hover:scale-110 transition-transform`} />
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </aside>
      
      {/* Mobile Bottom Navigation - Enhanced */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={toggleMobileMenu}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-gray-200 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-4">
              {/* Handle Bar */}
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
              
              {/* Mobile Navigation Items - Enhanced */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {navigationItems?.map((item, index) => (
                  <Link
                    key={item?.path}
                    to={item?.path}
                    onClick={toggleMobileMenu}
                    className={`group flex flex-col items-center p-3 rounded-xl text-center transition-all duration-300 ${
                      isActivePath(item?.path)
                        ? 'text-white bg-gradient-to-br from-blue-600 to-purple-600 shadow-md shadow-blue-500/50 scale-[1.02]' 
                        : 'text-gray-700 bg-gradient-to-br from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 hover:scale-[1.02] border border-gray-200'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`w-10 h-10 ${isActivePath(item?.path) ? 'bg-white/20' : 'bg-white'} rounded-xl flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon name={item?.icon} size={20} className={isActivePath(item?.path) ? 'text-white' : 'text-blue-600'} />
                    </div>
                    <span className="text-xs font-bold mb-0.5">{item?.name}</span>
                    <span className={`text-xs ${isActivePath(item?.path) ? 'text-white/80' : 'text-gray-600'}`}>
                      {item?.description}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Mobile User Profile - Enhanced */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <Icon name="User" size={20} color="white" />
                  </div>
                  <div className="ml-2">
                    <div className="text-xs font-bold text-gray-900">Admin User</div>
                    <div className="text-xs text-gray-600">admin@basicintelligence.com</div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="group w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-glow-md hover:scale-105 transition-all duration-300"
                >
                  <Icon name="LogOut" size={18} className="mr-2 group-hover:scale-110 transition-transform" />
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
