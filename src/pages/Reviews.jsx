import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Search, Filter, BookOpen, Package } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'BOOK', 'PRODUCT'

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Note: Reviews endpoint requires targetId and targetType
      // For admin viewing all reviews, we might need a different endpoint
      // For now, this is a placeholder - you may need to create an admin endpoint
      const response = await api.get('/admin/reviews');
      setReviews(response.data.data || response.data || []);
    } catch (error) {
      // Fallback: If admin endpoint doesn't exist, show empty list
      console.error('Failed to load reviews:', error);
      setReviews([]);
      // toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || review.targetType === filterType;
    return matchesSearch && matchesType;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">Manage all reviews and ratings</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'BOOK', 'PRODUCT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  review.targetType === 'BOOK' ? 'bg-primary-100' : 'bg-orange-100'
                }`}>
                  {review.targetType === 'BOOK' ? (
                    <BookOpen className="text-primary-600" size={24} />
                  ) : (
                    <Package className="text-orange-600" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {review.user?.phone || 'Anonymous'}
                        </h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {review.targetType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredReviews.length === 0 && (
        <div className="card text-center py-12">
          <Star className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4">No reviews found</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;

