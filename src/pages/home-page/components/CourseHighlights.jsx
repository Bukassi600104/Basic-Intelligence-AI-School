import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { courseService } from '../../../services/courseService';
import { testimonialService } from '../../../services/testimonialService';

const CourseHighlights = () => {
  const [courses, setCourses] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // Fetch featured courses
        const { data: coursesData, error: coursesError } = await courseService?.getFeaturedCourses();
        if (coursesError) {
          setError(coursesError);
        } else {
          setCourses(coursesData || []);
        }

        // Fetch featured testimonials
        const { data: testimonialsData, error: testimonialsError } = await testimonialService?.getFeaturedTestimonials();
        if (testimonialsError && !coursesError) {
          setError(testimonialsError);
        } else {
          setTestimonials(testimonialsData || []);
        }
      } catch (err) {
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDuration = (weeks) => {
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  };

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-success/20 text-success';
      case 'intermediate':
        return 'bg-warning/20 text-warning';
      case 'advanced':
        return 'bg-error/20 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatLevel = (level) => {
    return level?.charAt(0)?.toUpperCase() + level?.slice(1)?.toLowerCase();
  };

  if (loading) {
    return (
      <section className="py-20 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center">
            <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center">
            <Icon name="AlertCircle" size={32} className="mx-auto text-red-500 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location?.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        {/* Course Highlights */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Courses
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore our comprehensive AI curriculum designed to take you from beginner to expert
            </p>
          </div>

          {courses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses?.map((course) => (
                <div 
                  key={course?.id}
                  className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src={course?.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop'}
                      alt={course?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course?.level)}`}>
                        {formatLevel(course?.level)}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-foreground">
                        {course?.title}
                      </h3>
                      <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                        <Icon name="Clock" size={14} />
                        <span>{formatDuration(course?.duration_weeks)}</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {course?.description}
                    </p>

                    {/* Topics */}
                    {course?.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course?.topics?.slice(0, 3)?.map?.((topic, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                          >
                            {topic}
                          </span>
                        ))}
                        {course?.topics?.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                            +{course?.topics?.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Icon name="Users" size={14} />
                          <span>{course?.enrollment_count || 0} enrolled</span>
                        </div>
                        {course?.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <Icon name="Star" size={14} className="text-warning" />
                            <span>{course?.rating?.toFixed?.(1) || '0.0'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Featured Courses Yet</h3>
              <p className="text-muted-foreground">Check back soon for our latest AI courses!</p>
            </div>
          )}
        </div>

        {/* Testimonials */}
        <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Members Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of satisfied learners who have transformed their careers with AI
            </p>
          </div>

          {testimonials?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {testimonials?.slice(0, 4)?.map?.((testimonial) => (
                <div 
                  key={testimonial?.id}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow duration-300"
                >
                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial?.rating || 5)]?.map?.((_, index) => (
                      <Icon key={index} name="Star" size={16} className="text-warning fill-current" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial?.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {testimonial?.user?.full_name?.charAt?.(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {testimonial?.user?.full_name || 'Anonymous User'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial?.user?.bio && testimonial?.user?.location
                          ? `${testimonial?.user?.bio?.split(' ')?.slice(0, 2)?.join(' ')} • ${testimonial?.user?.location}`
                          : testimonial?.user?.location || 'Community Member'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="MessageCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Testimonials Yet</h3>
              <p className="text-muted-foreground">Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CourseHighlights;