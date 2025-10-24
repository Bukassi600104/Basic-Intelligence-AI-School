import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { contentService } from '../../../services/contentService';
import { googleDriveService } from '../../../services/googleDriveService';

/**
 * ContentUploadWizard - Multi-step wizard for uploading content
 * Steps: 1. Content Type → 2. Details → 3. Access Level → 4. Featured Settings → 5. Review
 */
const ContentUploadWizard = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedContent, setUploadedContent] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState('');

  // Initial form data for reset
  const initialFormData = {
    contentType: '',
    title: '',
    description: '',
    category: '',
    tags: [],
    googleDriveLink: '',
    googleDriveId: '',
    googleDriveEmbedUrl: '',
    promptType: '',
    useCaseTags: [],
    accessLevels: [], // Changed from accessLevel to accessLevels array
    isFeatured: false,
    featuredDescription: '',
    thumbnailUrl: '',
    featuredOrder: null
  };

  // Form data state
  const [formData, setFormData] = useState(initialFormData);

  const totalSteps = 5;

  // Categories by content type
  const categories = {
    video: ['Introduction', 'Fundamentals', 'Advanced', 'Tutorials', 'Workshops', 'Masterclass'],
    pdf: ['Guides', 'Templates', 'Worksheets', 'Cheat Sheets', 'Case Studies'],
    prompt: ['Business', 'Marketing', 'Technical', 'Creative', 'Education', 'Research']
  };

  const promptTypes = ['ChatGPT', 'Claude', 'Midjourney', 'Stable Diffusion', 'DALL-E', 'Other'];
  
  const accessLevelDetails = {
    starter: { name: 'Starter', price: '₦10,000/month', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    pro: { name: 'Pro', price: '₦15,000/month', color: 'text-orange-600 bg-orange-50 border-orange-200' },
    elite: { name: 'Elite', price: '₦25,000/month', color: 'text-purple-600 bg-purple-50 border-purple-200' }
  };

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [loading, currentStep, formData, showSuccessModal]);

  // Validation functions
  const validateStep = (step) => {
    const errors = {};
    
    switch(step) {
      case 1:
        if (!formData.contentType) {
          errors.contentType = 'Please select a content type';
        }
        break;
        
      case 2:
        if (!formData.title.trim()) {
          errors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
          errors.description = 'Description is required';
        }
        if (!formData.category) {
          errors.category = 'Category is required';
        }
        if (!formData.googleDriveLink.trim()) {
          errors.googleDriveLink = 'Google Drive link is required';
        } else {
          // Validate Google Drive URL format
          const validation = googleDriveService.validateDriveUrl(formData.googleDriveLink);
          if (!validation.isValid) {
            errors.googleDriveLink = validation.error;
          }
        }
        if (formData.contentType === 'prompt' && !formData.promptType) {
          errors.promptType = 'Prompt type is required';
        }
        break;
        
      case 3:
        if (!formData.accessLevels || formData.accessLevels.length === 0) {
          errors.accessLevels = 'Please select at least one membership tier';
        }
        break;
        
      case 4:
        if (formData.isFeatured) {
          if (!formData.featuredDescription.trim()) {
            errors.featuredDescription = 'Featured description is required';
          } else if (formData.featuredDescription.length > 120) {
            errors.featuredDescription = 'Description must be 120 characters or less';
          }
          if (!formData.thumbnailUrl.trim()) {
            errors.thumbnailUrl = 'Thumbnail URL is required for featured content';
          }
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        // Extract Google Drive ID and generate embed URL
        const extracted = googleDriveService.extractFileId(formData.googleDriveLink);
        if (extracted) {
          setFormData(prev => ({
            ...prev,
            googleDriveId: extracted,
            googleDriveEmbedUrl: googleDriveService.generateEmbedUrl(extracted, formData.contentType)
          }));
        }
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setValidationErrors({});
    setError('');
    setShowSuccessModal(false);
    setUploadedContent(null);
    setThumbnailLoading(false);
    setThumbnailError('');
  };

  const handleClose = () => {
    // Check if form has unsaved changes
    const hasChanges = Object.keys(formData).some(key => {
      if (key === 'accessLevels') return formData.accessLevels.length > 0; // Check array length
      const value = formData[key];
      return Array.isArray(value) ? value.length > 0 : value !== '' && value !== null && value !== false;
    });

    if (hasChanges && currentStep < 5 && !showSuccessModal) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    
    setLoading(true);
    setError('');

    try {
      const contentData = {
        title: formData.title,
        description: formData.description,
        content_type: formData.contentType,
        google_drive_id: formData.googleDriveId,
        google_drive_embed_url: formData.googleDriveEmbedUrl,
        access_levels: formData.accessLevels, // Send as array for JSONB
        category: formData.category,
        tags: formData.tags,
        is_featured: formData.isFeatured,
        featured_description: formData.isFeatured ? formData.featuredDescription : null,
        thumbnail_url: formData.isFeatured ? formData.thumbnailUrl : null,
        featured_order: formData.isFeatured ? formData.featuredOrder : null,
        prompt_type: formData.contentType === 'prompt' ? formData.promptType : null,
        use_case_tags: formData.contentType === 'prompt' ? formData.useCaseTags : null,
        status: 'active'
      };

      const { success, data, error: uploadError } = await contentService.createContentWithWizard(contentData);

      if (uploadError) {
        setError(uploadError);
      } else {
        setUploadedContent(data || contentData);
        setShowSuccessModal(true);
        
        // Dispatch custom event for dashboard integration
        window.dispatchEvent(new CustomEvent('content-uploaded', { 
          detail: { content: data || contentData } 
        }));
        
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'Failed to upload content');
    } finally {
      setLoading(false);
    }
  };

  // Validate and load thumbnail image
  const validateThumbnail = async (url) => {
    if (!url || !url.trim()) {
      setThumbnailError('');
      return;
    }

    setThumbnailLoading(true);
    setThumbnailError('');

    try {
      // Validate URL format
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i;
      if (!urlPattern.test(url)) {
        throw new Error('Invalid image format. Use JPG, PNG, or WebP');
      }

      // Test if image loads
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Unable to load image. Please check the URL.'));
        img.src = url;
      });

      setThumbnailLoading(false);
    } catch (err) {
      setThumbnailError(err.message);
      setThumbnailLoading(false);
    }
  };

  const handleThumbnailChange = (url) => {
    setFormData(prev => ({ ...prev, thumbnailUrl: url }));
    validateThumbnail(url);
  };

  // Render step content
  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return <Step1ContentType formData={formData} setFormData={setFormData} errors={validationErrors} />;
      case 2:
        return <Step2Details formData={formData} setFormData={setFormData} errors={validationErrors} categories={categories} promptTypes={promptTypes} />;
      case 3:
        return <Step3AccessLevel formData={formData} setFormData={setFormData} errors={validationErrors} accessLevelDetails={accessLevelDetails} />;
      case 4:
        return <Step4FeaturedSettings 
          formData={formData} 
          setFormData={setFormData} 
          errors={validationErrors}
          thumbnailLoading={thumbnailLoading}
          thumbnailError={thumbnailError}
          onThumbnailChange={handleThumbnailChange}
        />;
      case 5:
        return <Step5Review formData={formData} accessLevelDetails={accessLevelDetails} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8 max-h-[calc(100vh-4rem)] overflow-y-auto scroll-smooth">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload New Content</h2>
            <p className="text-sm text-gray-600 mt-1">Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            disabled={loading}
            title="Close wizard"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${step < currentStep ? 'bg-green-500 text-white' : 
                    step === currentStep ? 'bg-orange-500 text-white' : 
                    'bg-gray-200 text-gray-500'}
                `}>
                  {step < currentStep ? <Icon name="Check" size={20} /> : step}
                </div>
                {step < 5 && (
                  <div className={`
                    flex-1 h-1 mx-2
                    ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mb-4">
            <span>Type</span>
            <span>Details</span>
            <span>Access</span>
            <span>Featured</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[400px]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={currentStep === 1 || loading}
            className="flex items-center space-x-2"
          >
            <Icon name="ArrowLeft" size={18} />
            <span>Back</span>
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <span>Next</span>
              <Icon name="ArrowRight" size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="flex items-center space-x-2"
            >
              <Icon name="Upload" size={18} />
              <span>Upload Content</span>
            </Button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="CheckCircle" size={32} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Content Uploaded Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your {formData.contentType} has been added to the content library.
              </p>
              
              {uploadedContent && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">Content Details:</p>
                  <p className="text-sm text-gray-900 font-semibold">{uploadedContent.title || formData.title}</p>
                  <p className="text-xs text-gray-600 mt-1">Access: {formData.accessLevels?.join(', ') || 'Not set'}</p>
                  {formData.isFeatured && (
                    <div className="flex items-center mt-2 text-xs text-yellow-700">
                      <Icon name="Star" size={14} className="mr-1" />
                      <span>Featured on homepage</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetWizard();
                  }}
                  className="flex-1"
                >
                  Upload Another
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                  }}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={24} className="text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Unsaved Changes</h3>
                <p className="text-gray-600 mb-6">
                  You have unsaved changes. Are you sure you want to exit? All progress will be lost.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1"
                  >
                    Continue Editing
                  </Button>
                  <Button
                    onClick={() => {
                      setShowExitConfirm(false);
                      onClose();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Discard & Exit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Step 1: Content Type Selection
const Step1ContentType = ({ formData, setFormData, errors }) => {
  const contentTypes = [
    {
      type: 'video',
      icon: 'Video',
      title: 'Video',
      description: 'Upload video tutorials and courses from Google Drive'
    },
    {
      type: 'pdf',
      icon: 'FileText',
      title: 'PDF Document',
      description: 'Share guides, templates, and resources'
    },
    {
      type: 'prompt',
      icon: 'MessageSquare',
      title: 'AI Prompts',
      description: 'Curated prompts for various AI tools'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select Content Type</h3>
        <p className="text-gray-600">Choose the type of content you want to upload</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contentTypes.map((type) => (
          <button
            key={type.type}
            onClick={() => setFormData(prev => ({ ...prev, contentType: type.type }))}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200 text-left
              ${formData.contentType === type.type 
                ? 'border-orange-500 bg-orange-50 shadow-md' 
                : 'border-gray-200 hover:border-orange-200 hover:shadow-sm'}
            `}
          >
            <div className={`
              w-12 h-12 rounded-lg flex items-center justify-center mb-4
              ${formData.contentType === type.type ? 'bg-orange-500' : 'bg-gray-100'}
            `}>
              <Icon 
                name={type.icon} 
                size={24} 
                className={formData.contentType === type.type ? 'text-white' : 'text-gray-600'}
              />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">{type.title}</h4>
            <p className="text-sm text-gray-600">{type.description}</p>
            {formData.contentType === type.type && (
              <div className="mt-4 flex items-center text-orange-600 text-sm font-medium">
                <Icon name="CheckCircle" size={16} className="mr-1" />
                Selected
              </div>
            )}
          </button>
        ))}
      </div>

      {errors.contentType && (
        <p className="text-red-600 text-sm flex items-center mt-2">
          <Icon name="AlertCircle" size={16} className="mr-1" />
          {errors.contentType}
        </p>
      )}
    </div>
  );
};

// Step 2: Content Details
const Step2Details = ({ formData, setFormData, errors, categories, promptTypes }) => {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Content Details</h3>
        <p className="text-gray-600">Provide information about your {formData.contentType}</p>
      </div>

      <Input
        label="Title"
        required
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        placeholder={`Enter ${formData.contentType} title`}
        error={errors.title}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Provide a detailed description"
          rows={4}
          className={`
            w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
            ${errors.description ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
          `}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1 flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Google Drive Link <span className="text-red-500">*</span>
        </label>
        <Input
          value={formData.googleDriveLink}
          onChange={(e) => setFormData(prev => ({ ...prev, googleDriveLink: e.target.value }))}
          placeholder="https://drive.google.com/file/d/..."
          error={errors.googleDriveLink}
        />
        <p className="text-xs text-gray-500 mt-1">
          Make sure the file is set to "Anyone with the link can view"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="content-category" className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="content-category"
            name="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className={`
              w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
              ${errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
            `}
          >
            <option value="">Select category</option>
            {categories[formData.contentType]?.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {formData.contentType === 'prompt' && (
          <div>
            <label htmlFor="prompt-type" className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Type <span className="text-red-500">*</span>
            </label>
            <select
              id="prompt-type"
              name="promptType"
              value={formData.promptType}
              onChange={(e) => setFormData(prev => ({ ...prev, promptType: e.target.value }))}
              className={`
                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                ${errors.promptType ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
              `}
            >
              <option value="">Select prompt type</option>
              {promptTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.promptType && (
              <p className="text-red-600 text-sm mt-1">{errors.promptType}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex space-x-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            placeholder="Add tags (press Enter)"
            className="flex-1"
          />
          <Button onClick={handleAddTag} variant="outline" size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-orange-600 hover:text-orange-800"
              >
                <Icon name="X" size={14} />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Step 3: Access Level Selection
const Step3AccessLevel = ({ formData, setFormData, errors, accessLevelDetails }) => {
  const handleToggleTier = (tier) => {
    setFormData(prev => ({
      ...prev,
      accessLevels: prev.accessLevels.includes(tier)
        ? prev.accessLevels.filter(t => t !== tier)
        : [...prev.accessLevels, tier]
    }));
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      accessLevels: ['starter', 'pro', 'elite']
    }));
  };

  const handleClearAll = () => {
    setFormData(prev => ({
      ...prev,
      accessLevels: []
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select Access Levels</h3>
        <p className="text-gray-600">Choose which membership tiers can access this content</p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-3 mb-4">
        <button
          type="button"
          onClick={handleSelectAll}
          className="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Tier Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(accessLevelDetails).map(([level, details]) => {
          const isSelected = formData.accessLevels.includes(level);
          return (
            <label
              key={level}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${isSelected
                  ? `border-orange-500 ${details.color} shadow-md` 
                  : 'border-gray-200 hover:border-orange-200 hover:shadow-sm bg-white'}
              `}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleTier(level)}
                className="absolute top-4 right-4 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />

              <div className="text-center pr-8">
                {/* Icon */}
                <div className="mb-3">
                  <Icon 
                    name={level === 'starter' ? 'Shield' : level === 'pro' ? 'Award' : 'Crown'} 
                    size={32} 
                    className={isSelected ? 'text-orange-600 mx-auto' : 'text-gray-400 mx-auto'}
                  />
                </div>

                {/* Tier Name */}
                <h4 className="font-bold text-lg mb-1">{details.name}</h4>
                
                {/* Price */}
                <p className="text-sm font-medium mb-3">{details.price}</p>

                {/* Description */}
                <p className="text-xs text-gray-600">
                  {level === 'starter' && 'Basic tier - All members'}
                  {level === 'pro' && 'Mid tier - Advanced content'}
                  {level === 'elite' && 'Premium tier - Exclusive access'}
                </p>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="flex items-center justify-center text-orange-600 text-sm font-medium mt-3">
                    <Icon name="CheckCircle" size={16} className="mr-1" />
                    Selected
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Helper Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">💡 Tip: Higher tiers typically include lower tier content</p>
            <p className="text-xs">
              If you select Elite, consider also selecting Pro and Starter so all members can access this content.
              This creates a better experience for upgrading members.
            </p>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {formData.accessLevels.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="CheckCircle" size={18} className="text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Available to {formData.accessLevels.length} membership tier{formData.accessLevels.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.accessLevels.map(tier => (
              <span 
                key={tier}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${accessLevelDetails[tier].color}`}
              >
                {accessLevelDetails[tier].name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Validation Error */}
      {errors.accessLevels && (
        <p className="text-red-600 text-sm flex items-center">
          <Icon name="AlertCircle" size={16} className="mr-1" />
          {errors.accessLevels}
        </p>
      )}
    </div>
  );
};

// Step 4: Featured Settings
const Step4FeaturedSettings = ({ formData, setFormData, errors, thumbnailLoading, thumbnailError, onThumbnailChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Featured Content Settings</h3>
        <p className="text-gray-600">Choose if this content should be featured on the homepage</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
            className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <div>
            <span className="text-lg font-medium text-gray-900">Feature on Homepage</span>
            <p className="text-sm text-gray-600 mt-1">
              Featured content will be displayed prominently on the homepage to attract members
            </p>
          </div>
        </label>
      </div>

      {formData.isFeatured && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.featuredDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, featuredDescription: e.target.value }))}
              placeholder="Write a compelling short description (max 120 characters)"
              maxLength={120}
              rows={2}
              className={`
                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                ${errors.featuredDescription ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
              `}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.featuredDescription && (
                <p className="text-red-600 text-sm flex items-center">
                  <Icon name="AlertCircle" size={16} className="mr-1" />
                  {errors.featuredDescription}
                </p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {formData.featuredDescription.length}/120 characters
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => onThumbnailChange?.(e.target.value) || setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className={`
                w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2
                ${errors.thumbnailUrl || thumbnailError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}
              `}
            />
            {thumbnailError && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <Icon name="AlertCircle" size={16} className="mr-1" />
                {thumbnailError}
              </p>
            )}
            {errors.thumbnailUrl && !thumbnailError && (
              <p className="text-red-600 text-sm mt-1">{errors.thumbnailUrl}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter a publicly accessible image URL (JPG, PNG, or WebP) - Recommended: 800x600px
            </p>

            {/* Thumbnail Preview */}
            {formData.thumbnailUrl && !thumbnailError && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Thumbnail Preview:</p>
                {thumbnailLoading ? (
                  <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : (
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-auto max-h-60 object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
            )}
          </div>

          <Input
            label="Display Order"
            type="number"
            value={formData.featuredOrder || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, featuredOrder: parseInt(e.target.value) || null }))}
            placeholder="Leave empty for automatic ordering"
            helperText="Lower numbers appear first on homepage"
          />

          {formData.thumbnailUrl && (
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview Card</p>
              <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Icon name="Image" size={32} className="text-gray-400" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{formData.title || 'Content Title'}</h4>
                <p className="text-sm text-gray-600 mb-3">{formData.featuredDescription || 'Featured description will appear here'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                    {formData.accessLevels?.length > 0 ? formData.accessLevels.join(', ') : 'Not set'}
                  </span>
                  <span className="text-sm text-orange-600 font-medium">View Content →</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Step 5: Review
const Step5Review = ({ formData, accessLevelDetails }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Confirm</h3>
        <p className="text-gray-600">Please review all details before uploading</p>
      </div>

      <div className="space-y-4">
        {/* Content Type */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Content Type</h4>
          <p className="text-lg font-semibold text-gray-900 capitalize">{formData.contentType}</p>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Content Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium text-gray-900 text-right">{formData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium text-gray-900">{formData.category}</span>
            </div>
            {formData.promptType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Prompt Type:</span>
                <span className="font-medium text-gray-900">{formData.promptType}</span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Tags:</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                {formData.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
          <p className="text-gray-900">{formData.description}</p>
        </div>

        {/* Access Levels */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Access Levels</h4>
          <div className="flex flex-wrap gap-2">
            {formData.accessLevels.length > 0 ? (
              formData.accessLevels.map(level => (
                <div key={level} className={`inline-flex items-center px-4 py-2 rounded-lg ${accessLevelDetails[level].color}`}>
                  <Icon 
                    name={level === 'starter' ? 'Shield' : level === 'pro' ? 'Award' : 'Crown'} 
                    size={18} 
                    className="mr-2" 
                  />
                  <span className="font-semibold">{accessLevelDetails[level].name}</span>
                  <span className="ml-2 text-sm">({accessLevelDetails[level].price})</span>
                </div>
              ))
            ) : (
              <span className="text-gray-500 text-sm">No access levels selected</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Available to {formData.accessLevels.length} membership tier{formData.accessLevels.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Featured Status */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Featured on Homepage</h4>
          <div className="flex items-center space-x-2">
            {formData.isFeatured ? (
              <>
                <Icon name="Star" size={18} className="text-yellow-500" />
                <span className="font-medium text-gray-900">Yes, featured content</span>
              </>
            ) : (
              <>
                <Icon name="X" size={18} className="text-gray-400" />
                <span className="font-medium text-gray-600">Not featured</span>
              </>
            )}
          </div>
          {formData.isFeatured && (
            <p className="text-sm text-gray-600 mt-2">{formData.featuredDescription}</p>
          )}
        </div>

        {/* Google Drive Link */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Google Drive Link</h4>
          <p className="text-sm text-gray-900 break-all">{formData.googleDriveLink}</p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium">Ready to upload!</p>
            <p className="mt-1">Click "Upload Content" to make this content available to members.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentUploadWizard;
