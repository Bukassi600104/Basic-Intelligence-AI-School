import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { redirectAfterLogin } from '../../services/authHelpers';
import PublicHeader from '../../components/ui/PublicHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, user, userProfile, isAdmin, isMember } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle success message from registration
  useEffect(() => {
    const urlParams = new URLSearchParams(location?.search);
    const messageParam = urlParams?.get('message');
    
    if (messageParam === 'registration_success') {
      setSuccessMessage('Registration successful! Please check your email for verification, then sign in.');
    }
  }, [location?.search]);

  // Redirect if already logged in or after successful sign in
  useEffect(() => {
    console.log('SignInPage useEffect triggered:', { 
      user: !!user, 
      userProfile: !!userProfile, 
      isAdmin, 
      isMember 
    });
    
    if (user) {
      // Show loading state while determining user role
      setLoading(true);
      
      // Wait for user profile to load before making redirection decisions
      const redirectUser = () => {
        console.log('redirectUser called:', { 
          userProfile: !!userProfile, 
          isAdmin, 
          isMember,
          userEmail: user?.email 
        });
        
        // If user profile is still loading, wait a bit more
        if (!userProfile) {
          console.log('User profile not loaded yet, retrying in 500ms');
          const retryTimer = setTimeout(redirectUser, 500);
          return () => clearTimeout(retryTimer);
        }
        
        // Now we have user profile, make proper redirection decision
        if (isAdmin) {
          console.log('Redirecting to admin dashboard - user is admin');
          navigate('/admin-dashboard', { replace: true });
        } else if (isMember) {
          console.log('Redirecting to student dashboard - user is member');
          navigate('/student-dashboard', { replace: true });
        } else if (userProfile) {
          // If we have user profile but not membership, redirect to membership page
          console.log('Redirecting to membership page - user needs membership');
          navigate('/join-membership-page', { replace: true });
        } else {
          // Fallback: Redirect to appropriate dashboard based on best guess
          const isLikelyAdmin = user?.email?.includes('admin') || user?.email?.includes('@basicintelligence');
          console.log('Using fallback redirection - likely admin:', isLikelyAdmin);
          if (isLikelyAdmin) {
            navigate('/admin-dashboard', { replace: true });
          } else {
            navigate('/student-dashboard', { replace: true });
          }
        }
      };

      // Use the redirectAfterLogin helper to handle role-based redirection
      console.log('Using redirectAfterLogin helper');
      redirectAfterLogin(navigate, user.id);
      return () => {};
    }
  }, [user, userProfile, isAdmin, isMember, navigate]);

  const validateForm = () => {
    if (!formData?.email?.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData?.password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { data, error: signInError } = await signIn(
        formData?.email?.trim(),
        formData?.password
      );

      if (signInError) {
        setError(signInError);
        return;
      }

      // Sign in successful - user will be redirected by useEffect
      // The useEffect above will handle role-based redirection
      
    } catch (error) {
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleForgotPassword = () => {
    // Implement password reset functionality
    alert('Password reset functionality will be implemented soon. Please contact support via WhatsApp: +2349062284074');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PublicHeader />
      
      <main className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          {/* Enhanced Card Container - Much Wider */}
          <div className="bg-card border border-border rounded-2xl p-10 lg:p-12 shadow-xl backdrop-blur-sm bg-white/95">
            {/* Enhanced Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Icon name="LogIn" size={36} className="text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Welcome Back
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Sign in to access your AI learning dashboard and continue your journey
              </p>
            </div>

            {/* Enhanced Success Message */}
            {successMessage && (
              <div className="mb-10 p-5 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center space-x-4">
                  <Icon name="CheckCircle" size={24} className="text-green-600 flex-shrink-0" />
                  <span className="text-green-600 text-base font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Enhanced Error Message */}
            {error && (
              <div className="mb-10 p-5 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-4">
                  <Icon name="AlertCircle" size={24} className="text-red-600 flex-shrink-0" />
                  <span className="text-red-600 text-base font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Enhanced Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  required
                  value={formData?.email}
                  onChange={handleInputChange}
                  placeholder={process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL || 'your.email@example.com'}
                  disabled={loading}
                  className="text-lg h-14"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData?.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="text-lg h-14 pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-11 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/50"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={24} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="remember-me" className="text-base text-muted-foreground">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-base text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Enhanced Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
                size="lg"
                className="h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <Icon name="Loader" size={24} className="animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Icon name="LogIn" size={24} />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>


            {/* Enhanced WhatsApp Contact */}
            <div className="mt-10 p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center space-x-4">
                <Icon name="MessageCircle" size={24} className="text-green-600 flex-shrink-0" />
                <span className="text-base text-green-700 font-medium">
                  Need help? Contact us on WhatsApp:{' '}
                  <a 
                    href="https://wa.me/2349062284074" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline text-green-800"
                  >
                    +2349062284074
                  </a>
                </span>
              </div>
            </div>

            {/* Enhanced Sign Up Link */}
            <div className="mt-10 pt-8 border-t border-border text-center">
              <p className="text-lg text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                >
                  Sign Up Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignInPage;
