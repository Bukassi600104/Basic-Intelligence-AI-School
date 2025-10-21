import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StudentDashboardNav from '../../components/ui/StudentDashboardNav';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { contentService } from '../../services/contentService';

const StudentPDFs = () => {
  const { user, userProfile, isMember } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Check if user is a paid student - only redirect when profile is loaded and user is not a member
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Only redirect if user profile is loaded and user is not a member
    if (userProfile && !isMember) {
      navigate('/join-membership-page');
      return;
    }
  }, [user, userProfile, isMember, navigate]);

  // Load PDFs
  useEffect(() => {
    const loadPDFs = async () => {
      setLoading(true);
      try {
        // Get PDF content from Supabase
        const { data, error } = await contentService.getAccessibleContent('pdf');
        
        if (error) {
          console.error('Failed to load PDFs:', error);
          return;
        }

        // Transform the data to match the expected format
        const transformedPDFs = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || 'No description available',
          category: item.category || 'General',
          fileSize: item.file_size_bytes ? `${(item.file_size_bytes / (1024 * 1024)).toFixed(1)} MB` : 'Unknown',
          uploadedAt: item.created_at,
          pages: 0, // This would need to be calculated from actual PDF content
          downloadUrl: item.file_path || '#'
        }));
        
        setPdfs(transformedPDFs);
      } catch (error) {
        console.error('Failed to load PDFs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.membership_status === 'active') {
      loadPDFs();
    }
  }, [userProfile]);

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

  const filteredPDFs = pdfs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pdf.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || pdf.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(pdfs.map(pdf => pdf.category))];

  const handleViewPDF = async (pdf) => {
    if (pdf.downloadUrl && pdf.downloadUrl !== '#') {
      try {
        // Get signed URL for the PDF file
        const { data: signedUrl, error } = await contentService.getSignedUrl('prompt-library', pdf.downloadUrl);
        
        if (error) {
          console.error('Failed to get PDF URL:', error);
          alert(`Unable to open PDF "${pdf.title}". Please try again later or contact support.`);
          return;
        }
        
        // Open PDF in new tab
        window.open(signedUrl?.signedUrl, '_blank');
      } catch (error) {
        console.error('Failed to open PDF:', error);
        alert(`Unable to open PDF "${pdf.title}". Please try again later or contact support.`);
      }
    } else {
      alert(`PDF "${pdf.title}" is not available for viewing at the moment. Please contact support if this issue persists.`);
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
                <div className="text-lg font-medium text-foreground mb-2">Loading PDF Library</div>
                <div className="text-sm text-muted-foreground">Please wait while we fetch your resources...</div>
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
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">PDF Library</h1>
              <p className="text-muted-foreground">
                Access comprehensive guides, tutorials, and resources for your AI learning journey
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button 
                variant="outline"
                onClick={() => navigate('/student-dashboard')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search PDFs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PDF Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPDFs.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No PDFs Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No PDFs available at the moment. Check back later for new resources.'
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
              filteredPDFs.map((pdf) => (
                <div key={pdf.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  {/* PDF Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name="FileText" size={24} className="text-red-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(pdf.category)}`}>
                      {pdf.category}
                    </span>
                  </div>

                  {/* PDF Info */}
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                    {pdf.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {pdf.description}
                  </p>

                  {/* PDF Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Icon name="File" size={14} />
                        <span>{pdf.fileSize}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="FileText" size={14} />
                        <span>{pdf.pages} pages</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {formatDate(pdf.uploadedAt)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleViewPDF(pdf)}
                    >
                      <Icon name="Eye" size={16} className="mr-2" />
                      View PDF
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-4">
              <Icon name="HelpCircle" size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">Need Help Accessing PDFs?</h3>
                <p className="text-blue-700">
                  If you're having trouble viewing any PDFs or need assistance, contact our support team.
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

export default StudentPDFs;
