import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Alert, AlertDescription } from '@/components/ui/alert.tsx';
import PhoneInput from '../../../components/ui/PhoneInput';

const PaymentSubmissionForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    amount: '5000',
    transferReference: '',
    transferDate: '',
    screenshot: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes?.includes(file?.type)) {
        setErrors(prev => ({
          ...prev,
          screenshot: 'Please upload a valid image file (JPEG, PNG, or WebP)'
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file?.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          screenshot: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        screenshot: file
      }));
      
      setErrors(prev => ({
        ...prev,
        screenshot: ''
      }));
    }
  };

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFileChange(e?.dataTransfer?.files?.[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.whatsapp?.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/?.test(formData?.whatsapp)) {
      newErrors.whatsapp = 'Please enter a valid WhatsApp number';
    }

    if (!formData?.transferReference?.trim()) {
      newErrors.transferReference = 'Transfer reference is required';
    }

    if (!formData?.transferDate) {
      newErrors.transferDate = 'Transfer date is required';
    }

    if (!formData?.screenshot) {
      newErrors.screenshot = 'Payment screenshot is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          fullName: '',
          email: '',
          whatsapp: '',
          amount: '5000',
          transferReference: '',
          transferDate: '',
          screenshot: null
        });
        setSubmitStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    })?.format(value);
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="CheckCircle" size={32} className="text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Payment Submitted Successfully!
        </h3>
        <p className="text-muted-foreground mb-6">
          Your payment submission has been received and is being verified. You'll receive a WhatsApp confirmation within 24-48 hours once your payment is verified and your Member ID is assigned.
        </p>
        <div className="space-y-3">
          <Button variant="default" onClick={() => window.location.href = '/home-page'}>
            <Icon name="Home" size={16} className="mr-2" />
            Return to Home
          </Button>
          <Button variant="outline" onClick={() => setSubmitStatus(null)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Submit Another Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-10 lg:p-12 shadow-xl backdrop-blur-sm bg-white/95">
      {/* Enhanced Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center">
            <Icon name="Upload" size={36} className="text-secondary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Submit Payment Details
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Fill in your transfer details and upload payment screenshot for verification
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Personal Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            value={formData?.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            error={errors?.fullName}
            required
            className="text-lg h-14"
          />
          
          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            name="email"
            value={formData?.email}
            onChange={handleInputChange}
            placeholder={process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'your.email@example.com'}
            error={errors?.email}
            required
            className="text-lg h-14"
          />
        </div>

        <div>
          <PhoneInput
            label="WhatsApp Number"
            name="whatsapp"
            value={formData?.whatsapp}
            onChange={handleInputChange}
            placeholder="Enter WhatsApp number"
            defaultCountryCode="+234"
            error={errors?.whatsapp}
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            We'll send your Member ID confirmation via WhatsApp
          </p>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Input
            label="Amount Transferred"
            type="text"
            name="amount"
            value={formatCurrency(formData?.amount)}
            disabled
            description="Fixed membership fee"
            className="text-lg h-14"
          />
          
          <Input
            label="Transfer Reference"
            type="text"
            name="transferReference"
            value={formData?.transferReference}
            onChange={handleInputChange}
            placeholder="e.g., TXN123456789"
            error={errors?.transferReference}
            required
            className="text-lg h-14"
          />
          
          <Input
            label="Transfer Date"
            type="date"
            name="transferDate"
            value={formData?.transferDate}
            onChange={handleInputChange}
            error={errors?.transferDate}
            required
            className="text-lg h-14"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-lg font-medium text-foreground mb-4">
            Payment Screenshot <span className="text-error">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-colors duration-200 ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : errors?.screenshot 
                  ? 'border-error bg-error/5' :'border-border bg-muted/30 hover:bg-muted/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e?.target?.files?.[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="text-center">
              {formData?.screenshot ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-success/10 rounded-xl flex items-center justify-center mx-auto">
                    <Icon name="CheckCircle" size={32} className="text-success" />
                  </div>
                  <div className="text-base font-medium text-foreground">
                    {formData?.screenshot?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {(formData?.screenshot?.size / 1024 / 1024)?.toFixed(2)} MB
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    onClick={() => setFormData(prev => ({ ...prev, screenshot: null }))}
                    className="h-12 text-base"
                  >
                    <Icon name="X" size={20} className="mr-2" />
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center mx-auto">
                    <Icon name="Upload" size={32} className="text-muted-foreground" />
                  </div>
                  <div className="text-base font-medium text-foreground">
                    Drop your screenshot here or click to browse
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Supports JPEG, PNG, WebP (Max 5MB)
                  </div>
                </div>
              )}
            </div>
          </div>
          {errors?.screenshot && (
            <p className="mt-2 text-sm text-error font-medium">{errors?.screenshot}</p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a clear screenshot of your bank transfer receipt or confirmation
          </p>
        </div>

        {/* Enhanced Submit Button */}
        <div className="pt-8 border-t border-border">
          <Button
            type="submit"
            variant="default"
            loading={isSubmitting}
            disabled={isSubmitting}
            size="lg"
            className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-3">
                <Icon name="Loader" size={24} className="animate-spin" />
                <span>Submitting Payment...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Icon name="Send" size={24} />
                <span>Submit Payment for Verification</span>
              </div>
            )}
          </Button>
        </div>
      </form>
      {submitStatus === 'error' && (
        <div className="mt-10 p-6 bg-error/10 border border-error/20 rounded-xl">
          <div className="flex items-center space-x-4 text-error">
            <Icon name="AlertCircle" size={24} />
            <span className="text-base font-medium">Submission Failed</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            There was an error submitting your payment. Please try again or contact support.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentSubmissionForm;
