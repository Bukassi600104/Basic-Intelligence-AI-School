import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import LockedOverlay from '../../components/ui/LockedOverlay';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { contentService } from '../../services/contentService';
import { logger } from '../../utils/logger';

const StudentVideos = () => {
  const { user, userProfile, isMember } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const contentRef = useRef(null);
  
  // Get deep linking parameters
  const contentId = searchParams.get('contentId');
  const isFeatured = searchParams.get('featured') === 'true';

  // Check authentication - redirect to signin if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    // Allow all logged-in users to access this page
    // Content will be filtered based on membership status
  }, [user, navigate]);

  // Load Videos
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        // Get video content from Supabase
        const { data, error } = await contentService.getAccessibleContent('video');
        
        if (error) {
          logger.error('Failed to load videos:', error);
          return;
        }

        // Transform the data to match the expected format
        const transformedVideos = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || 'No description available',
          category: item.category || 'General',
          duration: 'Unknown', // This would need to be calculated from actual video content
          uploadedAt: item.created_at,
          thumbnail: item.google_drive_embed_url ? `${item.google_drive_embed_url.replace('/preview', '')}/thumbnail` : '/assets/images/no_image.png',
          videoUrl: item.google_drive_embed_url || '#',
          isFeatured: item.is_featured || false,
        }));
        
        setVideos(transformedVideos);
      } catch (error) {
        logger.error('Failed to load videos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.membership_status === 'active') {
      loadVideos();
    }

    // Listen for content upload events to auto-refresh
    const handleContentUploaded = (event) => {
      const uploadedContent = event.detail?.content;
      // Only refresh if it's a video type content
      if (!uploadedContent || uploadedContent.content_type === 'video') {
        loadVideos();
      }
    };

    window.addEventListener('content-uploaded', handleContentUploaded);
    
    return () => {
      window.removeEventListener('content-uploaded', handleContentUploaded);
    };
  }, [userProfile]);
  
  // Scroll to specific content when deep linked
  useEffect(() => {
    if (contentId && videos.length > 0 && contentRef.current) {
      const targetElement = document.getElementById(`video-${contentId}`);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight the targeted content
          targetElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          setTimeout(() => {
            targetElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
          }, 3000);
        }, 500);
      }
    }
  }, [contentId, videos]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Prompts': 'bg-green-100 text-green-800',
      'Business': 'bg-blue-100 text-blue-800',
      'Content': 'bg-purple-100 text-purple-800',
      'Analytics': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(videos.map(video => video.category))];

  const handlePlayVideo = (video) => {
    if (video.videoUrl && video.videoUrl !== '#') {
      // Open video in new tab for Google Drive videos
      window.open(video.videoUrl, '_blank');
    } else {
      // Show message for videos without URLs
      alert(`Video "${video.title}" is not available for playback at the moment. Please contact support if this issue persists.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <StudentDashboardNav />
        <div className="flex-1 transition-all duration-300 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
            <LoadingSpinner size="lg" message="Please wait while we fetch your video resources..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <StudentDashboardNav />
      <div className="flex-1 transition-all duration-300 lg:ml-64">
        <div className="p-3 sm:p-4 lg:p-5 pt-16 sm:pt-20 lg:pt-8">
          {/* Enhanced Gradient Header */}
          <div className="relative mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-orange-500/10 to-fuchsia-500/10 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-violet-400/20 to-indigo-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between p-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-1">
                  Video Library
                </h1>
                <p className="text-gray-600 text-sm">
                  Watch instructional videos and tutorials to enhance your AI learning experience
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-3 lg:mt-0">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/student-dashboard')}
                  className="border hover:bg-white/80"
                >
                  <Icon name="ArrowLeft" size={14} className="mr-1.5" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200 rounded-xl p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-600" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Icon name="Filter" size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none" />
                <select
                  id="category-filter-videos"
                  name="categoryFilter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80 appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Icon name="ChevronDown" size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" ref={contentRef}>
            {filteredVideos.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Icon name="Video" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Videos Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No videos available at the moment. Check back later for new content.'
                  }
                </p>
                {(searchTerm || selectedCategory !== 'all') && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredVideos.map((video) => (
                <div 
                  key={video.id} 
                  id={`video-${video.id}`}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <button 
                        onClick={() => handlePlayVideo(video)}
                        className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Icon name="Play" size={24} className="text-primary ml-1" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                      {video.duration}
                    </div>
                    {/* Featured Badge */}
                    {video.isFeatured && isFeatured && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                        <Icon name="Star" size={12} className="fill-current" />
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(video.category)}`}>
                        {video.category}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(video.uploadedAt)}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {video.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePlayVideo(video)}
                      >
                        <Icon name="Play" size={16} className="mr-2" />
                        Play Video
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-blue-50 border border-orange-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <Icon name="HelpCircle" size={24} className="text-orange-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Need Help with Videos?</h3>
                <p className="text-blue-700">
                  If you're having trouble playing any videos or need assistance, contact our support team.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
                >
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentVideos;

