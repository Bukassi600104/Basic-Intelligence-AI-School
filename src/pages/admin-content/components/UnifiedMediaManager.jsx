import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { contentService } from '../../../services/contentService';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const UnifiedMediaManager = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadMediaItems();
  }, [selectedTab, filterType]);

  const loadMediaItems = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterType !== 'all') {
        filters.content_type = filterType;
      }
      if (selectedTab === 'pending') {
        filters.status = 'active';
      }

      const result = await contentService.getContentLibrary(filters);
      setMediaItems(result.data || []);
    } catch (error) {
      console.error('Failed to load media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('content_type', getFileType(file.type));
      formData.append('access_level', 'starter');

      const result = await contentService.uploadContent(formData);
      if (result.data) {
        setShowUploadModal(false);
        loadMediaItems(); // Refresh the list
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  };

  const getFileIcon = (contentType) => {
    switch (contentType) {
      case 'video': return 'Video';
      case 'pdf': return 'FileText';
      case 'image': return 'Image';
      default: return 'File';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'archived': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAccessLevelColor = (level) => {
    switch (level) {
      case 'starter': return 'text-blue-600 bg-blue-100';
      case 'pro': return 'text-purple-600 bg-purple-100';
      case 'elite': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'pending' && item.status === 'active') ||
                      (selectedTab === 'videos' && item.content_type === 'video') ||
                      (selectedTab === 'pdfs' && item.content_type === 'pdf') ||
                      (selectedTab === 'images' && item.content_type === 'image');
    
    return matchesSearch && matchesTab;
  });

  const tabs = [
    { id: 'all', label: 'All Media', count: mediaItems.length },
    { id: 'videos', label: 'Videos', count: mediaItems.filter(item => item.content_type === 'video').length },
    { id: 'pdfs', label: 'PDFs', count: mediaItems.filter(item => item.content_type === 'pdf').length },
    { id: 'images', label: 'Images', count: mediaItems.filter(item => item.content_type === 'image').length },
    { id: 'pending', label: 'Pending', count: mediaItems.filter(item => item.status === 'active').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Icon name="Loader" size={24} className="animate-spin text-white" />
              </div>
              <div className="text-lg font-medium text-foreground mb-2">Loading Media Library</div>
              <div className="text-sm text-muted-foreground">Please wait while we load your content...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Content Library
              </h1>
              <p className="text-muted-foreground">
                Manage all your videos, PDFs, images, and other media assets
              </p>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              iconName="Upload"
              iconPosition="left"
            >
              Upload Media
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search media by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              iconName="Search"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'video', label: 'Videos' },
                { value: 'pdf', label: 'PDFs' },
                { value: 'image', label: 'Images' },
                { value: 'document', label: 'Documents' }
              ]}
            />
          </div>
        </div>

        {/* Media Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
            <Icon name="FolderOpen" size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-foreground mb-2">No Media Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Upload your first media file to get started'}
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Icon name="Upload" size={16} className="mr-2" />
              Upload Media
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                {/* Thumbnail/Icon */}
                <div className="relative mb-4">
                  <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center">
                    {item.content_type === 'video' ? (
                      <Icon name="Video" size={32} className="text-muted-foreground" />
                    ) : item.content_type === 'pdf' ? (
                      <Icon name="FileText" size={32} className="text-muted-foreground" />
                    ) : item.content_type === 'image' ? (
                      <div className="w-full h-full bg-cover bg-center rounded-xl" 
                           style={{ backgroundImage: `url(${item.file_path || '/assets/images/no_image.png'})` }} />
                    ) : (
                      <Icon name="File" size={32} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(item.access_level)}`}>
                      {item.access_level}
                    </span>
                  </div>
                </div>

                {/* Content Info */}
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name={getFileIcon(item.content_type)} size={12} />
                      <span>{item.content_type}</span>
                    </div>
                    {item.file_size_bytes && (
                      <span>{(item.file_size_bytes / 1024 / 1024).toFixed(1)} MB</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Preview functionality would go here
                        if (item.content_type === 'video' && item.google_drive_embed_url) {
                          window.open(item.google_drive_embed_url, '_blank');
                        } else if (item.file_path) {
                          // Handle file preview/download
                          console.log('Preview file:', item.file_path);
                        }
                      }}
                    >
                      <Icon name="Eye" size={14} className="mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Edit functionality
                        console.log('Edit item:', item.id);
                      }}
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Upload Media</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Icon name="Upload" size={32} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your files here, or click to browse
                  </p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept="video/*,application/pdf,image/*"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    {uploading ? 'Uploading...' : 'Select Files'}
                  </label>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Supported formats: MP4, WebM, PDF, JPG, PNG</p>
                  <p>Maximum file size: 100MB</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedMediaManager;
