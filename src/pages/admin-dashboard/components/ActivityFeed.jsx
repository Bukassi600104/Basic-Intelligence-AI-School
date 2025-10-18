import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return { icon: 'UserPlus', color: 'text-success' };
      case 'payment_submitted':
        return { icon: 'CreditCard', color: 'text-warning' };
      case 'payment_verified':
        return { icon: 'CheckCircle', color: 'text-success' };
      case 'course_completed':
        return { icon: 'Award', color: 'text-primary' };
      case 'login':
        return { icon: 'LogIn', color: 'text-muted-foreground' };
      default:
        return { icon: 'Activity', color: 'text-muted-foreground' };
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (activities?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors duration-200">
          View All
        </button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.map((activity, index) => {
          const { icon, color } = getActivityIcon(activity?.type);
          
          return (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors duration-200">
              <div className={`flex-shrink-0 ${color}`}>
                <Icon name={icon} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{activity?.user}</span>
                  <span className="text-muted-foreground"> {activity?.action}</span>
                </p>
                {activity?.details && (
                  <p className="text-xs text-muted-foreground mt-1">{activity?.details}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(activity?.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;