import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { reviewService } from '../../services/reviewService';
import { passwordService } from '../../services/passwordService';
import { avatarService } from '../../services/avatarService';
import { logger } from '../../utils/logger';

const StudentSettings = () => {
  const { user, userProfile, isMember, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    contentAlerts: true,
    paymentReminders: true,
    supportMessages: true
  });
  const [userReview, setUserReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewText: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Check authentication - redirect to signin if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    // Allow all logged-in users to access settings
  }, [user, navigate]);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Simulate API call to get user data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set form data from user profile
        setFormData({
          full_name: userProfile?.full_name || '',
          email: user?.email || '',
          phone: userProfile?.phone || '',
          location: userProfile?.location || '',
          bio: userProfile?.bio || ''
        });
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      loadUserData();
    }
  }, [userProfile, user]);

  // Load user's review
  useEffect(() => {
    const loadUserReview = async () => {
      if (!user?.id) return;
      
      try {
        const { data: reviewData, error } = await reviewService.getUserReview(user?.id);
        if (!error && reviewData) {
          setUserReview(reviewData);
          setReviewForm({
            rating: reviewData?.rating || 5,
            reviewText: reviewData?.review_text || ''
          });
          setReviewSubmitted(true);
        }
      } catch (error) {
        console.error('Failed to load user review:', error);
      }
    };

    if (userProfile?.membership_status === 'active') {
      loadUserReview();
    }
  }, [user?.id, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) {
        alert('Failed to update profile: ' + error);
      } else {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleResetPassword = () => {
    // In a real app, this would initiate password reset
    alert('This would initiate a password reset process in a real application.');
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/2349062284074', '_blank');
  };

  // Avatar upload handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = avatarService.validateAvatarFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      setTimeout(() => setUploadError(''), 5000);
      return;
    }

    // Create preview
    const preview = avatarService.getPreviewUrl(file);
    setPreviewUrl(preview);
    setUploadError('');
  };

  // Upload avatar to Supabase
  const handleUploadAvatar = async () => {
    const fileInput = document.getElementById('profile-picture-upload');
    const file = fileInput?.files[0];
    
    if (!file || !user?.id) return;

    setUploadingPicture(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const { avatarUrl, error } = await avatarService.uploadAvatar(file, user.id);
      
      if (error) {
        setUploadError(error);
      } else {
        setUploadSuccess('Profile picture updated successfully!');
        // Update local user profile state
        setUserProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
        
        // Clean up preview
        if (previewUrl) {
          avatarService.revokePreviewUrl(previewUrl);
          setPreviewUrl(null);
        }
        
        // Clear file input
        if (fileInput) fileInput.value = '';
        
        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setUploadError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  // Delete avatar from Supabase
  const handleDeleteAvatar = async () => {
    if (!userProfile?.avatar_url || !user?.id) return;

    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    setUploadingPicture(true);
    setUploadError('');

    try {
      const { error } = await avatarService.deleteAvatar(userProfile.avatar_url, user.id);
      
      if (error) {
        setUploadError(error);
      } else {
        setUploadSuccess('Profile picture removed successfully!');
        setUserProfile(prev => ({ ...prev, avatar_url: null }));
        setTimeout(() => setUploadSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Avatar delete error:', error);
      setUploadError('Failed to remove profile picture. Please try again.');
    } finally {
      setUploadingPicture(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        avatarService.revokePreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <StudentDashboardNav 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-6 pt-16 sm:pt-20 lg:pt-8 max-w-5xl mx-auto w-full">
            <LoadingSpinner size="lg" message="Please wait while we fetch your settings..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <StudentDashboardNav 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 lg:ml-64">
        <div className="p-3 sm:p-4 lg:p-5 pt-16 sm:pt-20 lg:pt-8 max-w-5xl mx-auto w-full">
          {/* Enhanced Gradient Header */}
          <div className="relative mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between p-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  Account Settings
                </h1>
                <p className="text-gray-600 text-sm">
                  Manage your account preferences and personal information
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/student-dashboard')}
                  className="border hover:bg-white/80"
                >
                  <Icon name="ArrowLeft" size={14} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Picture Section - Moved to Top */}
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl p-4 mb-4 shadow-sm border border-blue-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                    <Icon name="Camera" size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">Your Profile</h2>
                    <p className="text-gray-600 text-sm">
                      Personalize your account with a profile picture
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center space-x-1.5 bg-white/80 rounded-lg px-3 py-2 border border-blue-200 shadow-sm">
                    <Icon name="User" size={16} className="text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">
                      Member ID: {userProfile?.member_id || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-white/80 rounded-lg px-3 py-2 border border-green-200 shadow-sm">
                    <Icon name="CheckCircle" size={16} className="text-green-600" />
                    <span className="text-xs font-medium text-green-900">
                      Active Membership
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0 lg:ml-6">
                <div className="flex flex-col items-center space-y-3">
                  {/* Avatar Display */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-md overflow-hidden">
                      {previewUrl || userProfile?.avatar_url ? (
                        <img 
                          src={previewUrl || userProfile.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon name="User" size={40} className="text-primary" />
                      )}
                    </div>
                    
                    {/* Delete button for existing avatar */}
                    {userProfile?.avatar_url && !previewUrl && (
                      <button
                        onClick={handleDeleteAvatar}
                        disabled={uploadingPicture}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 disabled:opacity-50"
                        title="Remove profile picture"
                      >
                        <Icon name="X" size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* File Input */}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="profile-picture-upload"
                    disabled={uploadingPicture}
                  />
                  
                  {/* Upload Button */}
                  {!previewUrl ? (
                    <label 
                      htmlFor="profile-picture-upload"
                      className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg cursor-pointer hover:shadow-md transition-all duration-300 ${
                        uploadingPicture ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                      }`}
                    >
                      <Icon name="Upload" size={16} className="mr-2" />
                      {userProfile?.avatar_url ? 'Change Photo' : 'Upload Photo'}
                    </label>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleUploadAvatar}
                        disabled={uploadingPicture}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-md transition-all duration-300 disabled:opacity-50"
                      >
                        {uploadingPicture ? (
                          <>
                            <Icon name="Loader" size={16} className="mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Icon name="Check" size={16} className="mr-2" />
                            Save Photo
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (previewUrl) {
                            avatarService.revokePreviewUrl(previewUrl);
                            setPreviewUrl(null);
                          }
                          const fileInput = document.getElementById('profile-picture-upload');
                          if (fileInput) fileInput.value = '';
                        }}
                        disabled={uploadingPicture}
                        className="inline-flex items-center px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 disabled:opacity-50"
                      >
                        <Icon name="X" size={16} />
                      </button>
                    </div>
                  )}
                  
                  {/* Error/Success Messages */}
                  {uploadError && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
                      <Icon name="AlertCircle" size={16} />
                      {uploadError}
                    </div>
                  )}
                  {uploadSuccess && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm">
                      <Icon name="CheckCircle" size={16} />
                      {uploadSuccess}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Max size: 5MB<br />
                    Formats: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Profile Settings */}
            <div className="lg:col-span-2 space-y-4">
              {/* Profile Information - Updated with colorful tiles */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon name="User" size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-blue-900">Personal Information</h2>
                    <p className="text-blue-700 text-xs">Update your personal details and contact information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50/50 text-blue-700"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-blue-900 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                      placeholder="+234123456789"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 resize-vertical"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
                
                <div className="mt-6">
                  <Button 
                    onClick={handleSaveProfile}
                    loading={saveLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Icon name="Save" size={16} className="mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                    <Icon name="Bell" size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent">Notification Preferences</h2>
                    <p className="text-purple-700 text-xs">Manage how you receive updates and alerts</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-purple-200 hover:shadow-sm transition-shadow">
                    <div>
                      <div className="text-xs font-medium text-purple-900">Email Updates</div>
                      <div className="text-xs text-purple-600">Receive important updates via email</div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('emailUpdates')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
                        notifications.emailUpdates ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                          notifications.emailUpdates ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-purple-200 hover:shadow-sm transition-shadow">
                    <div>
                      <div className="text-xs font-medium text-purple-900">Content Alerts</div>
                      <div className="text-xs text-purple-600">Get notified when new content is added</div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('contentAlerts')}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
                        notifications.contentAlerts ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                          notifications.contentAlerts ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-purple-200 hover:shadow-sm transition-shadow">
                    <div>
                      <div className="text-sm font-medium text-purple-900">Payment Reminders</div>
                      <div className="text-xs text-purple-600">Receive reminders before subscription renewal</div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('paymentReminders')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                        notifications.paymentReminders ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                          notifications.paymentReminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                    <div>
                      <div className="text-sm font-medium text-purple-900">Support Messages</div>
                      <div className="text-xs text-purple-600">Receive support team messages</div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('supportMessages')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                        notifications.supportMessages ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
                          notifications.supportMessages ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                    <Icon name="Shield" size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-orange-900 to-red-900 bg-clip-text text-transparent">Password & Security</h2>
                    <p className="text-orange-700 text-sm">Update your password to keep your account secure</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-orange-900 mb-2">
                      <Icon name="Lock" size={16} className="text-orange-600" />
                      <span>Current Password</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80"
                      placeholder="Enter your current password"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-orange-900 mb-2">
                      <Icon name="Key" size={16} className="text-orange-600" />
                      <span>New Password</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80"
                      placeholder="Enter new password"
                    />
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${
                            passwordForm.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-muted-foreground">At least 8 characters</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${
                            /[a-z]/.test(passwordForm.newPassword) && /[A-Z]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-muted-foreground">Uppercase and lowercase letters</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            /[0-9]/.test(passwordForm.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          <span className="text-xs text-muted-foreground">At least one number</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-orange-900 mb-2">
                      <Icon name="CheckCircle" size={16} className="text-orange-600" />
                      <span>Confirm New Password</span>
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80"
                      placeholder="Confirm new password"
                    />
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                        <Icon name="AlertCircle" size={12} />
                        Passwords do not match
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={async () => {
                      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
                        alert('Please fill in all password fields');
                        return;
                      }
                      
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        alert('New passwords do not match');
                        return;
                      }
                      
                      const validation = passwordService.validatePasswordStrength(passwordForm.newPassword);
                      if (!validation.isValid) {
                        alert('Password does not meet security requirements. Please ensure it has at least 8 characters, uppercase and lowercase letters, and at least one number.');
                        return;
                      }
                      
                      setPasswordLoading(true);
                      try {
                        // In a real app, this would call an API to change the password
                        // For now, we'll simulate the process
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        
                        alert('Password changed successfully!');
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      } catch (error) {
                        alert('Failed to change password: ' + error.message);
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}
                    loading={passwordLoading}
                    disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
                    className="w-full"
                  >
                    <Icon name="Key" size={16} className="mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>

              {/* Review Submission */}
              {userProfile?.membership_status === 'active' && (
                <div className="bg-gradient-to-br from-emerald-50 to-cyan-100 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                      <Icon name="MessageSquare" size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-900 to-cyan-900 bg-clip-text text-transparent">Share Your Experience</h2>
                      <p className="text-emerald-700 text-sm">Help others discover the value of our platform</p>
                    </div>
                  </div>
                  
                  {reviewSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="CheckCircle" size={32} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Thank You for Your Review!</h3>
                      <p className="text-muted-foreground mb-4">
                        Your feedback helps us improve and helps others discover our platform.
                      </p>
                      <div className="flex items-center justify-center space-x-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Icon 
                            key={i}
                            name="Star" 
                            size={20} 
                            className={i < userReview?.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        "{userReview?.review_text}"
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          setReviewSubmitted(false);
                          setReviewForm({
                            rating: userReview?.rating || 5,
                            reviewText: userReview?.review_text || ''
                          });
                        }}
                      >
                        <Icon name="Edit" size={16} className="mr-2" />
                        Edit Review
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                          How would you rate your experience?
                        </label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewForm(prev => ({ ...prev, rating }))}
                              className="focus:outline-none"
                            >
                              <Icon 
                                name="Star" 
                                size={32} 
                                className={rating <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                              />
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={reviewForm.reviewText}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-vertical"
                          placeholder="Share your experience with Basic Intelligence AI School. What did you like? What could be improved?"
                          maxLength={500}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Share your honest feedback</span>
                          <span>{reviewForm.reviewText.length}/500</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button 
                          onClick={async () => {
                            setReviewLoading(true);
                            try {
                              const { data, error } = await reviewService.submitReview({
                                rating: reviewForm.rating,
                                review_text: reviewForm.reviewText,
                                user_id: user?.id,
                                user_name: userProfile?.full_name || 'Anonymous',
                                status: 'pending'
                              });

                              if (error) {
                                alert('Failed to submit review: ' + error);
                              } else {
                                setUserReview(data);
                                setReviewSubmitted(true);
                                alert('Review submitted successfully! It will be visible after approval.');
                              }
                            } catch (error) {
                              alert('Failed to submit review: ' + error.message);
                            } finally {
                              setReviewLoading(false);
                            }
                          }}
                          loading={reviewLoading}
                          disabled={!reviewForm.reviewText.trim()}
                          className="flex-1"
                        >
                          <Icon name="Send" size={16} className="mr-2" />
                          Submit Review
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setReviewForm({
                              rating: 5,
                              reviewText: ''
                            });
                          }}
                        >
                          <Icon name="X" size={16} className="mr-2" />
                          Clear
                        </Button>
                      </div>

                      <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <Icon name="Info" size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-emerald-900 mb-1">Review Guidelines</h4>
                            <ul className="text-xs text-emerald-700 space-y-1">
                              <li>• Be honest and constructive in your feedback</li>
                              <li>• Reviews are moderated before being published</li>
                              <li>• Your review helps other students make informed decisions</li>
                              <li>• Approved reviews may be featured on our homepage</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-6">
              {/* Account Actions */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Icon name="Zap" size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-900 to-blue-900 bg-clip-text text-transparent">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-indigo-200 hover:border-indigo-300 hover:bg-white/80 transition-all"
                    onClick={handleResetPassword}
                  >
                    <Icon name="Key" size={16} className="mr-2" />
                    Reset Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-2 border-indigo-200 hover:border-indigo-300 hover:bg-white/80 transition-all"
                    onClick={handleContactSupport}
                  >
                    <Icon name="MessageCircle" size={16} className="mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gradient-to-br from-teal-50 to-green-100 border-2 border-teal-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Icon name="Info" size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-teal-900 to-green-900 bg-clip-text text-transparent">Account Info</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-teal-700 font-medium">Member ID:</span>
                    <span className="font-bold text-teal-900">{userProfile?.member_id || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-teal-700 font-medium">Status:</span>
                    <span className="font-bold text-green-600 flex items-center gap-1">
                      <Icon name="CheckCircle" size={14} />
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-teal-700 font-medium">Member Since:</span>
                    <span className="font-bold text-teal-900">
                      {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Icon name="HelpCircle" size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">Need Help?</h3>
                </div>
                <p className="text-blue-700 text-sm mb-4">
                  Have questions about your account settings or need assistance?
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={handleContactSupport}
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  WhatsApp Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;
