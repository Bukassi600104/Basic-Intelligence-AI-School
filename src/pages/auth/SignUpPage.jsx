import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GeometricBackground from '../../components/ui/GeometricBackground';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { notificationService } from '../../services/notificationService';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    tier: 'pro'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signUp, user, userProfile, getLoginIntent, clearLoginIntent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get tier from URL parameters or login intent
  useEffect(() => {
    const urlParams = new URLSearchParams(location?.search);
    const tierParam = urlParams?.get('tier');
    
    // Check for login intent (from featured content)
    const intent = getLoginIntent();
    
    // Prioritize URL parameter, then check intent for tier recommendation
    if (tierParam && ['starter', 'pro', 'elite']?.includes(tierParam)) {
      setFormData(prev => ({ ...prev, tier: tierParam }));
    } else if (intent && intent.path) {
      // Could add logic here to recommend tier based on content access_level
      // For now, default to pro which is the most common
      setFormData(prev => ({ ...prev, tier: 'pro' }));
    }
  }, [location?.search, getLoginIntent]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && userProfile) {
      // Check for login intent first
      const intent = getLoginIntent();
      if (intent && intent.path) {
        // Build URL with query parameters if present
        let redirectUrl = intent.path;
        const params = new URLSearchParams();
        if (intent.contentId) params.append('contentId', intent.contentId);
        if (intent.featured) params.append('featured', 'true');
        
        if (params.toString()) {
          redirectUrl = `${intent.path}?${params.toString()}`;
        }

        // Clear intent and redirect
        clearLoginIntent();
        navigate(redirectUrl, { replace: true });
        return;
      }

      // Default redirect based on role
      if (userProfile.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    }
  }, [user, userProfile, navigate, getLoginIntent, clearLoginIntent]);

  const validateForm = () => {
    if (!formData?.fullName?.trim()) {
      setError('Full name is required');
      return false;
    }
    
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
    
    if (formData?.password?.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData?.password !== formData?.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!formData?.phone?.trim()) {
      setError('Phone number is required');
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

    try {
      // Prepare metadata for user profile
      const userMetadata = {
        full_name: formData?.fullName?.trim(),
        phone: formData?.phone?.trim(),
        location: formData?.location?.trim(),
        membership_tier: formData?.tier,
        membership_status: 'pending' // Set as pending until payment is confirmed
      };

      // Sign up with Supabase Auth
      const { data, error: signUpError } = await signUp(
        formData?.email?.trim(),
        formData?.password,
        userMetadata
      );

      if (signUpError) {
        setError(signUpError);
        return;
      }

      // Registration successful - redirect to dashboard immediately
      if (data?.user) {
        // Send welcome email with pending activation message
        try {
          await notificationService.sendNotification({
            userId: data.user.id,
            templateName: 'user_welcome_pending_activation',
            variables: {
              full_name: formData?.fullName?.trim(),
              email: formData?.email?.trim(),
              member_id: 'Pending Assignment',
              membership_tier: formData?.tier,
              dashboard_url: `${window.location.origin}/student-dashboard`
            },
            recipientType: 'email'
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't block registration if email fails
        }
        
        // User will see locked dashboard with payment instructions
        navigate('/student-dashboard');
      }
      
    } catch (error) {
      setError('Registration failed. Please try again.');
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
    // Clear error when user starts typing
    if (error) setError('');
  };

  const getTierDisplayName = (tier) => {
    const tierNames = {
      starter: 'Starter Member (₦10,000/month)',
      pro: 'Pro Member (₦15,000/month)',
      elite: 'Elite Member (₦25,000/month)'
    };
    return tierNames?.[tier] || 'Pro Member (₦15,000/month)';
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
              Start Your Journey
            </span>
          </div>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Join Thousands of Students
          </h1>
          
          <p className="text-lg text-gray-300 leading-relaxed">
            Get instant access to our comprehensive AI courses and tutorials.
          </p>
        </div>
        
        {/* Pagination dots at bottom */}
        <div className="absolute bottom-6 flex gap-1.5 z-20">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
        </div>
      </GeometricBackground>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-white overflow-y-auto relative">
        {/* Back to Homepage Button - Desktop */}
        <Link 
          to="/" 
          className="hidden lg:flex absolute top-6 left-6 items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors group z-10"
        >
          <Icon name="ArrowLeft" size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>

        <div className="w-full max-w-md py-6">
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
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Create your account
            </h2>
            <p className="text-gray-600">
              Sign up to get started with your AI learning journey.
            </p>
          </div>

          {/* Login Intent Notification */}
          {(() => {
            const intent = getLoginIntent();
            return intent && intent.path ? (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-slideDown">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-900 text-xs font-semibold">Featured Content Waiting</p>
                    <p className="text-blue-700 text-xs mt-0.5">
                      Create your account to access the featured content you selected
                    </p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Selected Tier Display */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Selected Plan:</p>
                <p className="text-lg text-orange-600 font-bold">
                  {getTierDisplayName(formData?.tier)}
                </p>
              </div>
              <Link 
                to="/pricing-plans-page" 
                className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1 transition-colors"
              >
                <span>Change</span>
                <Icon name="ArrowRight" size={16} />
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-slideDown">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={formData?.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              disabled={loading}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData?.email}
              onChange={handleInputChange}
              placeholder="john@example.com"
              disabled={loading}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData?.password}
                onChange={handleInputChange}
                placeholder="Minimum 6 characters"
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

            <div className="relative">
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData?.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                disabled={loading}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform translate-y-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
              </button>
            </div>

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              required
              value={formData?.phone}
              onChange={handleInputChange}
              placeholder="+234 XXX XXX XXXX"
              disabled={loading}
            />

            <Input
              label="Location (Optional)"
              name="location"
              type="text"
              value={formData?.location}
              onChange={handleInputChange}
              placeholder="City, State"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="orange"
              fullWidth
              loading={loading}
              disabled={loading}
              size="lg"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link 
              to="/signin" 
              className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>

          {/* WhatsApp Contact */}
          <button
            onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
            className="w-full mt-4 p-3 border-2 border-gray-200 rounded-lg hover:border-orange-500 transition-colors text-sm text-gray-700 hover:text-orange-600 font-medium"
          >
            <Icon name="MessageCircle" size={16} className="inline mr-2" />
            Need Help? WhatsApp Us
          </button>

          {/* Terms and Privacy */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <a href="#" className="text-orange-500 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-orange-500 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
