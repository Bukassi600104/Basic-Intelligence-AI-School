import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PaymentInstructions from '../../components/ui/PaymentInstructions';
import { subscriptionService } from '../../services/subscriptionService';
import { logger } from '../../utils/logger';

const StudentSubscription = () => {
  const { user, userProfile, isMember } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [daysRemaining, setDaysRemaining] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  // Calculate days remaining
  useEffect(() => {
    if (userProfile?.subscription_expiry && userProfile?.membership_status === 'active') {
      const expiryDate = new Date(userProfile.subscription_expiry);
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(diffDays > 0 ? diffDays : 0);
    }
  }, [userProfile]);

  // Fetch pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!userProfile?.id) return;
      
      try {
        const { success, data } = await subscriptionService.getPendingRequests(userProfile.id);
        if (success && data) {
          setPendingRequests(data);
        }
      } catch (error) {
        logger.error('Failed to fetch pending requests:', error);
      }
    };

    fetchPendingRequests();
  }, [userProfile]);

  const plans = {
    starter: {
      name: 'Starter Plan',
      amount: '₦10,000',
      duration: '30 days',
      features: [
        'Access to PDF resources',
        'Video streaming access',
        'Prompt library access',
        'WhatsApp support',
        'Regular content updates'
      ]
    },
    pro: {
      name: 'Pro Plan', 
      amount: '₦15,000',
      duration: '30 days',
      features: [
        'All Starter features',
        'Advanced content',
        'Priority support',
        'Exclusive webinars',
        'Certificate of completion'
      ]
    },
    elite: {
      name: 'Elite Plan',
      amount: '₦25,000',
      duration: '30 days',
      features: [
        'All Pro features',
        'Exclusive resources',
        '1-on-1 coaching sessions',
        'Custom content requests',
        'Direct mentor access'
      ]
    }
  };

  const currentPlan = plans[userProfile?.membership_tier] || plans.pro;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 border-green-300', icon: 'CheckCircle', label: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: 'Clock', label: 'Pending Activation' },
      expired: { color: 'bg-red-100 text-red-800 border-red-300', icon: 'XCircle', label: 'Expired' },
      inactive: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: 'Slash', label: 'Inactive' }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    
    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border-2 ${config.color}`}>
        <Icon name={config.icon} size={16} />
        <span className="font-bold text-sm">{config.label}</span>
      </div>
    );
  };

  const handleRenewClick = () => {
    setSelectedPlan(userProfile?.membership_tier); // Use current plan for renewal
    setShowPaymentForm(true);
  };

  const handleUpgradeClick = (planTier) => {
    setSelectedPlan(planTier); // Use selected plan for upgrade
    setShowPaymentForm(true);
  };

  const handlePaymentSubmitted = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    // Refresh pending requests
    subscriptionService.getPendingRequests(userProfile.id)
      .then(({ success, data }) => {
        if (success && data) {
          setPendingRequests(data);
        }
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading subscription data..." />
      </div>
    );
  }

  // Show payment form if selected
  if (showPaymentForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <StudentDashboardNav 
          collapsed={sidebarCollapsed} 
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} p-8`}>
          <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => {
                setShowPaymentForm(false);
                setSelectedPlan(null);
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <Icon name="ArrowLeft" size={20} />
              <span>Back to Subscription</span>
            </button>

            <PaymentInstructions 
              userProfile={userProfile}
              selectedTier={selectedPlan}
              onPaymentSubmitted={handlePaymentSubmitted}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <StudentDashboardNav 
        collapsed={sidebarCollapsed} 
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} p-8`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription Management</h1>
            <p className="text-gray-600">Manage your subscription plan and billing</p>
          </div>

          {/* Current Plan Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Icon name="Award" size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentPlan.name}</h2>
                  <p className="text-gray-600">Current Plan</p>
                </div>
              </div>
              {getStatusBadge(userProfile?.membership_status)}
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Icon name="CreditCard" size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Amount</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{currentPlan.amount}</div>
                <div className="text-sm text-gray-500">per {currentPlan.duration}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Icon name="Calendar" size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Days Remaining</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {userProfile?.membership_status === 'active' && daysRemaining !== null ? daysRemaining : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {userProfile?.membership_status === 'pending' && 'Awaiting activation'}
                  {userProfile?.membership_status === 'expired' && 'Subscription expired'}
                  {userProfile?.membership_status === 'active' && daysRemaining !== null && 'days left'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Icon name="User" size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Member ID</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{userProfile?.member_id || 'Pending'}</div>
                <div className="text-sm text-gray-500">Your unique ID</div>
              </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Benefits</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Check" size={14} className="text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleRenewClick}
                className="flex-1 min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3"
                disabled={userProfile?.membership_status === 'pending' || pendingRequests.length > 0}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="RefreshCw" size={20} />
                  <span>Renew Subscription</span>
                </div>
              </Button>
            </div>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name="Clock" size={24} className="text-yellow-600" />
                <h3 className="text-xl font-bold text-yellow-900">Pending Payment Verification</h3>
              </div>
              <p className="text-yellow-800 mb-4">
                Your payment is currently being verified by our admin team. You will receive a confirmation email within 48 hours.
              </p>
              {pendingRequests.map((request, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Request Type: {request.request_type}</div>
                      <div className="text-sm text-gray-600">Submitted: {new Date(request.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {request.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upgrade Options */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upgrade Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {Object.entries(plans).map(([tier, plan]) => {
                const isCurrent = userProfile?.membership_tier === tier;
                const isUpgrade = !isCurrent && (
                  (tier === 'pro' && userProfile?.membership_tier === 'starter') ||
                  (tier === 'elite' && (userProfile?.membership_tier === 'starter' || userProfile?.membership_tier === 'pro'))
                );

                return (
                  <div
                    key={tier}
                    className={`rounded-2xl border-2 p-6 transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-lg'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-1">{plan.amount}</div>
                      <div className="text-sm text-gray-600">{plan.duration}</div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <div className="w-full py-3 bg-blue-100 text-blue-800 rounded-lg text-center font-bold">
                        Current Plan
                      </div>
                    ) : isUpgrade ? (
                      <Button
                        onClick={() => handleUpgradeClick(tier)}
                        fullWidth
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold"
                        disabled={pendingRequests.length > 0}
                      >
                        Upgrade Now
                      </Button>
                    ) : (
                      <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-medium">
                        Not Available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon name="HelpCircle" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Need Help?</h3>
                <p className="text-blue-800 mb-4">
                  Contact our support team for assistance with your subscription or billing questions.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/2348012345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Icon name="MessageCircle" size={18} />
                    <span>WhatsApp Support</span>
                  </a>
                  <a
                    href="mailto:support@basicintelligence.com"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Icon name="Mail" size={18} />
                    <span>Email Support</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSubscription;
