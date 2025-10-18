import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { analyticsService } from '../../services/analyticsService';

// Recharts imports
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

// Color palette for charts
const COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4'
};

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

const AdminAnalytics = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const result = await analyticsService.getAnalyticsData(dateRange);
      if (result.success) {
        setAnalyticsData(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error);
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

  const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
  };

  const exportReport = async (type) => {
    try {
      const result = await analyticsService.exportReport(type, dateRange);
      if (result.success) {
        // Success handled in service
      } else {
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader" size={24} className="animate-spin text-white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Analytics</div>
                <div className="text-sm text-muted-foreground">Please wait while we prepare your reports...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
            <div className="text-center py-12">
              <Icon name="AlertCircle" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Data Available</h2>
              <p className="text-muted-foreground mb-4">Unable to load analytics data at this time.</p>
              <Button onClick={loadAnalyticsData} iconName="RefreshCw">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { summary, revenue, userGrowth, coursePerformance, contentEngagement } = analyticsData;

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Analytics & Reports
              </h1>
              <p className="text-muted-foreground">
                Comprehensive insights into your platform performance and user engagement
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last 12 Months</option>
              </select>
              <Button
                variant="outline"
                onClick={() => exportReport('comprehensive')}
                iconName="Download"
              >
                Export Report
              </Button>
              <Button
                variant="outline"
                onClick={loadAnalyticsData}
                iconName="RefreshCw"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Total Revenue</h3>
                <Icon name="DollarSign" size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">All-time platform revenue</p>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <Icon name="TrendingUp" size={16} className="mr-1" />
                <span>+{summary.growthRate}% from last period</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Total Users</h3>
                <Icon name="Users" size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">
                {formatNumber(summary.totalUsers)}
              </div>
              <p className="text-sm text-muted-foreground">Registered users</p>
              <div className="mt-4 flex items-center text-sm text-blue-600">
                <Icon name="TrendingUp" size={16} className="mr-1" />
                <span>{formatNumber(summary.activeUsers)} active users</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Active Users</h3>
                <Icon name="UserCheck" size={20} className="text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">
                {formatNumber(summary.activeUsers)}
              </div>
              <p className="text-sm text-muted-foreground">Currently active</p>
              <div className="mt-4 flex items-center text-sm text-purple-600">
                <Icon name="Activity" size={16} className="mr-1" />
                <span>Last 15 minutes</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Course Completion</h3>
                <Icon name="Award" size={20} className="text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-2">
                {summary.avgCompletionRate}%
              </div>
              <p className="text-sm text-muted-foreground">Average completion rate</p>
              <div className="mt-4 flex items-center text-sm text-orange-600">
                <Icon name="TrendingUp" size={16} className="mr-1" />
                <span>{formatNumber(summary.totalCourses)} courses</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Revenue Overview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport('revenue')}
                >
                  Export
                </Button>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke={COLORS.success} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* User Growth Chart */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">User Growth</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport('users')}
                >
                  Export
                </Button>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="newUsers" fill={COLORS.primary} name="New Users" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="totalUsers" stroke={COLORS.secondary} strokeWidth={2} name="Total Users" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Course Performance */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Course Performance</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport('courses')}
                >
                  Export
                </Button>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={coursePerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="title" stroke="#6b7280" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="enrollments" fill={COLORS.primary} name="Enrollments" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completionRate" fill={COLORS.success} name="Completion %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Content Engagement */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Content Engagement</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportReport('content')}
                >
                  Export
                </Button>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contentEngagement}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, completion }) => `${type}: ${completion}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="completion"
                    nameKey="type"
                  >
                    {contentEngagement.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
            {/* Course Performance Details */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-6">Course Performance Details</h3>
              <div className="space-y-4">
                {coursePerformance.map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{course.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatNumber(course.enrollments)} enrollments</span>
                        <span>{course.completionRate}% completion</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{formatCurrency(course.revenue)}</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Engagement Details */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground mb-6">Content Engagement Details</h3>
              <div className="space-y-4">
                {contentEngagement.map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{content.type}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          {content.views ? `${formatNumber(content.views)} views` : `${formatNumber(content.downloads)} downloads`}
                        </span>
                        <span>{content.completion}% completion</span>
                        <span>{content.fileCount} files</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-foreground">{content.avgTime}</div>
                      <div className="text-xs text-muted-foreground">Avg. time</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Reports Section */}
          <div className="mt-8 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-6">Quick Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => exportReport('revenue')}
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted transition-colors group"
              >
                <Icon name="DollarSign" size={24} className="text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">Revenue Report</span>
                <span className="text-xs text-muted-foreground">Monthly earnings</span>
              </button>
              
              <button
                onClick={() => exportReport('users')}
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted transition-colors group"
              >
                <Icon name="Users" size={24} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">User Report</span>
                <span className="text-xs text-muted-foreground">Growth & activity</span>
              </button>
              
              <button
                onClick={() => exportReport('courses')}
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted transition-colors group"
              >
                <Icon name="BookOpen" size={24} className="text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">Course Report</span>
                <span className="text-xs text-muted-foreground">Performance metrics</span>
              </button>
              
              <button
                onClick={() => exportReport('content')}
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-muted transition-colors group"
              >
                <Icon name="BarChart3" size={24} className="text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-foreground">Content Report</span>
                <span className="text-xs text-muted-foreground">Engagement metrics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
