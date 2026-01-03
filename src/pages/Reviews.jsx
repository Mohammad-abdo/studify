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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            Reviews
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage all reviews and ratings</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="relative glass-card p-6 border border-white/40 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
            <Search className="text-yellow-600" size={20} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none bg-transparent font-medium text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'BOOK', 'PRODUCT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg scale-105'
                    : 'glass text-gray-700 hover:bg-white/80 border border-white/30'
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
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-yellow-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start gap-4">
                <div className={`relative p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform ${
                  review.targetType === 'BOOK' 
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-500' 
                    : 'bg-gradient-to-br from-orange-500 to-amber-500'
                }`}>
                  {review.targetType === 'BOOK' ? (
                    <BookOpen className="text-white drop-shadow-md" size={24} />
                  ) : (
                    <Package className="text-white drop-shadow-md" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {review.user?.phone || 'Anonymous'}
                        </h3>
                        <span className="px-3 py-1 text-xs font-bold rounded-full backdrop-blur-sm border-2 bg-white/30 text-gray-800 border-white/50">
                          {review.targetType}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm font-semibold text-gray-700">({review.rating}/5)</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-800 mt-2 font-medium">{review.comment}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredReviews.length === 0 && (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl text-center">
          <Star className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4 font-semibold">No reviews found</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;

