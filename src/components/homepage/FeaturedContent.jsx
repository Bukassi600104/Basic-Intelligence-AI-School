import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Icon from '../AppIcon';
import { contentService } from '../../services/contentService';

/**
 * FeaturedContent Component
 * Displays featured content cards on homepage with tier-based access control
 */
const FeaturedContent = ({ limit = 6 }) => {
  const navigate = useNavigate();
  const { user, userProfile, canAccessContent } = useAuth();
  const [featuredContent, setFeaturedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    setLoading(true);
    setError('');

    try {
      const { success, data, error: fetchError } = await contentService.getFeaturedContent(limit);

      if (!success || fetchError) {
        setError(fetchError || 'Failed to load featured content');
      } else {
        setFeaturedContent(data || []);
      }
    } catch (err) {
      setError('An error occurred while loading content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center space-x-2 text-red-600">
          <Icon name="AlertCircle" size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!featuredContent || featuredContent.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-orange-500/10 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold border border-orange-500/20">
              Featured Content
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start Learning Today
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our most popular AI courses, tutorials, and resources designed to accelerate your learning
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredContent.map((content) => (
            <FeaturedContentCard
              key={content.id}
              content={content}
              user={user}
              userProfile={userProfile}
              canAccessContent={canAccessContent}
              navigate={navigate}
            />
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Button
            onClick={() => navigate('/pricing-plans-page')}
            size="lg"
            className="inline-flex items-center space-x-2"
          >
            <span>View All Plans</span>
            <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
};

/**
 * FeaturedContentCard Component
 * Individual content card with access control logic
 */
const FeaturedContentCard = ({ content, user, userProfile, canAccessContent, navigate }) => {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [checking, setChecking] = useState(false);

  const tierConfig = {
    starter: {
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: 'Shield'
    },
    pro: {
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: 'Star'
    },
    elite: {
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: 'Crown'
    }
  };

  const contentTypeIcons = {
    video: 'Video',
    pdf: 'FileText',
    prompt: 'MessageSquare'
  };

  const handleCardClick = async () => {
    setChecking(true);

    // Scenario 1: Not logged in - redirect to sign in with intent
    if (!user) {
      // Store intended content in session storage
      sessionStorage.setItem('intendedContent', JSON.stringify({
        contentId: content.id,
        contentType: content.content_type,
        contentTitle: content.title,
        referrer: 'homepage_featured'
      }));

      // Log click (no user)
      await contentService.logFeaturedClick(content.id, true, null, 'homepage');

      // Redirect to sign in
      navigate('/sign-in');
      return;
    }

    // Scenario 2: Logged in - check access
    const { success, hasAccess } = await contentService.canAccessFeaturedContent(content.id);

    // Log the click
    await contentService.logFeaturedClick(content.id, false, null, 'homepage');

    if (hasAccess) {
      // Scenario 3: Has access - redirect to content in dashboard
      redirectToContent();
    } else {
      // Scenario 4: No access - show upgrade modal
      setShowAccessModal(true);
    }

    setChecking(false);
  };

  const redirectToContent = () => {
    // Determine dashboard route based on content type
    const routes = {
      video: '/student-dashboard/videos',
      pdf: '/student-dashboard/pdfs',
      prompt: '/student-dashboard/prompts'
    };

    const route = routes[content.content_type] || '/student-dashboard';
    
    // Navigate with content ID for deep linking
    navigate(`${route}?contentId=${content.id}&featured=true`);
  };

  const tierDetails = tierConfig[content.access_level] || tierConfig.starter;

  return (
    <>
      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={handleCardClick}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {content.thumbnail_url ? (
            <img
              src={content.thumbnail_url}
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Icon
                name={contentTypeIcons[content.content_type]}
                size={48}
                className="text-gray-400"
              />
            </div>
          )}
          
          {/* Content Type Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 backdrop-blur-sm">
              <Icon name={contentTypeIcons[content.content_type]} size={12} />
              <span className="capitalize">{content.content_type}</span>
            </span>
          </div>

          {/* Access Level Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${tierDetails.color} backdrop-blur-sm border`}>
              <Icon name={tierDetails.icon} size={12} />
              <span className="capitalize">{content.access_level}</span>
            </span>
          </div>
        </div>

        {/* Content Info */}
        <div className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
            {content.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {content.featured_description || content.description}
          </p>

          {/* Category Tag */}
          {content.category && (
            <div className="flex items-center space-x-2 mb-4">
              <Icon name="Tag" size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">{content.category}</span>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between">
            <span className="text-orange-600 font-semibold text-sm group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
              <span>{checking ? 'Checking access...' : 'View Content'}</span>
              <Icon name="ArrowRight" size={16} />
            </span>
          </div>
        </div>
      </div>

      {/* Access Modal */}
      {showAccessModal && (
        <AccessModal
          content={content}
          userProfile={userProfile}
          onClose={() => setShowAccessModal(false)}
          navigate={navigate}
        />
      )}
    </>
  );
};

/**
 * AccessModal Component
 * Modal shown when user doesn't have access to content
 */
const AccessModal = ({ content, userProfile, onClose, navigate }) => {
  const tierPricing = {
    starter: { name: 'Starter', price: '₦10,000/month' },
    pro: { name: 'Pro', price: '₦15,000/month' },
    elite: { name: 'Elite', price: '₦25,000/month' }
  };

  const requiredTier = tierPricing[content.access_level];
  const currentTier = userProfile?.membership_tier ? tierPricing[userProfile.membership_tier] : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="Lock" size={32} className="text-orange-600" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
          Upgrade Required
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {userProfile?.membership_status === 'active' ? (
            <>
              This content requires <span className="font-semibold text-orange-600">{requiredTier.name}</span> membership.
              {currentTier && <> You are currently on <span className="font-semibold">{currentTier.name}</span> plan.</>}
            </>
          ) : (
            <>
              This content is available to <span className="font-semibold text-orange-600">{requiredTier.name}</span> members.
              Complete your payment to gain access.
            </>
          )}
        </p>

        {/* Content Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">{content.title}</h4>
          <p className="text-sm text-gray-600 mb-3">{content.featured_description}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 capitalize">{content.content_type}</span>
            <span className="font-semibold text-orange-600">{requiredTier.price}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {userProfile?.membership_status === 'active' ? (
            <Button
              onClick={() => navigate('/student-dashboard/subscription')}
              className="w-full"
            >
              Upgrade Membership
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/pricing-plans-page')}
              className="w-full"
            >
              View Plans & Pricing
            </Button>
          )}
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedContent;
