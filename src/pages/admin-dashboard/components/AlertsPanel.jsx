import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertsPanel = ({ alerts = [] }) => {
  const getAlertConfig = (priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-error/10',
          border: 'border-error/20',
          icon: 'AlertTriangle',
          iconColor: 'text-error',
          textColor: 'text-error'
        };
      case 'medium':
        return {
          bg: 'bg-warning/10',
          border: 'border-warning/20',
          icon: 'AlertCircle',
          iconColor: 'text-warning',
          textColor: 'text-warning'
        };
      default:
        return {
          bg: 'bg-primary/10',
          border: 'border-primary/20',
          icon: 'Info',
          iconColor: 'text-primary',
          textColor: 'text-primary'
        };
    }
  };

  if (alerts?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Administrative Alerts</h3>
        <div className="text-center py-6">
          <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" />
          <p className="text-muted-foreground">All systems running smoothly</p>
          <p className="text-sm text-muted-foreground mt-1">No pending alerts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Administrative Alerts</h3>
        <span className="px-2 py-1 bg-error/10 border border-error/20 rounded-full text-xs font-medium text-error">
          {alerts?.length} pending
        </span>
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {alerts?.map((alert, index) => {
          const config = getAlertConfig(alert?.priority);
          
          return (
            <div key={index} className={`${config?.bg} ${config?.border} border rounded-lg p-4`}>
              <div className="flex items-start space-x-3">
                <Icon name={config?.icon} size={18} className={`${config?.iconColor} flex-shrink-0 mt-0.5`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-medium ${config?.textColor}`}>
                      {alert?.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {alert?.time}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {alert?.message}
                  </p>
                  
                  {alert?.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={alert?.action?.onClick}
                      iconName={alert?.action?.icon}
                      iconPosition="left"
                    >
                      {alert?.action?.text}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="ghost" fullWidth>
          <Icon name="Settings" size={16} className="mr-2" />
          Manage Alert Settings
        </Button>
      </div>
    </div>
  );
};

export default AlertsPanel;