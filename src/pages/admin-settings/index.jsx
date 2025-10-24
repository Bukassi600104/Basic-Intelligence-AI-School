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
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

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

  // Password validation
  const isPasswordValid = () => {
    return (
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      passwordData.newPassword === passwordData.confirmPassword &&
      passwordData.newPassword.length >= 8 &&
      /[A-Z]/.test(passwordData.newPassword) &&
      /[0-9]/.test(passwordData.newPassword)
    );
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!isPasswordValid()) {
      setError('Please ensure all password requirements are met');
      return;
    }

    setPasswordLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { supabase } = await import('../../lib/supabase');
      
      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });

      if (signInError) {
        setError('Current password is incorrect. Please try again.');
        setPasswordLoading(false);
        return;
      }

      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setSuccessMessage('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update password: ' + err?.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: 'Settings' },
    { id: 'membership', name: 'Membership Plans', icon: 'CreditCard' },
    { id: 'notifications', name: 'Notifications', icon: 'Bell' },
    { id: 'password', name: 'Password Settings', icon: 'Lock' },
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
                autoComplete="email"
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
        
      case 'password':
        return (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground mb-4">
              Change your admin account password
            </div>
            
            <div className="border border-border rounded-lg p-6">
              <div className="space-y-5">
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-foreground mb-2">
                    <Icon name="Lock" size={16} className="text-muted-foreground" />
                    <span>Current Password</span>
                  </label>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="border-2"
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-foreground mb-2">
                    <Icon name="Key" size={16} className="text-muted-foreground" />
                    <span>New Password</span>
                  </label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="border-2"
                  />
                  {passwordData.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className={`flex items-center space-x-2 text-xs ${passwordData.newPassword.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Icon name={passwordData.newPassword.length >= 8 ? 'CheckCircle' : 'Circle'} size={12} />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Icon name={/[A-Z]/.test(passwordData.newPassword) ? 'CheckCircle' : 'Circle'} size={12} />
                        <span>At least one uppercase letter</span>
                      </div>
                      <div className={`flex items-center space-x-2 text-xs ${/[0-9]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-muted-foreground'}`}>
                        <Icon name={/[0-9]/.test(passwordData.newPassword) ? 'CheckCircle' : 'Circle'} size={12} />
                        <span>At least one number</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-foreground mb-2">
                    <Icon name="ShieldCheck" size={16} className="text-muted-foreground" />
                    <span>Confirm New Password</span>
                  </label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="border-2"
                  />
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="mt-2 text-xs text-red-500 flex items-center space-x-1">
                      <Icon name="AlertCircle" size={12} />
                      <span>Passwords do not match</span>
                    </p>
                  )}
                  {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                    <p className="mt-2 text-xs text-green-500 flex items-center space-x-1">
                      <Icon name="CheckCircle" size={12} />
                      <span>Passwords match</span>
                    </p>
                  )}
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordLoading || !isPasswordValid()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    {passwordLoading ? (
                      <>
                        <Icon name="Loader" size={20} className="animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Lock" size={20} />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="transition-all duration-300 lg:ml-60">
        {/* Mobile spacing for header */}
        <div className="lg:hidden h-16"></div>
        
        {/* Enhanced Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 lg:px-6 py-8 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float">
                <Icon name="Settings" size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-1 animate-fadeIn">Settings</h1>
                <p className="text-white/90 animate-slideUp">
                  Configure system settings and preferences
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="bg-white text-indigo-600 hover:bg-gray-50 px-6 py-3 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Save" size={20} className="mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Enhanced Success/Error Messages */}
          {successMessage && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-4 mb-6 shadow-lg animate-slideDown">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                  <Icon name="CheckCircle" size={20} className="text-white" />
                </div>
                <span className="text-emerald-700 font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-4 mb-6 shadow-lg animate-slideDown">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mr-3">
                  <Icon name="AlertCircle" size={20} className="text-white" />
                </div>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Enhanced Settings Tabs */}
            <div className="lg:col-span-1">
              <nav className="bg-white/80 backdrop-blur-md rounded-2xl p-3 shadow-lg border-2 border-gray-200 space-y-2">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                      activeTab === tab?.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600'
                    }`}
                  >
                    <Icon name={tab?.icon} size={20} className="mr-3" />
                    {tab?.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Enhanced Settings Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/90 backdrop-blur-md border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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

