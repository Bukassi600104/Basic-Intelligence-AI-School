import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import EnhancedDashboard from './components/EnhancedDashboard';

const EnhancedAdminDashboard = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <EnhancedDashboard />
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
