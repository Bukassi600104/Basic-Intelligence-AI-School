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

const StudentPrompts = () => {
  const { user, userProfile, isMember } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  // Check authentication - redirect to signin if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    // Allow all logged-in users to access this page
    // Content will be filtered based on membership status
  }, [user, navigate]);

  // Load Prompts
  useEffect(() => {
    const loadPrompts = async () => {
      setLoading(true);
      try {
        // Get prompt content from Supabase (PDFs with category 'Prompts')
        const { data, error } = await contentService.getAccessibleContent('pdf', 'Prompts');
        
        if (error) {
          console.error('Failed to load prompts:', error);
          return;
        }

        // Transform the data to match the expected format
        const transformedPrompts = (data || []).map(item => ({
          id: item.id,
          title: item.title,
          description: item.description || 'No description available',
          category: item.category || 'General',
          prompt: 'Prompt content will be available once the PDF is processed. Please check back later or contact support if this message persists.',
          useCase: item.tags?.[0] || 'General',
          difficulty: 'Intermediate', // This would be determined from content analysis
          uploadedAt: item.created_at,
        }));
        
        setPrompts(transformedPrompts);
      } catch (error) {
        console.error('Failed to load prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.membership_status === 'active') {
      loadPrompts();
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
      'Content': 'bg-green-100 text-green-800',
      'Business': 'bg-blue-100 text-blue-800',
      'SEO': 'bg-purple-100 text-purple-800',
      'Customer Service': 'bg-orange-100 text-orange-800',
      'Analytics': 'bg-red-100 text-red-800',
      'E-commerce': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.useCase.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(prompts.map(prompt => prompt.category))];

  const copyToClipboard = async (text, promptId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPromptId(promptId);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
            <LoadingSpinner size="lg" message="Please wait while we fetch your AI prompts..." />
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
        <div className="p-3 sm:p-4 lg:p-5 pt-16 sm:pt-20 lg:pt-8">
          {/* Enhanced Gradient Header */}
          <div className="relative mb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between p-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  Prompt Library
                </h1>
                <p className="text-gray-600 text-sm">
                  Access and use pre-built AI prompts for various business and creative use cases
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/student-dashboard')}
                  className="border hover:bg-white/80"
                >
                  <Icon name="ArrowLeft" size={14} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-200 rounded-xl p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Icon name="Filter" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-600 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Icon name="ChevronDown" size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-600 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Prompt Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPrompts.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Icon name="MessageSquare" size={40} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-base font-medium text-foreground mb-2">No Prompts Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No prompts available at the moment. Check back later for new prompts.'
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
              filteredPrompts.map((prompt) => (
                <div key={prompt.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-300">
                  {/* Prompt Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="MessageSquare" size={20} className="text-green-600" />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(prompt.category)}`}>
                        {prompt.category}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(prompt.difficulty)}`}>
                        {prompt.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Prompt Info */}
                  <h3 className="text-base font-semibold text-foreground mb-1.5">
                    {prompt.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2.5">
                    {prompt.description}
              </p>

                  {/* Use Case */}
                  <div className="mb-3">
                    <span className="text-xs font-medium text-muted-foreground">Use Case:</span>
                    <span className="text-xs text-foreground ml-2">{prompt.useCase}</span>
                  </div>

                  {/* Prompt Preview */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Prompt:</span>
                      <button
                        onClick={() => copyToClipboard(prompt.prompt, prompt.id)}
                        className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80"
                      >
                        <Icon name={copiedPromptId === prompt.id ? "Check" : "Copy"} size={12} />
                        <span>{copiedPromptId === prompt.id ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <p className="text-xs text-foreground font-mono line-clamp-4">
                        {prompt.prompt}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      {formatDate(prompt.uploadedAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Support Section */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Icon name="HelpCircle" size={20} className="text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-blue-900 mb-0.5">Need Help with Prompts?</h3>
                <p className="text-sm text-blue-700">
                  If you need assistance using these prompts or want to request specific prompt types, contact our support team.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://wa.me/2349062284074', '_blank')}
                >
                  <Icon name="MessageCircle" size={14} className="mr-2" />
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

export default StudentPrompts;
