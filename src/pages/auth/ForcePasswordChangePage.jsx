import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { passwordService } from '../../services/passwordService';
import { supabase } from '../../lib/supabase';
import GeometricBackground from '../../components/ui/GeometricBackground';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { logger } from '../../utils/logger';

const ForcePasswordChangePage = () => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if user doesn't need to change password
  useEffect(() => {
    if (userProfile && !userProfile.must_change_password) {
      // User doesn't need to change password, redirect to appropriate dashboard
      if (userProfile.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/student-dashboard', { replace: true });
      }
    }
  }, [userProfile, navigate]);

  const validateForm = () => {
    // For forced password changes, current password is not required
    // It's a temporary password from admin
    
    if (!formData.newPassword) {
      setError('New password is required');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For forced password changes, we don't need to verify the current password
      // because it's a temporary password provided by admin
      
      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (updateError) {
        logger.error('Failed to update password:', updateError);
        setError(updateError.message || 'Failed to change password. Please try again.');
        setLoading(false);
        return;
      }

      // Update user profile to mark password as changed
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({
          must_change_password: false,
          password_changed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileUpdateError) {
        logger.error('Failed to update password change status:', profileUpdateError);
        // Continue anyway since password was changed
      }

      logger.info('Password changed successfully');

      // Redirect to appropriate dashboard
      if (userProfile?.role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else {
        navigate('/student-dashboard', { replace: true });
      }
    } catch (error) {
      logger.error('Password change error:', error);
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Geometric Pattern Background */}
      <GeometricBackground className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-8 text-white relative">
        <div className="max-w-md text-center z-10 px-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-6 border-2 border-orange-500/30">
            <Icon name="Lock" size={40} className="text-orange-300" />
          </div>
          
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Password Change Required
          </h1>
          
          <p className="text-lg text-gray-300 leading-relaxed">
            For security reasons, you must change your temporary password before accessing your account.
          </p>
        </div>
      </GeometricBackground>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-white overflow-y-auto relative">
        <div className="w-full max-w-md py-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <Icon name="Shield" size={32} className="text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Change Your Password
            </h2>
            <p className="text-gray-600">
              Your account was created by an administrator with a temporary password.
              Please set a new password to continue.
            </p>
          </div>

          {/* Alert Box */}
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="AlertCircle" size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-900 text-sm font-semibold">Important</p>
                <p className="text-orange-700 text-sm mt-1">
                  Choose a strong password with at least 6 characters. Do not share it with anyone.
                </p>
              </div>
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

          {/* Password Change Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Current Temporary Password"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter temporary password"
                disabled={loading}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform translate-y-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <Icon name={showCurrentPassword ? "EyeOff" : "Eye"} size={18} />
              </button>
            </div>

            <div className="relative">
              <Input
                label="New Password"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Minimum 6 characters"
                disabled={loading}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform translate-y-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <Icon name={showNewPassword ? "EyeOff" : "Eye"} size={18} />
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter new password"
                disabled={loading}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform translate-y-1 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={18} />
              </button>
            </div>

            <Button
              type="submit"
              variant="orange"
              fullWidth
              loading={loading}
              disabled={loading}
              size="lg"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>

          {/* Sign Out Option */}
          <div className="mt-6 text-center">
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              Sign out instead
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <Icon name="HelpCircle" size={14} className="inline mr-1" />
              Need help? Contact your administrator or support team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChangePage;
