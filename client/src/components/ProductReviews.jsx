import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaUser, FaCalendarAlt, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const ProductReviews = ({ productId }) => {
  const { getReviews, addReview } = useShop();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  // Fetch reviews on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        // Use the full server URL instead of relative path
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews`);
        
        if (!response.ok) {
          // Handle 404 or other error status
          console.warn(`Reviews API endpoint returned ${response.status}. Using empty reviews.`);
          setReviews([]);
          return;
        }
        
        const text = await response.text();
        
        try {
          // Try to parse the response as JSON
          const data = JSON.parse(text);
          console.log('Fetched reviews:', data);
          
          // Format the reviews data
          const formattedReviews = data.map(review => ({
            id: review._id,
            userId: review.user?._id || review.userId,
            username: review.user?.name || review.username || 'Anonymous',
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            date: new Date(review.createdAt || review.date).toISOString().split('T')[0]
          }));
          
          setReviews(formattedReviews);
        } catch (parseError) {
          // If parsing fails, log it and set empty reviews
          console.error('Error parsing reviews response:', parseError);
          console.error('Response content:', text.substring(0, 100) + '...');
          setReviews([]);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Use empty array if fetch fails
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to submit a review');
      return;
    }
    
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast.error('Please provide both title and comment for your review');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Please login to submit a review');
        setIsSubmitting(false);
        return;
      }
      
      // Use the full server URL instead of relative path
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to submit review: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, use the error text (truncated if too long)
          if (errorText.length > 100) {
            errorMessage = `${errorText.substring(0, 100)}...`;
          } else {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Review submitted:', data);
      
      // After successful API submission, refresh reviews
      const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        const formattedReviews = refreshedData.map(review => ({
          id: review._id,
          userId: review.user?._id || review.userId,
          username: review.user?.name || review.username || 'Anonymous',
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          date: new Date(review.createdAt || review.date).toISOString().split('T')[0]
        }));
        setReviews(formattedReviews);
      } else {
        // If refresh fails, add the new review locally with server-provided ID if available
        const formattedNewReview = {
          id: data.reviewId || Date.now().toString(),
          userId: user.id,
          username: user.name,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
          date: new Date().toISOString().split('T')[0]
        };
        
        setReviews([...reviews, formattedNewReview]);
      }
      
      // Reset form and hide it
      setNewReview({ rating: 5, title: '', comment: '' });
      setShowAddReview(false);
      toast.success('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!user) {
      toast.error('Please login to delete your review');
      return;
    }
    
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      setIsDeletingReview(true);
      
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('Please login to delete your review');
          setIsDeletingReview(false);
          return;
        }
        
        // Make DELETE request to API
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${productId}/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Failed to delete review: ${response.status}`;
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            if (errorText.length > 100) {
              errorMessage = `${errorText.substring(0, 100)}...`;
            } else {
              errorMessage = errorText;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        // Update UI by removing the deleted review
        setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
        toast.success('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error(error.message || 'Failed to delete review');
      } finally {
        setIsDeletingReview(false);
      }
    }
  };

  const handleRatingChange = (newRating) => {
    setNewReview({ ...newReview, rating: newRating });
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    reviews.forEach(review => {
      distribution[review.rating] += 1;
    });
    return distribution;
  };

  const userCanDeleteReview = (reviewUserId) => {
    if (!user) return false;
    return user.id === reviewUserId || user.role === 'admin';
  };

  const distribution = getRatingDistribution();
  const averageRating = calculateAverageRating();

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-primary/20 dark:border-primary/10 shadow-primary/5 p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
        Customer Reviews
        <span className="ml-auto text-sm text-gray-600 dark:text-gray-400 font-normal">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Review summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            {/* Average rating */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {averageRating}
              </div>
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Rating distribution */}
            <div className="col-span-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center mb-2">
                  <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ 
                          width: `${reviews.length > 0 ? (distribution[rating] / reviews.length) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-8 text-sm text-gray-600 dark:text-gray-400 text-right">
                    {distribution[rating]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add review button */}
          <div className="mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddReview(!showAddReview)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:bg-primary transition-all duration-300"
            >
              <FaPencilAlt className="h-4 w-4" />
              <span>{showAddReview ? 'Cancel Review' : 'Write a Review'}</span>
            </motion.button>
          </div>

          {/* Add review form */}
          <AnimatePresence>
            {showAddReview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <form onSubmit={handleSubmitReview} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Share Your Experience
                  </h3>
                  
                  {/* Rating selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(star)}
                          className="focus:outline-none mr-1"
                        >
                          <FaStar
                            className={`h-8 w-8 ${
                              star <= newReview.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            } hover:text-yellow-400 transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Review title */}
                  <div className="mb-4">
                    <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Review Title
                    </label>
                    <input
                      type="text"
                      id="review-title"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                      placeholder="Summarize your experience"
                      required
                    />
                  </div>
                  
                  {/* Review comment */}
                  <div className="mb-6">
                    <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Review
                    </label>
                    <textarea
                      id="review-comment"
                      rows="4"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
                      placeholder="Tell others about your experience with this product"
                      required
                    />
                  </div>
                  
                  {/* Submit button */}
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl hover:from-primary-dark hover:to-primary transition-all duration-300 shadow-lg hover:shadow-primary/25 disabled:opacity-70"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reviews list */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No reviews yet. Be the first to share your experience!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {review.title}
                    </h3>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <FaUser className="h-3 w-3 mr-1" />
                        <span>{review.username}</span>
                      </div>
                      <div className="flex items-center">
                        <FaCalendarAlt className="h-3 w-3 mr-1" />
                        <span>{review.date}</span>
                      </div>
                    </div>
                    
                    {userCanDeleteReview(review.userId) && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isDeletingReview}
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete review"
                      >
                        <FaTrash className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductReviews; 