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
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-lg border border-border"
        >
          <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:absolute top-0 left-0 h-screen bg-card border-r border-border z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20 lg:w-20' : 'w-64 lg:w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <Link to="/student-dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground leading-tight">
                  Basic Intelligence
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  Student Portal
                </span>
              </div>
            </Link>
          )}
          
          {isCollapsed && (
            <Link to="/student-dashboard" className="flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BI</span>
              </div>
            </Link>
          )}

          {/* Collapse toggle - desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 rounded-md hover:bg-muted transition-colors"
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-border">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {userProfile?.full_name || 'Student'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {userProfile?.member_id || 'Member ID Pending'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-xs">
                  {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || 'S'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-lg transition-all duration-200
                    ${isActive(item.href) 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                    ${isCollapsed ? 'justify-center' : 'space-x-2'}
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon 
                    name={item.icon} 
                    size={20} 
                    className={isActive(item.href) ? 'text-white' : ''}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-medium text-center flex-1">{item.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border space-y-2">
          {/* Support */}
          <button
            onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
              text-muted-foreground hover:text-foreground hover:bg-muted w-full
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <Icon name="MessageCircle" size={20} />
            {!isCollapsed && <span className="text-sm font-medium">Support</span>}
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
              text-muted-foreground hover:text-foreground hover:bg-muted w-full
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <Icon name="LogOut" size={20} />
            {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default StudentDashboardNav;
