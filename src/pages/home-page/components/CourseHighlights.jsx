import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { courseService } from '../../../services/courseService';

const CourseHighlights = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const { data: coursesData, error: coursesError } = await courseService?.getFeaturedCourses();
        if (coursesError) {
          setError(coursesError);
        } else {
          setCourses(coursesData || []);
        }
      } catch (err) {
        setError('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDuration = (weeks) => weeks === 1 ? '1 week' : `${weeks} weeks`;

  const getLevelVariant = (level) => {
    const levelLower = level?.toLowerCase();
    if (levelLower === 'beginner') return 'default';
    if (levelLower === 'intermediate') return 'secondary';
    if (levelLower === 'advanced') return 'destructive';
    return 'outline';
  };

  const formatLevel = (level) => level?.charAt(0)?.toUpperCase() + level?.slice(1)?.toLowerCase();

  if (loading) {
    return (
      <section className="py-24 lg:py-32 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading amazing courses...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 lg:py-32 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="AlertCircle" size={32} className="text-red-600" />
              </div>
              <CardTitle className="mb-2">Oops! Something went wrong</CardTitle>
              <CardDescription className="mb-6">{error}</CardDescription>
              <Button onClick={() => window.location?.reload()} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 lg:py-36 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge className="mb-6 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-5 py-2.5 text-sm font-bold">
            Featured Courses
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">Start Your AI Journey</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed">Explore our comprehensive AI curriculum</p>
        </div>
        {courses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {courses?.map((course, index) => (
              <Card key={course?.id} className="group hover:shadow-2xl hover:border-emerald-400 hover:-translate-y-2 transition-all duration-300">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
                  <Image src={course?.image_url || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'} alt={course?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <Badge variant={getLevelVariant(course?.level)}>{formatLevel(course?.level)}</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">{course?.title}</CardTitle>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={16} />
                      <span>{formatDuration(course?.duration_weeks)}</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={16} />
                      <span>{course?.enrollment_count || 0} enrolled</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">{course?.description}</CardDescription>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="ghost" size="sm" className="ml-auto text-emerald-600">View Course</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Icon name="BookOpen" size={40} className="text-emerald-600 mx-auto mb-4" />
              <CardTitle className="mb-2">No Featured Courses Yet</CardTitle>
              <CardDescription>Check back soon!</CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default CourseHighlights;
