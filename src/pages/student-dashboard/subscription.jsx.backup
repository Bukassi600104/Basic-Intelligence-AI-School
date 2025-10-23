import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { userService } from '../../services/userService';
import { subscriptionService } from '../../services/subscriptionService';

const StudentSubscription = () => {
  const { user, userProfile, isMember } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [plans, setPlans] = useState({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);

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

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      setLoading(true);
      try {
        // Use real user profile data from Supabase
        const subscriptionData = {
          plan: userProfile?.membership_tier || 'Starter',
          status: userProfile?.membership_status || 'inactive',
          memberId: userProfile?.member_id || 'Pending',
          startDate: userProfile?.joined_at || new Date().toISOString(),
          renewalDate: userProfile?.last_active_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          paymentMethod: 'Bank Transfer', // This would come from payment records
          amount: getPlanAmount(userProfile?.membership_tier),
          billingCycle: 'Monthly',
          features: getPlanFeatures(userProfile?.membership_tier)
        };
        
        setSubscriptionData(subscriptionData);
      } catch (error) {
        console.error('Failed to load subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.membership_status === 'active') {
      loadSubscriptionData();
    }
  }, [userProfile]);

  const getPlanAmount = (tier) => {
    const amounts = {
      'starter': '₦10,000',
      'pro': '₦15,000', 
      'elite': '₦25,000'
    };
    return amounts[tier] || '₦15,000';
  };

  const getPlanFeatures = (tier) => {
    const baseFeatures = [
      'Access to PDF resources',
      'Video streaming access',
      'Prompt library access',
      'WhatsApp support',
      'Regular content updates'
    ];

    const proFeatures = [
      ...baseFeatures,
      'Advanced content',
      'Priority support'
    ];

    const eliteFeatures = [
      ...proFeatures,
      'Exclusive resources',
      '1-on-1 coaching',
      'Custom content requests'
    ];

    const features = {
      'starter': baseFeatures,
      'pro': proFeatures,
      'elite': eliteFeatures
    };

    return features[tier] || baseFeatures;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'expired': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleRenewSubscription = () => {
    // In a real app, this would initiate a payment process
    alert('This would initiate the subscription renewal process in a real application.');
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
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader" size={24} className="animate-spin text-white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Subscription Details</div>
                <div className="text-sm text-muted-foreground">Please wait while we fetch your subscription information...</div>
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
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
          {/* Enhanced Gradient Header */}
          <div className="relative mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/20 to-green-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between p-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  Subscription Management
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your membership subscription and billing details
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/student-dashboard')}
                  className="border-2 hover:bg-white/80"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {subscriptionData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Subscription Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Plan Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                        <Icon name="Award" size={24} className="text-white" />
                      </div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">Current Plan</h2>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-md ${
                      subscriptionData.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-300' 
                        : getStatusColor(subscriptionData.status)
                    }`}>
                      {subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
                        {subscriptionData.plan}
                      </div>
                      <div className="text-2xl text-blue-700 font-semibold mb-6">
                        {subscriptionData.amount} <span className="text-base text-blue-600">/ {subscriptionData.billingCycle}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 p-3 bg-white/60 rounded-xl border border-blue-200">
                          <Icon name="CheckCircle" size={18} className="text-green-600" />
                          <span className="text-sm font-medium text-blue-900">Active Member</span>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-white/60 rounded-xl border border-blue-200">
                          <Icon name="User" size={18} className="text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Member ID: {subscriptionData.memberId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white/60 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon name="Calendar" size={16} className="text-blue-600" />
                          <div className="text-sm text-blue-700 font-medium">Started On</div>
                        </div>
                        <div className="text-base font-bold text-blue-900 ml-6">
                          {formatDate(subscriptionData.startDate)}
                        </div>
                      </div>
                      <div className="p-4 bg-white/60 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon name="RefreshCw" size={16} className="text-blue-600" />
                          <div className="text-sm text-blue-700 font-medium">Renews On</div>
                        </div>
                        <div className="text-base font-bold text-blue-900 ml-6">
                          {formatDate(subscriptionData.renewalDate)}
                        </div>
                      </div>
                      <div className="p-4 bg-white/60 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon name="CreditCard" size={16} className="text-blue-600" />
                          <div className="text-sm text-blue-700 font-medium">Payment Method</div>
                        </div>
                        <div className="text-base font-bold text-blue-900 ml-6">
                          {subscriptionData.paymentMethod}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                      <Icon name="Star" size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-900 to-pink-900 bg-clip-text text-transparent">Plan Features</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptionData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                        <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0" />
                        <span className="text-purple-900 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Sidebar */}
              <div className="space-y-6">
                {/* Renew Subscription */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                      <Icon name="Zap" size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-900 to-green-900 bg-clip-text text-transparent">Subscription Actions</h3>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all"
                      onClick={handleRenewSubscription}
                    >
                      <Icon name="RefreshCw" size={16} className="mr-2" />
                      Renew Subscription
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-2 border-emerald-200 hover:border-emerald-300 hover:bg-white/80 transition-all"
                      onClick={handleContactSupport}
                    >
                      <Icon name="MessageCircle" size={16} className="mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <Icon name="CreditCard" size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-orange-900 to-amber-900 bg-clip-text text-transparent">Payment Info</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-orange-700 font-medium">Plan:</span>
                      <span className="font-bold text-orange-900">{subscriptionData.plan}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-orange-700 font-medium">Amount:</span>
                      <span className="font-bold text-orange-900">{subscriptionData.amount}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-orange-700 font-medium">Billing Cycle:</span>
                      <span className="font-bold text-orange-900">{subscriptionData.billingCycle}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-orange-700 font-medium">Payment Method:</span>
                      <span className="font-bold text-orange-900">{subscriptionData.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Support Card */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Icon name="HelpCircle" size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-900 to-blue-900 bg-clip-text text-transparent">Need Help?</h3>
                  </div>
                  <p className="text-cyan-800 text-sm mb-4">
                    Have questions about your subscription or need assistance with payment?
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-2 border-cyan-200 hover:border-cyan-300 hover:bg-white/80"
                    onClick={handleContactSupport}
                  >
                    <Icon name="MessageCircle" size={16} className="mr-2" />
                    WhatsApp Support
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-100 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-900 to-orange-900 bg-clip-text text-transparent mb-2">Important Information</h3>
                <ul className="text-yellow-800 text-sm space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={16} className="mt-0.5 text-yellow-700 flex-shrink-0" />
                    <span>Your subscription will automatically renew on the renewal date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={16} className="mt-0.5 text-yellow-700 flex-shrink-0" />
                    <span>You will receive a reminder 7 days before renewal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={16} className="mt-0.5 text-yellow-700 flex-shrink-0" />
                    <span>All payments are processed securely via bank transfer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={16} className="mt-0.5 text-yellow-700 flex-shrink-0" />
                    <span>Contact support for any billing inquiries or subscription changes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubscription;
