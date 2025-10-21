import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { reviewService } from '../../services/reviewService';
import { passwordService } from '../../services/passwordService';

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

  // Check if user is a paid student - only redirect when profile is loaded and user is not a member
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Only redirect if user profile is loaded and user is not a member
    if (userProfile && !isMember) {
      navigate('/join-membership-page');
      return;
    }
  }, [user, userProfile, isMember, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <StudentDashboardNav 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-6 pt-16 sm:pt-20 lg:pt-8 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader" size={24} className="animate-spin text-white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Settings</div>
                <div className="text-sm text-muted-foreground">Please wait while we fetch your settings...</div>
              </div>
            </div>
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
        <div className="p-4 sm:p-6 lg:p-6 pt-16 sm:pt-20 lg:pt-8 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Account Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and personal information
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button 
                variant="outline"
                onClick={() => navigate('/student-dashboard')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Profile Picture Section - Moved to Top */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">Your Profile</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Personalize your account with a profile picture and manage your information
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 bg-white/50 rounded-lg px-4 py-2">
                    <Icon name="User" size={20} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Member ID: {userProfile?.member_id || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/50 rounded-lg px-4 py-2">
                    <Icon name="CheckCircle" size={20} className="text-success" />
                    <span className="text-sm font-medium text-foreground">
                      Active Membership
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 lg:mt-0 lg:ml-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Icon name="User" size={48} className="text-primary" />
                    )}
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) { // 5MB limit
                          alert('File size must be less than 5MB');
                          return;
                        }
                        
                        setProfilePicture(file);
                        setUploadingPicture(true);
                        
                        // Simulate upload process
                        setTimeout(() => {
                          alert('Profile picture uploaded successfully!');
                          setUploadingPicture(false);
                          // In a real app, this would update the user profile with the new avatar URL
                        }, 1500);
                      }
                    }}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  
                  <label 
                    htmlFor="profile-picture-upload"
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl cursor-pointer hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Icon name="Upload" size={18} className="mr-2" />
                    {uploadingPicture ? 'Uploading...' : 'Update Photo'}
                  </label>
                  
                  {profilePicture && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {profilePicture.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Information - Updated with colorful tiles */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon name="User" size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">Personal Information</h2>
                    <p className="text-blue-700 text-sm">Update your personal details and contact information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-3 border border-blue-200 rounded-xl bg-blue-50/50 text-blue-700"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      Email cannot be changed. Contact support for assistance.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
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
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">Email Updates</div>
                      <div className="text-xs text-muted-foreground">Receive important updates via email</div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('emailUpdates')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.emailUpdates ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">Content Alerts</div>
                      <div className="text-xs text-muted-foreground">Get notified when new content is added</div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('contentAlerts')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.contentAlerts ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.contentAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">Payment Reminders</div>
                      <div className="text-xs text-muted-foreground">Receive reminders before subscription renewal</div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('paymentReminders')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.paymentReminders ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.paymentReminders ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">Support Messages</div>
                      <div className="text-xs text-muted-foreground">Receive support team messages</div>
                    </div>
                    <button
                      onClick={() => handleNotificationChange('supportMessages')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.supportMessages ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.supportMessages ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
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
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Confirm new password"
                    />
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
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
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">Share Your Experience</h2>
                  
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

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Review Guidelines</h4>
                            <ul className="text-xs text-blue-700 space-y-1">
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
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleResetPassword}
                  >
                    <Icon name="Key" size={16} className="mr-2" />
                    Reset Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleContactSupport}
                  >
                    <Icon name="MessageCircle" size={16} className="mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member ID:</span>
                    <span className="font-medium text-foreground">{userProfile?.member_id || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Membership Status:</span>
                    <span className="font-medium text-success">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member Since:</span>
                    <span className="font-medium text-foreground">
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
