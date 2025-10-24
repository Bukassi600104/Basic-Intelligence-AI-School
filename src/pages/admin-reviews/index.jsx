import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { reviewService } from '../../services/reviewService';

const AdminReviews = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    averageRating: 0
  });

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (userProfile?.role !== 'admin') {
      navigate('/student-dashboard');
      return;
    }
  }, [user, userProfile, navigate]);

  // Load reviews and stats
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      try {
        const { data: reviewsData, error: reviewsError } = await reviewService.getAllReviews();
        if (!reviewsError && reviewsData) {
          setReviews(reviewsData);
          
          // Calculate stats
          const total = reviewsData.length;
          const pending = reviewsData.filter(r => r.status === 'pending').length;
          const approved = reviewsData.filter(r => r.status === 'approved').length;
          const rejected = reviewsData.filter(r => r.status === 'rejected').length;
          const averageRating = reviewsData.length > 0 
            ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length 
            : 0;

          setStats({
            total,
            pending,
            approved,
            rejected,
            averageRating: averageRating.toFixed(1)
          });
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile?.role === 'admin') {
      loadReviews();
    }
  }, [userProfile]);

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    return review.status === filter;
  });

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const { data, error } = await reviewService.updateReviewStatus(reviewId, newStatus);
      if (!error && data) {
        // Update local state
        setReviews(prev => prev.map(review => 
          review.id === reviewId ? { ...review, status: newStatus } : review
        ));
        
        // Update stats
        setStats(prev => {
          const newStats = { ...prev };
          if (data.status === 'approved') {
            newStats.approved++;
            newStats.pending--;
          } else if (data.status === 'rejected') {
            newStats.rejected++;
            newStats.pending--;
          }
          return newStats;
        });

        setShowReviewModal(false);
        alert(`Review ${newStatus} successfully!`);
      } else {
        alert('Failed to update review status: ' + error);
      }
    } catch (error) {
      alert('Failed to update review status: ' + error.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await reviewService.deleteReview(reviewId);
      if (!error) {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          [selectedReview?.status]: prev[selectedReview?.status] - 1
        }));
        setShowReviewModal(false);
        alert('Review deleted successfully!');
      } else {
        alert('Failed to delete review: ' + error);
      }
    } catch (error) {
      alert('Failed to delete review: ' + error.message);
    }
  };

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      case 'rejected':
        return 'XCircle';
      default:
        return 'HelpCircle';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
          <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Loader" size={24} className="animate-spin text-white" />
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Loading Reviews</div>
                <div className="text-sm text-muted-foreground">Please wait while we fetch all reviews...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Review Management</h1>
              <p className="text-muted-foreground">
                Manage and moderate student reviews for the platform
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button 
                variant="outline"
                onClick={() => navigate('/admin-dashboard')}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    {stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon name="MessageSquare" size={24} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    {stats.pending}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Icon name="Clock" size={24} className="text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    {stats.approved}
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Icon name="CheckCircle" size={24} className="text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    {stats.rejected}
                  </div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Icon name="XCircle" size={24} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                    {stats.averageRating}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Icon name="Star" size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All Reviews ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'approved'
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Approved ({stats.approved})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                Rejected ({stats.rejected})
              </button>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="MessageSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Reviews Found</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'No reviews have been submitted yet.' 
                    : `No ${filter} reviews found.`
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Rating</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Review</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReviews.map((review) => (
                      <tr key={review.id} className="hover:bg-muted/25 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <Icon name="User" size={16} className="text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {review.user_name || 'Anonymous'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {review.user_email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Icon 
                                key={i}
                                name="Star" 
                                size={16} 
                                className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                              />
                            ))}
                            <span className="text-sm text-muted-foreground ml-2">
                              ({review.rating}/5)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-foreground line-clamp-2">
                              {review.review_text}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                            <Icon name={getStatusIcon(review.status)} size={12} className="mr-1" />
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReviewModal(review)}
                            >
                              <Icon name="Eye" size={14} className="mr-1" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Review Details</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Reviewer Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Icon name="User" size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedReview.user_name || 'Anonymous Student'}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedReview.user_email || 'No email provided'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(selectedReview.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-2">Rating</h4>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon 
                      key={i}
                      name="Star" 
                      size={24} 
                      className={i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                    />
                  ))}
                  <span className="text-lg font-medium text-foreground ml-2">
                    ({selectedReview.rating}/5)
                  </span>
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-2">Review</h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground leading-relaxed">
                    "{selectedReview.review_text}"
                  </p>
                </div>
              </div>

              {/* Current Status */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-foreground mb-2">Current Status</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReview.status)}`}>
                  <Icon name={getStatusIcon(selectedReview.status)} size={16} className="mr-2" />
                  {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-border">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex flex-wrap gap-2">
                  {selectedReview.status !== 'approved' && (
                    <Button
                      onClick={() => handleStatusChange(selectedReview.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Icon name="CheckCircle" size={16} className="mr-2" />
                      Approve
                    </Button>
                  )}
                  {selectedReview.status !== 'rejected' && (
                    <Button
                      onClick={() => handleStatusChange(selectedReview.id, 'rejected')}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <Icon name="XCircle" size={16} className="mr-2" />
                      Reject
                    </Button>
                  )}
                  {selectedReview.status === 'pending' && (
                    <Button
                      onClick={() => handleStatusChange(selectedReview.id, 'pending')}
                      variant="outline"
                    >
                      <Icon name="Clock" size={16} className="mr-2" />
                      Keep Pending
                    </Button>
                  )}
                </div>
                
                <Button
                  onClick={() => handleDeleteReview(selectedReview.id)}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
