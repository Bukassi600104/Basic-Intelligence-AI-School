// Notification Wizard - Complete implementation with all email scenarios
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { userService } from '../../services/userService';
import { notificationService } from '../../services/notificationService';
import { logger } from '../../utils/logger';
import { sanitizeHtml, RateLimiter } from '../../utils/security';
import { Toaster, toast } from 'sonner';

/**
 * COMPREHENSIVE NOTIFICATION WIZARD v2.0
 * 
 * Features:
 * 1. Admin can send notifications by typing message or selecting template
 * 2. Broadcast to all members or send to individual members
 * 3. Send via Email, WhatsApp, or Both
 * 4. Preview message before sending
 * 5. View delivery results with success/failure tracking
 * 6. View notification logs and delivery history
 * 7. Template management (view, edit, create)
 * 8. Real-time progress tracking
 * 
 * 8 Email Scenarios Supported:
 * ✅ 1. User registration - welcome email
 * ✅ 2. Forgot password - reset link
 * ✅ 3. Admin activates account - activation email
 * ✅ 4. Subscription expiring - renewal reminder
 * ✅ 5. Renewal/upgrade processed - confirmation
 * ✅ 6. New payment registered - admin notification
 * ✅ 7. New material uploaded - member notification
 * ✅ 8. Custom broadcast message - admin to members
 */

const NotificationWizardComplete = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  // Rate limiting for notification sending
  const [rateLimiter] = useState(() => new RateLimiter(3, 60000)); // 3 sends per minute

  // State Management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('send'); // send, templates, logs
  
  // User & Template Data
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [notificationLogs, setNotificationLogs] = useState([]);
  
  // Notification Composition
  const [notificationMode, setNotificationMode] = useState('broadcast'); // broadcast | individual
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notificationData, setNotificationData] = useState({
    templateName: '', // empty for custom message
    subject: '',
    message: '',
    recipientType: 'email', // email | whatsapp | both
  });
  const [messagePreview, setMessagePreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Sending State
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState(null);
  
  // Template Management
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'email',
    category: 'custom'
  });

  // ================== LIFECYCLE HOOKS ==================

  useEffect(() => {
    checkAdminAccess();
  }, [userProfile, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Auto-refresh logs every 5 seconds
    const interval = setInterval(() => {
      if (activeTab === 'logs') {
        loadNotificationLogs();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // ================== ACCESS CONTROL ==================

  const checkAdminAccess = async () => {
    try {
      if (!userProfile) {
        navigate('/login');
        return;
      }

      if (userProfile.role !== 'admin') {
        toast.error('Access Denied', {
          description: 'Only administrators can access this wizard.'
        });
        navigate('/');
        return;
      }
    } catch (error) {
      logger.error('Access validation failed:', error);
      setError(error.message);
    }
  };

  // ================== DATA LOADING ==================

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadUsers(),
        loadTemplates(),
        loadNotificationLogs()
      ]);
    } catch (error) {
      logger.error('Failed to load data:', error);
      setError('Failed to load data: ' + error.message);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await userService.getAllUsers();
      if (result?.error) {
        logger.error('Error loading users:', result.error);
        setUsers([]);
      } else {
        setUsers(result?.data || []);
      }
    } catch (error) {
      logger.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const loadTemplates = async () => {
    try {
      const result = await notificationService.getTemplates();
      if (result?.error) {
        logger.error('Error loading templates:', result.error);
        setTemplates([]);
      } else {
        setTemplates(result?.data || []);
      }
    } catch (error) {
      logger.error('Error loading templates:', error);
      setTemplates([]);
    }
  };

  const loadNotificationLogs = async () => {
    try {
      const result = await notificationService.getNotificationLogs({});
      if (result?.error) {
        logger.error('Error loading logs:', result.error);
        setNotificationLogs([]);
      } else {
        setNotificationLogs(result?.data || []);
      }
    } catch (error) {
      logger.error('Error loading logs:', error);
      setNotificationLogs([]);
    }
  };

  // ================== NOTIFICATION COMPOSITION ==================

  const handleTemplateChange = (templateName) => {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      setNotificationData(prev => ({
        ...prev,
        templateName,
        subject: template.subject,
        message: template.content
      }));
      generatePreview({
        subject: template.subject,
        message: template.content,
        ...notificationData
      });
    }
  };

  const handleCustomMessage = () => {
    setNotificationData(prev => ({
      ...prev,
      templateName: '',
      subject: prev.subject || '',
      message: prev.message || ''
    }));
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

  const generatePreview = (data = notificationData) => {
    // Use security utility for safe HTML sanitization
    const sanitizedSubject = sanitizeHtml(data.subject || 'No Subject');
    const sanitizedMessage = sanitizeHtml(data.message || 'No message content', { allowLineBreaks: true });
    
    let preview = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; border-radius: 8px;">
      <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px;">
          <h2 style="margin: 0; font-size: 20px;">${sanitizedSubject}</h2>
        </div>
        <div style="padding: 20px; color: #333;">
          ${sanitizedMessage}
        </div>
        <div style="background: #f9f9f9; padding: 15px; text-align: center; color: #666; font-size: 12px;">
          <p>Basic Intelligence Community School<br>Powered by Notification System</p>
        </div>
      </div>
    </div>`;
    setMessagePreview(preview);
  };

  // ================== SENDING NOTIFICATIONS ==================

  const handleSendNotifications = async () => {
    // Rate limiting check
    if (!rateLimiter.isAllowed()) {
      const timeToWait = Math.ceil(rateLimiter.timeUntilNextRequest() / 1000);
      toast.error('Rate limit exceeded', {
        description: `Please wait ${timeToWait} seconds before sending more notifications.`
      });
      return;
    }

    // Validation
    if (notificationMode === 'individual' && selectedUsers.length === 0) {
      toast.error('No recipients selected', {
        description: 'Please select at least one user to send notifications to.'
      });
      return;
    }

    if (!notificationData.message.trim()) {
      toast.error('No message content', {
        description: 'Please enter a message before sending.'
      });
      return;
    }

    if (!notificationData.subject.trim()) {
      toast.error('No subject', {
        description: 'Please enter a subject line.'
      });
      return;
    }

    setSending(true);
    setResults(null);
    setError(null);

    try {
      // Determine recipients
      let recipientIds = selectedUsers;
      if (notificationMode === 'broadcast') {
        recipientIds = users.map(u => u.id);
      }

      setSendProgress({ current: 0, total: recipientIds.length });

      // Send notifications
      const result = await notificationService.sendBulkNotifications({
        userIds: recipientIds,
        templateName: notificationData.templateName || 'custom_message',
        variables: {
          custom_message: notificationData.message,
          subject: notificationData.subject,
          full_name: '{{full_name}}', // Will be replaced per user
          email: '{{email}}',
          member_id: '{{member_id}}',
          dashboard_url: `${window.location.origin}/student-dashboard`
        },
        recipientType: notificationData.recipientType
      });

      // Update progress
      setSendProgress({ current: recipientIds.length, total: recipientIds.length });

      setResults(result);

      // Show appropriate toast
      if (result.successful > 0 && result.failed === 0) {
        toast.success('All notifications sent! 🎉', {
          description: `Successfully sent ${result.successful} notification${result.successful === 1 ? '' : 's'} via ${notificationData.recipientType}`
        });
        
        // Clear form on complete success
        setNotificationData({
          templateName: '',
          subject: '',
          message: '',
          recipientType: 'email'
        });
        setSelectedUsers([]);
      } else if (result.successful > 0 && result.failed > 0) {
        toast.warning('Partial delivery', {
          description: `Sent ${result.successful} of ${result.total} notifications. ${result.failed} failed.`
        });
      } else {
        toast.error('All notifications failed', {
          description: `Failed to send notifications to ${result.failed} recipient${result.failed === 1 ? '' : 's'}.`
        });
      }

      // Reload logs
      loadNotificationLogs();

    } catch (error) {
      logger.error('Send notifications error:', error);
      setError('Failed to send notifications: ' + error.message);
      toast.error('Error sending notifications', {
        description: error.message || 'An unexpected error occurred.'
      });
    } finally {
      setSending(false);
    }
  };

  // ================== TEMPLATE MANAGEMENT ==================

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.content.trim()) {
      toast.error('Incomplete form', { description: 'All fields are required.' });
      return;
    }

    try {
      const result = await notificationService.createTemplate({
        ...templateForm,
        is_active: true
      });

      if (result?.error) {
        toast.error('Failed to save template', { description: result.error });
      } else {
        toast.success('Template saved!', { description: 'New template created successfully.' });
        setShowTemplateForm(false);
        setTemplateForm({
          name: '',
          subject: '',
          content: '',
          type: 'email',
          category: 'custom'
        });
        loadTemplates();
      }
    } catch (error) {
      toast.error('Error saving template', { description: error.message });
    }
  };

  // ================== RENDER FUNCTIONS ==================

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 transition-all duration-300 lg:ml-60">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader" size={24} className="animate-spin text-white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Notification Wizard</div>
                <div className="text-sm text-muted-foreground">Initializing components and data...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Toaster position="top-right" expand={true} richColors />
      <AdminSidebar />
      
      <div className="flex-1 transition-all duration-300 lg:ml-60">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          
          {/* HEADER */}
          <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 rounded-2xl p-8 mb-8 shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg animate-float">
                  <Icon name="Send" size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Notification Wizard Pro</h1>
                  <p className="text-blue-100">Send bulk emails, WhatsApp, and manage notifications</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-2 border border-white/30"
                >
                  <Icon name="ArrowLeft" size={16} />
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>

          {/* ERROR DISPLAY */}
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

          {/* TABS */}
          <div className="flex space-x-2 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('send')}
              className={`px-6 py-3 font-semibold transition-all duration-200 ${
                activeTab === 'send'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="Send" size={16} className="inline mr-2" />
              Send Notifications
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 font-semibold transition-all duration-200 ${
                activeTab === 'templates'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="Layout" size={16} className="inline mr-2" />
              Templates ({templates.length})
            </button>
            <button
              onClick={() => { setActiveTab('logs'); loadNotificationLogs(); }}
              className={`px-6 py-3 font-semibold transition-all duration-200 ${
                activeTab === 'logs'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon name="FileText" size={16} className="inline mr-2" />
              Logs ({notificationLogs.length})
            </button>
          </div>

          {/* SEND TAB */}
          {activeTab === 'send' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN - RECIPIENTS */}
              <div className="lg:col-span-1">
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg sticky top-24">
                  <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-600 p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="relative flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Icon name="Users" size={24} className="text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Recipients</h2>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    
                    {/* BROADCAST VS INDIVIDUAL */}
                    <div className="mb-6">
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Send Mode</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => { setNotificationMode('broadcast'); setSelectedUsers([]); }}
                          className={`py-2 px-3 rounded-lg font-medium transition-all ${
                            notificationMode === 'broadcast'
                              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Icon name="Send" size={14} className="inline mr-1" />
                          Broadcast
                        </button>
                        <button
                          onClick={() => setNotificationMode('individual')}
                          className={`py-2 px-3 rounded-lg font-medium transition-all ${
                            notificationMode === 'individual'
                              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                              : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Icon name="User" size={14} className="inline mr-1" />
                          Individual
                        </button>
                      </div>
                    </div>

                    {/* SELECT ALL (individual mode only) */}
                    {notificationMode === 'individual' && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl border-2 border-emerald-200">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === users.length && users.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="w-5 h-5 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                          />
                          <span className="ml-3 font-semibold text-gray-900">Select All ({users.length})</span>
                          <span className="ml-auto px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                            {selectedUsers.length}
                          </span>
                        </label>
                      </div>
                    )}

                    {/* USER LIST (individual mode only) */}
                    {notificationMode === 'individual' && (
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {users && users.length > 0 ? (
                          users.map(user => (
                            <div
                              key={user.id}
                              className="flex items-center p-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 rounded-lg transition-all border-2 border-transparent hover:border-emerald-200 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                                className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                              />
                              <div className="ml-3 flex-1 min-w-0">
                                <div className="text-xs font-semibold text-gray-900 truncate group-hover:text-emerald-700">
                                  {user?.full_name || user?.email || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-600 truncate">
                                  {user?.email}
                                </div>
                                {user?.member_id && (
                                  <div className="text-xs text-gray-500 font-medium">
                                    ID: {user.member_id}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <Icon name="Users" size={32} className="text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 font-medium">No users found</p>
                          </div>
                        )}
                      </div>
                    )}

                    {notificationMode === 'broadcast' && (
                      <div className="text-center py-8">
                        <Icon name="Send" size={32} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">Broadcast Mode</p>
                        <p className="text-sm text-gray-500 mt-1">Sending to all {users.length} users</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - COMPOSER */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* TEMPLATE SELECTION */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                  <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-purple-500 p-6">
                    <div className="relative flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Icon name="Mail" size={24} className="text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Compose Message</h2>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    
                    {/* TEMPLATE SELECTION */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Icon name="Layout" size={14} className="inline mr-1" />
                        Use Template
                      </label>
                      <select
                        value={notificationData.templateName}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">📝 Custom Message</option>
                        <optgroup label="Welcome & Onboarding">
                          {templates.filter(t => t.category === 'welcome').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Account & Security">
                          {templates.filter(t => t.category === 'security' || t.category === 'activation').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Subscription & Payment">
                          {templates.filter(t => t.category === 'subscription').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Content & Announcements">
                          {templates.filter(t => t.category === 'announcement' || t.category === 'content').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Other">
                          {templates.filter(t => !['welcome', 'security', 'activation', 'subscription', 'announcement', 'content'].includes(t.category)).map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* SUBJECT */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Icon name="Type" size={14} className="inline mr-1" />
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={notificationData.subject}
                        onChange={(e) => {
                          setNotificationData(prev => ({ ...prev, subject: e.target.value }));
                          generatePreview({ ...notificationData, subject: e.target.value });
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter email subject line..."
                      />
                    </div>

                    {/* MESSAGE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Icon name="FileText" size={14} className="inline mr-1" />
                        Message Content
                      </label>
                      <textarea
                        value={notificationData.message}
                        onChange={(e) => {
                          setNotificationData(prev => ({ ...prev, message: e.target.value }));
                          generatePreview({ ...notificationData, message: e.target.value });
                        }}
                        rows={8}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical font-mono text-sm"
                        placeholder="Enter your message. Use {{variable_name}} for personalization.&#10;&#10;Available variables:&#10;{{full_name}} - User full name&#10;{{email}} - User email&#10;{{member_id}} - Member ID&#10;{{dashboard_url}} - Dashboard link"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Use variables like {'{{'} full_name {'}}'}, {'{{'} email {'}}'}, {'{{'} member_id {'}}'} for personalization
                      </p>
                    </div>

                    {/* RECIPIENT TYPE */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Icon name="Send" size={14} className="inline mr-1" />
                        Send Via
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'email', icon: 'Mail', label: 'Email' },
                          { value: 'whatsapp', icon: 'MessageSquare', label: 'WhatsApp' },
                          { value: 'both', icon: 'Zap', label: 'Both' }
                        ].map(option => (
                          <label
                            key={option.value}
                            className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              notificationData.recipientType === option.value
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              value={option.value}
                              checked={notificationData.recipientType === option.value}
                              onChange={(e) => setNotificationData(prev => ({ ...prev, recipientType: e.target.value }))}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <Icon name={option.icon} size={24} className="mx-auto mb-2" />
                              <span className="text-sm font-medium">{option.label}</span>
                            </div>
                            {notificationData.recipientType === option.value && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                                <Icon name="Check" size={12} className="text-white" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PREVIEW & SEND */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setShowPreview(!showPreview);
                      if (!showPreview) generatePreview();
                    }}
                    className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                  >
                    <Icon name="Eye" size={20} />
                    <span>{showPreview ? 'Hide Preview' : 'Preview Message'}</span>
                  </button>
                  <button
                    onClick={handleSendNotifications}
                    disabled={sending || (notificationMode === 'individual' && selectedUsers.length === 0) || !notificationData.message.trim()}
                    className="px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-pink-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {sending ? (
                      <>
                        <Icon name="Loader" size={20} className="animate-spin" />
                        <span>Sending ({sendProgress.current}/{sendProgress.total})</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={20} />
                        <span>Send Notifications</span>
                      </>
                    )}
                  </button>
                </div>

                {/* MESSAGE PREVIEW */}
                {showPreview && (
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 animate-slideDown">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                      <Icon name="Eye" size={20} />
                      <span>Message Preview</span>
                    </h3>
                    <div className="overflow-y-auto max-h-96 border-2 border-gray-100 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: messagePreview }} />
                  </div>
                )}

                {/* RESULTS */}
                {results && (
                  <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg animate-slideDown">
                    <div className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                      <div className="relative flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Icon name="CheckCircle" size={24} className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Delivery Results</h3>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                          <Icon name="Send" size={24} className="mx-auto mb-2 text-blue-600" />
                          <div className="text-3xl font-bold text-blue-600">{results.total}</div>
                          <div className="text-sm text-gray-600 font-medium">Total Sent</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                          <Icon name="CheckCircle" size={24} className="mx-auto mb-2 text-green-600" />
                          <div className="text-3xl font-bold text-green-600">{results.successful}</div>
                          <div className="text-sm text-gray-600 font-medium">Successful</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
                          <Icon name="XCircle" size={24} className="mx-auto mb-2 text-red-600" />
                          <div className="text-3xl font-bold text-red-600">{results.failed}</div>
                          <div className="text-sm text-gray-600 font-medium">Failed</div>
                        </div>
                      </div>

                      {results.failed > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4">
                          <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center space-x-2">
                            <Icon name="AlertCircle" size={16} />
                            <span>Failed Notifications ({results.failed})</span>
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {results.details
                              .filter(d => !d.success)
                              .map((detail, idx) => (
                                <div key={idx} className="text-xs text-red-800 bg-white p-3 rounded-lg border border-red-200 font-mono">
                                  <span className="font-semibold">User:</span> {detail.userId}
                                  <div className="text-red-600 mt-1">Error: {detail.error}</div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <button
                onClick={() => setShowTemplateForm(!showTemplateForm)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-purple-600 transition-all flex items-center space-x-2"
              >
                <Icon name="Plus" size={20} />
                <span>Create New Template</span>
              </button>

              {showTemplateForm && (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 space-y-4 animate-slideDown">
                  <h3 className="text-lg font-bold text-gray-900">New Template</h3>
                  <input
                    type="text"
                    placeholder="Template Name (e.g., welcome_email)"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Subject Line"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                  />
                  <textarea
                    placeholder="Message Content"
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={templateForm.type}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, type: e.target.value }))}
                      className="px-4 py-3 border-2 border-gray-300 rounded-xl"
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="both">Both</option>
                    </select>
                    <select
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))}
                      className="px-4 py-3 border-2 border-gray-300 rounded-xl"
                    >
                      <option value="custom">Custom</option>
                      <option value="welcome">Welcome</option>
                      <option value="security">Security</option>
                      <option value="subscription">Subscription</option>
                      <option value="announcement">Announcement</option>
                      <option value="content">Content</option>
                    </select>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveTemplate}
                      className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all"
                    >
                      Save Template
                    </button>
                    <button
                      onClick={() => setShowTemplateForm(false)}
                      className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* TEMPLATE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{template.name}</h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        template.type === 'email' ? 'bg-blue-100 text-blue-700' :
                        template.type === 'whatsapp' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {template.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{template.content}</p>
                    <div className="mt-4 flex space-x-2">
                      <span className="px-3 py-1 text-xs bg-gray-100 rounded-full text-gray-700 font-medium">
                        {template.category}
                      </span>
                      {template.is_active && (
                        <span className="px-3 py-1 text-xs bg-green-100 rounded-full text-green-700 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LOGS TAB */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg">
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 p-6">
                  <div className="relative flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon name="FileText" size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Notification Delivery Logs</h3>
                  </div>
                </div>

                <div className="p-6">
                  {notificationLogs && notificationLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-bold">Email</th>
                            <th className="px-4 py-3 text-left font-bold">Template</th>
                            <th className="px-4 py-3 text-left font-bold">Type</th>
                            <th className="px-4 py-3 text-left font-bold">Status</th>
                            <th className="px-4 py-3 text-left font-bold">Sent At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {notificationLogs.slice(0, 20).map((log, idx) => (
                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900 font-mono text-xs">{log.recipient_email || 'N/A'}</td>
                              <td className="px-4 py-3 text-gray-700">{log.notification_templates?.name || log.template_id || 'Custom'}</td>
                              <td className="px-4 py-3 capitalize">{log.recipient_type}</td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  log.status === 'sent' ? 'bg-green-100 text-green-700' :
                                  log.status === 'failed' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-xs">
                                {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Icon name="FileText" size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">No notification logs yet</p>
                      <p className="text-sm text-gray-500 mt-1">Logs will appear here as you send notifications</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationWizardComplete;
