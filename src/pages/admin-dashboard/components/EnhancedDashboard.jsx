import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { adminService } from '../../../services/adminService';
import { reviewService } from '../../../services/reviewService';

const EnhancedDashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    pendingPayments: 0,
    activeMembers: 0,
    totalRevenue: 0,
    recentActivities: [],
    pendingTasks: {
      payments: 0,
      media: 0,
      courses: 0
    },
    reviewStats: {
      total: 0,
      pending: 0,
      approved: 0,
      averageRating: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardMetrics();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-orange-600 bg-orange-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const quickActions = [
    {
      label: 'Add User',
      icon: 'UserPlus',
      action: () => navigate('/admin-users?action=create'),
      color: 'bg-blue-500'
    },
    {
      label: 'Create Course',
      icon: 'BookOpen',
      action: () => navigate('/admin-courses?action=create'),
      color: 'bg-green-500'
    },
    {
      label: 'Upload Media',
      icon: 'Upload',
      action: () => navigate('/admin-content?action=upload'),
      color: 'bg-purple-500'
    },
    {
      label: 'Review Payments',
      icon: 'CreditCard',
      action: () => navigate('/admin-users?tab=payments'),
      color: 'bg-orange-500'
    },
    {
      label: 'View Reports',
      icon: 'BarChart3',
      action: () => navigate('/admin-analytics'),
      color: 'bg-indigo-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Icon name="Loader" size={24} className="animate-spin text-white" />
              </div>
              <div className="text-lg font-medium text-foreground mb-2">Loading Dashboard</div>
              <div className="text-sm text-muted-foreground">Please wait while we prepare your admin dashboard...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {userProfile?.full_name || 'Admin'}. Here's what's happening with your platform.
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center space-x-2 bg-card border border-border rounded-xl px-4 py-3 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                  <Icon name={action.icon} size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Users */}
          <div 
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin-users')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon name="Users" size={24} className="text-blue-600" />
              </div>
              <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {dashboardData.totalUsers.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <div className="mt-2 text-xs text-green-600 font-medium">
              All registered members
            </div>
          </div>

          {/* Pending Payments */}
          <div 
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin-users?tab=payments')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Icon name="CreditCard" size={24} className="text-orange-600" />
              </div>
              <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {dashboardData.pendingPayments}
            </h3>
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <div className="mt-2 text-xs text-orange-600 font-medium">
              Awaiting approval
            </div>
          </div>

          {/* Active Members */}
          <div 
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin-users?tab=members')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-600" />
              </div>
              <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {dashboardData.activeMembers.toLocaleString()}
            </h3>
            <p className="text-sm text-muted-foreground">Active Members</p>
            <div className="mt-2 text-xs text-green-600 font-medium">
              {Math.round((dashboardData.activeMembers / dashboardData.totalUsers) * 100)}% of total
            </div>
          </div>

          {/* Total Revenue */}
          <div 
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin-analytics')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Icon name="DollarSign" size={24} className="text-purple-600" />
              </div>
              <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {formatCurrency(dashboardData.totalRevenue)}
            </h3>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <div className="mt-2 text-xs text-purple-600 font-medium">
              This month
            </div>
          </div>

          {/* Review Stats */}
          <div 
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/admin-reviews')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Icon name="Star" size={24} className="text-pink-600" />
              </div>
              <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {dashboardData.reviewStats.total}
            </h3>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <div className="mt-2 text-xs text-pink-600 font-medium">
              {dashboardData.reviewStats.pending} pending
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Tasks Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Pending Tasks</h2>
                <Icon name="AlertCircle" size={20} className="text-orange-500" />
              </div>
              
              <div className="space-y-4">
                {/* Pending Payments */}
                <div 
                  className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors"
                  onClick={() => navigate('/admin-users?tab=payments')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Icon name="CreditCard" size={16} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Pending Payments</div>
                      <div className="text-xs text-muted-foreground">Awaiting approval</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {dashboardData.pendingTasks.payments}
                  </div>
                </div>

                {/* Pending Media */}
                <div 
                  className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => navigate('/admin-content?tab=pending')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon name="Video" size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Pending Media</div>
                      <div className="text-xs text-muted-foreground">Awaiting processing</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {dashboardData.pendingTasks.media}
                  </div>
                </div>

                {/* Unpublished Courses */}
                <div 
                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors"
                  onClick={() => navigate('/admin-courses?status=draft')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Icon name="BookOpen" size={16} className="text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">Unpublished Courses</div>
                      <div className="text-xs text-muted-foreground">In draft status</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-yellow-600">
                    {dashboardData.pendingTasks.courses}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/admin-analytics')}>
                  View All
                </Button>
              </div>

              {dashboardData.recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No Recent Activity</h3>
                  <p className="text-muted-foreground">
                    Activity will appear here as you manage the platform.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border border-border rounded-xl">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'user_created' ? 'bg-blue-100' :
                        activity.type === 'course_created' ? 'bg-green-100' :
                        activity.type === 'content_uploaded' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
                        <Icon 
                          name={
                            activity.type === 'user_created' ? 'UserPlus' :
                            activity.type === 'course_created' ? 'BookOpen' :
                            activity.type === 'content_uploaded' ? 'Upload' :
                            'CreditCard'
                          } 
                          size={16} 
                          className={
                            activity.type === 'user_created' ? 'text-blue-600' :
                            activity.type === 'course_created' ? 'text-green-600' :
                            activity.type === 'content_uploaded' ? 'text-purple-600' :
                            'text-orange-600'
                          } 
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground mb-1">{activity.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{activity.adminName}</span>
                          <span>•</span>
                          <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <Icon name="MessageCircle" size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Need Help?</h3>
              <p className="text-blue-700">
                Contact our technical support team for any platform issues or assistance.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
              >
                <Icon name="MessageCircle" size={16} className="mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
