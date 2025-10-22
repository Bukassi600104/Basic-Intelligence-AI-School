import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';

const StudentDashboardNav = ({ isCollapsed, onToggleCollapse }) => {
  const { userProfile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/student-dashboard',
      icon: 'LayoutDashboard'
    },
    {
      name: 'PDF Library',
      href: '/student-dashboard/pdfs',
      icon: 'FileText'
    },
    {
      name: 'Video Library',
      href: '/student-dashboard/videos',
      icon: 'Video'
    },
    {
      name: 'Prompt Library',
      href: '/student-dashboard/prompts',
      icon: 'MessageSquare'
    },
    {
      name: 'Subscription',
      href: '/student-dashboard/subscription',
      icon: 'CreditCard'
    },
    {
      name: 'Settings',
      href: '/student-dashboard/settings',
      icon: 'Settings'
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button - Enhanced */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-xl bg-white shadow-xl border-2 border-gray-200 hover:border-blue-500 hover:scale-110 transition-all duration-300"
        >
          <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} className="text-gray-900" />
        </button>
      </div>

      {/* Mobile overlay - Enhanced */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Enhanced with Gradients */}
      <div className={`
        fixed lg:absolute top-0 left-0 h-screen bg-white border-r-2 border-gray-200 z-40 shadow-xl
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20 lg:w-20' : 'w-64 lg:w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header - Enhanced with Gradient */}
        <div className="relative overflow-hidden border-b-2 border-gray-200">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative flex items-center justify-between p-4">
            {!isCollapsed && (
              <Link to="/student-dashboard" className="flex items-center space-x-2 group">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                  <span className="text-white font-extrabold text-sm">BI</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-white leading-tight">
                    Basic Intelligence
                  </span>
                  <span className="text-xs text-white/80 font-medium leading-tight">
                    Student Portal
                  </span>
                </div>
              </Link>
            )}
            
            {isCollapsed && (
              <Link to="/student-dashboard" className="flex items-center justify-center w-full group">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-110 transition-transform">
                  <span className="text-white font-extrabold text-sm">BI</span>
                </div>
              </Link>
            )}

            {/* Collapse toggle - desktop only */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
            >
              <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
            </button>
          </div>
        </div>

        {/* User Profile - Enhanced */}
        <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-extrabold text-base">
                  {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">
                  {userProfile?.full_name || 'Student'}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {userProfile?.member_id || 'Member ID Pending'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-extrabold text-sm">
                  {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || 'S'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation - Enhanced with Gradients */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item, index) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`
                    group flex items-center px-3 py-3 rounded-xl transition-all duration-300 font-medium
                    ${isActive(item.href) 
                      ? 'text-white bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/50 scale-[1.02]' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:scale-[1.01]'
                    }
                    ${isCollapsed ? 'justify-center' : 'space-x-3'}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className={`flex-shrink-0 ${isActive(item.href) ? 'animate-pulse' : ''}`}>
                    <Icon 
                      name={item.icon} 
                      size={20} 
                    />
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm font-bold flex-1">{item.name}</span>
                  )}
                  {isActive(item.href) && !isCollapsed && (
                    <div className="w-1.5 h-6 bg-white rounded-full shadow-lg"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions - Enhanced */}
        <div className="p-4 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 space-y-2">
          {/* Support */}
          <button
            onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
            className={`
              group flex items-center px-3 py-3 rounded-xl transition-all duration-300 font-medium w-full
              text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-600 hover:shadow-lg hover:scale-[1.02]
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}
          >
            <Icon name="MessageCircle" size={20} className="group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="text-sm font-bold">Support</span>}
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className={`
              group flex items-center px-3 py-3 rounded-xl transition-all duration-300 font-medium w-full
              text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 hover:shadow-lg hover:shadow-red-500/50 hover:scale-[1.02]
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}
          >
            <Icon name="LogOut" size={20} className="group-hover:scale-110 transition-transform" />
            {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default StudentDashboardNav;
