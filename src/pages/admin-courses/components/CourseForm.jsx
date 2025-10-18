import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { contentService } from '../../../services/contentService';

const CourseForm = ({
  isOpen,
  onClose,
  onSubmit,
  course = null,
  title = 'Create Course'
}) => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    duration_weeks: 4,
    price_naira: 0,
    topics: [],
    image_url: '',
    status: 'draft'
  });
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videos, setVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);

  // Load form data when editing
  useEffect(() => {
    if (course) {
      setFormData({
        title: course?.title || '',
        description: course?.description || '',
        level: course?.level || 'beginner',
        duration_weeks: course?.duration_weeks || 4,
        price_naira: course?.price_naira || 0,
        topics: course?.topics || [],
        image_url: course?.image_url || '',
        status: course?.status || 'draft'
      });
    }
  }, [course]);

  // Load available videos
  useEffect(() => {
    if (isOpen) {
      loadVideos();
    }
  }, [isOpen]);

  const loadVideos = async () => {
    try {
      const { data, error } = await contentService?.getAccessibleContent('video');
      if (!error) {
        setVideos(data || []);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const handleTopicAdd = () => {
    if (newTopic?.trim() && !formData?.topics?.includes(newTopic?.trim())) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev?.topics, newTopic?.trim()]
      }));
      setNewTopic('');
    }
  };

  const handleTopicRemove = (topicToRemove) => {
    setFormData(prev => ({
      ...prev,
      topics: prev?.topics?.filter(topic => topic !== topicToRemove)
    }));
  };

  const handleVideoToggle = (videoId) => {
    setSelectedVideos(prev => 
      prev?.includes(videoId) 
        ? prev?.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const validateForm = () => {
    if (!formData?.title?.trim()) {
      setError('Course title is required');
      return false;
    }

    if (!formData?.description?.trim()) {
      setError('Course description is required');
      return false;
    }

    if (formData?.duration_weeks < 1) {
      setError('Duration must be at least 1 week');
      return false;
    }

    if (formData?.topics?.length === 0) {
      setError('At least one topic is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onSubmit(formData);
      
      if (success) {
        // Link selected videos to course after creation
        if (selectedVideos?.length > 0 && !course) {
          // This would need to be handled after course creation
          console.log('Videos to link:', selectedVideos);
        }
        
        onClose();
      }
    } catch (err) {
      setError('Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-card border border-border rounded-2xl p-10 lg:p-12 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl backdrop-blur-sm bg-white/95">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Icon name="BookOpen" size={36} className="text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              {title}
            </h1>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-3 hover:bg-muted rounded-xl transition-colors"
            >
              <Icon name="X" size={24} className="text-muted-foreground" />
            </button>
          </div>

          {/* Enhanced Error Display */}
          {error && (
            <div className="mb-10 p-5 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <Icon name="AlertCircle" size={24} className="text-red-600 flex-shrink-0" />
                <span className="text-red-600 text-base font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Input
                label="Course Title"
                name="title"
                value={formData?.title}
                onChange={handleInputChange}
                placeholder="Enter course title"
                required
                className="text-lg h-14"
              />

              <Select
                label="Course Level"
                name="level"
                value={formData?.level}
                onChange={handleInputChange}
                required
                className="text-lg h-14"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Input
                label="Duration (Weeks)"
                name="duration_weeks"
                type="number"
                value={formData?.duration_weeks}
                onChange={handleNumberChange}
                min="1"
                max="52"
                required
                className="text-lg h-14"
              />

              <Input
                label="Price (₦)"
                name="price_naira"
                type="number"
                value={formData?.price_naira}
                onChange={handleNumberChange}
                min="0"
                className="text-lg h-14"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-foreground mb-4">
                Description
              </label>
              <textarea
                name="description"
                value={formData?.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                rows={6}
                className="w-full px-4 py-3 text-lg border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                required
              />
            </div>

            <Input
              label="Course Image URL (Optional)"
              name="image_url"
              type="url"
              value={formData?.image_url}
              onChange={handleInputChange}
              placeholder={process.env.NEXT_PUBLIC_CDN_URL || 'https://example.com/image.jpg'}
              className="text-lg h-14"
            />

            {/* Topics Management */}
            <div>
              <label className="block text-lg font-medium text-foreground mb-4">
                Course Topics
              </label>
              
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Add a topic"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e?.target?.value)}
                  onKeyPress={(e) => e?.key === 'Enter' && (e?.preventDefault(), handleTopicAdd())}
                  className="text-lg h-14 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTopicAdd}
                  disabled={!newTopic?.trim()}
                  className="h-14 text-lg"
                >
                  <Icon name="Plus" size={24} />
                </Button>
              </div>

              {/* Display Topics */}
              <div className="flex flex-wrap gap-3">
                {formData?.topics?.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-xl text-base"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleTopicRemove(topic)}
                      className="ml-3 hover:text-red-600 transition-colors"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Video Selection */}
            {videos?.length > 0 && (
              <div>
                <label className="block text-lg font-medium text-foreground mb-4">
                  Course Videos (Optional)
                </label>
                <div className="max-h-60 overflow-y-auto border border-border rounded-xl">
                  {videos?.map((video) => (
                    <div
                      key={video?.id}
                      className="flex items-center p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedVideos?.includes(video?.id)}
                        onChange={() => handleVideoToggle(video?.id)}
                        className="mr-4 rounded border-border focus:ring-primary h-5 w-5"
                      />
                      <div className="flex-1">
                        <p className="text-base font-medium text-foreground">{video?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Access Level: {video?.access_level} • Category: {video?.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Select
              label="Course Status"
              name="status"
              value={formData?.status}
              onChange={handleInputChange}
              className="text-lg h-14"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>

            {/* Enhanced Form Actions */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                size="lg"
                className="h-14 text-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                size="lg"
                className="h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <Icon name="Loader" size={24} className="animate-spin" />
                    <span>Saving Course...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Icon name="Save" size={24} />
                    <span>{course ? 'Update Course' : 'Create Course'}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;
