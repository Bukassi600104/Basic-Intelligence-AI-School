import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { reviewService } from '../../services/reviewService';

const ReviewCarousel = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load approved reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data, error } = await reviewService.getApprovedReviews();
        if (!error && data) {
          setReviews(data);
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  // Auto-rotate reviews
  useEffect(() => {
    if (reviews.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  const nextReview = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevReview = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const goToReview = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Icon name="Loader" size={24} className="animate-spin text-white" />
          </div>
          <div className="text-lg font-medium text-foreground mb-2">Loading Reviews</div>
          <div className="text-sm text-muted-foreground">Loading student testimonials...</div>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
        <div className="text-center">
          <Icon name="MessageSquare" size={48} className="text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Student Reviews Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share your experience with Basic Intelligence AI School!
          </p>
          <Button 
            onClick={() => window.location.href = '/signup'}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Join Now & Share Your Story
          </Button>
        </div>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];

  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
          What Our Students Say
        </h2>
        <p className="text-muted-foreground text-lg">
          Real experiences from our AI learning community
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Review Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            {/* Stars */}
            <div className="flex items-center space-x-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Icon 
                  key={i}
                  name="Star" 
                  size={24} 
                  className={i < currentReview?.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                />
              ))}
            </div>

            {/* Review Text */}
            <blockquote className="text-lg lg:text-xl text-foreground mb-6 italic leading-relaxed">
              "{currentReview?.review_text}"
            </blockquote>

            {/* Reviewer Info */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Icon name="User" size={24} className="text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  {currentReview?.user_name || 'Anonymous Student'}
                </div>
                <div className="text-sm text-muted-foreground">
                  AI Student Member
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        {reviews.length > 1 && (
          <div className="flex items-center justify-center mt-8 space-x-4">
            {/* Previous Button */}
            <button
              onClick={prevReview}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <Icon name="ChevronLeft" size={20} className="text-foreground" />
            </button>

            {/* Dots Indicator */}
            <div className="flex items-center space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReview(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-primary scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextReview}
              className="w-10 h-10 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <Icon name="ChevronRight" size={20} className="text-foreground" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
              {reviews.length}
            </div>
            <div className="text-sm text-muted-foreground">Student Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
              {reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
              100%
            </div>
            <div className="text-sm text-muted-foreground">Verified Members</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Ready to start your AI learning journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.location.href = '/join-membership-page'}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Join Our Community
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/about-page'}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCarousel;
