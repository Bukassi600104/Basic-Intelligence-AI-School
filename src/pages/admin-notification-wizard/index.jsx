import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { userService } from '../../services/userService';
import { notificationService } from '../../services/notificationService';

const AdminNotificationWizard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notificationData, setNotificationData] = useState({
    templateName: '',
    subject: '',
    message: '',
    recipientType: 'email', // email, whatsapp, both
    selectedUserIds: []
  });
  const [templates, setTemplates] = useState([]);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null);

  // Check admin access
  useEffect(() => {
    if (userProfile && userProfile?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [userProfile, navigate]);

  // Load users and templates
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResult, templatesResult] = await Promise.all([
        userService.getAllUsers(),
        notificationService.getTemplates()
      ]);

      if (usersResult.data) {
        setUsers(usersResult.data);
      }

      if (templatesResult.data) {
        setTemplates(templatesResult.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateName) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setNotificationData(prev => ({
        ...prev,
        templateName,
        subject: template.subject,
        message: template.content
      }));
    }
  };

  const handleUserSelection = (userId, isSelected) => {
    if (isSelected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSendNotifications = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    if (!notificationData.message.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);
    setResults(null);

    try {
      const result = await notificationService.sendBulkNotifications({
        userIds: selectedUsers,
        templateName: notificationData.templateName || 'Custom Notification',
        variables: {
          custom_message: notificationData.message
        },
        recipientType: notificationData.recipientType
      });

      setResults(result);
      
      if (result.successful > 0) {
        alert(`Successfully sent ${result.successful} notifications`);
      }
      
      if (result.failed > 0) {
        alert(`${result.failed} notifications failed to send. Check the logs for details.`);
      }

    } catch (error) {
      alert('Failed to send notifications: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader" size={24} className="animate-spin text-white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Notification Wizard</div>
                <div className="text-sm text-muted-foreground">Please wait while we fetch data...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Notification Wizard</h1>
              <p className="text-muted-foreground">
                Send bulk notifications to users via email and WhatsApp
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button 
                variant="outline"
                onClick={() => navigate('/admin-users')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Users
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Selection */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Select Users</h2>
                
                {/* Select All */}
                <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <span className="ml-2 text-sm font-medium text-foreground">Select All Users</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedUsers.length} selected
                  </span>
                </div>

                {/* Users List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center p-3 hover:bg-muted/50 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {user.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                        {user.whatsapp_phone && (
                          <div className="text-xs text-green-600 flex items-center mt-1">
                            <Icon name="Phone" size={12} className="mr-1" />
                            WhatsApp: {user.whatsapp_phone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Notification Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">Notification Template</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Choose Template
                    </label>
                    <select
                      value={notificationData.templateName}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Custom Message</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.name}>
                          {template.name} ({template.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={notificationData.subject}
                      onChange={(e) => setNotificationData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Notification subject"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      value={notificationData.message}
                      onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                      rows={8}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                      placeholder="Enter your notification message here..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You can use variables like {{full_name}}, {{email}}, {{member_id}} in your message
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Send Via
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="email"
                          checked={notificationData.recipientType === 'email'}
                          onChange={(e) => setNotificationData(prev => ({ ...prev, recipientType: e.target.value }))}
                          className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                        />
                        <span className="ml-2 text-sm text-foreground">Email Only</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="whatsapp"
                          checked={notificationData.recipientType === 'whatsapp'}
                          onChange={(e) => setNotificationData(prev => ({ ...prev, recipientType: e.target.value }))}
                          className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                        />
                        <span className="ml-2 text-sm text-foreground">WhatsApp Only</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="both"
                          checked={notificationData.recipientType === 'both'}
                          onChange={(e) => setNotificationData(prev => ({ ...prev, recipientType: e.target.value }))}
                          className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                        />
                        <span className="ml-2 text-sm text-foreground">Both</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Ready to Send</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUsers.length} users selected • {notificationData.recipientType}
                    </p>
                  </div>
                  <Button
                    onClick={handleSendNotifications}
                    loading={sending}
                    disabled={selectedUsers.length === 0 || !notificationData.message.trim()}
                    size="lg"
                  >
                    <Icon name="Send" size={16} className="mr-2" />
                    Send Notifications
                  </Button>
                </div>
              </div>

              {/* Results */}
              {results && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Results</h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{results.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                      <div className="text-sm text-muted-foreground">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </div>

                  {results.failed > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-900 mb-2">Failed Notifications</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {results.details
                          .filter(detail => !detail.success)
                          .map((detail, index) => (
                            <div key={index} className="text-xs text-red-700">
                              User ID: {detail.userId} - {detail.error}
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationWizard;
