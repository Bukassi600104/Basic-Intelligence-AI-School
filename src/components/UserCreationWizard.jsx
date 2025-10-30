import React, { useState } from 'react';
import Icon from './AppIcon';
import PhoneInput from './ui/PhoneInput';

const UserCreationWizard = ({ onSubmit, onClose, actionLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'student',
    membership_tier: 'starter',
    membership_status: 'pending',
    phone: '',
    whatsapp_phone: '',
    location: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [emailValidated, setEmailValidated] = useState(false);

  const totalSteps = 3;

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Field validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
      }

      if (!formData.full_name.trim()) {
        newErrors.full_name = 'Full name is required';
      } else if (formData.full_name.trim().length < 3) {
        newErrors.full_name = 'Full name must be at least 3 characters';
      }
    }

    if (step === 2) {
      // Step 2 fields are optional but validate format if provided
      if (formData.phone && formData.phone.length < 10) {
        newErrors.phone = 'Phone number must be at least 10 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        setEmailValidated(true);
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Reset email validation if email changes
    if (field === 'email') {
      setEmailValidated(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      onSubmit(formData);
    }
  };

  const getStepIcon = (stepNumber) => {
    if (currentStep > stepNumber) {
      return <Icon name="CheckCircle" size={24} className="text-green-500" />;
    }
    if (currentStep === stepNumber) {
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-pink-600 flex items-center justify-center text-white font-bold">
          {stepNumber}
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
        {stepNumber}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Icon name="UserPlus" size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">Create New User</h2>
                <p className="text-white/90 mt-1">
                  Step {currentStep} of {totalSteps}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              type="button"
            >
              <Icon name="X" size={24} />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Step 1 */}
            <div className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {getStepIcon(1)}
                <span className={`text-xs mt-2 font-medium ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-500'}`}>
                  Basic Info
                </span>
              </div>
              <div className={`flex-1 h-1 mx-4 rounded ${currentStep > 1 ? 'bg-gradient-to-r from-orange-600 to-pink-600' : 'bg-gray-300'}`}></div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {getStepIcon(2)}
                <span className={`text-xs mt-2 font-medium ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-500'}`}>
                  Contact Details
                </span>
              </div>
              <div className={`flex-1 h-1 mx-4 rounded ${currentStep > 2 ? 'bg-gradient-to-r from-orange-600 to-pink-600' : 'bg-gray-300'}`}></div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              {getStepIcon(3)}
              <span className={`text-xs mt-2 font-medium ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-500'}`}>
                Review & Create
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-br from-gray-50 to-orange-50 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 280px)' }}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Icon name="Info" size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Let's start with the essential information
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Email and full name are required to create a user account
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-colors shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <Icon name="Mail" size={16} className="mr-2 text-orange-600" />
                  Email Address *
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="user@example.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <Icon name="AlertCircle" size={14} className="mr-1" />
                    {errors.email}
                  </p>
                )}
                {emailValidated && !errors.email && formData.email && (
                  <p className="text-green-600 text-xs mt-2 flex items-center">
                    <Icon name="CheckCircle" size={14} className="mr-1" />
                    Email format is valid
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-colors shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <Icon name="User" size={16} className="mr-2 text-orange-600" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className={`w-full px-4 py-3 border-2 ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all`}
                  placeholder="John Doe"
                  required
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <Icon name="AlertCircle" size={14} className="mr-1" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-blue-400 transition-colors shadow-sm">
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <Icon name="Shield" size={16} className="mr-2 text-orange-600" />
                    User Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Determines access level and permissions
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-blue-400 transition-colors shadow-sm">
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <Icon name="Award" size={16} className="mr-2 text-orange-600" />
                    Membership Tier
                  </label>
                  <select
                    value={formData.membership_tier}
                    onChange={(e) => handleChange('membership_tier', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                  >
                    <option value="starter">Starter (₦5,000/month)</option>
                    <option value="pro">Pro (₦15,000/month)</option>
                    <option value="elite">Elite (₦25,000/month)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Controls access to content and features
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Icon name="Phone" size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Add contact information (Optional)
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      These details help with notifications and support
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-blue-400 transition-colors shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <Icon name="CheckCircle" size={16} className="mr-2 text-orange-600" />
                  Membership Status
                </label>
                <select
                  value={formData.membership_status}
                  onChange={(e) => handleChange('membership_status', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Current membership status
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-blue-400 transition-colors shadow-sm">
                <PhoneInput
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  defaultCountryCode="+234"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <Icon name="AlertCircle" size={14} className="mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-blue-400 transition-colors shadow-sm">
                <PhoneInput
                  label="WhatsApp Phone"
                  name="whatsapp_phone"
                  value={formData.whatsapp_phone}
                  onChange={(e) => handleChange('whatsapp_phone', e.target.value)}
                  placeholder="Enter WhatsApp number"
                  defaultCountryCode="+234"
                />
                <p className="text-xs text-gray-500 mt-2">
                  For WhatsApp notifications (international format)
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-blue-400 transition-colors shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <Icon name="MapPin" size={16} className="mr-2 text-orange-600" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Lagos, Nigeria"
                />
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-orange-200 hover:border-blue-400 transition-colors shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <Icon name="FileText" size={16} className="mr-2 text-orange-600" />
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all"
                  placeholder="Brief description about the user"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Optional: Add a short bio or description
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Icon name="CheckCircle" size={20} className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Review and confirm user details
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Please verify all information before creating the user
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Icon name="User" size={20} className="mr-2 text-orange-600" />
                  User Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="text-gray-900 font-semibold">{formData.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Full Name:</span>
                    <span className="text-gray-900 font-semibold">{formData.full_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Role:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${formData.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {formData.role === 'admin' ? 'Admin' : 'Student'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Membership Tier:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      formData.membership_tier === 'elite' ? 'bg-purple-100 text-purple-800' :
                      formData.membership_tier === 'pro' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.membership_tier.charAt(0).toUpperCase() + formData.membership_tier.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Membership Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      formData.membership_status === 'active' ? 'bg-green-100 text-green-800' :
                      formData.membership_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.membership_status.charAt(0).toUpperCase() + formData.membership_status.slice(1)}
                    </span>
                  </div>
                  {formData.phone && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Phone:</span>
                      <span className="text-gray-900">{formData.phone}</span>
                    </div>
                  )}
                  {formData.whatsapp_phone && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">WhatsApp:</span>
                      <span className="text-gray-900">{formData.whatsapp_phone}</span>
                    </div>
                  )}
                  {formData.location && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Location:</span>
                      <span className="text-gray-900">{formData.location}</span>
                    </div>
                  )}
                  {formData.bio && (
                    <div className="py-2">
                      <span className="text-gray-600 font-medium block mb-2">Bio:</span>
                      <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{formData.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Icon name="Key" size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-2">
                      Automatic Password Generation
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>A secure temporary password will be generated automatically</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>The password will be shown after user creation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>User must change password on first login</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Welcome email will be sent with login credentials</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handleBack}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center"
            >
              <Icon name={currentStep === 1 ? "X" : "ChevronLeft"} size={20} className="mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-700 hover:to-pink-700 transition-all hover:-translate-y-1 flex items-center"
              >
                Next Step
                <Icon name="ChevronRight" size={20} className="ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-teal-700 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Icon name="UserPlus" size={20} className="mr-2" />
                {actionLoading ? 'Creating User...' : 'Create User'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreationWizard;
