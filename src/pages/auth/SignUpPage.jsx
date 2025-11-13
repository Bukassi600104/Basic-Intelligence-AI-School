import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GeometricBackground from '../../components/ui/GeometricBackground';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Alert, AlertDescription } from '@/components/ui/alert.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.tsx';
import PhoneInput from '../../components/ui/PhoneInput';
import Icon from '../../components/AppIcon';
import { notificationService } from '../../services/notificationService';
import { emailVerificationService } from '../../services/emailVerificationService';
import { whatsappService } from '../../services/whatsappService';

const SignUpPage = () => {
  // Wizard steps: 1 = Member Details, 2 = Select Plan, 3 = Account Summary & Payment
  const [currentStep, setCurrentStep] = useState(1);
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
  const [paymentSlip, setPaymentSlip] = useState(null);

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
    // Prevent redirect loop - only redirect if we have complete auth state
    if (!user || !userProfile) {
      return;
    }

    console.log('SignUp redirect check:', {
      hasUser: !!user,
      hasProfile: !!userProfile,
      role: userProfile?.role
    });

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
      navigate('/admin-dashboard', { replace: true });
    } else {
      navigate('/student-dashboard', { replace: true });
    }
  }, [user, userProfile]);

  const getTierDisplayName = (tier) => {
    const tierNames = {
      starter: 'Starter Member (₦10,000/month)',
      pro: 'Pro Member (₦15,000/month)',
      elite: 'Elite Member (₦25,000/month)'
    };
    return tierNames?.[tier] || 'Pro Member (₦15,000/month)';
  };

  const getTierPrice = (tier) => {
    const prices = {
      starter: '10000',
      pro: '15000',
      elite: '25000'
    };
    return prices?.[tier] || '15000';
  };

  // Wizard navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    setError('');
  };

  // Validation functions for each step
  const validateStep1 = () => {
    if (!formData?.fullName?.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData?.email?.trim()) {
      setError('Email is required');
      return false;
    }
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

  const validateStep2 = () => {
    // Plan selection is always valid since we have a default
    return true;
  };

  const validateStep3 = () => {
    if (!paymentSlip) {
      setError('Please upload your payment slip to complete registration');
      return false;
    }
    return true;
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

  const handleFileChange = (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes?.includes(file?.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      // Validate file size (5MB max)
      if (file?.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setPaymentSlip(file);
      setError('');
    }
  };

  const handlePaymentConfirmation = async () => {
    setError('');
    setLoading(true);
    
    console.log('🚀 Starting payment confirmation process...');
    console.log('Form data:', formData);

    if (!validateStep3()) {
      setLoading(false);
      return;
    }

    try {
      // Send WhatsApp notification to admin
      try {
        const whatsappResult = await whatsappService.sendPaymentReceipt({
          fullName: formData?.fullName?.trim(),
          email: formData?.email?.trim(),
          phone: formData?.phone?.trim(),
          plan: getTierDisplayName(formData?.tier),
          amount: getTierPrice(formData?.tier),
          imageFile: paymentSlip
        });
        
        if (whatsappResult.success) {
          console.log('WhatsApp notification sent to admin');
        }
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp notification:', whatsappError);
      }

      // First, send payment slip to admin email
      const slipEmailData = {
        to: 'bukassi@gmail.com',
        subject: `New Registration Payment Slip - ${formData?.fullName?.trim()}`,
        html: `
          <h2>New Member Registration Payment</h2>
          <p><strong>Name:</strong> ${formData?.fullName?.trim()}</p>
          <p><strong>Email:</strong> ${formData?.email?.trim()}</p>
          <p><strong>Phone:</strong> ${formData?.phone?.trim()}</p>
          <p><strong>Location:</strong> ${formData?.location?.trim()}</p>
          <p><strong>Plan:</strong> ${getTierDisplayName(formData?.tier)}</p>
          <p><strong>Amount:</strong> ₦${getTierPrice(formData?.tier)}</p>
          <hr>
          <p><strong>Payment Slip:</strong> Attached</p>
        `
      };

      // Send email with attachment (this would need to be implemented in email service)
      console.log('Payment slip would be sent to admin:', slipEmailData);
      
      // For now, let's try to send the email via notificationService
      try {
        const emailResult = await notificationService.sendNotificationByEmail(
          'bukassi@gmail.com',
          'Payment Slip Upload Notification',
          {
            full_name: 'Admin',
            member_name: formData?.fullName?.trim(),
            email: formData?.email?.trim(),
            phone: formData?.phone?.trim(),
            location: formData?.location?.trim(),
            plan: getTierDisplayName(formData?.tier),
            amount: `₦${getTierPrice(formData?.tier)}`
          }
        );
        console.log('Payment slip email result:', emailResult);
      } catch (emailError) {
        console.error('Failed to send payment slip email:', emailError);
      }

      // Create account
      const userMetadata = {
        full_name: formData?.fullName?.trim(),
        phone: formData?.phone?.trim(),
        location: formData?.location?.trim(),
        membership_tier: formData?.tier,
        membership_status: 'pending', // Set as pending until payment is confirmed
        email_verified: true,
        payment_confirmed: false // Will be updated by admin
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
        // Send welcome email
        try {
          await notificationService.sendNotification({
            userId: data.user.id,
            templateName: 'Welcome Email',
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
        
        setSuccess('Account created successfully! Redirecting to dashboard...');
        
        // Redirect to dashboard immediately
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

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Geometric Pattern Background */}
      <GeometricBackground className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 text-white relative">
        {/* Central content - properly centered including logo */}
        <div className="flex flex-col items-center justify-center w-full max-w-lg text-center z-20 px-8 space-y-6">
          {/* Logo - centered as part of content */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Icon name="GraduationCap" size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold">Basic Intelligence</span>
            </div>
          </Link>
          
          <div className="inline-block">
            <span className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm border border-orange-500/30 font-medium backdrop-blur-sm">
              Join Our Community
            </span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
            {currentStep === 1 && 'Create Your Account'}
            {currentStep === 2 && 'Choose Your Plan'}
            {currentStep === 3 && 'Complete Registration'}
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-md">
            {currentStep === 1 && 'Start your AI learning journey with us.'}
            {currentStep === 2 && 'Select the membership plan that fits your goals.'}
            {currentStep === 3 && 'Review your details and confirm payment.'}
          </p>
        </div>
        
        {/* Wizard Progress */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-40">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? 'bg-orange-500 shadow-lg w-8'
                  : step < currentStep
                  ? 'bg-orange-300'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </GeometricBackground>
      
      {/* Right Panel - Wizard Steps */}
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
              <span className="lg:text-lg font-bold text-gray-900">Basic Intelligence</span>
            </Link>
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

          {/* Step 1: Member Details */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Member Details</h2>
                <p className="text-gray-600">Please provide your personal information</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData?.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="text-lg h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData?.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                    className="text-lg h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp Number</Label>
                  <PhoneInput
                    id="phone"
                    name="phone"
                    value={formData?.phone}
                    onChange={handleInputChange}
                    placeholder="Enter WhatsApp number"
                    defaultCountryCode="+234"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    type="text"
                    name="location"
                    value={formData?.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="text-lg h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData?.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    required
                    className="text-lg h-14"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData?.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    required
                    className="text-lg h-14"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/signin')}
                  className="text-lg h-14 px-6"
                >
                  Already have an account?
                </Button>
                <Button
                  type="submit"
                  onClick={(e) => { e.preventDefault(); if (validateStep1()) nextStep(); }}
                  className="text-lg h-14 px-8"
                >
                  Next Step
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Plan */}
          {currentStep === 2 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
                <p className="text-gray-600">Select the membership plan that fits your goals</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="tier">Membership Plan</Label>
                  <Select value={formData?.tier} onValueChange={(value) => setFormData(prev => ({ ...prev, tier: value }))}>
                    <SelectTrigger className="text-lg h-14">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">
                        <div className="flex flex-col">
                          <span className="font-medium">Starter</span>
                          <span className="text-sm text-gray-500">₦10,000/month</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pro">
                        <div className="flex flex-col">
                          <span className="font-medium">Pro</span>
                          <span className="text-sm text-gray-500">₦15,000/month</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="elite">
                        <div className="flex flex-col">
                          <span className="font-medium">Elite</span>
                          <span className="text-sm text-gray-500">₦25,000/month</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plan Details */}
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
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
                      <span>View Details</span>
                      <Icon name="ArrowRight" size={16} />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="text-lg h-14 px-6"
                >
                  <Icon name="ArrowLeft" size={20} className="mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={() => { if (validateStep2()) nextStep(); }}
                  className="text-lg h-14 px-8"
                >
                  Next Step
                  <Icon name="ArrowRight" size={20} className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Account Summary & Payment */}
          {currentStep === 3 && (
            <div>
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Complete Registration</h2>
                <p className="text-sm text-gray-600">Review your details and upload payment slip</p>
              </div>

              {/* Payment Details */}
              <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <Icon name="CreditCard" size={18} className="mr-2 text-orange-600" />
                  Payment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank:</span>
                    <span className="font-semibold">Opay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number:</span>
                    <span className="font-semibold">9062284074</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name:</span>
                    <span className="font-semibold">Orjiako Tony</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-orange-200">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-base text-orange-600">₦{getTierPrice(formData?.tier)}</span>
                  </div>
                </div>
              </div>

              {/* Account Summary */}
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Account Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData?.fullName?.trim()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData?.email?.trim()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData?.phone?.trim()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium text-orange-600">{getTierDisplayName(formData?.tier)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Slip Upload */}
              <div className="space-y-2">
                <Label className="text-sm">Payment Slip (Required)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-orange-400 transition-colors">
                  {paymentSlip ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                        <Icon name="CheckCircle" size={24} className="text-green-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {paymentSlip?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(paymentSlip?.size / 1024 / 1024)?.toFixed(2)} MB
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setPaymentSlip(null)}
                        className="text-xs h-8"
                      >
                        <Icon name="X" size={14} className="mr-1" />
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
                        <Icon name="Upload" size={24} className="text-gray-400" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Upload payment receipt or screenshot
                      </div>
                      <div className="text-xs text-gray-500">
                        Supports JPEG, PNG, WebP (Max 5MB)
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e?.target?.files?.[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="text-lg h-14 px-6"
                >
                  <Icon name="ArrowLeft" size={20} className="mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={handlePaymentConfirmation}
                  loading={loading}
                  disabled={loading}
                  className="text-lg h-14 px-8"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <Icon name="Loader" size={24} className="animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>I have made payment</span>
                      <Icon name="ArrowRight" size={20} />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;