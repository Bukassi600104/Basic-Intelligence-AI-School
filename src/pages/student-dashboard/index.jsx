import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { contentService } from '../../services/contentService';

const StudentDashboard = () => {
  const { user, userProfile, isMember } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is a paid student
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!isMember) {
      navigate('/join-membership-page');
      return;
    }
  }, [user, isMember, navigate]);

  // Load recent content
  useEffect(() => {
    const loadRecentContent = async () => {
      setLoading(true);
      try {
        // Get accessible content from Supabase
        const { data, error } = await contentService.getAccessibleContent();
        
        if (error) {
          console.error('Failed to load recent content:', error);
          return;
        }

        // Transform the data to match the expected format
        const transformedContent = (data || []).slice(0, 6).map(item => ({
          id: item.id,
          title: item.title,
          type: item.content_type,
          category: item.category || 'General',
          uploadedAt: item.created_at,
          description: item.description || 'No description available'
        }));
        
        setRecentContent(transformedContent);
      } catch (error) {
        console.error('Failed to load recent content:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.membership_status === 'active') {
      loadRecentContent();
    }
  }, [userProfile]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getContentIcon = (type) => {
    switch (type) {
      case 'pdf':
        return 'FileText';
      case 'video':
        return 'Video';
      case 'prompt':
        return 'MessageSquare';
      default:
        return 'File';
    }
  };

  const getContentColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'text-red-600';
      case 'video':
        return 'text-blue-600';
      case 'prompt':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <StudentDashboardNav 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader" size={24} className="animate-spin text-white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Dashboard</div>
                <div className="text-sm text-muted-foreground">Please wait while we prepare your learning environment...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <StudentDashboardNav 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Welcome back, {userProfile?.full_name || 'Student'}!
                </h1>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                  Continue your AI learning journey. Access your resources, track your progress, and explore new content.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 bg-white/50 rounded-lg px-4 py-2">
                    <Icon name="User" size={20} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Member ID: {userProfile?.member_id || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/50 rounded-lg px-4 py-2">
                    <Icon name="CheckCircle" size={20} className="text-success" />
                    <span className="text-sm font-medium text-foreground">
                      Active Membership
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:mt-0">
                <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Icon name="BookOpen" size={48} className="text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/student-dashboard/pdfs')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Icon name="FileText" size={24} className="text-red-600" />
                </div>
                <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">PDF Library</h3>
              <p className="text-sm text-muted-foreground">
                Access comprehensive guides, tutorials, and resources
              </p>
            </div>

            <div 
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/student-dashboard/videos')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon name="Video" size={24} className="text-blue-600" />
                </div>
                <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Video Library</h3>
              <p className="text-sm text-muted-foreground">
                Watch instructional videos and tutorials
              </p>
            </div>

            <div 
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/student-dashboard/prompts')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Icon name="MessageSquare" size={24} className="text-green-600" />
                </div>
                <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Prompt Library</h3>
              <p className="text-sm text-muted-foreground">
                Explore and use AI prompts for various use cases
              </p>
            </div>

            <div 
              className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/student-dashboard/subscription')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Icon name="CreditCard" size={24} className="text-purple-600" />
                </div>
                <Icon name="ArrowRight" size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Subscription</h3>
              <p className="text-sm text-muted-foreground">
                Manage your membership and billing details
              </p>
            </div>
          </div>

          {/* Recent Content Section */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recently Added Content</h2>
              <Button variant="outline" onClick={() => navigate('/student-dashboard/content')}>
                View All Content
              </Button>
            </div>

            {recentContent.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Recent Content</h3>
                <p className="text-muted-foreground">
                  New content will appear here once it's uploaded by the admin.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentContent.map((content) => (
                  <div 
                    key={content.id}
                    className="border border-border rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      if (content.type === 'pdf') {
                        navigate('/student-dashboard/pdfs');
                      } else if (content.type === 'video') {
                        navigate('/student-dashboard/videos');
                      } else {
                        navigate('/student-dashboard/prompts');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 bg-${getContentColor(content.type).split('-')[1]}-100 rounded-lg flex items-center justify-center`}>
                        <Icon name={getContentIcon(content.type)} size={20} className={getContentColor(content.type)} />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {content.category}
                        </span>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(content.uploadedAt)}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {content.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {content.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <Icon name="MessageCircle" size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Need Help?</h3>
                <p className="text-blue-700">
                  Contact our support team via WhatsApp for any questions or assistance.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  WhatsApp Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
