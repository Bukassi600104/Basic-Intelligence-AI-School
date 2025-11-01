import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import { Button } from '@/components/ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Separator } from '@/components/ui/separator.tsx';

const PublicHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { user, userProfile, signOut, isAdmin, isMember, membershipTier, profileLoading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about-page' },
    { name: 'Pricing', href: '/pricing-plans-page' },
    { name: 'Courses', href: '/courses' },
    { name: 'Join Membership', href: '/join-membership-page' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-xl border-b-2 border-gray-200 shadow-2xl' 
        : 'bg-white/95 backdrop-blur-lg border-b border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo - Enhanced with Gradient */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 min-w-0 group">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                  <span className="text-white font-black text-base">BI</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                  Basic Intelligence
                </span>
                <span className="text-xs text-gray-600 font-semibold leading-tight">
                  Community School
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation - Enhanced */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation?.map?.((item) => (
              <Link
                key={item?.name}
                to={item?.href}
                className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-200 group"
              >
                <span className="relative z-10">{item?.name}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            ))}
          </nav>

          {/* Auth Section - Modern Design */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-40"></div>
                    <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-md animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                      <span className="text-white font-bold text-sm">
                        {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || user?.email?.charAt?.(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-gray-900">
                      {profileLoading ? (
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        userProfile?.full_name || (isAdmin ? 'Admin' : user?.email?.split('@')[0] || user?.email)
                      )}
                    </div>
                    <div className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
                      {profileLoading ? (
                        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mt-1"></div>
                      ) : (
                        isAdmin ? 'Administrator' : `${membershipTier} Member`
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to={isAdmin ? "/admin-dashboard" : "/student-dashboard"}
                    className="relative px-5 py-2.5 text-sm font-bold text-white rounded-xl overflow-hidden group shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-500/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative flex items-center gap-2">
                      <Icon name="LayoutDashboard" size={16} />
                      Dashboard
                    </span>
                  </Link>
                  
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2.5 text-sm font-bold text-gray-700 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-xl border border-gray-200 hover:border-red-300 transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all border border-gray-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="relative px-5 py-2.5 text-sm font-bold text-white rounded-xl overflow-hidden group shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-purple-500/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative">Sign Up</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - Enhanced */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all border border-gray-200 hover:border-transparent"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
          </button>
        </div>

        {/* Mobile menu - Modern Gradient Design */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t-2 border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-b-2xl">
            <div className="space-y-2">
              {navigation?.map?.((item) => (
                <Link
                  key={item?.name}
                  to={item?.href}
                  className="block px-4 py-3 text-sm font-bold text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all mx-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item?.name}
                </Link>
              ))}
              
              <div className="pt-4 mt-4 border-t-2 border-gray-200 mx-2">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-md opacity-40"></div>
                        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-md animate-gradient" style={{ backgroundSize: '200% 200%' }}>
                          <span className="text-white font-bold text-base">
                            {userProfile?.full_name?.charAt?.(0)?.toUpperCase() || user?.email?.charAt?.(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {profileLoading ? (
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                          ) : (
                            userProfile?.full_name || (isAdmin ? 'Admin' : user?.email?.split('@')[0] || user?.email)
                          )}
                        </div>
                        <div className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">
                          {profileLoading ? (
                            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse mt-1"></div>
                          ) : (
                            isAdmin ? 'Administrator' : `${membershipTier} Member`
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Link
                      to={isAdmin ? "/admin-dashboard" : "/student-dashboard"}
                      className="relative block w-full text-center px-4 py-3 text-sm font-bold text-white rounded-xl overflow-hidden shadow-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
                      <span className="relative flex items-center justify-center gap-2">
                        <Icon name="LayoutDashboard" size={16} />
                        Go to Dashboard
                      </span>
                    </Link>
                    
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-center px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/signin"
                      className="block text-center px-4 py-3 text-sm font-bold text-gray-700 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="relative block w-full text-center px-4 py-3 text-sm font-bold text-white rounded-xl overflow-hidden shadow-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient" style={{ backgroundSize: '200% 200%' }}></div>
                      <span className="relative">Sign Up Free</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
