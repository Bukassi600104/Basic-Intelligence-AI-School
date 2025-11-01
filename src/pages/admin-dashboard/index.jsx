import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import StatCard from '../../components/ui/StatCard';
import ActionCard from '../../components/ui/ActionCard';
import ActivityFeed from './components/ActivityFeed';
import AlertsPanel from './components/AlertsPanel';
import SystemStatusPanel from './components/SystemStatusPanel';
import RecentUploadsWidget from './components/RecentUploadsWidget';
import Icon from '../../components/AppIcon';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { adminService } from '../../services/adminService';



const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    activities: [],
    alerts: [],
    systemStatus: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check admin access - only redirect when profile is loaded and user is not admin
  useEffect(() => {
    if (userProfile && userProfile?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [userProfile, navigate]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load all dashboard data in parallel with proper error handling
      const [
        statsResult,
        activitiesResult,
        alertsResult
      ] = await Promise.all([
        adminService?.getDashboardStats?.() || Promise.resolve({ data: null, error: 'Service not available' }),
        adminService?.getRecentActivities?.(10) || Promise.resolve({ data: [], error: 'Service not available' }),
        adminService?.getSystemAlerts?.() || Promise.resolve({ data: [], error: 'Service not available' })
      ]);

      // Handle results with proper error checking
      const stats = statsResult?.data || null;
      const activities = activitiesResult?.data || [];
      const alerts = alertsResult?.data || [];

      // Check for errors
      const hasErrors = statsResult?.error || activitiesResult?.error || alertsResult?.error;
      if (hasErrors) {
        const errorMessage = statsResult?.error || activitiesResult?.error || alertsResult?.error;
        console.error('Dashboard data loading errors:', {
          stats: statsResult?.error,
          activities: activitiesResult?.error,
          alerts: alertsResult?.error
        });
        setError(errorMessage);
      }

      // Update dashboard data even if there are partial errors
      setDashboardData({
        stats: stats || {},
        activities: activities || [],
        alerts: alerts || [],
        systemStatus: adminService?.getSystemStatus?.()?.data || {
          database: 'unknown',
          storage: 'unknown',
          authentication: 'unknown',
          lastUpdate: new Date()?.toISOString()
        }
      });
    } catch (err) {
      console.error('Dashboard loading failed:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
      
      // Set empty data structure on complete failure
      setDashboardData({
        stats: {},
        activities: [],
        alerts: [],
        systemStatus: {
          database: 'error',
          storage: 'error',
          authentication: 'error',
          lastUpdate: new Date()?.toISOString()
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleQuickAction = async (action) => {
    try {
      switch (action) {
        case 'add_user': navigate('/admin-users?action=create');
          break;
        case 'new_course': navigate('/admin-courses?action=create');
          break;
        case 'reports':
          // Navigate to reports page (to be implemented)
          navigate('/admin-dashboard?tab=analytics');
          break;
        case 'verify_payments':
          navigate('/admin-users?tab=payments&filter=pending');
          break;
        case 'manage_users': navigate('/admin-users');
          break;
        case 'manage_courses': navigate('/admin-courses');
          break;
        case 'assign_member_ids':
          await handleBulkAssignMemberIds();
          break;
        default:
          console.log('Unknown quick action:', action);
      }
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  const handleBulkAssignMemberIds = async () => {
    if (!window?.confirm('Assign member IDs to all users without member IDs?')) {
      return;
    }

    try {
      setRefreshing(true);
      
      // This would need to be implemented to get users without member IDs
      // For now, we'll show a success message alert('Member ID assignment process started. This may take a few minutes.');
      
      // Refresh dashboard data
      await loadDashboardData();
    } catch (error) {
      alert('Failed to assign member IDs: ' + error?.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Metrics data based on real stats - Updated for StatCard
  const metricsData = dashboardData?.stats ? [
    {
      title: 'Total Users',
      value: dashboardData?.stats?.totalUsers?.toString() || '0',
      icon: 'Users',
      change: `+${dashboardData?.stats?.recentRegistrations || 0}`,
      changeType: 'positive',
      subtitle: 'All registered users',
      variant: 'primary',
      onClick: () => navigate('/admin-users')
    },
    {
      title: 'Pending Payments',
      value: dashboardData?.stats?.pendingPayments?.toString() || '0',
      icon: 'Clock',
      change: 'Awaiting review',
      changeType: 'neutral',
      subtitle: 'Awaiting verification',
      variant: 'warning',
      onClick: () => navigate('/admin-users?tab=payments&filter=pending')
    },
    {
      title: 'Active Members',
      value: dashboardData?.stats?.activeMembers?.toString() || '0',
      icon: 'CheckCircle',
      change: `${dashboardData?.stats?.activeMembers > 0 ? Math.round((dashboardData?.stats?.activeMembers / dashboardData?.stats?.totalUsers) * 100) : 0}%`,
      changeType: 'positive',
      subtitle: 'Verified & paid',
      variant: 'success',
      onClick: () => navigate('/admin-users?filter=active')
    },
    {
      title: 'Total Revenue',
      value: `₦${dashboardData?.stats?.totalRevenue?.toLocaleString() || '0'}`,
      icon: 'DollarSign',
      change: `₦${dashboardData?.stats?.thisMonthRevenue?.toLocaleString() || '0'}`,
      changeType: 'positive',
      subtitle: 'This month',
      variant: 'secondary'
    }
  ] : [];

  // Quick actions - Updated to use ActionCard props
  const quickActions = [
    {
      title: 'Add User',
      description: 'Quickly add new users to the platform with admin approval',
      icon: 'UserPlus',
      accentColor: 'blue',
      buttonText: 'Add User',
      onClick: () => handleQuickAction('add_user')
    },
    {
      title: 'New Course',
      description: 'Create new educational content and course materials',
      icon: 'BookOpen',
      accentColor: 'purple',
      buttonText: 'New Course',
      onClick: () => handleQuickAction('new_course')
    },
    {
      title: 'Reports',
      description: 'Generate and view analytics reports and user statistics',
      icon: 'BarChart3',
      accentColor: 'emerald',
      buttonText: 'View Reports',
      onClick: () => handleQuickAction('reports')
    },
    {
      title: 'Verify Payments',
      description: 'Review and approve pending payment submissions',
      icon: 'CreditCard',
      accentColor: 'amber',
      buttonText: 'Review Payments',
      badge: `${dashboardData?.stats?.pendingPayments || 0} pending`,
      onClick: () => handleQuickAction('verify_payments')
    }
  ];

  if (loading && !dashboardData?.stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <AdminSidebar />
        <div className="transition-all duration-300 lg:ml-60">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                <Icon name="Loader2" size={36} className="animate-spin text-white" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</p>
              <p className="text-sm text-gray-600">Fetching your latest data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData?.stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <AdminSidebar />
        <div className="transition-all duration-300 lg:ml-60">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Icon name="AlertCircle" size={36} className="text-red-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-2">Failed to Load Dashboard</p>
              <p className="text-sm text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-glow-md hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <Icon name="RefreshCw" size={18} />
                  <span>Try Again</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <AdminSidebar />
      {/* Main Content */}
      <div className="transition-all duration-300 lg:ml-60">
        {/* Mobile spacing for header */}
        <div className="lg:hidden h-16"></div>
        
        {/* Header - Enhanced Design */}
        <div className="relative overflow-hidden bg-white border-b-2 border-gray-200 px-4 lg:px-6 py-6 lg:py-8">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="animate-fadeIn">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <Icon name="LayoutDashboard" size={18} className="text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600 text-sm lg:text-base ml-10">
                Welcome back! Here's what's happening with your{' '}
                <span className="font-semibold text-gray-900">platform today</span>
              </p>
            </div>
            
            <div className="flex items-center space-x-2 animate-slideUp">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group px-3 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-blue-500 hover:shadow-md hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-1.5">
                  <Icon 
                    name="RefreshCw" 
                    size={14} 
                    className={`${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} 
                  />
                  <span className="hidden sm:inline text-sm">Refresh</span>
                </div>
              </button>
              
              {dashboardData?.stats?.pendingPayments > 0 && (
                <button
                  onClick={() => navigate('/admin-users?tab=payments&filter=pending')}
                  className="group relative px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg shadow-md hover:shadow-glow-md hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center space-x-1.5">
                    <Icon name="AlertCircle" size={14} className="animate-pulse" />
                    <span className="text-sm">{dashboardData?.stats?.pendingPayments} Pending</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-3 lg:p-4 space-y-4">
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3 animate-slideDown">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
                <span className="text-red-700 font-medium text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Metrics Grid - Using StatCard */}
          <div>
            <div className="flex items-center space-x-1.5 mb-4">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-lg font-bold text-gray-900">Key Metrics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {metricsData?.map((metric, index) => (
                <div 
                  key={index}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <StatCard
                    title={metric?.title}
                    value={metric?.value}
                    icon={metric?.icon}
                    change={metric?.change}
                    changeType={metric?.changeType}
                    subtitle={metric?.subtitle}
                    variant={metric?.variant}
                    onClick={metric?.onClick}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions - Using ActionCard */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {quickActions?.map((action, index) => (
                <div 
                  key={index}
                  className="animate-slideUp"
                  style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
                >
                  <ActionCard
                    title={action?.title}
                    description={action?.description}
                    icon={action?.icon}
                    accentColor={action?.accentColor}
                    buttonText={action?.buttonText}
                    badge={action?.badge}
                    onClick={action?.onClick}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Activity Feed - Takes 2 columns on xl screens */}
            <div className="xl:col-span-2 space-y-6">
              <ActivityFeed activities={dashboardData?.activities} />
              <RecentUploadsWidget onRefresh={handleRefresh} />
            </div>

            {/* Right Sidebar - Alerts and System Status */}
            <div className="space-y-6">
              <AlertsPanel alerts={dashboardData?.alerts} />
              <SystemStatusPanel systemData={dashboardData?.systemStatus} />
            </div>
          </div>

          {/* Additional Admin Tools - Enhanced */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-white rounded-2xl shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 rounded-2xl opacity-50"></div>
            
            <div className="relative p-6 lg:p-8">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">Administrative Tools</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => navigate('/admin-users')}
                  className="group flex flex-col items-center p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                    <Icon name="Users" size={26} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 mb-1">User Management</span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {dashboardData?.stats?.totalUsers || 0} users
                  </span>
                </button>
                
                <button 
                  onClick={() => navigate('/admin-courses')}
                  className="group flex flex-col items-center p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                    <Icon name="BookOpen" size={26} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 mb-1">Course Library</span>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                    {dashboardData?.stats?.publishedCourses || 0} published
                  </span>
                </button>
                
                <button 
                  onClick={() => console.log('Analytics clicked')}
                  className="group flex flex-col items-center p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                    <Icon name="BarChart3" size={26} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 mb-1">Analytics</span>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    View reports
                  </span>
                </button>
                
                <button 
                  onClick={() => console.log('Settings clicked')}
                  className="group flex flex-col items-center p-6 rounded-xl bg-white border-2 border-gray-200 hover:border-amber-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
                    <Icon name="Settings" size={26} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 mb-1">Settings</span>
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                    Platform config
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
