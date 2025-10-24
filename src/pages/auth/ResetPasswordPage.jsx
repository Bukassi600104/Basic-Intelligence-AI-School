import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { passwordService } from '../../services/passwordService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const validation = passwordService.validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      setError('Password does not meet security requirements. Please ensure it has at least 8 characters, uppercase and lowercase letters, and at least one number.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/signin');
        }, 3000);
      }
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="CheckCircle" size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>
            <Button
              onClick={() => navigate('/signin')}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500"
            >
              Go to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/signin')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm font-medium">Back to Sign In</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Key" size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Reset Your Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-2">
                <Icon name="Lock" size={16} className="text-orange-600" />
                <span>New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                </button>
              </div>
              {newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs text-gray-600">At least 8 characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs text-gray-600">Uppercase and lowercase letters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-xs text-gray-600">At least one number</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-2">
                <Icon name="CheckCircle" size={16} className="text-orange-600" />
                <span>Confirm New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Icon name="Key" size={20} className="mr-2" />
              Reset Password
            </Button>
          </form>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Icon name="Shield" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Security Tips</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Use a unique password you don't use elsewhere</li>
                  <li>• Consider using a password manager</li>
                  <li>• Never share your password with anyone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
