import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { contentService } from '../../../services/contentService';

const RecentUploadsWidget = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecentUploads();

    // Listen for content upload events from wizard
    const handleContentUploaded = () => {
      loadRecentUploads();
    };

    window.addEventListener('content-uploaded', handleContentUploaded);
    
    return () => {
      window.removeEventListener('content-uploaded', handleContentUploaded);
    };
  }, []);

  const loadRecentUploads = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: contentError } = await contentService.getAllContent();
      
      if (contentError) {
        setError(contentError);
        return;
      }

      // Sort by created_at descending and take top 5
      const recentUploads = (data || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setUploads(recentUploads);
      
      // Notify parent dashboard to refresh stats
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      setError('Failed to load recent uploads');
      console.error('Load recent uploads error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'pdf':
        return 'FileText';
      case 'document':
        return 'File';
      case 'image':
        return 'Image';
      default:
        return 'File';
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'video':
        return 'from-red-500 to-pink-600';
      case 'pdf':
        return 'from-orange-500 to-amber-600';
      case 'document':
        return 'from-blue-500 to-cyan-600';
      case 'image':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getAccessLevelBadge = (levels) => {
    // Handle both old single level (string) and new multi-level (array)
    const levelArray = Array.isArray(levels) ? levels : [levels];
    
    const colors = {
      starter: 'bg-green-100 text-green-700',
      pro: 'bg-blue-100 text-blue-700',
      elite: 'bg-purple-100 text-purple-700'
    };

    return levelArray.map(level => (
      <span key={level} className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[level] || 'bg-gray-100 text-gray-700'}`}>
        {level}
      </span>
    ));
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && uploads.length === 0) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm animate-slideUp">
        <div className="flex items-center justify-center py-8">
          <Icon name="Loader2" size={24} className="animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow animate-slideUp">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
              <Icon name="Upload" size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Recent Uploads</h3>
          </div>
          <button
            onClick={loadRecentUploads}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh uploads"
          >
            <Icon 
              name="RefreshCw" 
              size={16} 
              className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <Icon name="AlertCircle" size={16} className="text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {uploads.length === 0 && !loading ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="FileX" size={28} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No content yet</p>
            <p className="text-xs text-gray-600 mb-4">Upload your first content to get started</p>
            <Button
              size="sm"
              onClick={() => navigate('/admin-content')}
              className="bg-gradient-to-r from-orange-500 to-amber-600"
            >
              <Icon name="Plus" size={14} className="mr-2" />
              Upload Content
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map((upload, index) => (
              <div
                key={upload.id}
                className="group flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                onClick={() => navigate('/admin-content')}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Icon */}
                <div className={`w-10 h-10 bg-gradient-to-br ${getContentTypeColor(upload.content_type)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon name={getContentTypeIcon(upload.content_type)} size={20} className="text-white" />
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                      {upload.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTimeAgo(upload.created_at)}
                    </span>
                  </div>
                  
                  {upload.description && (
                    <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                      {upload.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-2">
                    {/* Access Levels */}
                    <div className="flex items-center space-x-1">
                      {getAccessLevelBadge(upload.access_levels || upload.access_level)}
                    </div>

                    {/* Category */}
                    {upload.category && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {upload.category}
                      </span>
                    )}

                    {/* Featured Badge */}
                    {upload.is_featured && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center">
                        <Icon name="Star" size={10} className="mr-1" />
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="ChevronRight" size={16} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        {uploads.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin-content')}
              className="w-full justify-center"
            >
              View All Content
              <Icon name="ArrowRight" size={14} className="ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentUploadsWidget;
