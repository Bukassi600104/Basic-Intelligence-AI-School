import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GeometricBackground from '../../components/ui/GeometricBackground';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PhoneInput from '../../components/ui/PhoneInput';
import Icon from '../../components/AppIcon';
import { notificationService } from '../../services/notificationService';
import { emailVerificationService } from '../../services/emailVerificationService';

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
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Email verification state
  const [verificationStep, setVerificationStep] = useState(1); // 1: form, 2: verify OTP, 3: success
  const [otpCode, setOtpCode] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

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

  // OTP expiry countdown timer
  useEffect(() => {
    if (otpExpiry && verificationStep === 2) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiry = new Date(otpExpiry);
        const secondsLeft = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeRemaining(secondsLeft);
        
        if (secondsLeft === 0) {
          clearInterval(interval);
          setError('Your OTP has expired. Please request a new one.');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [otpExpiry, verificationStep]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

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
    
    // Enhanced email validation
    const emailValidation = emailVerificationService.validateEmailFormat(formData?.email?.trim());
    if (!emailValidation.valid) {
      setError(emailValidation.error);
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

  // Step 1: Send OTP for email verification
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send verification email with OTP
      const result = await emailVerificationService.sendVerificationEmail(
        formData?.email?.trim(),
        formData?.fullName?.trim()
      );

      if (!result.success) {
        setError(result.error || 'Failed to send verification email. Please try again.');
        return;
      }

      // Move to verification step
      setOtpExpiry(result.data.expiresAt);
      setVerificationStep(2);
      setSuccess('Verification code sent to your email. Please check your inbox.');
      
    } catch (error) {
      setError('Failed to send verification email. Please try again.');
      console.error('Verification email error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Verify the OTP
      const verifyResult = await emailVerificationService.verifyOTP(
        formData?.email?.trim(),
        otpCode
      );

      if (!verifyResult.success) {
        setError(verifyResult.error || 'Invalid or expired OTP code');
        return;
      }

      // OTP verified successfully - now create the account
      const userMetadata = {
        full_name: formData?.fullName?.trim(),
        phone: formData?.phone?.trim(),
        location: formData?.location?.trim(),
        membership_tier: formData?.tier,
        membership_status: 'pending', // Set as pending until payment is confirmed
        email_verified: true
      };

      const { data, error: signUpError } = await signUp(
        formData?.email?.trim(),
        formData?.password,
        userMetadata
      );

      if (signUpError) {
        setError(signUpError);
        return;
      }

      if (data?.user) {
        // Mark email as verified in user profile
        await emailVerificationService.markEmailVerified(data.user.id);

        // Send thank you email
        try {
          await notificationService.sendNotification({
            userId: data.user.id,
            templateName: 'Registration Thank You',
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
          console.error('Failed to send thank you email:', emailError);
          // Don't block registration if email fails
        }
        
        setVerificationStep(3);
        setSuccess('Account created successfully! Redirecting to dashboard...');
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 2000);
      }
      
    } catch (error) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await emailVerificationService.resendVerificationEmail(
        formData?.email?.trim()
      );

      if (!result.success) {
        setError(result.error || 'Failed to resend code');
        return;
      }

      setOtpExpiry(result.data.expiresAt);
      setResendCooldown(60); // 60 second cooldown
      setSuccess('New verification code sent to your email');
      setOtpCode(''); // Clear current OTP input
      
    } catch (error) {
      setError('Failed to resend verification code');
      console.error('Resend OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Go back to form from verification step
  const handleBackToForm = () => {
    setVerificationStep(1);
    setOtpCode('');
    setError('');
    setSuccess('');
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Geometric Pattern Background */}
      <GeometricBackground className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white relative">
        {/* Logo at top */}
        <Link to="/" className="absolute top-8 left-8 z-30">
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Icon name="GraduationCap" size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold">Basic Intelligence</span>
          </div>
        </Link>
        
        {/* Central content */}
        <div className="max-w-lg text-center z-20 px-6 space-y-6">
          <div className="inline-block">
            <span className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm border border-orange-500/30 font-medium backdrop-blur-sm">
              Start Your Journey
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
            Join Thousands of Students
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-md mx-auto">
            Get instant access to our comprehensive AI courses and tutorials.
          </p>
        </div>
        
        {/* Pagination dots at bottom */}
        <div className="absolute bottom-8 flex gap-2 z-30">
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
          <div className="w-2 h-2 rounded-full bg-orange-500 shadow-lg"></div>
          <div className="w-2 h-2 rounded-full bg-gray-600"></div>
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
              {verificationStep === 1 && 'Create your account'}
              {verificationStep === 2 && 'Verify your email'}
              {verificationStep === 3 && 'Success!'}
            </h2>
            <p className="text-gray-600">
              {verificationStep === 1 && 'Sign up to get started with your AI learning journey.'}
              {verificationStep === 2 && 'Enter the 6-digit code we sent to your email'}
              {verificationStep === 3 && 'Your account has been created successfully!'}
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

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-slideDown">
              <div className="flex items-center space-x-2">
                <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            </div>
          )}

          {/* Registration Form - Step 1 */}
          {verificationStep === 1 && (
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

              <PhoneInput
                label="Phone Number"
                name="phone"
                required
                value={formData?.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                defaultCountryCode="+234"
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
                {loading ? 'Sending Code...' : 'Continue'}
              </Button>
            </form>
          )}

          {/* OTP Verification Form - Step 2 */}
          {verificationStep === 2 && (
            <div className="space-y-6">
              {/* Email sent to display */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon name="Mail" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Code sent to:</p>
                    <p className="text-sm text-blue-700 font-semibold">{formData?.email}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                      setOtpCode(value);
                      if (error) setError('');
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none transition-colors"
                    disabled={loading}
                    autoFocus
                  />
                  {timeRemaining > 0 && (
                    <p className="mt-2 text-sm text-gray-600 flex items-center justify-center gap-2">
                      <Icon name="Clock" size={16} />
                      Code expires in {formatTime(timeRemaining)}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="orange"
                  fullWidth
                  loading={loading}
                  disabled={loading || otpCode.length !== 6}
                  size="lg"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </Button>
              </form>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : 'Resend verification code'}
                </button>
              </div>

              {/* Back to form */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1 mx-auto transition-colors"
                  disabled={loading}
                >
                  <Icon name="ArrowLeft" size={16} />
                  Change email address
                </button>
              </div>
            </div>
          )}

          {/* Success Message - Step 3 */}
          {verificationStep === 3 && (
            <div className="text-center space-y-6 py-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-fadeIn">
                <Icon name="CheckCircle" size={40} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome aboard!</h3>
                <p className="text-gray-600">
                  Your account has been created successfully. You'll be redirected to your dashboard shortly.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
              </div>
            </div>
          )}

          {/* Sign In Link - Only show on step 1 */}
          {verificationStep === 1 && (
            <>
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
            </>
          )}

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
