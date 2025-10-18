import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const AuthenticationGate = ({ 
  children, 
  requiredRole = null, 
  requirePaymentVerification = false,
  fallbackPath = '/home-page' 
}) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    paymentStatus: null
  });
  
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Simulate auth check - replace with actual auth logic
      const mockUser = {
        id: 'user123',
        email: 'user@example.com',
        role: 'student', // 'student', 'admin', 'guest'
        paymentStatus: 'verified', // 'pending', 'verified', 'rejected', 'expired\'memberId: \'BI0001',
        name: 'John Doe'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        user: mockUser,
        paymentStatus: mockUser?.paymentStatus
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        paymentStatus: null
      });
    }
  };

  const LoadingScreen = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Icon name="GraduationCap" size={24} color="white" />
        </div>
        <div className="space-y-2">
          <div className="text-lg font-semibold text-foreground">Basic Intelligence</div>
          <div className="text-sm text-muted-foreground">Verifying your access...</div>
        </div>
        <div className="mt-6 flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  const AccessDeniedScreen = ({ reason, actionButton }) => (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="ShieldX" size={32} className="text-error" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground mb-6">{reason}</p>
        
        {actionButton}
        
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Need help? Contact our support team
          </p>
          <button className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors duration-200">
            <Icon name="MessageCircle" size={16} />
            <span>WhatsApp Support</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Show loading screen while checking auth
  if (authState?.isLoading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated
  if (!authState?.isAuthenticated) {
    return (
      <AccessDeniedScreen
        reason="You need to be logged in to access this page."
        actionButton={
          <button 
            onClick={() => window.location.href = '/login'}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
          >
            <Icon name="LogIn" size={16} />
            <span>Login to Continue</span>
          </button>
        }
      />
    );
  }

  // Check role requirements
  if (requiredRole && authState?.user?.role !== requiredRole) {
    const roleMessages = {
      admin: "This area is restricted to administrators only.",
      student: "This area is for verified students only.",
      guest: "This area is for guests only."
    };

    return (
      <AccessDeniedScreen
        reason={roleMessages?.[requiredRole] || "You don't have permission to access this area."}
        actionButton={
          <button 
            onClick={() => window.location.href = fallbackPath}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors duration-200"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Go Back</span>
          </button>
        }
      />
    );
  }

  // Check payment verification requirements
  if (requirePaymentVerification && authState?.paymentStatus !== 'verified') {
    const paymentMessages = {
      pending: "Your payment is still being verified. Please wait for confirmation.",
      rejected: "Your payment was rejected. Please contact support or resubmit.",
      expired: "Your payment verification has expired. Please resubmit your payment.",
      null: "Payment verification is required to access this area."
    };

    return (
      <AccessDeniedScreen
        reason={paymentMessages?.[authState?.paymentStatus] || paymentMessages?.null}
        actionButton={
          <div className="space-y-3">
            {authState?.paymentStatus === 'pending' && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center space-x-2 text-warning mb-2">
                  <Icon name="Clock" size={16} />
                  <span className="text-sm font-medium">Verification in Progress</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This usually takes 24-48 hours. You'll receive WhatsApp confirmation.
                </p>
              </div>
            )}
            
            <button 
              onClick={() => window.location.href = '/join-membership-page'}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors duration-200"
            >
              <Icon name="CreditCard" size={16} />
              <span>
                {authState?.paymentStatus === 'rejected' || authState?.paymentStatus === 'expired' ?'Resubmit Payment' :'Complete Payment'
                }
              </span>
            </button>
          </div>
        }
      />
    );
  }

  // All checks passed, render the protected content
  return children;
};

export default AuthenticationGate;