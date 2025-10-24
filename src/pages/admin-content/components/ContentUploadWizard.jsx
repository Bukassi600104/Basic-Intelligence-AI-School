import React, { useState } from 'react';
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

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Content Type
    contentType: '', // 'video', 'pdf', 'prompt'
    
    // Step 2: Details
    title: '',
    description: '',
    category: '',
    tags: [],
    googleDriveLink: '',
    googleDriveId: '',
    googleDriveEmbedUrl: '',
    
    // For prompts
    promptType: '', // 'ChatGPT', 'Claude', 'Midjourney', etc.
    useCaseTags: [],
    
    // Step 3: Access Level
    accessLevel: 'starter', // 'starter', 'pro', 'elite'
    
    // Step 4: Featured Settings
    isFeatured: false,
    featuredDescription: '',
    thumbnailUrl: '',
    featuredOrder: null
  });

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
        if (!formData.accessLevel) {
          errors.accessLevel = 'Please select an access level';
        }
        break;
        
      case 4:
        if (formData.isFeatured) {
          if (!formData.featuredDescription.trim()) {
            errors.featuredDescription = 'Featured description is required';
          } else if (formData.featuredDescription.length > 100) {
            errors.featuredDescription = 'Description must be 100 characters or less';
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
        access_level: formData.accessLevel,
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

      const { success, error: uploadError } = await contentService.createContentWithWizard(contentData);

      if (uploadError) {
        setError(uploadError);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError(err.message || 'Failed to upload content');
    } finally {
      setLoading(false);
    }
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
        return <Step4FeaturedSettings formData={formData} setFormData={setFormData} errors={validationErrors} />;
      case 5:
        return <Step5Review formData={formData} accessLevelDetails={accessLevelDetails} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload New Content</h2>
            <p className="text-sm text-gray-600 mt-1">Step {currentStep} of {totalSteps}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
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
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Select Access Level</h3>
        <p className="text-gray-600">Choose which membership tier can access this content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(accessLevelDetails).map(([level, details]) => (
          <button
            key={level}
            onClick={() => setFormData(prev => ({ ...prev, accessLevel: level }))}
            className={`
              p-6 rounded-xl border-2 transition-all duration-200
              ${formData.accessLevel === level 
                ? `border-orange-500 ${details.color} shadow-md` 
                : 'border-gray-200 hover:border-orange-200 hover:shadow-sm bg-white'}
            `}
          >
            <div className="text-center">
              <h4 className="font-bold text-lg mb-2">{details.name}</h4>
              <p className="text-sm font-medium mb-4">{details.price}</p>
              {formData.accessLevel === level && (
                <div className="flex items-center justify-center text-orange-600 text-sm font-medium">
                  <Icon name="CheckCircle" size={16} className="mr-1" />
                  Selected
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Access Level Information:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Starter: Basic content for all members</li>
              <li>Pro: Advanced content for Pro and Elite members</li>
              <li>Elite: Premium content for Elite members only</li>
            </ul>
          </div>
        </div>
      </div>

      {errors.accessLevel && (
        <p className="text-red-600 text-sm flex items-center">
          <Icon name="AlertCircle" size={16} className="mr-1" />
          {errors.accessLevel}
        </p>
      )}
    </div>
  );
};

// Step 4: Featured Settings
const Step4FeaturedSettings = ({ formData, setFormData, errors }) => {
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
              placeholder="Write a compelling short description (max 100 characters)"
              maxLength={100}
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
                {formData.featuredDescription.length}/100 characters
              </p>
            </div>
          </div>

          <Input
            label="Thumbnail URL"
            required
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
            placeholder="https://drive.google.com/..."
            error={errors.thumbnailUrl}
            helperText="Google Drive link to thumbnail image (recommended: 800x600px)"
          />

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
                    {formData.accessLevel.charAt(0).toUpperCase() + formData.accessLevel.slice(1)}
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

        {/* Access Level */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Access Level</h4>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg ${accessLevelDetails[formData.accessLevel].color}`}>
            <Icon name="Shield" size={18} className="mr-2" />
            <span className="font-semibold">{accessLevelDetails[formData.accessLevel].name}</span>
            <span className="ml-2 text-sm">({accessLevelDetails[formData.accessLevel].price})</span>
          </div>
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
