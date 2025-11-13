import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import FeatureCard from '../../components/ui/FeatureCard';
import LockedOverlay from '../../components/ui/LockedOverlay';
import Icon from '../../components/AppIcon';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Progress } from '@/components/ui/progress.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { contentService } from '../../services/contentService';
import { referralService } from '../../services/referralService';

const StudentDashboard = () => {
  const { user, userProfile, isMember } = useAuth();
  const navigate = useNavigate();
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referralInfo, setReferralInfo] = useState(null);
  const [referralAnalytics, setReferralAnalytics] = useState([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [showLockedOverlay, setShowLockedOverlay] = useState(false);

  // Calculate days remaining until subscription expires
  useEffect(() => {
    if (userProfile?.subscription_expiry) {
      const expiry = new Date(userProfile.subscription_expiry);
      const now = new Date();
      const diffTime = expiry - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays > 0 ? diffDays : 0);
    }
  }, [userProfile]);

  // Determine if overlay should be shown
  useEffect(() => {
    if (userProfile) {
      const status = userProfile.membership_status;
      setShowLockedOverlay(status === 'pending' || status === 'expired' || status === 'inactive');
    }
  }, [userProfile]);

  // Check authentication - redirect to signin if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    // Keep users on dashboard even if pending/inactive - they'll see locked overlay
  }, [user, navigate]);

  // Load recent content
  useEffect(() => {
    const loadRecentContent = async () => {
      setLoading(true);
      try {
        // Get accessible content from Supabase
        const { data, error } = await contentService.getAccessibleContent();
        
        if (error) {
          console.error('Failed to load recent content:', error);
          return;
        }

        // Transform the data to match the expected format
        const transformedContent = (data || []).slice(0, 6).map(item => ({
          id: item.id,
          title: item.title,
          type: item.content_type,
          category: item.category || 'General',
          uploadedAt: item.created_at,
          description: item.description || 'No description available'
        }));
        
        setRecentContent(transformedContent);
      } catch (error) {
        console.error('Failed to load recent content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.membership_status === 'active') {
      loadRecentContent();
    }

    // Listen for content upload events to auto-refresh
    const handleContentUploaded = () => {
      loadRecentContent();
    };

    window.addEventListener('content-uploaded', handleContentUploaded);
    
    return () => {
      window.removeEventListener('content-uploaded', handleContentUploaded);
    };
  }, [userProfile]);

  // Load referral information
  useEffect(() => {
    const loadReferralInfo = async () => {
      if (!user?.id) return;
      
      try {
        const { data: referralData, error: referralError } = await referralService.getUserReferralInfo(user?.id);
        if (!referralError && referralData) {
          setReferralInfo(referralData);
        }

        const { data: analyticsData, error: analyticsError } = await referralService.getUserReferralAnalytics(user?.id);
        if (!analyticsError && analyticsData) {
          setReferralAnalytics(analyticsData);
        }
      } catch (error) {
        console.error('Failed to load referral info:', error);
      }
    };

    if (userProfile?.membership_status === 'active') {
      loadReferralInfo();
    }
  }, [user?.id, userProfile]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'pdf':
        return 'FileText';
      case 'video':
        return 'Video';
      case 'prompt':
        return 'MessageSquare';
      default:
        return 'File';
    }
  };

  const getContentColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'text-red-600';
      case 'video':
        return 'text-blue-600';
      case 'prompt':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex">
        <StudentDashboardNav />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-6 pt-16 sm:pt-20 lg:pt-8 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" message="Preparing your learning environment..." />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex relative">
      {/* Show locked overlay for pending/expired/inactive accounts */}
      {showLockedOverlay && userProfile && (
        <LockedOverlay 
          type={userProfile.membership_status}
          onRenew={() => navigate('/student-dashboard/subscription?action=renew')}
          registrationDate={userProfile.created_at || userProfile.registration_date}
        />
      )}
      
      <StudentDashboardNav 
      />
      <div className="flex-1 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-6 pt-16 sm:pt-20 lg:pt-8 max-w-5xl mx-auto w-full">
          {/* Welcome Section - Orange Theme */}
          <div className="relative overflow-hidden rounded-3xl mb-8 animate-fadeIn shadow-2xl">
            {/* Animated Background Gradient - Orange Theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 animate-gradient"></div>
            
            {/* Enhanced Decorative Elements - Orange Theme */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-orange-500/30 to-orange-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
            
            {/* Floating Icons */}
            <div className="absolute top-8 right-20 opacity-20 animate-float">
              <Icon name="Sparkles" size={32} className="text-white" />
            </div>
            <div className="absolute bottom-12 left-16 opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>
              <Icon name="Zap" size={28} className="text-white" />
            </div>
            
            <div className="relative p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 shadow-md hover:bg-white/30 transition-all">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      Your Learning Hub
                    </span>
                  </div>
                  
                  {/* Main Heading */}
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
                      Welcome back,
                      <br />
                      <span className="bg-gradient-to-r from-yellow-200 via-orange-100 to-white bg-clip-text text-transparent">
                        {userProfile?.full_name || 'Student'}!
                      </span>
                    </h1>
                    <p className="text-sm lg:text-base text-white/95 leading-relaxed font-medium">
                      Continue your AI learning journey.
                    </p>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="flex flex-wrap gap-2">
                    <div className="group flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-lg px-3 py-2 border border-white/30 hover:bg-white/30 hover:border-white/50 transition-all shadow-md">
                      <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon name="User" size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-white/80 font-medium">Member ID</div>
                        <div className="text-xs font-bold text-white">
                          {userProfile?.member_id || 'Pending'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="group flex items-center space-x-2 bg-emerald-500/40 backdrop-blur-md rounded-lg px-3 py-2 border border-emerald-300/40 hover:bg-emerald-500/50 hover:border-emerald-300/60 transition-all shadow-md">
                      <div className="w-8 h-8 bg-emerald-400/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon name="CheckCircle" size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-emerald-100 font-medium">Status</div>
                        <div className="text-xs font-bold text-white capitalize">
                          {userProfile?.membership_status || 'Pending'}
                        </div>
                      </div>
                    </div>
                    
                    {userProfile?.membership_status === 'active' && daysRemaining !== null && (
                      <div className="group flex items-center space-x-2 bg-yellow-500/40 backdrop-blur-md rounded-lg px-3 py-2 border border-yellow-300/40 hover:bg-yellow-500/50 hover:border-yellow-300/60 transition-all shadow-md">
                        <div className="w-8 h-8 bg-yellow-400/50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon name="Clock" size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="text-xs text-yellow-100 font-medium">Days Remaining</div>
                          <div className="text-xs font-bold text-white">
                            {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced Icon Display */}
                <div className="flex lg:flex-col gap-2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md group-hover:bg-white/30 transition-all"></div>
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white/40 group-hover:scale-110 transition-all duration-300">
                      <Icon name="BookOpen" size={40} className="text-white group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Cards - Orange Theme */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                className="cursor-pointer animate-slideUp"
                onClick={() => navigate('/student-dashboard/pdfs')}
              >
                <FeatureCard
                  variant="default"
                  colorScheme="orange"
                  title="PDF Library"
                  description="Access comprehensive guides, tutorials, and resources"
                  icon="FileText"
                />
              </div>

              <div 
                className="cursor-pointer animate-slideUp"
                style={{ animationDelay: '0.1s' }}
                onClick={() => navigate('/student-dashboard/videos')}
              >
                <FeatureCard
                  variant="default"
                  colorScheme="orange"
                  title="Video Library"
                  description="Watch instructional videos and tutorials"
                  icon="Video"
                />
              </div>

              <div 
                className="cursor-pointer animate-slideUp"
                style={{ animationDelay: '0.2s' }}
                onClick={() => navigate('/student-dashboard/prompts')}
              >
                <FeatureCard
                  variant="default"
                  colorScheme="orange"
                  title="Prompt Library"
                  description="Explore and use AI prompts for various use cases"
                  icon="MessageSquare"
                />
              </div>

              <div 
                className="cursor-pointer animate-slideUp"
                style={{ animationDelay: '0.3s' }}
                onClick={() => navigate('/student-dashboard/subscription')}
              >
                <FeatureCard
                  variant="default"
                  colorScheme="orange"
                  title="Subscription"
                  description="Manage your membership and billing details"
                  icon="CreditCard"
                />
              </div>
            </div>
          </div>

          {/* Referral Sharing Section - Orange Theme */}
          {userProfile?.membership_status === 'active' && (
            <div className="relative overflow-hidden rounded-3xl mb-8 animate-slideUp" style={{ animationDelay: '0.4s' }}>
              {/* Background Gradient - Orange Theme */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                        <Icon name="Share2" size={26} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-white">Share & Refer Friends</h2>
                        <p className="text-white/90 text-sm lg:text-base">
                          Invite friends to join Basic Intelligence AI School and help them start their AI journey
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center border border-white/30 hover:scale-105 transition-transform">
                        <div className="text-3xl font-extrabold text-white mb-1">
                          {referralInfo?.referral_count || 0}
                        </div>
                        <div className="text-sm font-medium text-white/90">Friends Referred</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center border border-white/30 hover:scale-105 transition-transform">
                        <div className="text-3xl font-extrabold text-white mb-1">
                          {referralAnalytics?.filter(ref => ref?.referred_user?.membership_status === 'active')?.length || 0}
                        </div>
                        <div className="text-sm font-medium text-white/90">Active Members</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center border border-white/30 hover:scale-105 transition-transform">
                        <div className="text-2xl font-extrabold text-white mb-1">
                          {referralInfo?.referral_code || 'Loading...'}
                        </div>
                        <div className="text-sm font-medium text-white/90">Your Referral Code</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => setShowReferralModal(true)}
                        variant="orange-outline"
                        className="shadow-2xl hover:shadow-glow-lg hover:scale-105 transition-all duration-300"
                      >
                        <Icon name="Share2" size={18} className="mr-2" />
                        Share Referral Link
                      </Button>
                      <button
                        onClick={async () => {
                          if (referralInfo?.referral_code) {
                            const referralLink = referralService.generateReferralLink(referralInfo.referral_code);
                            const result = await referralService.copyToClipboard(referralLink);
                            if (result.success) {
                              setCopySuccess(true);
                              setTimeout(() => setCopySuccess(false), 2000);
                            }
                          }
                        }}
                        className="group px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <Icon name="Copy" size={18} className="group-hover:scale-110 transition-transform" />
                          <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-8">
                    <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/30 hover:scale-110 transition-transform">
                      <Icon name="Users" size={56} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Content Section - Orange Theme */}
          <div className="relative overflow-hidden rounded-2xl animate-slideUp" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-white shadow-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-orange-50 opacity-50"></div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Recently Added Content</h2>
                </div>
                <button
                  onClick={() => navigate('/student-dashboard/content')}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <span>View All</span>
                    <Icon name="ArrowRight" size={16} />
                  </div>
                </button>
              </div>

              {recentContent.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="FileText" size={40} className="text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Recent Content</h3>
                  <p className="text-gray-600">
                    New content will appear here once it's uploaded by the admin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentContent.map((content) => (
                    <div 
                      key={content.id}
                      className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-card-hover hover:border-orange-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                      onClick={() => {
                        if (content.type === 'pdf') {
                          navigate('/student-dashboard/pdfs');
                        } else if (content.type === 'video') {
                          navigate('/student-dashboard/videos');
                        } else {
                          navigate('/student-dashboard/prompts');
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${
                          content.type === 'pdf' ? 'from-orange-500 to-orange-600' :
                          content.type === 'video' ? 'from-orange-500 to-orange-600' :
                          content.type === 'prompt' ? 'from-orange-500 to-orange-600' :
                          'from-gray-500 to-gray-600'
                        } rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon name={getContentIcon(content.type)} size={26} className="text-white" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {content.category}
                          </span>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {formatDate(content.uploadedAt)}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {content.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {content.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <Icon name="MessageCircle" size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Need Help?</h3>
                <p className="text-blue-700">
                  Contact our support team via WhatsApp for any questions or assistance.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  WhatsApp Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Share Referral Link</h2>
                <button
                  onClick={() => {
                    setShowReferralModal(false);
                    setSelectedMessage(null);
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
              <p className="text-muted-foreground mt-2">
                Choose a message and share your referral link with friends
              </p>
            </div>

            <div className="p-6">
              {referralInfo?.referral_code && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Referral Link
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          readOnly
                          value={referralService.generateReferralLink(referralInfo.referral_code)}
                          className="flex-1 px-3 py-2 border border-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-muted/50"
                        />
                        <Button
                          onClick={async () => {
                            const referralLink = referralService.generateReferralLink(referralInfo.referral_code);
                            const result = await referralService.copyToClipboard(referralLink);
                            if (result.success) {
                              setCopySuccess(true);
                              setTimeout(() => setCopySuccess(false), 2000);
                            }
                          }}
                          className="rounded-l-none"
                        >
                          <Icon name="Copy" size={16} className="mr-2" />
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Choose a Message</h3>
                <div className="space-y-3">
                  {referralInfo?.referral_code && referralService.getReferralMessages(referralService.generateReferralLink(referralInfo.referral_code)).map((message) => (
                    <div
                      key={message.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedMessage?.id === message.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                          selectedMessage?.id === message.id
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}>
                          {selectedMessage?.id === message.id && (
                            <Icon name="Check" size={12} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-2">{message.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{message.message}</p>
                          <div className="flex flex-wrap gap-2">
                            {message.platforms.map((platform) => (
                              <span
                                key={platform}
                                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMessage && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Share on Social Media</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedMessage.platforms.includes('whatsapp') && (
                      <Button
                        onClick={() => referralService.shareToSocialMedia('whatsapp', selectedMessage.message)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Icon name="MessageCircle" size={16} className="mr-2" />
                        WhatsApp
                      </Button>
                    )}
                    {selectedMessage.platforms.includes('twitter') && (
                      <Button
                        onClick={() => referralService.shareToSocialMedia('twitter', selectedMessage.message)}
                        className="bg-blue-400 hover:bg-blue-500 text-white"
                      >
                        <Icon name="Twitter" size={16} className="mr-2" />
                        Twitter
                      </Button>
                    )}
                    {selectedMessage.platforms.includes('linkedin') && (
                      <Button
                        onClick={() => referralService.shareToSocialMedia('linkedin', selectedMessage.message)}
                        className="bg-blue-700 hover:bg-blue-800 text-white"
                      >
                        <Icon name="Linkedin" size={16} className="mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    {selectedMessage.platforms.includes('facebook') && (
                      <Button
                        onClick={() => referralService.shareToSocialMedia('facebook', selectedMessage.message)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Icon name="Facebook" size={16} className="mr-2" />
                        Facebook
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-border">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReferralModal(false);
                    setSelectedMessage(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
