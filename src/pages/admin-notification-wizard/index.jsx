import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
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
  const [error, setError] = useState(null);
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
    const checkAccess = async () => {
      try {
        // Check if user is authenticated
        if (!userProfile) {
          navigate('/login');
          return;
        }

        // Check if user is admin
        if (userProfile.role !== 'admin') {
          navigate('/');
          return;
        }

      } catch (error) {
        setError(error.message);
        console.error('Access validation failed:', error);
      }
    };

    checkAccess();
  }, [userProfile, navigate]);

  // Load users and templates
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersResult, templatesResult] = await Promise.all([
        userService.getAllUsers(),
        notificationService.getTemplates()
      ]);

      if (usersResult?.error) {
        console.error('Error loading users:', usersResult.error);
        setError('Failed to load users: ' + usersResult.error);
      } else if (usersResult?.data) {
        setUsers(usersResult.data);
      } else {
        setUsers([]);
      }

      if (templatesResult?.error) {
        console.error('Error loading templates:', templatesResult.error);
      } else if (templatesResult?.data) {
        setTemplates(templatesResult.data);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data: ' + error.message);
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
    if (isSelected && users && users.length > 0) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSendNotifications = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!notificationData.message.trim()) {
      setError('Please enter a message');
      return;
    }

    setSending(true);
    setResults(null);
    setError(null);

    try {
      const result = await notificationService.sendBulkNotifications({
        userIds: selectedUsers,
        templateName: notificationData.templateName || 'custom_message',
        variables: {
          custom_message: notificationData.message,
          subject: notificationData.subject || 'New Notification'
        },
        recipientType: notificationData.recipientType
      });

      setResults(result);
      
      if (result.successful > 0 && result.failed === 0) {
        setError(null);
      } else if (result.failed > 0) {
        setError(`${result.failed} notifications failed to send. Check the results below for details.`);
      }

    } catch (error) {
      console.error('Send notifications error:', error);
      setError('Failed to send notifications: ' + error.message);
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
          {/* Header with Gradient */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-lg">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg animate-float">
                  <Icon name="Send" size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Notification Wizard</h1>
                  <p className="text-blue-100">
                    Send bulk notifications to users via email and WhatsApp
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 border border-white/30"
                >
                  <Icon name="ArrowLeft" size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 flex items-start shadow-lg animate-slideDown">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="AlertCircle" size={20} className="text-white" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Card Header with Gradient */}
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-600 p-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon name="Users" size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Select Recipients</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  
                  {/* Select All */}
                  <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border-2 border-emerald-200">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-5 h-5 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                      />
                      <span className="ml-3 text-sm font-semibold text-gray-900">Select All Users</span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                      {selectedUsers.length} selected
                    </span>
                  </div>

                  {/* Users List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {users && users.length > 0 ? (
                      users.map(user => (
                        <div key={user.id} className="flex items-center p-4 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-emerald-200 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                            className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                          />
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate group-hover:text-emerald-700">
                              {user?.full_name || user?.email || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {user?.email || 'No email'}
                            </div>
                            {user?.whatsapp_phone && (
                              <div className="text-xs text-green-600 flex items-center mt-1 font-medium">
                                <Icon name="Phone" size={12} className="mr-1" />
                                WhatsApp: {user.whatsapp_phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Icon name="Users" size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No users found</p>
                        <p className="text-sm text-gray-500 mt-1">Users will appear here when available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Notification Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Template Selection */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Card Header with Gradient */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon name="Mail" size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Compose Notification</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  
                  <div className="space-y-5">
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <Icon name="Layout" size={16} className="text-gray-500" />
                        <span>Choose Template</span>
                      </label>
                      <select
                        value={notificationData.templateName}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
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
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <Icon name="Type" size={16} className="text-gray-500" />
                        <span>Subject</span>
                      </label>
                      <input
                        type="text"
                        value={notificationData.subject}
                        onChange={(e) => setNotificationData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter notification subject..."
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <Icon name="FileText" size={16} className="text-gray-500" />
                        <span>Message</span>
                      </label>
                      <textarea
                        value={notificationData.message}
                        onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                        rows={8}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical transition-all duration-200"
                        placeholder="Enter your notification message here..."
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                        <Icon name="Info" size={12} />
                        <span>You can use variables like {'{{'} full_name {'}}'},  {'{{'} email {'}}'},  {'{{'} member_id {'}}'} in your message</span>
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                        <Icon name="Send" size={16} className="text-gray-500" />
                        <span>Send Via</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <label className="relative flex items-center justify-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-purple-500 hover:bg-purple-50">
                          <input
                            type="radio"
                            value="email"
                            checked={notificationData.recipientType === 'email'}
                            onChange={(e) => setNotificationData(prev => ({ ...prev, recipientType: e.target.value }))}
                            className="sr-only"
                          />
                          <div className={`text-center ${notificationData.recipientType === 'email' ? 'text-purple-600' : 'text-gray-700'}`}>
                            <Icon name="Mail" size={24} className="mx-auto mb-2" />
                            <span className="text-sm font-medium">Email Only</span>
                          </div>
                          {notificationData.recipientType === 'email' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                              <Icon name="Check" size={12} className="text-white" />
                            </div>
                          )}
                        </label>
                        <label className="relative flex items-center justify-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-green-500 hover:bg-green-50">
                          <input
                            type="radio"
                            value="whatsapp"
                            checked={notificationData.recipientType === 'whatsapp'}
                            onChange={(e) => setNotificationData(prev => ({ ...prev, recipientType: e.target.value }))}
                            className="sr-only"
                          />
                          <div className={`text-center ${notificationData.recipientType === 'whatsapp' ? 'text-green-600' : 'text-gray-700'}`}>
                            <Icon name="MessageSquare" size={24} className="mx-auto mb-2" />
                            <span className="text-sm font-medium">WhatsApp</span>
                          </div>
                          {notificationData.recipientType === 'whatsapp' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                              <Icon name="Check" size={12} className="text-white" />
                            </div>
                          )}
                        </label>
                        <label className="relative flex items-center justify-center p-4 border-2 border-gray-300 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50">
                          <input
                            type="radio"
                            value="both"
                            checked={notificationData.recipientType === 'both'}
                            onChange={(e) => setNotificationData(prev => ({ ...prev, recipientType: e.target.value }))}
                            className="sr-only"
                          />
                          <div className={`text-center ${notificationData.recipientType === 'both' ? 'text-blue-600' : 'text-gray-700'}`}>
                            <Icon name="Zap" size={24} className="mx-auto mb-2" />
                            <span className="text-sm font-medium">Both</span>
                          </div>
                          {notificationData.recipientType === 'both' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Icon name="Check" size={12} className="text-white" />
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Icon name="Rocket" size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Ready to Send</h3>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-purple-600">{selectedUsers.length}</span> users selected • <span className="capitalize font-medium">{notificationData.recipientType}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSendNotifications}
                    disabled={sending || selectedUsers.length === 0 || !notificationData.message.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 min-w-[200px]"
                  >
                    {sending ? (
                      <>
                        <Icon name="Loader" size={20} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={20} />
                        <span>Send Notifications</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Results */}
              {results && (
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg animate-slideDown">
                  {/* Results Header */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Icon name="CheckCircle" size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">Delivery Results</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Icon name="Send" size={24} className="text-white" />
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{results.total}</div>
                        <div className="text-sm text-gray-600 font-medium">Total Sent</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Icon name="CheckCircle" size={24} className="text-white" />
                        </div>
                        <div className="text-3xl font-bold text-green-600">{results.successful}</div>
                        <div className="text-sm text-gray-600 font-medium">Successful</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200">
                        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Icon name="XCircle" size={24} className="text-white" />
                        </div>
                        <div className="text-3xl font-bold text-red-600">{results.failed}</div>
                        <div className="text-sm text-gray-600 font-medium">Failed</div>
                      </div>
                    </div>

                    {results.failed > 0 && (
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center space-x-2">
                          <Icon name="AlertCircle" size={16} />
                          <span>Failed Notifications</span>
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                          {results.details
                            .filter(detail => !detail.success)
                            .map((detail, index) => (
                              <div key={index} className="text-xs text-red-800 bg-white p-2 rounded-lg border border-red-200">
                                <span className="font-semibold">User ID:</span> {detail.userId} - {detail.error}
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
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
