import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAuthState = () => {
  const { 
    user, 
    userProfile, 
    loading, 
    profileLoading, 
    isAdmin, 
    isMember, 
    membershipTier,
    membershipStatus 
  } = useAuth();

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Auth State Test</h1>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <strong>Profile Loading:</strong> {profileLoading ? 'Yes' : 'No'}
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <strong>User Profile:</strong> {userProfile ? 'Loaded' : 'Not Loaded'}
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <strong>Is Member:</strong> {isMember ? 'Yes' : 'No'}
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <strong>Membership Tier:</strong> {membershipTier}
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <strong>Membership Status:</strong> {membershipStatus}
          </div>
        </div>

        {userProfile && (
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-2">User Profile Data:</h3>
            <pre className="text-sm">{JSON.stringify(userProfile, null, 2)}</pre>
          </div>
        )}

        {user && (
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-bold mb-2">User Data:</h3>
            <pre className="text-sm">{JSON.stringify({
              id: user.id,
              email: user.email,
              role: user.role
            }, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAuthState;
