import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx';
import CourseFilters from './components/CourseFilters';
import CourseTable from './components/CourseTable';
import CourseForm from './components/CourseForm';
import BulkActions from './components/BulkActions';
import { courseService } from '../../services/courseService';


const AdminCoursesPage = () => {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    level: 'all',
    instructor: 'all'
  });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Check admin access
  useEffect(() => {
    if (userProfile && userProfile?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [userProfile, navigate]);

  // Load courses
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    setError('');

    try {
      // Get all courses (not just published ones for admin)
      const { data: coursesData, error: coursesError } = await courseService?.getAllCourses();
      
      if (coursesError) {
        setError(coursesError);
      } else {
        setCourses(coursesData || []);
        setFilteredCourses(coursesData || []);
      }
    } catch (err) {
      setError('Failed to load courses data');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters) => {
    let filtered = [...courses];

    // Apply search filter
    if (currentFilters?.search) {
      const searchTerm = currentFilters?.search?.toLowerCase();
      filtered = filtered?.filter(course => 
        course?.title?.toLowerCase()?.includes(searchTerm) ||
        course?.description?.toLowerCase()?.includes(searchTerm) ||
        course?.topics?.some(topic => topic?.toLowerCase()?.includes(searchTerm))
      );
    }

    // Apply status filter
    if (currentFilters?.status !== 'all') {
      filtered = filtered?.filter(course => course?.status === currentFilters?.status);
    }

    // Apply level filter
    if (currentFilters?.level !== 'all') {
      filtered = filtered?.filter(course => course?.level === currentFilters?.level);
    }

    // Apply instructor filter
    if (currentFilters?.instructor !== 'all') {
      filtered = filtered?.filter(course => course?.instructor_id === currentFilters?.instructor);
    }

    // Apply sorting
    if (sortConfig?.key) {
      filtered?.sort((a, b) => {
        let aValue = a?.[sortConfig?.key];
        let bValue = b?.[sortConfig?.key];

        // Handle null values
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return sortConfig?.direction === 'asc' ? 1 : -1;
        if (bValue === null) return sortConfig?.direction === 'asc' ? -1 : 1;

        // Handle date sorting
        if (sortConfig?.key === 'created_at' || sortConfig?.key === 'updated_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        // Handle string sorting
        if (typeof aValue === 'string') {
          aValue = aValue?.toLowerCase();
          bValue = bValue?.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig?.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig?.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredCourses(filtered);
    setSelectedCourses([]); // Clear selection when filters change
  };

  const handleSort = (newSortConfig) => {
    setSortConfig(newSortConfig);
    applyFilters(filters);
  };

  const handleSelectCourse = (courseId, isSelected) => {
    if (isSelected) {
      setSelectedCourses(prev => [...prev, courseId]);
    } else {
      setSelectedCourses(prev => prev?.filter(id => id !== courseId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedCourses(filteredCourses?.map(course => course?.id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleCreateCourse = async (courseData) => {
    setActionLoading(true);
    try {
      const { data, error } = await courseService?.createCourse({
        ...courseData,
        instructor_id: user?.id
      });

      if (error) {
        setError(error);
        return false;
      }

      await loadCourses();
      return true;
    } catch (err) {
      setError('Failed to create course');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCourse = async (courseId, courseData) => {
    setActionLoading(true);
    try {
      const { error } = await courseService?.updateCourse(courseId, courseData);

      if (error) {
        setError(error);
        return false;
      }

      await loadCourses();
      return true;
    } catch (err) {
      setError('Failed to update course');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleCourseAction = async (action, course) => {
    setActionLoading(true);

    try {
      switch (action) {
        case 'edit':
          setEditingCourse(course);
          break;
          
        case 'publish':
          const { error: publishError } = await courseService?.updateCourse(course?.id, { 
            status: 'published' 
          });
          if (publishError) {
            setError('Failed to publish course: ' + publishError);
          } else {
            await loadCourses();
          }
          break;
          
        case 'unpublish':
          const { error: unpublishError } = await courseService?.updateCourse(course?.id, { 
            status: 'draft' 
          });
          if (unpublishError) {
            setError('Failed to unpublish course: ' + unpublishError);
          } else {
            await loadCourses();
          }
          break;
          
        case 'feature':
          const { error: featureError } = await courseService?.updateCourse(course?.id, { 
            is_featured: !course?.is_featured 
          });
          if (featureError) {
            setError('Failed to toggle featured status: ' + featureError);
          } else {
            await loadCourses();
          }
          break;
          
        case 'archive':
          const { error: archiveError } = await courseService?.updateCourse(course?.id, { 
            status: 'archived' 
          });
          if (archiveError) {
            setError('Failed to archive course: ' + archiveError);
          } else {
            await loadCourses();
          }
          break;
          
        case 'delete':
          if (window?.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            const { error: deleteError } = await courseService?.deleteCourse(course?.id);
            if (deleteError) {
              setError('Failed to delete course: ' + deleteError);
            } else {
              await loadCourses();
            }
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      setError('Action failed: ' + error?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCourses?.length === 0) return;

    setActionLoading(true);

    try {
      switch (action) {
        case 'publish':
          for (const courseId of selectedCourses) {
            await courseService?.updateCourse(courseId, { status: 'published' });
          }
          break;
          
        case 'unpublish':
          for (const courseId of selectedCourses) {
            await courseService?.updateCourse(courseId, { status: 'draft' });
          }
          break;
          
        case 'feature':
          for (const courseId of selectedCourses) {
            await courseService?.updateCourse(courseId, { is_featured: true });
          }
          break;
          
        case 'unfeature':
          for (const courseId of selectedCourses) {
            await courseService?.updateCourse(courseId, { is_featured: false });
          }
          break;
          
        case 'archive':
          for (const courseId of selectedCourses) {
            await courseService?.updateCourse(courseId, { status: 'archived' });
          }
          break;
          
        case 'delete':
          if (window?.confirm(`Are you sure you want to delete ${selectedCourses?.length} courses? This action cannot be undone.`)) {
            for (const courseId of selectedCourses) {
              await courseService?.deleteCourse(courseId);
            }
          }
          break;
          
        default:
          break;
      }

      await loadCourses();
      setSelectedCourses([]);
    } catch (error) {
      setError('Bulk action failed: ' + error?.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadCourses();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 transition-all duration-300 lg:ml-60">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 transition-all duration-300 lg:ml-60">
          <div className="p-6 lg:p-8 pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Icon name="AlertCircle" size={32} className="mx-auto text-red-500 mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleRefresh}>Try Again</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 flex">
      <AdminSidebar />
      <div className="flex-1 transition-all duration-300 lg:ml-60">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {/* Page Header - Enhanced */}
          <div className="relative overflow-hidden rounded-3xl mb-8 animate-fadeIn">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <Icon name="BookOpen" size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Course Management</h1>
                  </div>
                  <p className="text-white/90 ml-15">
                    Create, edit, and manage educational content and course materials
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={handleRefresh}
                    loading={loading}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                  >
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg"
                  >
                    <Icon name="Plus" size={16} className="mr-2" />
                    Create Course
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Icon name="AlertCircle" size={16} className="text-red-600 mr-2" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Stats Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Courses</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{courses?.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="BookOpen" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {courses?.filter(c => c?.status === 'published')?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="CheckCircle" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-amber-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Draft</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {courses?.filter(c => c?.status === 'draft')?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="Edit" size={28} className="text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-xl transition-all hover:-translate-y-1 animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Featured</p>
                  <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {courses?.filter(c => c?.is_featured)?.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="Star" size={28} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Course Filters */}
          <CourseFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onFilterChange={handleFiltersChange}
            onClearFilters={() => {
              const defaultFilters = {
                search: '',
                status: 'all',
                level: 'all',
                instructor: 'all'
              };
              setFilters(defaultFilters);
              applyFilters(defaultFilters);
            }}
            totalCourses={courses?.length}
            filteredCourses={filteredCourses?.length}
          />

          {/* Bulk Actions */}
          {selectedCourses?.length > 0 && (
            <BulkActions
              selectedCount={selectedCourses?.length}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedCourses([])}
              loading={actionLoading}
            />
          )}

          {/* Course Table */}
          <div className="bg-card border border-border rounded-lg">
            <CourseTable
              courses={filteredCourses}
              selectedCourses={selectedCourses}
              onSelectCourse={handleSelectCourse}
              onSelectAll={handleSelectAll}
              onSort={handleSort}
              sortConfig={sortConfig}
              sortField={sortConfig?.key}
              sortDirection={sortConfig?.direction}
              onCourseAction={handleCourseAction}
              onEdit={(course) => setEditingCourse(course)}
              onDuplicate={(course) => console.log('Duplicate course:', course?.id)}
              onDelete={(course) => handleCourseAction('delete', course)}
              onToggleStatus={(course) => {
                const newStatus = course?.status === 'published' ? 'draft' : 'published';
                const action = newStatus === 'published' ? 'publish' : 'unpublish';
                handleCourseAction(action, course);
              }}
              loading={actionLoading}
            />
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <CourseForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCourse}
          title="Create New Course"
        />
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <CourseForm
          isOpen={!!editingCourse}
          onClose={() => setEditingCourse(null)}
          onSubmit={(data) => handleUpdateCourse(editingCourse?.id, data)}
          course={editingCourse}
          title="Edit Course"
        />
      )}
    </div>
  );
};

export default AdminCoursesPage;