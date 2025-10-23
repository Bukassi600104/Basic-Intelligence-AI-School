import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../services/notificationService';

const PaymentInstructions = ({ userProfile, selectedTier, onPaymentSubmitted }) => {
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const plans = {
    starter: { name: 'Starter Plan', amount: '₦10,000', duration: '30 days' },
    pro: { name: 'Pro Plan', amount: '₦15,000', duration: '30 days' },
    elite: { name: 'Elite Plan', amount: '₦25,000', duration: '30 days' }
  };

  // Use selectedTier if provided (for upgrades), otherwise use current tier (for renewals)
  const displayTier = selectedTier || userProfile?.membership_tier;
  const selectedPlan = plans[displayTier] || plans.pro;

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
          request_type: userProfile.membership_status === 'pending' ? 'new' : (selectedTier ? 'upgrade' : 'renewal'),
          current_plan: userProfile.membership_tier,
          requested_plan: displayTier,
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
          request_type: userProfile.membership_status === 'pending' ? 'New Signup' : (selectedTier ? 'Upgrade' : 'Renewal'),
          full_name: userProfile.full_name,
          email: userProfile.email,
          member_id: userProfile.member_id || 'Pending',
          current_plan: userProfile.membership_tier,
          requested_plan: displayTier,
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
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
          <Icon name="CreditCard" size={20} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Payment Instructions</h2>
      </div>

      {/* Selected Plan */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-600 mb-1">Selected Plan</div>
            <div className="text-lg font-bold text-blue-900">{selectedPlan.name}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{selectedPlan.amount}</div>
            <div className="text-xs text-gray-600">{selectedPlan.duration}</div>
          </div>
        </div>
      </div>

      {/* Bank Account Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
          <Icon name="Building" size={18} className="mr-2 text-blue-600" />
          Bank Account Details
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
            <span className="text-xs font-medium text-gray-600">Bank Name:</span>
            <span className="text-sm font-bold text-gray-900">Access Bank</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
            <span className="text-xs font-medium text-gray-600">Account Name:</span>
            <span className="text-sm font-bold text-gray-900">Basic Intelligence Community School</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200">
            <span className="text-xs font-medium text-gray-600">Account Number:</span>
            <span className="text-sm font-bold text-gray-900">0123456789</span>
          </div>
        </div>
      </div>

      {/* Upload Payment Slip */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Upload Payment Slip</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
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
                <Icon name="Loader" size={36} className="text-blue-600 animate-spin mb-2" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : uploadedUrl ? (
              <div className="flex flex-col items-center">
                <Icon name="CheckCircle" size={36} className="text-green-600 mb-2" />
                <p className="text-sm text-green-600 font-medium">Payment slip uploaded successfully!</p>
                <p className="text-xs text-gray-600 mt-1">Click to change</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Icon name="Upload" size={36} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">Click to upload payment slip</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG (max 5MB)</p>
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
        className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-md"
      >
        {submitting ? (
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Loader" size={18} className="animate-spin" />
            <span>Submitting...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <Icon name="Send" size={18} />
            <span>I Have Made Payment</span>
          </div>
        )}
      </Button>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900">
            <p className="font-medium mb-1">Important:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800">
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
