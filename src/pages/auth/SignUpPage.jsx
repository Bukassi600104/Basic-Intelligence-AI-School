import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicHeader from '../../components/ui/PublicHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

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

  const { signUp, user, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get tier from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location?.search);
    const tierParam = urlParams?.get('tier');
    if (tierParam && ['starter', 'pro', 'elite']?.includes(tierParam)) {
      setFormData(prev => ({ ...prev, tier: tierParam }));
    }
  }, [location?.search]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && userProfile) {
      // Redirect based on role
      if (userProfile.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    }
  }, [user, userProfile, navigate]);

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
        membership_tier: formData?.tier
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

      // Registration successful
      if (data?.user) {
        // Show success message and redirect
        navigate('/signin?message=registration_success');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <PublicHeader />
      
      <div className="max-w-2xl w-full space-y-8 animate-fadeIn mt-20">
        {/* Compact Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-3xl">
          {/* Compact Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                <Icon name="UserPlus" size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Join Basic Intelligence
            </h1>
            <p className="text-sm text-gray-600">
              Start your AI learning journey with us
            </p>
          </div>

          {/* Selected Tier Display - Compact */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Selected Membership:</p>
                <p className="text-sm text-blue-600 font-semibold">
                  {getTierDisplayName(formData?.tier)}
                </p>
              </div>
              <Link 
                to="/pricing-plans-page" 
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors"
              >
                <span>Change</span>
                <Icon name="ArrowRight" size={14} />
              </Link>
            </div>
          </div>

          {/* Error Message - Compact */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-slideDown">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={18} className="text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Compact Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                required
                value={formData?.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={loading}
                className="h-11 text-sm"
              />

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData?.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
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

              <div className="relative">
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData?.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter your password"
                  disabled={loading}
                  className="h-11 text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                required
                value={formData?.phone}
                onChange={handleInputChange}
                placeholder="+234 123 456 7890"
                disabled={loading}
                className="h-11 text-sm"
              />

              <Input
                label="Location (Optional)"
                name="location"
                type="text"
                value={formData?.location}
                onChange={handleInputChange}
                placeholder="City, State"
                disabled={loading}
                className="h-11 text-sm"
              />
            </div>

            {/* Terms and Conditions - Compact */}
            <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
              <Icon name="Shield" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                </p>
              </div>
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Icon name="UserPlus" size={18} />
                  <span>Create Account</span>
                </div>
              )}
            </Button>
          </form>

          {/* WhatsApp Contact - Compact */}
          <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Icon name="MessageCircle" size={16} className="text-green-600" />
              <button
                onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
                className="text-green-700 font-medium hover:underline cursor-pointer"
              >
                Need help? WhatsApp Us
              </button>
            </div>
          </div>

          {/* Sign In Link - Compact */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Sign In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
