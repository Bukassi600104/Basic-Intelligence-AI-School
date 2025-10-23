import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8 max-w-7xl mx-auto w-full">
            <LoadingSpinner size="lg" message="Please wait while we fetch your resources..." />
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
          {/* Enhanced Gradient Header */}
          <div className="relative mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-rose-500/10 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-400/20 to-orange-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between p-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                  PDF Library
                </h1>
                <p className="text-gray-600 text-lg">
                  Access comprehensive guides, tutorials, and resources for your AI learning journey
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/student-dashboard')}
                  className="border-2 hover:bg-white/80"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-100 border-2 border-indigo-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-600" />
                <input
                  type="text"
                  placeholder="Search PDFs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Icon name="Filter" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 appearance-none"
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
                <div key={pdf.id} className="group bg-white border-2 border-red-200 rounded-2xl p-6 hover:shadow-2xl hover:border-red-300 transition-all duration-300 transform hover:scale-105">
                  {/* PDF Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                      <Icon name="FileText" size={28} className="text-white" />
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 shadow-sm ${
                      pdf.category === 'Prompts' ? 'bg-green-100 text-green-800 border-green-300' :
                      pdf.category === 'Business' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      pdf.category === 'Content' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                      pdf.category === 'Analytics' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                      'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      {pdf.category}
                    </span>
                  </div>

                  {/* PDF Info */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {pdf.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {pdf.description}
                  </p>

                  {/* PDF Metadata */}
                  <div className="flex items-center justify-between text-xs mb-4">
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg">
                        <Icon name="File" size={14} className="text-gray-700" />
                        <span className="font-medium">{pdf.fileSize}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-lg">
                        <Icon name="FileText" size={14} className="text-gray-700" />
                        <span className="font-medium">{pdf.pages} pages</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                    <Icon name="Clock" size={12} />
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
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
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
