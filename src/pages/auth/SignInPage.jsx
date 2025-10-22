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

  const { signIn, user, userProfile, isAdmin, isMember, profileLoading } = useAuth();
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
    // Log state for debugging
    console.log('SignIn useEffect:', { 
      hasUser: !!user, 
      hasProfile: !!userProfile, 
      role: userProfile?.role,
      isAdmin,
      profileLoading 
    });
    
    if (user && userProfile && !profileLoading) {
      console.log('🔄 Redirecting user based on role:', {
        email: user.email,
        role: userProfile.role,
        isAdmin,
        isMember
      });
      
      // Stop loading spinner
      setLoading(false);
      
      // Direct redirection based on user role from profile
      if (userProfile.role === 'admin') {
        console.log('✅ Admin detected - redirecting to /admin-dashboard');
        navigate('/admin-dashboard', { replace: true });
      } else if (userProfile.role === 'student') {
        console.log('✅ Student detected - redirecting to /student-dashboard');
        navigate('/student-dashboard', { replace: true });
      } else {
        // Fallback for unknown roles
        console.log('⚠️ Unknown role:', userProfile.role, '- redirecting to student dashboard');
        navigate('/student-dashboard', { replace: true });
      }
    }
  }, [user, userProfile, profileLoading, isAdmin, isMember, navigate]);

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
        setLoading(false);
        return;
      }

      // Sign in successful - keep loading true until redirect happens
      // The useEffect will handle the redirect based on user role
      console.log('Sign in successful, waiting for profile to load and redirect...');
      
    } catch (error) {
      setError('Sign in failed. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <PublicHeader />
      
      <div className="max-w-md w-full space-y-8 animate-fadeIn mt-20">
        {/* Compact Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
          {/* Compact Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <Icon name="LogIn" size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-gray-600">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-slideDown">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={18} className="text-green-600 flex-shrink-0" />
                <span className="text-green-700 text-sm">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slideDown">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={18} className="text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Compact Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                value={formData?.email}
                onChange={handleInputChange}
                placeholder="youremail@gmail.com"
                disabled={loading}
                className="h-11 text-sm"
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
                  className="h-11 text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 text-gray-600">
                  Remember me
                </label>
              </div>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Compact Submit Button */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
              className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="Loader" size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="LogIn" size={18} />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          {/* WhatsApp Contact - Compact */}
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Icon name="MessageCircle" size={16} className="text-green-600" />
              <span className="text-green-700">
                Need help?{' '}
                <a 
                  href="https://wa.me/2349062284074" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  WhatsApp Us
                </a>
              </span>
            </div>
          </div>

          {/* Sign Up Link - Compact */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Sign Up Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
