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

const StudentPDFs = () => {
  const { user, userProfile, isMember } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pdfs, setPdfs] = useState([]);
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
          downloadUrl: item.file_path || '#',
          isFeatured: item.is_featured || false,
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
  
  // Scroll to specific content when deep linked
  useEffect(() => {
    if (contentId && pdfs.length > 0 && contentRef.current) {
      const targetElement = document.getElementById(`pdf-${contentId}`);
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
  }, [contentId, pdfs]);

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
        <StudentDashboardNav />
      <div className="flex-1 transition-all duration-300 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8 max-w-7xl mx-auto w-full">
            <LoadingSpinner size="lg" message="Please wait while we fetch your resources..." />
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
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-rose-500/10 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-400/20 to-orange-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between p-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-1">
                  PDF Library
                </h1>
                <p className="text-gray-600 text-sm">
                  Access comprehensive guides, tutorials, and resources for your AI learning journey
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-indigo-600" />
                <input
                  type="text"
                  placeholder="Search PDFs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/80"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Icon name="Filter" size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none" />
                <select
                  id="category-filter-pdfs"
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
                <Icon name="ChevronDown" size={14} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* PDF Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" ref={contentRef}>
            {filteredPDFs.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Icon name="FileText" size={40} className="text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-medium text-foreground mb-1.5">No PDFs Found</h3>
                <p className="text-sm text-muted-foreground mb-3">
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
                <div 
                  key={pdf.id}
                  id={`pdf-${pdf.id}`}
                  className="group bg-white border border-red-200 rounded-xl p-4 hover:shadow-lg hover:border-red-300 transition-all duration-300 transform hover:scale-105"
                >
                  {/* PDF Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                      <Icon name="FileText" size={22} className="text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {/* Featured Badge */}
                      {pdf.isFeatured && isFeatured && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Icon name="Star" size={10} className="fill-current" />
                          Featured
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                        pdf.category === 'Prompts' ? 'bg-green-100 text-green-800 border-green-300' :
                        pdf.category === 'Business' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                        pdf.category === 'Content' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        pdf.category === 'Analytics' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                        {pdf.category}
                      </span>
                    </div>
                  </div>

                  {/* PDF Info */}
                  <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {pdf.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                    {pdf.description}
                  </p>

                  {/* PDF Metadata */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="flex items-center space-x-1 bg-gray-100 px-1.5 py-0.5 rounded">
                        <Icon name="File" size={12} className="text-gray-700" />
                        <span className="font-medium">{pdf.fileSize}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-gray-100 px-1.5 py-0.5 rounded">
                        <Icon name="FileText" size={12} className="text-gray-700" />
                        <span className="font-medium">{pdf.pages} pages</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <Icon name="Clock" size={11} />
                    <span>{formatDate(pdf.uploadedAt)}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-md hover:shadow-lg"
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
          <div className="mt-8 bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                <Icon name="HelpCircle" size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-900 to-blue-900 bg-clip-text text-transparent mb-1">Need Help Accessing PDFs?</h3>
                <p className="text-cyan-800">
                  If you're having trouble viewing any PDFs or need assistance, contact our support team.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-2 border-cyan-200 hover:border-cyan-300 hover:bg-white/80"
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

