import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicHeader from '../../components/ui/PublicHeader';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { courseService } from '../../services/courseService';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Load published courses
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const { data, error: coursesError } = await courseService?.getPublishedCourses();
        
        if (coursesError) {
          setError('Failed to load courses');
          console.error('Courses loading error:', coursesError);
        } else {
          setCourses(data || []);
          setFilteredCourses(data || []);
        }
      } catch (err) {
        setError('Failed to load courses data');
        console.error('Courses loading failed:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...courses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        course?.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        course?.topics?.some(topic => topic?.toLowerCase()?.includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course?.category === selectedCategory);
    }

    // Apply level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course?.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategory, selectedLevel, courses]);

  const formatLevel = (level) => {
    const levels = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    return levels[level] || level;
  };

  const getLevelColor = (level) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (weeks) => {
    if (!weeks) return 'Self-paced';
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  };

  const categories = ['all', ...new Set(courses.map(course => course?.category).filter(Boolean))];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader" size={24} className="animate-spin text-white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Courses</div>
                <div className="text-sm text-muted-foreground">Please wait while we fetch our course catalog...</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Our AI Courses
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Unlock Your AI Potential: A Global Journey from Novice to Expert.
              Dive into our in-depth curriculum, expertly crafted to empower professionals everywhere with the complete spectrum of artificial intelligence knowledge.
            </p>
            
            {/* Call to Action */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="text-lg px-8 py-4 w-full"
                >
                  <Icon name="UserPlus" size={20} className="mr-2" />
                  Start Learning Today
                </Button>
              </Link>
              <Link to="/pricing" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 w-full"
                >
                  <Icon name="CreditCard" size={20} className="mr-2" />
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3">
                <Icon name="AlertCircle" size={24} className="text-red-600 flex-shrink-0" />
                <span className="text-red-600">{error}</span>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Categories</option>
                  {categories.filter(cat => cat !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Levels</option>
                  {levels.filter(level => level !== 'all').map(level => (
                    <option key={level} value={level}>{formatLevel(level)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </span>
              {(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <Icon name="BookOpen" size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-4">No Courses Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all'
                  ? 'Try adjusting your search criteria or clear filters to see all courses.'
                  : 'No courses are currently available. Check back soon for new course offerings!'
                }
              </p>
              {(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all') && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
                >
                  {/* Course Image */}
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={course?.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                        {formatLevel(course.level)}
                      </span>
                      {course.category && (
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {course.category}
                        </span>
                      )}
                    </div>

                    {/* Course Title */}
                    <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Course Description */}
                    <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Metadata */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Icon name="Clock" size={16} />
                          <span>{formatDuration(course.duration_weeks)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Icon name="Users" size={16} />
                          <span>{course.enrollment_count || 0} enrolled</span>
                        </div>
                      </div>

                      {course.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <Icon name="Star" size={16} className="text-warning" />
                          <span className="text-sm font-medium text-foreground">
                            {course.rating?.toFixed?.(1) || '0.0'}
                          </span>
                          <span className="text-sm text-muted-foreground">rating</span>
                        </div>
                      )}
                    </div>

                    {/* Topics */}
                    {course.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {course.topics.slice(0, 3).map((topic, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                          >
                            {topic}
                          </span>
                        ))}
                        {course.topics.length > 3 && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                            +{course.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      className="w-full"
                      onClick={() => navigate('/signup')}
                    >
                      <Icon name="BookOpen" size={16} className="mr-2" />
                      Enroll Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Start Your AI Journey?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our community of 500+ professionals and transform your career with AI skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button 
                    size="lg"
                    className="text-lg px-8 py-4 w-full"
                  >
                    <Icon name="UserPlus" size={20} className="mr-2" />
                    Create Your Account
                  </Button>
                </Link>
                <Link to="/pricing" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="text-lg px-8 py-4 w-full"
                  >
                    <Icon name="CreditCard" size={20} className="mr-2" />
                    View Membership Plans
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;
