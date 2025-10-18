import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { emailService } from '../../services/emailService';
import { userService } from '../../services/userService';

const AdminNotificationWizard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [notificationData, setNotificationData] = useState({
    notificationType: 'email',
    audienceType: 'all',
    audienceFilters: {
      membershipStatus: '',
      role: '',
      activeOnly: true
    },
    subject: '',
    content: '',
    template: 'default',
    sendOption: 'immediately',
    scheduledDate: '',
    scheduledTime: ''
  });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (userProfile?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, userProfile, navigate]);

  // Load members for selection
  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const result = await userService.getAllUsers();
        if (result.success) {
          setMembers(result.data);
        }
      } catch (error) {
        console.error('Error loading members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (filter, value) => {
    setNotificationData(prev => ({
      ...prev,
      audienceFilters: {
        ...prev.audienceFilters,
        [filter]: value
      }
    }));
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(member => member.id));
    }
  };

  const handleSelectMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const filteredMembers = members.filter(member => {
    const filters = notificationData.audienceFilters;
    if (filters.membershipStatus && member.membership_status !== filters.membershipStatus) {
      return false;
    }
    if (filters.role && member.role !== filters.role) {
      return false;
    }
    if (filters.activeOnly && member.membership_status !== 'active') {
      return false;
    }
    return true;
  });

  const handleSendNotification = async () => {
    if (!notificationData.subject || !notificationData.content) {
      setResult({ success: false, error: 'Subject and content are required' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      let sendResult;

      if (notificationData.audienceType === 'specific' && selectedMembers.length > 0) {
        // Send to selected members
        sendResult = await emailService.sendBulkEmail(
          selectedMembers,
          notificationData.subject,
          notificationData.content,
          notificationData.template
        );
      } else {
        // Send to all members with filters
        sendResult = await emailService.sendEmailToAllMembers(
          notificationData.audienceFilters,
          notificationData.subject,
          notificationData.content,
          notificationData.template
        );
      }

      setResult(sendResult);
      
      if (sendResult.success) {
        // Reset form on success
        setNotificationData({
          notificationType: 'email',
          audienceType: 'all',
          audienceFilters: {
            membershipStatus: '',
            role: '',
            activeOnly: true
          },
          subject: '',
          content: '',
          template: 'default',
          sendOption: 'immediately',
          scheduledDate: '',
          scheduledTime: ''
        });
        setSelectedMembers([]);
        setCurrentStep(1);
      }
    } catch (error) {
      setResult({ success: false, error: error.message });
    } finally {
      setSending(false);
    }
  };

  const getStepTitle = () => {
    const steps = {
      1: 'Notification Type & Audience',
      2: 'Content Creation',
      3: 'Delivery Options',
      4: 'Review & Confirm',
      5: 'Sending Notification'
    };
    return steps[currentStep] || 'Notification Wizard';
  };

  const getTargetCount = () => {
    if (notificationData.audienceType === 'specific') {
      return selectedMembers.length;
    }
    return filteredMembers.length;
  };

  // Step 1: Notification Type & Audience
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              notificationData.notificationType === 'email'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleInputChange('notificationType', 'email')}
          >
            <div className="flex items-center space-x-3">
              <Icon name="Mail" size={24} className="text-primary" />
              <div>
                <div className="font-medium text-foreground">Email</div>
                <div className="text-sm text-muted-foreground">Send email notifications</div>
              </div>
            </div>
          </div>
          
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all opacity-50 ${
              notificationData.notificationType === 'sms'
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
            title="Coming Soon"
          >
            <div className="flex items-center space-x-3">
              <Icon name="MessageSquare" size={24} className="text-muted-foreground" />
              <div>
                <div className="font-medium text-muted-foreground">SMS</div>
                <div className="text-sm text-muted-foreground">Text messages (Coming Soon)</div>
              </div>
            </div>
          </div>
          
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all opacity-50 ${
              notificationData.notificationType === 'in_app'
                ? 'border-primary bg-primary/5'
                : 'border-border'
            }`}
            title="Coming Soon"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Bell" size={24} className="text-muted-foreground" />
              <div>
                <div className="font-medium text-muted-foreground">In-App</div>
                <div className="text-sm text-muted-foreground">Platform notifications (Coming Soon)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Target Audience</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                notificationData.audienceType === 'all'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleInputChange('audienceType', 'all')}
            >
              <div className="text-center">
                <Icon name="Users" size={24} className="mx-auto mb-2 text-primary" />
                <div className="font-medium text-foreground">All Members</div>
                <div className="text-sm text-muted-foreground">Send to everyone</div>
              </div>
            </div>
            
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                notificationData.audienceType === 'filtered'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleInputChange('audienceType', 'filtered')}
            >
              <div className="text-center">
                <Icon name="Filter" size={24} className="mx-auto mb-2 text-primary" />
                <div className="font-medium text-foreground">Filtered</div>
                <div className="text-sm text-muted-foreground">Send to specific groups</div>
              </div>
            </div>
            
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                notificationData.audienceType === 'specific'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleInputChange('audienceType', 'specific')}
            >
              <div className="text-center">
                <Icon name="UserCheck" size={24} className="mx-auto mb-2 text-primary" />
                <div className="font-medium text-foreground">Specific</div>
                <div className="text-sm text-muted-foreground">Choose individual members</div>
              </div>
            </div>
          </div>

          {/* Filters for filtered audience */}
          {notificationData.audienceType === 'filtered' && (
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <h4 className="font-medium text-foreground">Filter Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Membership Status
                  </label>
                  <Select
                    value={notificationData.audienceFilters.membershipStatus}
                    onChange={(e) => handleFilterChange('membershipStatus', e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role
                  </label>
                  <Select
                    value={notificationData.audienceFilters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activeOnly"
                    checked={notificationData.audienceFilters.activeOnly}
                    onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label htmlFor="activeOnly" className="ml-2 block text-sm text-foreground">
                    Active Members Only
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Member selection for specific audience */}
          {notificationData.audienceType === 'specific' && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-foreground">Select Members</h4>
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center text-muted-foreground">Loading members...</div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center text-muted-foreground">No members found</div>
                ) : (
                  filteredMembers.map(member => (
                    <div
                      key={member.id}
                      className={`flex items-center p-3 rounded border cursor-pointer transition-colors ${
                        selectedMembers.includes(member.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                      onClick={() => handleSelectMember(member.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleSelectMember(member.id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">
                          {member.full_name || 'Unnamed Member'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.email} • {member.role}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 text-sm text-muted-foreground">
                {selectedMembers.length} of {filteredMembers.length} members selected
              </div>
            </div>
          )}

          {/* Audience summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Icon name="Info" size={20} className="text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-900">
                  Will be sent to {getTargetCount()} members
                </div>
                <div className="text-xs text-blue-700">
                  {notificationData.audienceType === 'all' && 'All members in the system'}
                  {notificationData.audienceType === 'filtered' && 'Members matching your filters'}
                  {notificationData.audienceType === 'specific' && 'Selected individual members'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Content Creation
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Content</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Template
            </label>
            <Select
              value={notificationData.template}
              onChange={(e) => handleInputChange('template', e.target.value)}
            >
              <option value="default">Default Template</option>
              <option value="announcement">Announcement</option>
              <option value="course_update">Course Update</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <Input
              type="text"
              placeholder="Enter notification subject..."
              value={notificationData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Content
            </label>
            <textarea
              rows={10}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Write your notification content here..."
              value={notificationData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
            />
            <div className="mt-2 text-sm text-muted-foreground">
              You can use HTML formatting for email notifications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 3: Delivery Options
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Delivery Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              notificationData.sendOption === 'immediately'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleInputChange('sendOption', 'immediately')}
          >
            <div className="text-center">
              <Icon name="Send" size={24} className="mx-auto mb-2 text-primary" />
              <div className="font-medium text-foreground">Send Immediately</div>
              <div className="text-sm text-muted-foreground">Send right now</div>
            </div>
          </div>
          
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              notificationData.sendOption === 'schedule'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => handleInputChange('sendOption', 'schedule')}
          >
            <div className="text-center">
              <Icon name="Calendar" size={24} className="mx-auto mb-2 text-primary" />
              <div className="font-medium text-foreground">Schedule</div>
              <div className="text-sm text-muted-foreground">Send at specific time</div>
            </div>
          </div>
        </div>
      </div>

      {notificationData.sendOption === 'schedule' && (
        <div className="bg-muted/30 p-4 rounded-lg space-y-4">
          <h4 className="font-medium text-foreground">Schedule Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date
              </label>
              <Input
                type="date"
                value={notificationData.scheduledDate}
                onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Time
              </label>
              <Input
                type="time"
                value={notificationData.scheduledTime}
                onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Note: Scheduled notifications will be sent automatically at the specified time.
          </div>
        </div>
      )}
    </div>
  );

  // Step 4: Review & Confirm
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Review & Confirm</h3>
        <div className="bg-muted/30 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Notification Type</div>
              <div className="text-foreground capitalize">{notificationData.notificationType}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Target Audience</div>
              <div className="text-foreground capitalize">{notificationData.audienceType}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Members</div>
              <div className="text-foreground">{getTargetCount()} members</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Template</div>
              <div className="text-foreground capitalize">{notificationData.template}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Delivery</div>
              <div className="text-foreground capitalize">
                {notificationData.sendOption === 'immediately' 
                  ? 'Send Immediately' 
                  : `Scheduled for ${notificationData.scheduledDate} at ${notificationData.scheduledTime}`
                }
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">Subject</div>
            <div className="text-foreground font-medium">{notificationData.subject}</div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">Content Preview</div>
            <div className="bg-background border border-border rounded p-4 max-h-40 overflow-y-auto">
              <div className="text-foreground whitespace-pre-wrap">{notificationData.content}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-yellow-600" />
          <div>
            <div className="text-sm font-medium text-yellow-900">Important</div>
            <div className="text-xs text-yellow-700">
              Once sent, this notification cannot be recalled. Please review all details carefully.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 5: Sending (only shown during sending process)
  const renderStep5 = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="Send" size={24} className="text-white" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Sending Notification</h3>
      <p className="text-muted-foreground mb-4">
        Your notification is being sent to {getTargetCount()} members...
      </p>
      <div className="w-24 h-2 bg-muted rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return notificationData.audienceType && 
               (notificationData.audienceType !== 'specific' || selectedMembers.length > 0);
      case 2:
        return notificationData.subject.trim() && notificationData.content.trim();
      case 3:
        if (notificationData.sendOption === 'schedule') {
          return notificationData.scheduledDate && notificationData.scheduledTime;
        }
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Notification Wizard</h1>
              <p className="text-muted-foreground">
                {getStepTitle()}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button 
                variant="outline"
                onClick={() => navigate('/admin-dashboard')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-2xl mx-auto mt-2 text-xs text-muted-foreground">
              <span>Audience</span>
              <span>Content</span>
              <span>Delivery</span>
              <span>Review</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-6">
              {renderCurrentStep()}
            </div>

            {/* Navigation Buttons */}
            {currentStep !== 5 && (
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Previous
                </Button>

                {currentStep === 4 ? (
                  <Button
                    onClick={handleSendNotification}
                    disabled={!isStepValid() || sending}
                  >
                    {sending ? (
                      <>
                        <Icon name="Loader" size={16} className="mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={16} className="mr-2" />
                        Send Notification
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextStep}
                    disabled={!isStepValid()}
                  >
                    Next
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className={`mt-6 p-4 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✓ Notification sent successfully!' : '✗ Failed to send notification'}
                </div>
                {result.error && (
                  <div className="text-red-600 mt-1">{result.error}</div>
                )}
                {result.summary && (
                  <div className="mt-2 text-sm text-gray-600">
                    Sent: {result.summary.sent} | Failed: {result.summary.failed} | Total: {result.summary.total}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationWizard;
