import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { contentService } from '../../services/contentService';

const AdminContentPage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Form states
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
  
  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    access_level: 'all',
    category: 'all'
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
        // Extract Google Drive ID from URL
        const driveId = extractGoogleDriveId(googleDriveUrl);
        if (driveId) {
          contentData.google_drive_id = driveId;
          contentData.google_drive_embed_url = `https://drive.google.com/file/d/${driveId}/preview`;
        } else {
          setError('Invalid Google Drive URL format');
          return;
        }
      }

      // Create content record
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

  const extractGoogleDriveId = (url) => {
    const patterns = [
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
      /\/file\/d\/([a-zA-Z0-9-_]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url?.match(pattern);
      if (match && match?.[1]) {
        return match?.[1];
      }
    }
    return null;
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

  const filteredContent = content?.filter(item => {
    const matchesType = filters?.type === 'all' || item?.content_type === filters?.type;
    const matchesAccess = filters?.access_level === 'all' || item?.access_level === filters?.access_level;
    const matchesCategory = filters?.category === 'all' || item?.category === filters?.category;
    return matchesType && matchesAccess && matchesCategory;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
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
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {/* Page Header - Enhanced */}
          <div className="relative overflow-hidden rounded-3xl mb-8 animate-fadeIn">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-cyan-600"></div>
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
                    onClick={() => setShowUploadForm(true)}
                    className="bg-white text-emerald-600 hover:bg-white/90 font-bold shadow-lg"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Add Content
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Stats Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Content</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{content?.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="FolderOpen" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Videos</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {content?.filter(c => c?.content_type === 'video')?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Elite Content</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {content?.filter(c => c?.access_level === 'elite')?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="Crown" size={28} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Content Type"
                value={filters?.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e?.target?.value }))}
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="pdf">PDF Documents</option>
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

              <Input
                label="Category"
                placeholder="Filter by category"
                value={filters?.category === 'all' ? '' : filters?.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e?.target?.value || 'all' }))}
              />
            </div>
          </div>

          {/* Content Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Access Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredContent?.map((item) => (
                    <tr key={item?.id} className="hover:bg-muted/25">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Icon 
                            name={item?.content_type === 'video' ? 'Play' : 'FileText'} 
                            size={16} 
                            className="text-primary mr-3" 
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{item?.title}</p>
                            <p className="text-xs text-muted-foreground">{item?.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item?.content_type === 'video' ?'bg-green-100 text-green-800' :'bg-blue-100 text-blue-800'
                        }`}>
                          {item?.content_type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item?.access_level === 'starter' ? 'bg-gray-100 text-gray-800' :
                          item?.access_level === 'pro'? 'bg-yellow-100 text-yellow-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item?.access_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item?.category || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(item.created_at)?.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {item?.content_type === 'video' && item?.google_drive_embed_url && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => window.open(item?.google_drive_embed_url, '_blank')}
                            >
                              <Icon name="ExternalLink" size={12} className="mr-1" />
                              Preview
                            </Button>
                          )}
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => handleDelete(item?.id)}
                          >
                            <Icon name="Trash2" size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredContent?.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                        No content found. Start by uploading your first video or PDF.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Upload Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setShowUploadForm(false)} />
            
            <div className="relative bg-card border border-border rounded-xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Upload Content</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} className="text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
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
                  <Input
                    label="Google Drive URL"
                    value={googleDriveUrl}
                    onChange={(e) => setGoogleDriveUrl(e?.target?.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    required
                  />
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                    disabled={uploadLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={uploadLoading}
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload Content'}
                  </Button>
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