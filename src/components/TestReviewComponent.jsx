import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';

const TestReviewComponent = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testReviews = async () => {
      try {
        // Test getApprovedReviews
        const { data, error } = await reviewService.getApprovedReviews();
        if (error) {
          throw new Error(error);
        }
        setReviews(data || []);
        console.log('Successfully fetched reviews:', data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    testReviews();
  }, []);

  if (loading) return <div>Loading reviews...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Test Reviews</h2>
      {reviews.length === 0 ? (
        <div>No reviews found</div>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review.id}>
              <div>Rating: {review.rating}/5</div>
              <div>Review: {review.review_text}</div>
              <div>Status: {review.status}</div>
              <div>By: {review?.user?.full_name || 'Anonymous'}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TestReviewComponent;