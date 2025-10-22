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
                  <Icon name="UserPlus" size={36} className="text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Join Basic Intelligence
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start your AI learning journey with our community of professionals
              </p>
            </div>

            {/* Enhanced Selected Tier Display */}
            <div className="mb-10 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-medium text-foreground mb-2">Selected Membership:</p>
                  <p className="text-lg text-primary font-semibold">
                    {getTierDisplayName(formData?.tier)}
                  </p>
                </div>
                <Link 
                  to="/pricing-plans-page" 
                  className="text-base text-primary hover:text-primary/80 font-medium flex items-center space-x-2 transition-colors"
                >
                  <Icon name="ArrowRight" size={18} />
                  <span>Change Plan</span>
                </Link>
              </div>
            </div>

            {/* Enhanced Error Message */}
            {error && (
              <div className="mb-10 p-5 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center space-x-4">
                  <Icon name="AlertCircle" size={24} className="text-red-600 flex-shrink-0" />
                  <span className="text-red-600 text-base font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Enhanced Registration Form - Much Better Spacing */}
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Input
                  label="Full Name"
                  name="fullName"
                  type="text"
                  required
                  value={formData?.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  className="text-lg h-14"
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
                  className="text-lg h-14"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    className="text-lg h-14 pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-11 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-muted/50"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={24} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  required
                  value={formData?.phone}
                  onChange={handleInputChange}
                  placeholder="+234 123 456 7890"
                  disabled={loading}
                  className="text-lg h-14"
                />

                <Input
                  label="Location (Optional)"
                  name="location"
                  type="text"
                  value={formData?.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  disabled={loading}
                  className="text-lg h-14"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-4 p-6 bg-muted/30 rounded-xl">
                <Icon name="Shield" size={24} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-base text-muted-foreground">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                  </p>
                </div>
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
                    <span>Creating Your Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Icon name="UserPlus" size={24} />
                    <span>Create Account</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Enhanced WhatsApp Contact */}
            <div className="mt-10 p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-center space-x-4">
                <Icon name="MessageCircle" size={24} className="text-green-600 flex-shrink-0" />
                <button
                  onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
                  className="text-base text-green-700 font-medium hover:underline cursor-pointer"
                >
                  Need help? Contact us on WhatsApp
                </button>
              </div>
            </div>

            {/* Enhanced Sign In Link */}
            <div className="mt-10 pt-8 border-t border-border text-center">
              <p className="text-lg text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/signin" 
                  className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                >
                  Sign In Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
