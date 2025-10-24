import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { redirectAfterLogin } from '../../services/authHelpers';
import GeometricBackground from '../../components/ui/GeometricBackground';
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
    <div className="flex min-h-screen">
            {/* Left Panel - Geometric Pattern Background */}
      <GeometricBackground className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-8 text-white relative">
        {/* Logo at top */}
        <Link to="/" className="absolute top-6 left-6 z-20">
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Icon name="GraduationCap" size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold">Basic Intelligence</span>
          </div>
        </Link>
        
        {/* Central content */}
        <div className="max-w-md text-center z-10 px-8">
          <div className="inline-block mb-6">
            <span className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm border border-orange-500/30 font-medium">
              Welcome Back
            </span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Continue Your AI Journey
          </h1>
          
          <p className="text-lg text-gray-300 leading-relaxed">
            Access your courses, prompt library, and exclusive AI tutorials.
          </p>
        </div>
        
        {/* Pagination dots at bottom */}
        <div className="absolute bottom-6 flex gap-1.5 z-20">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
        </div>
      </GeometricBackground>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-white relative">
        {/* Back to Homepage Button - Desktop */}
        <Link 
          to="/" 
          className="hidden lg:flex absolute top-6 left-6 items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors group"
        >
          <Icon name="ArrowLeft" size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Mobile Logo with Back Button */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
              <Icon name="ArrowLeft" size={20} />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Icon name="GraduationCap" size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Basic Intelligence</span>
            </Link>
          </div>
          
          {/* Form Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Welcome back!
            </h2>
            <p className="text-sm text-gray-600">
              Enter your email and password to continue your learning.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-slideDown">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={18} className="text-green-600 flex-shrink-0" />
                <span className="text-green-700 text-xs">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slideDown">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={18} className="text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-xs">{error}</span>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData?.email}
              onChange={handleInputChange}
              placeholder="jane@example.com"
              disabled={loading}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData?.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform translate-y-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
                title={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
              </button>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700">Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="orange"
              fullWidth
              loading={loading}
              disabled={loading}
              size="md"
            >
              {loading ? 'Signing In...' : 'Log in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Or contact us</span>
            </div>
          </div>

          {/* WhatsApp Contact */}
          <a
            href="https://wa.me/2349062284074"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Icon name="MessageCircle" size={18} className="text-green-600" />
            <span>WhatsApp Support</span>
          </a>

          {/* Sign Up Link */}
          <p className="text-center text-xs text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            >
              Register
            </Link>
          </p>

          {/* Terms and Privacy */}
          <p className="text-center text-xs text-gray-500 mt-4">
            By logging in, you agree to our{' '}
            <a href="#" className="text-orange-500 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
