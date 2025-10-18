import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import { systemService } from '../../../services/systemService';

const SystemStatusPanel = () => {
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch system status
  const fetchSystemStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await systemService.getSystemStatus();
      if (result.success) {
        setSystemData(result.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and auto-refresh every 5 minutes
  useEffect(() => {
    fetchSystemStatus();

    const interval = setInterval(() => {
      fetchSystemStatus(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchSystemStatus(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'offline':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStorageColor = (usage) => {
    if (usage >= 90) return 'bg-error';
    if (usage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  // Prepare status items for display
  const statusItems = systemData ? [
    {
      label: 'Server Status',
      value: systemData.serverStatus,
      icon: 'Server',
      status: systemData.serverStatus
    },
    {
      label: 'Database',
      value: systemData.databaseStatus.message,
      icon: 'Database',
      status: systemData.databaseStatus.status
    },
    {
      label: 'Active Users',
      value: systemData.activeUsers.count,
      icon: 'Users',
      status: 'online'
    },
    {
      label: 'System Uptime',
      value: systemData.uptime.percentage,
      icon: 'Clock',
      status: 'online'
    }
  ] : [];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <Icon name="Loader" size={24} className="animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading system status...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header with last updated */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">System Status</h3>
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Updated {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statusItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-md">
            <Icon 
              name={item.icon} 
              size={16} 
              className={getStatusColor(item.status)} 
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Storage Usage */}
      {systemData?.storageUsage && (
        <div className="mb-6">
          {/* Storage Alert */}
          {systemData.storageUsage.percentage >= 75 && (
            <div className={`mb-3 p-3 rounded-md border ${
              systemData.storageUsage.percentage >= 90 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-center space-x-2">
                <Icon name="AlertTriangle" size={16} />
                <span className="text-sm font-medium">
                  {systemData.storageUsage.percentage >= 90 
                    ? 'Storage Almost Full!' 
                    : 'Storage Usage High'}
                </span>
              </div>
              <p className="text-xs mt-1">
                {systemData.storageUsage.percentage >= 90 
                  ? 'Consider cleaning up files or upgrading storage plan.'
                  : 'Monitor storage usage closely.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Storage Usage</span>
            <span className="text-sm text-muted-foreground">
              {systemData.storageUsage.percentage}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getStorageColor(systemData.storageUsage.percentage)}`}
              style={{ width: `${systemData.storageUsage.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {systemData.storageUsage.message} ({systemData.storageUsage.used} {systemData.storageUsage.unit} of {systemData.storageUsage.total} {systemData.storageUsage.unit})
          </p>
          
          {/* Storage Breakdown */}
          {systemData.storageUsage.breakdown && systemData.storageUsage.breakdown.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">Storage by Type</span>
                <span className="text-xs text-muted-foreground">
                  {systemData.storageUsage.fileCount} files
                </span>
              </div>
              <div className="space-y-2">
                {systemData.storageUsage.breakdown.map((bucket, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        bucket.bucket === 'videos' ? 'bg-blue-500' :
                        bucket.bucket === 'pdfs' ? 'bg-green-500' :
                        bucket.bucket === 'images' ? 'bg-purple-500' :
                        bucket.bucket === 'audio' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="capitalize text-muted-foreground">{bucket.bucket}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-foreground">{bucket.size} {bucket.unit}</span>
                      <span className="text-muted-foreground ml-1">({bucket.fileCount} files)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Last Backup */}
      {systemData?.lastBackup && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Last Backup</span>
          </div>
          <span className="text-sm text-muted-foreground">{systemData.lastBackup.display}</span>
        </div>
      )}

      {/* Subscription Stats */}
      {systemData?.subscriptionStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Users" size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Membership Overview</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-700">Total Members:</span>
              <span className="font-medium text-blue-900">{systemData.subscriptionStats.totalMembers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Active:</span>
              <span className="font-medium text-blue-900">{systemData.subscriptionStats.activeMembers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Expiring Soon:</span>
              <span className="font-medium text-blue-900">{systemData.subscriptionStats.expiringSoon}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Pending Requests:</span>
              <span className="font-medium text-blue-900">{systemData.subscriptionStats.pendingRequests}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick System Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            {refreshing ? (
              <Icon name="Loader" size={14} className="animate-spin" />
            ) : (
              <Icon name="RefreshCw" size={14} />
            )}
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200">
            <Icon name="Settings" size={14} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPanel;
