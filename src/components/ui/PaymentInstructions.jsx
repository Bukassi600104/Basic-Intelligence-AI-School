import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../services/notificationService';

const PaymentInstructions = ({ userProfile, onPaymentSubmitted }) => {
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const plans = {
    starter: { name: 'Starter Plan', amount: '₦10,000', duration: '30 days' },
    pro: { name: 'Pro Plan', amount: '₦15,000', duration: '30 days' },
    elite: { name: 'Elite Plan', amount: '₦25,000', duration: '30 days' }
  };

  const selectedPlan = plans[userProfile?.membership_tier] || plans.pro;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile.id}_${Date.now()}.${fileExt}`;
      const filePath = `payment-slips/${fileName}`;

      const { data, error } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      setUploadedUrl(publicUrl);
      setPaymentSlip(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload payment slip. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!uploadedUrl) {
      alert('Please upload your payment slip first');
      return;
    }

    setSubmitting(true);
    try {
      // Create subscription request
      const { data, error } = await supabase
        .from('subscription_requests')
        .insert({
          member_id: userProfile.id,
          request_type: userProfile.membership_status === 'pending' ? 'new' : 'renewal',
          current_plan: userProfile.membership_tier,
          requested_plan: userProfile.membership_tier,
          payment_amount: parseFloat(selectedPlan.amount.replace(/[₦,]/g, '')),
          payment_status: 'pending',
          payment_slip_url: uploadedUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to admin
      await notificationService.sendNotification({
        userId: userProfile.id,
        templateName: 'admin_payment_request_notification',
        variables: {
          request_type: userProfile.membership_status === 'pending' ? 'New Signup' : 'Renewal',
          full_name: userProfile.full_name,
          email: userProfile.email,
          member_id: userProfile.member_id || 'Pending',
          current_plan: userProfile.membership_tier,
          requested_plan: userProfile.membership_tier,
          payment_amount: selectedPlan.amount
        },
        recipientType: 'email'
      });

      alert('Payment submitted successfully! You will receive a confirmation email within 48 hours.');
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to submit payment. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
          <Icon name="CreditCard" size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Instructions</h2>
      </div>

      {/* Selected Plan */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Selected Plan</div>
            <div className="text-2xl font-bold text-blue-900">{selectedPlan.name}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{selectedPlan.amount}</div>
            <div className="text-sm text-gray-600">{selectedPlan.duration}</div>
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Icon name="Building" size={20} className="mr-2 text-blue-600" />
          Bank Account Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Bank Name:</span>
            <span className="text-sm font-bold text-gray-900">First Bank of Nigeria</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Account Name:</span>
            <span className="text-sm font-bold text-gray-900">Basic Intelligence Community</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-600">Account Number:</span>
            <span className="text-sm font-bold text-gray-900">1234567890</span>
          </div>
        </div>
      </div>

      {/* Upload Payment Slip */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Upload Payment Slip</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="payment-slip-upload"
            disabled={uploading || submitting}
          />
          <label
            htmlFor="payment-slip-upload"
            className="cursor-pointer block"
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <Icon name="Loader" size={48} className="text-blue-600 animate-spin mb-3" />
                <p className="text-gray-600">Uploading...</p>
              </div>
            ) : uploadedUrl ? (
              <div className="flex flex-col items-center">
                <Icon name="CheckCircle" size={48} className="text-green-600 mb-3" />
                <p className="text-green-600 font-medium">Payment slip uploaded successfully!</p>
                <p className="text-sm text-gray-600 mt-2">Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Icon name="Upload" size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">Click to upload payment slip</p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG (max 5MB)</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmitPayment}
        disabled={!uploadedUrl || submitting}
        loading={submitting}
        fullWidth
        className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg shadow-lg"
      >
        {submitting ? (
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Loader" size={20} className="animate-spin" />
            <span>Submitting...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Send" size={20} />
            <span>I Have Made Payment</span>
          </div>
        )}
      </Button>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Transfer the exact amount to the account above</li>
              <li>Upload a clear image of your payment slip/receipt</li>
              <li>Your account will be activated within 48 hours</li>
              <li>You will receive a confirmation email once verified</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;
