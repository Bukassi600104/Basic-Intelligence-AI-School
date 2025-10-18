import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { settingsService } from '../../services/settingsService';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Basic Intelligence Community School',
    siteDescription: 'Premium intelligence and analytical training platform',
    contactEmail: 'admin@basicintelligence.com',
    supportPhone: '+2349062284074',
    membershipPlans: {
      basic: { price: 5000, features: ['Basic PDF Access', 'Community Access'] },
      premium: { price: 15000, features: ['Full PDF Library', 'Video Content', 'Priority Support'] },
      pro: { price: 25000, features: ['Everything', 'One-on-One Sessions', 'Custom Content'] }
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      if (userProfile && userProfile?.role !== 'admin') {
        navigate('/');
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await settingsService.getDashboardSettings();
        
        if (error) {
          setError('Failed to load settings: ' + error);
          return;
        }

        if (data) {
          setSettings({
            siteName: data.general.siteName,
            siteDescription: data.general.siteDescription,
            contactEmail: data.general.contactEmail,
            supportPhone: data.general.supportPhone,
            membershipPlans: data.membership.plans,
            notifications: {
              emailNotifications: data.notifications.email_notifications,
              smsNotifications: data.notifications.sms_notifications,
              pushNotifications: data.notifications.push_notifications
            }
          });
        }
      } catch (err) {
        setError('Failed to load settings: ' + err?.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userProfile, navigate]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Save general settings
      const generalUpdates = {
        'site_name': settings.siteName,
        'site_description': settings.siteDescription,
        'contact_email': settings.contactEmail,
        'support_phone': settings.supportPhone
      };

      // Save membership plans
      const membershipUpdates = {
        'membership_plans': settings.membershipPlans
      };

      // Save notifications
      const notificationUpdates = {
        'notifications': {
          email_notifications: settings.notifications.emailNotifications,
          sms_notifications: settings.notifications.smsNotifications,
          push_notifications: settings.notifications.pushNotifications
        }
      };

      // Save all settings to database
      const { error: generalError } = await settingsService.updateCategorySettings('general', generalUpdates);
      if (generalError) throw new Error(`General settings: ${generalError}`);

      const { error: membershipError } = await settingsService.updateCategorySettings('membership', membershipUpdates);
      if (membershipError) throw new Error(`Membership settings: ${membershipError}`);

      const { error: notificationError } = await settingsService.updateCategorySettings('notifications', notificationUpdates);
      if (notificationError) throw new Error(`Notification settings: ${notificationError}`);

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to save settings: ' + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: 'Settings' },
    { id: 'membership', name: 'Membership Plans', icon: 'CreditCard' },
    { id: 'notifications', name: 'Notifications', icon: 'Bell' },
    { id: 'security', name: 'Security', icon: 'Shield' },
    { id: 'system', name: 'System', icon: 'Monitor' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Site Name
              </label>
              <Input
                value={settings?.siteName}
                onChange={(e) => handleInputChange('general', 'siteName', e?.target?.value)}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Site Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                value={settings?.siteDescription}
                onChange={(e) => handleInputChange('general', 'siteDescription', e?.target?.value)}
                placeholder="Enter site description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contact Email
              </label>
              <Input
                type="email"
                value={settings?.contactEmail}
                onChange={(e) => handleInputChange('general', 'contactEmail', e?.target?.value)}
                placeholder="Enter contact email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Support Phone
              </label>
              <Input
                value={settings?.supportPhone}
                onChange={(e) => handleInputChange('general', 'supportPhone', e?.target?.value)}
                placeholder="Enter support phone"
              />
            </div>
          </div>
        );
        
      case 'membership':
        return (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground mb-4">
              Configure membership plans and pricing
            </div>
            {Object?.entries(settings?.membershipPlans || {})?.map(([planId, plan]) => (
              <div key={planId} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-foreground capitalize">{planId} Plan</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">₦</span>
                    <Input
                      type="number"
                      value={plan?.price}
                      onChange={(e) => handleInputChange('membershipPlans', planId, {
                        ...plan,
                        price: parseInt(e?.target?.value) || 0
                      })}
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Features
                  </label>
                  <div className="space-y-2">
                    {plan?.features?.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Icon name="Check" size={16} className="text-green-500" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground mb-4">
              Configure notification preferences
            </div>
            
            {Object?.entries(settings?.notifications || {})?.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground capitalize">
                    {key?.replace(/([A-Z])/g, ' $1')?.trim()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {key === 'emailNotifications' && 'Send notifications via email'}
                    {key === 'smsNotifications' && 'Send notifications via SMS'}
                    {key === 'pushNotifications' && 'Send push notifications'}
                  </div>
                </div>
                <button
                  onClick={() => handleInputChange('notifications', key, !value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        );
        
      case 'security':
        return (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground mb-4">
              Security and authentication settings
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-lg font-medium text-foreground mb-3">Password Policy</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-500" />
                  <span className="text-sm text-foreground">Minimum 8 characters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-500" />
                  <span className="text-sm text-foreground">At least one uppercase letter</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-green-500" />
                  <span className="text-sm text-foreground">At least one number</span>
                </div>
              </div>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-lg font-medium text-foreground mb-3">Session Management</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Session Timeout</span>
                  <span className="text-sm text-muted-foreground">24 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Max Concurrent Sessions</span>
                  <span className="text-sm text-muted-foreground">3</span>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'system':
        return (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground mb-4">
              System information and maintenance
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Database</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Storage</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Authentication</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Online</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-3">Maintenance</h3>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="Download" size={16} className="mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" size="sm" fullWidth>
                    <Icon name="FileText" size={16} className="mr-2" />
                    View Logs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

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
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">
                Configure system settings and preferences
              </p>
            </div>
            
            <Button
              onClick={handleSaveSettings}
              loading={loading}
              iconName="Save"
              iconPosition="left"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Icon name="CheckCircle" size={16} className="text-green-600 mr-2" />
                <span className="text-green-700 text-sm">{successMessage}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Tabs */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      activeTab === tab?.id
                        ? 'text-primary bg-primary/10 border-r-2 border-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} className="mr-3" />
                    {tab?.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {tabs?.find(tab => tab?.id === activeTab)?.name}
                  </h2>
                </div>
                
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
