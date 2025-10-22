import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../services/authHelpers';
import AdminSidebar from '../../components/ui/AdminSidebar';

const AdminSettings = () => {
  const { user, userProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[^a-zA-Z0-9]+/)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const getStrengthLabel = (strength) => {
    switch (strength) {
      case 0: return { text: 'Very Weak', color: 'bg-red-500' };
      case 1: return { text: 'Weak', color: 'bg-red-400' };
      case 2: return { text: 'Fair', color: 'bg-yellow-500' };
      case 3: return { text: 'Good', color: 'bg-yellow-400' };
      case 4: return { text: 'Strong', color: 'bg-green-400' };
      case 5: return { text: 'Very Strong', color: 'bg-green-500' };
      default: return { text: 'Very Weak', color: 'bg-red-500' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setStatus({
        type: 'error',
        message: 'Passwords do not match'
      });
      return;
    }
    
    // Validate password strength
    if (passwordStrength < 3) {
      setStatus({
        type: 'error',
        message: 'Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers and symbols.'
      });
      return;
    }
    
    setLoading(true);
    setStatus(null);
    
    try {
      const { error } = await changePassword(password);
      
      if (error) throw error;
      
      setStatus({
        type: 'success',
        message: 'Password updated successfully'
      });
      
      // Clear form after successful update
      setPassword('');
      setConfirmPassword('');
      setPasswordStrength(0);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.message || 'Failed to update password'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const strengthInfo = getStrengthLabel(passwordStrength);
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <AdminSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
          
          <div className="bg-white rounded-lg shadow p-6 max-w-md">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            
            {status && (
              <div 
                className={`mb-4 p-4 rounded ${
                  status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {status.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${strengthInfo.color}`} 
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{strengthInfo.text}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;