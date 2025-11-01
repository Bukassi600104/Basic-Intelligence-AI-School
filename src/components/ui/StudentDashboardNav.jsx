import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import { Button } from '@/components/ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Separator } from '@/components/ui/separator.tsx';

const StudentDashboardNav = () => {
  const { userProfile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      {/* Mobile menu button - Orange Theme */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-xl bg-white shadow-xl border-2 border-gray-200 hover:border-orange-500 hover:scale-110 transition-all duration-300"
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

      {/* Sidebar - Enhanced with Gradients - Static with Collapse */}
      <div className={`
        fixed lg:absolute top-0 left-0 h-screen bg-white border-r-2 border-gray-200 z-40 shadow-xl
        transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-64'}
      `}>
        {/* Collapse Toggle Button - Desktop Only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-6 z-50 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:bg-orange-50"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={14} className="text-orange-600" />
        </button>

        {/* Header - Orange Theme Gradient */}
        <div className="relative overflow-hidden border-b-2 border-orange-200">
          {/* Animated Gradient Background - Orange Theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative flex items-center justify-between p-3">
            {!isCollapsed && (
              <Link to="/student-dashboard" className="flex items-center space-x-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
                  <div className="relative w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg border border-white/40 group-hover:scale-110 transition-all duration-300">
                    <span className="text-white font-black text-sm">BI</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white leading-tight tracking-tight">
                    Basic Intelligence
                  </span>
                  <span className="text-xs text-white/90 font-medium leading-tight">
                  Student Portal
                </span>
              </div>
            </Link>
            )}
            {isCollapsed && (
              <Link to="/student-dashboard" className="flex items-center justify-center w-full group">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-lg blur-sm group-hover:blur-md transition-all"></div>
                  <div className="relative w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg border border-white/40 group-hover:scale-110 transition-all duration-300">
                    <span className="text-white font-black text-sm">BI</span>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* User Profile - Orange Theme */}
        {!isCollapsed && (
          <div className="p-3 border-b border-gray-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg blur-md opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative flex items-center space-x-2 p-2.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-orange-300 transition-all hover:shadow-md">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg blur-sm opacity-50"></div>
                  <div className="relative w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                    <span className="text-white font-black text-base">
                      {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {userProfile?.full_name || 'Student'}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                  <Icon name="Hash" size={10} />
                  {userProfile?.member_id || 'Pending'}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="ChevronRight" size={14} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Navigation - Ultra Modern with Icon Gradients */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item, index) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`
                    group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4 space-x-3'} py-3.5 rounded-xl transition-all duration-300 font-medium overflow-hidden
                    ${isActive(item.href) 
                      ? 'text-white shadow-xl scale-[1.02]' 
                      : 'text-gray-700 hover:text-gray-900 hover:scale-[1.01] hover:shadow-md'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {/* Active background gradient - Orange Theme */}
                  {isActive(item.href) && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-500 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/50 to-orange-600/50 blur-xl"></div>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                    </>
                  )}
                  
                  {/* Hover background - Orange Theme */}
                  {!isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                  
                  {/* Icon with gradient background */}
                  <div className={`relative flex-shrink-0 ${isActive(item.href) ? 'animate-pulse' : ''}`}>
                    {isActive(item.href) ? (
                      <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                        <Icon name={item.icon} size={16} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-gray-200">
                        <Icon name={item.icon} size={16} className="text-orange-600" />
                      </div>
                    )}
                  </div>
                  
                  {!isCollapsed && <span className="relative text-xs font-bold flex-1">{item.name}</span>}
                  {!isCollapsed && isActive(item.href) && (
                    <div className="relative flex items-center gap-1">
                      <div className="w-1 h-5 bg-white rounded-full shadow-md"></div>
                      <Icon name="ChevronRight" size={14} className="opacity-80" />
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions - Orange Theme */}
        <div className="p-3 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-orange-50 space-y-1.5">
          {/* Support Button */}
          <button
            onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
            className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-2 px-3'} py-2 rounded-lg transition-all duration-300 font-medium w-full overflow-hidden text-xs text-gray-700 hover:text-white hover:shadow-lg hover:scale-[1.02]`}
            title={isCollapsed ? "Support" : ""}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/50 to-green-600/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative w-9 h-9 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all border border-green-200 group-hover:border-white/30">
              <Icon name="MessageCircle" size={20} className="text-green-600 group-hover:text-white transition-colors" />
            </div>
            {!isCollapsed && <span className="relative text-sm font-bold">Support</span>}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3.5 rounded-xl transition-all duration-300 font-medium w-full overflow-hidden text-red-600 hover:text-white hover:shadow-xl hover:scale-[1.02]`}
            title={isCollapsed ? "Sign Out" : ""}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/50 to-red-600/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative w-9 h-9 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all border border-red-200 group-hover:border-white/30">
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
