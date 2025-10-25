import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { contentService } from '../../services/contentService';
import { processGoogleDriveUrl, isValidGoogleDriveUrl } from '../../utils/googleDriveUtils';
import ContentUploadWizard from './components/ContentUploadWizard';

const AdminContentPage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  
  // Form states (legacy - can be removed later)
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState('pdf');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    access_level: 'pro',
    category: '',
    tags: []
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [driveUrlValid, setDriveUrlValid] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    access_level: 'all',
    category: 'all',
    featured: 'all'
  });

  // Check admin access
  useEffect(() => {
    if (userProfile && userProfile?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [userProfile, navigate]);

  // Load content
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: contentError } = await contentService?.getAllContent();
      
      if (contentError) {
        setError(contentError);
      } else {
        setContent(data || []);
      }
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e?.preventDefault();
    
    if (!formData?.title?.trim()) {
      setError('Title is required');
      return;
    }

    if (uploadType === 'pdf' && !selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    if (uploadType === 'video' && !googleDriveUrl?.trim()) {
      setError('Google Drive URL is required for videos');
      return;
    }

    setUploadLoading(true);
    setError('');

    try {
      let contentData = {
        title: formData?.title,
        description: formData?.description,
        content_type: uploadType,
        access_level: formData?.access_level,
        category: formData?.category,
        tags: formData?.tags
      };

      if (uploadType === 'pdf' && selectedFile) {
        // Upload PDF to Supabase storage
        const filePath = `${formData?.category}/${formData?.access_level}/${Date.now()}_${selectedFile?.name}`;
        const { data: uploadData, error: uploadError } = await contentService?.uploadFile(
          'prompt-library',
          filePath,
          selectedFile
        );

        if (uploadError) {
          setError(uploadError);
          return;
        }

        contentData.file_path = filePath;
        contentData.mime_type = selectedFile?.type;
        contentData.file_size_bytes = selectedFile?.size;
      } else if (uploadType === 'video' && googleDriveUrl) {
        // Use the Google Drive URL processing utility
        // The contentService will handle URL processing automatically
        contentData.google_drive_embed_url = googleDriveUrl;
      }

      // Create content record (contentService will process Drive URLs automatically)
      const { data, error: createError } = await contentService?.createContent(contentData);

      if (createError) {
        setError(createError);
      } else {
        await loadContent();
        resetForm();
        setShowUploadForm(false);
      }
    } catch (err) {
      setError('Upload failed: ' + err?.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle Google Drive URL input with validation and preview
  const handleGoogleDriveUrlChange = (url) => {
    setGoogleDriveUrl(url);
    
    if (!url.trim()) {
      setThumbnailPreview(null);
      setDriveUrlValid(null);
      return;
    }

    if (!isValidGoogleDriveUrl(url)) {
      setDriveUrlValid(false);
      setThumbnailPreview(null);
      return;
    }

    const result = processGoogleDriveUrl(url);
    if (result.valid) {
      setDriveUrlValid(true);
      setThumbnailPreview(result.thumbnailUrl);
    } else {
      setDriveUrlValid(false);
      setThumbnailPreview(null);
      setError(result.error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      access_level: 'pro',
      category: '',
      tags: []
    });
    setSelectedFile(null);
    setGoogleDriveUrl('');
    setThumbnailPreview(null);
    setDriveUrlValid(null);
  };

  const handleWizardSuccess = async () => {
    setShowWizard(false);
    await loadContent();
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  const handleDelete = async (contentId) => {
    if (!window?.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const { error } = await contentService?.deleteContent(contentId);
      if (error) {
        setError(error);
      } else {
        await loadContent();
      }
    } catch (err) {
      setError('Failed to delete content');
    }
  };

  const handleToggleFeatured = async (contentId, currentStatus) => {
    try {
      const { error } = await contentService.updateFeaturedStatus(contentId, {
        is_featured: !currentStatus
      });
      
      if (error) {
        setError(error);
      } else {
        await loadContent();
      }
    } catch (err) {
      setError('Failed to update featured status');
    }
  };

  const filteredContent = content?.filter(item => {
    const matchesType = filters?.type === 'all' || item?.content_type === filters?.type;
    const matchesAccess = filters?.access_level === 'all' || item?.access_level === filters?.access_level;
    const matchesCategory = filters?.category === 'all' || item?.category === filters?.category;
    const matchesFeatured = filters?.featured === 'all' || 
      (filters?.featured === 'featured' && item?.is_featured) ||
      (filters?.featured === 'not_featured' && !item?.is_featured);
    return matchesType && matchesAccess && matchesCategory && matchesFeatured;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 transition-all duration-300 lg:ml-60">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Loading content...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-cyan-50 flex">
      <AdminSidebar />
      <div className="flex-1 transition-all duration-300 lg:ml-60">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {/* Page Header - Enhanced */}
          <div className="relative overflow-hidden rounded-3xl mb-8 animate-fadeIn">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-green-600 to-orange-600"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <Icon name="FolderOpen" size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Content Library</h1>
                  </div>
                  <p className="text-white/90 ml-15">
                    Manage videos, PDF prompts, and educational materials
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={loadContent}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={() => setShowWizard(true)}
                    className="bg-white text-orange-600 hover:bg-white/90 font-bold shadow-lg"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Upload Content
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 animate-slideDown">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Content Upload Wizard Modal */}
          {showWizard && (
            <ContentUploadWizard
              onSuccess={handleWizardSuccess}
              onCancel={handleWizardCancel}
            />
          )}

          {/* Stats Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Content</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">{content?.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="FolderOpen" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Videos</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-600 bg-clip-text text-transparent">
                    {content?.filter(c => c?.content_type === 'video')?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="Play" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-amber-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">PDF Prompts</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {content?.filter(c => c?.content_type === 'pdf')?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="FileText" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Featured</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                    {content?.filter(c => c?.is_featured)?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="Star" size={28} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Icon name="Filter" size={20} className="text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Content Type"
                value={filters?.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e?.target?.value }))}
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="pdf">PDF Documents</option>
                <option value="prompt">Prompts</option>
              </Select>

              <Select
                label="Access Level"
                value={filters?.access_level}
                onChange={(e) => setFilters(prev => ({ ...prev, access_level: e?.target?.value }))}
              >
                <option value="all">All Levels</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </Select>

              <Select
                label="Featured Status"
                value={filters?.featured}
                onChange={(e) => setFilters(prev => ({ ...prev, featured: e?.target?.value }))}
              >
                <option value="all">All Content</option>
                <option value="featured">Featured Only</option>
                <option value="not_featured">Not Featured</option>
              </Select>

              <Input
                label="Category"
                placeholder="Filter by category"
                value={filters?.category === 'all' ? '' : filters?.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e?.target?.value || 'all' }))}
              />
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Access Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContent?.map((item) => (
                    <tr key={item?.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                            item?.content_type === 'video' ? 'bg-green-100' :
                            item?.content_type === 'prompt' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            <Icon 
                              name={
                                item?.content_type === 'video' ? 'Play' :
                                item?.content_type === 'prompt' ? 'MessageSquare' : 'FileText'
                              } 
                              size={18} 
                              className={
                                item?.content_type === 'video' ? 'text-green-600' :
                                item?.content_type === 'prompt' ? 'text-purple-600' : 'text-blue-600'
                              } 
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item?.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{item?.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item?.content_type === 'video' ? 'bg-green-100 text-green-800' :
                          item?.content_type === 'prompt' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item?.content_type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item?.access_level === 'starter' ? 'bg-blue-100 text-blue-800' :
                          item?.access_level === 'pro' ? 'bg-orange-100 text-orange-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}>
                          <Icon 
                            name={
                              item?.access_level === 'starter' ? 'Shield' :
                              item?.access_level === 'pro' ? 'Star' : 'Crown'
                            } 
                            size={10} 
                            className="mr-1" 
                          />
                          {item?.access_level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleFeatured(item?.id, item?.is_featured)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                            item?.is_featured 
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Icon 
                            name="Star" 
                            size={10} 
                            className={`mr-1 ${item?.is_featured ? 'fill-current' : ''}`} 
                          />
                          {item?.is_featured ? 'Featured' : 'Not Featured'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item?.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(item.created_at)?.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {item?.google_drive_embed_url && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => window.open(item?.google_drive_embed_url, '_blank')}
                              title="Preview content"
                            >
                              <Icon name="ExternalLink" size={12} className="mr-1" />
                              View
                            </Button>
                          )}
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => handleDelete(item?.id)}
                            title="Delete content"
                          >
                            <Icon name="Trash2" size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredContent?.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <Icon name="Inbox" size={48} className="text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium mb-2">No content found</p>
                        <p className="text-gray-500 text-sm mb-4">
                          {filters.type !== 'all' || filters.access_level !== 'all' || filters.featured !== 'all' || filters.category !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Start by uploading your first content'}
                        </p>
                        {(filters.type !== 'all' || filters.access_level !== 'all' || filters.featured !== 'all' || filters.category !== 'all') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setFilters({ type: 'all', access_level: 'all', category: 'all', featured: 'all' })}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowUploadForm(false)} />
            
            <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl border-2 border-gray-200 animate-slideUp overflow-hidden">
              {/* Gradient Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-green-600 to-orange-600 p-8">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-float">
                      <Icon name="Upload" size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-white">Upload Content</h2>
                      <p className="text-white/90">Add new resources to the library</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <Icon name="X" size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-emerald-50">
                <Select
                  label="Content Type"
                  value={uploadType}
                  onChange={(e) => setUploadType(e?.target?.value)}
                >
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video (Google Drive)</option>
                </Select>

                <Input
                  label="Title"
                  value={formData?.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e?.target?.value }))}
                  placeholder="Enter content title"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData?.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e?.target?.value }))}
                    placeholder="Enter content description"
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Access Level"
                    value={formData?.access_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, access_level: e?.target?.value }))}
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </Select>

                  <Input
                    label="Category"
                    value={formData?.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e?.target?.value }))}
                    placeholder="e.g., Prompts, Introduction"
                  />
                </div>

                {uploadType === 'pdf' ? (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select PDF File
                    </label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setSelectedFile(e?.target?.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      label="Google Drive Thumbnail Link"
                      value={googleDriveUrl}
                      onChange={(e) => handleGoogleDriveUrlChange(e?.target?.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      required
                    />
                    <div className="text-sm space-y-2">
                      <p className="text-muted-foreground">
                        <strong>Recommended aspect ratios:</strong> 16:9 (standard), 4:3 (classic), or 1:1 (square)
                      </p>
                      <p className="text-muted-foreground">
                        <strong>How to get the link:</strong> Right-click your image in Google Drive → Get link → Copy link
                      </p>
                      {driveUrlValid === true && (
                        <div className="flex items-center text-green-600">
                          <Icon name="CheckCircle" size={16} className="mr-2" />
                          <span>Valid Google Drive link detected</span>
                        </div>
                      )}
                      {driveUrlValid === false && googleDriveUrl.trim() && (
                        <div className="flex items-center text-red-600">
                          <Icon name="AlertCircle" size={16} className="mr-2" />
                          <span>Invalid Google Drive URL format</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Thumbnail Preview */}
                    {thumbnailPreview && (
                      <div className="mt-4 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thumbnail Preview:
                        </label>
                        <div className="relative">
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="w-full max-w-md rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.src = '/assets/images/no_image.png';
                              e.target.alt = 'Preview failed to load';
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            This is how the thumbnail will appear to students
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    disabled={uploadLoading}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:from-emerald-700 hover:to-green-700 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {uploadLoading ? (
                      <>
                        <Icon name="Loader" size={20} className="animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="Upload" size={20} />
                        <span>Upload Content</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentPage;
