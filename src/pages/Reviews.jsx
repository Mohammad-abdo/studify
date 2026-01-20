import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

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
      const response = await api.get('/admin/reviews');
      setReviews(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || review.targetType === filterType;
    return matchesSearch && matchesType;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  const columns = [
    {
      header: 'User',
      accessor: 'user.phone',
      render: (review) => review.user?.phone || 'Anonymous',
    },
    {
      header: 'Type',
      accessor: 'targetType',
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (review) => (
        <div className="flex items-center gap-1">
          {renderStars(review.rating)}
          <span className="ml-1 text-xs text-gray-600">({review.rating}/5)</span>
        </div>
      ),
    },
    {
      header: 'Comment',
      accessor: 'comment',
      hideOnMobile: true,
      render: (review) =>
        review.comment?.length > 80
          ? review.comment.slice(0, 80) + '...'
          : review.comment || '—',
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (review) => new Date(review.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        subtitle="Manage all reviews and ratings"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Reviews' },
        ]}
      />

      {/* Filters */}
      <div className="card-elevated">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'BOOK', 'PRODUCT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium border ${
                  filterType === type
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-blue-200 hover:bg-blue-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {(searchTerm || filterType !== 'ALL') && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="badge badge-info flex items-center gap-1">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {filterType !== 'ALL' && (
              <span className="badge badge-info flex items-center gap-1">
                Type: {filterType}
                <button
                  onClick={() => setFilterType('ALL')}
                  className="ml-1 hover:text-blue-800"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading reviews..." />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <DataTable
          data={filteredReviews}
          columns={columns}
          loading={false}
          searchable={false}
        />
      )}
    </div>
  );
};

export default Reviews;

