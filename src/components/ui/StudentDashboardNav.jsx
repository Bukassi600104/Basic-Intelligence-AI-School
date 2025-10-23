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
        {/* Header - Ultra Modern Gradient */}
        <div className="relative overflow-hidden border-b-2 border-blue-200">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative flex items-center justify-between p-4">
            {!isCollapsed && (
              <Link to="/student-dashboard" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                  <div className="relative w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-xl border-2 border-white/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-white font-black text-base">BI</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black text-white leading-tight tracking-tight">
                    Basic Intelligence
                  </span>
                  <span className="text-xs text-white/90 font-semibold leading-tight">
                    Student Portal
                  </span>
                </div>
              </Link>
            )}
            
            {isCollapsed && (
              <Link to="/student-dashboard" className="flex items-center justify-center w-full group">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                  <div className="relative w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-xl border-2 border-white/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-white font-black text-base">BI</span>
                  </div>
                </div>
              </Link>
            )}

            {/* Collapse toggle - desktop only */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-lg text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20 hover:border-white/40"
            >
              <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={18} />
            </button>
          </div>
        </div>

        {/* User Profile - Modern Card */}
        <div className="p-4 border-b-2 border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          {!isCollapsed ? (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative flex items-center space-x-3 p-4 bg-white rounded-xl shadow-md border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-50"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                    <span className="text-white font-black text-lg">
                      {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">
                    {userProfile?.full_name || 'Student'}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                    <Icon name="Hash" size={12} />
                    {userProfile?.member_id || 'Pending'}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="ChevronRight" size={16} className="text-blue-600" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                  <span className="text-white font-black text-base">
                    {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation - Ultra Modern with Icon Gradients */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item, index) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`
                    group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 font-medium overflow-hidden
                    ${isActive(item.href) 
                      ? 'text-white shadow-xl scale-[1.02]' 
                      : 'text-gray-700 hover:text-gray-900 hover:scale-[1.01] hover:shadow-md'
                    }
                    ${isCollapsed ? 'justify-center' : 'space-x-3'}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {/* Active background gradient */}
                  {isActive(item.href) && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-500/50 blur-xl"></div>
                    </>
                  )}
                  
                  {/* Hover background */}
                  {!isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                  
                  {/* Icon with gradient background */}
                  <div className={`relative flex-shrink-0 ${isActive(item.href) ? 'animate-pulse' : ''}`}>
                    {isActive(item.href) ? (
                      <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                        <Icon name={item.icon} size={20} />
                      </div>
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-200">
                        <Icon name={item.icon} size={20} className="text-blue-600" />
                      </div>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      <span className="relative text-sm font-bold flex-1">{item.name}</span>
                      {isActive(item.href) && (
                        <div className="relative flex items-center gap-1">
                          <div className="w-1.5 h-6 bg-white rounded-full shadow-lg"></div>
                          <Icon name="ChevronRight" size={16} className="opacity-80" />
                        </div>
                      )}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions - Modern Gradient Buttons */}
        <div className="p-4 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 space-y-2">
          {/* Support Button */}
          <button
            onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
            className={`
              group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 font-medium w-full overflow-hidden
              text-gray-700 hover:text-white hover:shadow-xl hover:scale-[1.02]
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/50 to-green-500/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all border border-emerald-200 group-hover:border-white/30">
              <Icon name="MessageCircle" size={20} className="text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            {!isCollapsed && <span className="relative text-sm font-bold">Support</span>}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={`
              group relative flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 font-medium w-full overflow-hidden
              text-red-600 hover:text-white hover:shadow-xl hover:scale-[1.02]
              ${isCollapsed ? 'justify-center' : 'space-x-3'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-pink-500/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative w-9 h-9 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all border border-red-200 group-hover:border-white/30">
              <Icon name="LogOut" size={20} className="text-red-600 group-hover:text-white transition-colors" />
            </div>
            {!isCollapsed && <span className="relative text-sm font-bold">Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default StudentDashboardNav;
