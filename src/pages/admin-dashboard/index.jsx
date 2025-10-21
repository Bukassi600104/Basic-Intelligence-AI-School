import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/ui/AdminSidebar';
import MetricsCard from './components/MetricsCard';
import QuickActionCard from './components/QuickActionCard';
import ActivityFeed from './components/ActivityFeed';
import AlertsPanel from './components/AlertsPanel';
import SystemStatusPanel from './components/SystemStatusPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { adminService } from '../../services/adminService';



const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  // Metrics data based on real stats
  const metricsData = dashboardData?.stats ? [
    {
      title: 'Total Users',
      value: dashboardData?.stats?.totalUsers?.toString() || '0',
      icon: 'Users',
      trend: `+${dashboardData?.stats?.recentRegistrations || 0}`,
      trendDirection: 'up',
      subtitle: 'All registered users',
      color: 'primary',
      onClick: () => navigate('/admin-users')
    },
    {
      title: 'Pending Payments',
      value: dashboardData?.stats?.pendingPayments?.toString() || '0',
      icon: 'Clock',
      trend: 'Awaiting review',
      trendDirection: 'neutral',
      subtitle: 'Awaiting verification',
      color: 'warning',
      onClick: () => navigate('/admin-users?tab=payments&filter=pending')
    },
    {
      title: 'Active Members',
      value: dashboardData?.stats?.activeMembers?.toString() || '0',
      icon: 'CheckCircle',
      trend: `${dashboardData?.stats?.activeMembers > 0 ? Math.round((dashboardData?.stats?.activeMembers / dashboardData?.stats?.totalUsers) * 100) : 0}%`,
      trendDirection: 'up',
      subtitle: 'Verified & paid',
      color: 'success',
      onClick: () => navigate('/admin-users?filter=active')
    },
    {
      title: 'Total Revenue',
      value: `₦${dashboardData?.stats?.totalRevenue?.toLocaleString() || '0'}`,
      icon: 'DollarSign',
      trend: `₦${dashboardData?.stats?.thisMonthRevenue?.toLocaleString() || '0'}`,
      trendDirection: 'up',
      subtitle: 'This month',
      color: 'secondary'
    }
  ] : [];

  // Quick actions - Updated with working buttons
  const quickActions = [
    {
      title: 'Add User',
      description: 'Quickly add new users to the platform with admin approval',
      icon: 'UserPlus',
      buttonText: 'Add User',
      buttonVariant: 'default',
      onClick: () => handleQuickAction('add_user')
    },
    {
      title: 'New Course',
      description: 'Create new educational content and course materials',
      icon: 'BookOpen',
      buttonText: 'New Course',
      buttonVariant: 'outline',
      onClick: () => handleQuickAction('new_course')
    },
    {
      title: 'Reports',
      description: 'Generate and view analytics reports and user statistics',
      icon: 'BarChart3',
      buttonText: 'View Reports',
      buttonVariant: 'outline',
      onClick: () => handleQuickAction('reports')
    },
    {
      title: 'Verify Payments',
      description: 'Review and approve pending payment submissions',
      icon: 'CreditCard',
      buttonText: 'Review Payments',
      buttonVariant: 'default',
      badge: `${dashboardData?.stats?.pendingPayments || 0} pending`,
      onClick: () => handleQuickAction('verify_payments')
    }
  ];

  if (loading && !dashboardData?.stats) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={handleToggleSidebar} 
        />
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !dashboardData?.stats) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={handleToggleSidebar} 
        />
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Icon name="AlertCircle" size={32} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={handleToggleSidebar} 
      />
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Mobile spacing for header */}
        <div className="lg:hidden h-16"></div>
        
        {/* Header */}
        <div className="bg-card border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your platform.
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                loading={refreshing}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Refresh
              </Button>
              
              {dashboardData?.stats?.pendingPayments > 0 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/admin-users?tab=payments&filter=pending')}
                  iconName="AlertCircle"
                  iconPosition="left"
                >
                  {dashboardData?.stats?.pendingPayments} Pending
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {metricsData?.map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                icon={metric?.icon}
                trend={metric?.trend}
                trendDirection={metric?.trendDirection}
                subtitle={metric?.subtitle}
                color={metric?.color}
                onClick={metric?.onClick}
              />
            ))}
          </div>

          {/* Quick Actions - Updated to use working buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {quickActions?.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action?.title}
                description={action?.description}
                icon={action?.icon}
                buttonText={action?.buttonText}
                buttonVariant={action?.buttonVariant}
                badge={action?.badge}
                onClick={action?.onClick}
              />
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Activity Feed - Takes 2 columns on xl screens */}
            <div className="xl:col-span-2">
              <ActivityFeed activities={dashboardData?.activities} />
            </div>

            {/* Right Sidebar - Alerts and System Status */}
            <div className="space-y-6">
              <AlertsPanel alerts={dashboardData?.alerts} />
              <SystemStatusPanel systemData={dashboardData?.systemStatus} />
            </div>
          </div>

          {/* Additional Admin Tools */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Administrative Tools</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => navigate('/admin-users')}
                className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-muted transition-colors duration-200"
              >
                <Icon name="Users" size={24} className="text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">User Management</span>
                <span className="text-xs text-muted-foreground">
                  {dashboardData?.stats?.totalUsers || 0} users
                </span>
              </button>
              
              <button 
                onClick={() => navigate('/admin-courses')}
                className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-muted transition-colors duration-200"
              >
                <Icon name="BookOpen" size={24} className="text-secondary mb-2" />
                <span className="text-sm font-medium text-foreground">Course Library</span>
                <span className="text-xs text-muted-foreground">
                  {dashboardData?.stats?.publishedCourses || 0} published
                </span>
              </button>
              
              <button 
                onClick={() => console.log('Analytics clicked')}
                className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-muted transition-colors duration-200"
              >
                <Icon name="BarChart3" size={24} className="text-success mb-2" />
                <span className="text-sm font-medium text-foreground">Analytics</span>
                <span className="text-xs text-muted-foreground">View reports</span>
              </button>
              
              <button 
                onClick={() => console.log('Settings clicked')}
                className="flex flex-col items-center p-4 rounded-lg border border-border hover:bg-muted transition-colors duration-200"
              >
                <Icon name="Settings" size={24} className="text-warning mb-2" />
                <span className="text-sm font-medium text-foreground">Settings</span>
                <span className="text-xs text-muted-foreground">Platform config</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
