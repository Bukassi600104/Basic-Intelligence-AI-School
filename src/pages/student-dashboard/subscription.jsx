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
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Subscription Management</h1>
              <p className="text-muted-foreground">
                Manage your membership subscription and billing details
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

          {subscriptionData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Subscription Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Plan Card */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Current Plan</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscriptionData.status)}`}>
                      {subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {subscriptionData.plan}
                      </div>
                      <div className="text-lg text-muted-foreground mb-4">
                        {subscriptionData.amount} / {subscriptionData.billingCycle}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Icon name="CheckCircle" size={16} className="text-success" />
                          <span className="text-sm text-foreground">Active Member</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon name="User" size={16} className="text-primary" />
                          <span className="text-sm text-foreground">Member ID: {subscriptionData.memberId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Started On</div>
                        <div className="text-sm font-medium text-foreground">
                          {formatDate(subscriptionData.startDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Renews On</div>
                        <div className="text-sm font-medium text-foreground">
                          {formatDate(subscriptionData.renewalDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Payment Method</div>
                        <div className="text-sm font-medium text-foreground">
                          {subscriptionData.paymentMethod}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Card */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">Plan Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptionData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Sidebar */}
              <div className="space-y-6">
                {/* Renew Subscription */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Subscription Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full"
                      onClick={handleRenewSubscription}
                    >
                      <Icon name="RefreshCw" size={16} className="mr-2" />
                      Renew Subscription
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

                {/* Payment Information */}
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Payment Information</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium text-foreground">{subscriptionData.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium text-foreground">{subscriptionData.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billing Cycle:</span>
                      <span className="font-medium text-foreground">{subscriptionData.billingCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium text-foreground">{subscriptionData.paymentMethod}</span>
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
                    Have questions about your subscription or need assistance with payment?
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
          )}

          {/* Important Notes */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Information</h3>
                <ul className="text-yellow-700 text-sm space-y-2">
                  <li>• Your subscription will automatically renew on the renewal date</li>
                  <li>• You will receive a reminder 7 days before renewal</li>
                  <li>• All payments are processed securely via bank transfer</li>
                  <li>• Contact support for any billing inquiries or subscription changes</li>
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
