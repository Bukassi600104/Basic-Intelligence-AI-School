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
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatLevel = (level) => {
    return level?.charAt(0)?.toUpperCase() + level?.slice(1)?.toLowerCase();
  };

  if (loading) {
    return (
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading amazing courses...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center bg-white rounded-2xl p-12 shadow-lg">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertCircle" size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location?.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 lg:py-36 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Course Highlights */}
        <div className="mb-28">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-block px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-6">
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Featured Courses
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8">
              <span className="bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
                Start Your AI Journey
              </span>
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">
              Explore our comprehensive AI curriculum designed to take you from{' '}
              <span className="font-bold text-gray-900">beginner to expert</span>
            </p>
          </div>

          {courses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
              {courses?.map((course, index) => (
                <div 
                  key={course?.id}
                  className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-2 transition-all duration-300 animate-slideUp"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Course Image */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
                    <Image 
                      src={course?.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop'}
                      alt={course?.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 backdrop-blur-sm ${getLevelColor(course?.level)}`}>
                        {formatLevel(course?.level)}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-7">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {course?.title}
                      </h3>
```                    <div className="flex items-center space-x-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={16} className="text-gray-400" />
                        <span>{formatDuration(course?.duration_weeks)}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Users" size={16} className="text-gray-400" />
                        <span>{course?.enrollment_count || 0} enrolled</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {course?.description}
                    </p>

                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {course?.description}
                    </p>

                    {/* Topics */}
                    {course?.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {course?.topics?.slice(0, 3)?.map?.((topic, index) => (
                          <span 
                            key={index}
                            className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200"
                          >
                            {topic}
                          </span>
                        ))}
                        {course?.topics?.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                            +{course?.topics?.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                      {course?.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              name="Star"
                              size={14}
                              className={i < Math.round(course?.rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                          <span className="text-sm font-semibold text-gray-700 ml-1">
                            {course?.rating?.toFixed?.(1)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                        <span>View Course</span>
                        <Icon name="ArrowRight" size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="BookOpen" size={40} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Featured Courses Yet</h3>
              <p className="text-gray-600">Check back soon for our latest AI courses!</p>
            </div>
          )}
        </div>

        {/* Testimonials - Enhanced Design */}
        <div className="relative">
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 rounded-3xl"></div>
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl"></div>
          
          <div className="relative p-8 lg:p-16">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-6">
                <span className="text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Success Stories
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-gray-900 via-orange-900 to-pink-900 bg-clip-text text-transparent">
                  What Our Members Say
                </span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of satisfied learners who have{' '}
                <span className="font-semibold text-gray-900">transformed their careers</span> with AI
              </p>
            </div>

            {testimonials?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {testimonials?.slice(0, 4)?.map?.((testimonial, index) => (
                  <div 
                    key={testimonial?.id}
                    className="group bg-white border-2 border-gray-200 rounded-2xl p-8 hover:shadow-card-hover hover:border-purple-400 hover:-translate-y-1 transition-all duration-300 animate-slideUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Quote Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1 mb-5">
                      {[...Array(testimonial?.rating || 5)]?.map?.((_, i) => (
                        <Icon key={i} name="Star" size={18} className="text-amber-400 fill-current" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                      "{testimonial?.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center space-x-4 pt-6 border-t-2 border-gray-100">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">
                          {testimonial?.user?.full_name?.charAt?.(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {testimonial?.user?.full_name || 'Anonymous User'}
                        </div>
                        <div className="text-sm text-gray-600">
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
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="MessageCircle" size={40} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Testimonials Yet</h3>
                <p className="text-gray-600">Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHighlights;