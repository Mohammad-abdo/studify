import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, BookOpen, User, Building, Tag, FileText, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books/${id}`);
      const bookData = response.data.data || response.data;
      // Parse imageUrls if it's a string
      if (bookData.imageUrls && typeof bookData.imageUrls === 'string') {
        bookData.imageUrls = JSON.parse(bookData.imageUrls);
      }
      setBook(bookData);
    } catch (error) {
      toast.error('Failed to load book');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'PENDING':
        return <Clock className="text-yellow-600" size={20} />;
      case 'REJECTED':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Book not found</p>
      </div>
    );
  }

  const images = Array.isArray(book.imageUrls) ? book.imageUrls : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/books')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-gray-600 mt-1">Book Details</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/books/edit/${book.id}`)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit size={18} />
          Edit Book
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {images.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={img}
                      alt={`${book.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(book.title)}&background=4f46e5&color=fff&size=200`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-primary-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{book.description}</p>
          </div>

          {/* Pricing */}
          {book.pricing && book.pricing.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-3">
                {book.pricing.map((price, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{price.accessType}</span>
                    </div>
                    <span className="text-lg font-semibold text-primary-600">${price.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {book.reviews && book.reviews.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
              <div className="space-y-4">
                {book.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="text-primary-600" size={16} />
                        </div>
                        <span className="font-medium text-gray-900">{review.user?.phone || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(book.approvalStatus)}
              <h2 className="text-xl font-semibold text-gray-900">Status</h2>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(book.approvalStatus)}`}>
              <span className="font-medium">{book.approvalStatus}</span>
            </div>
          </div>

          {/* Information Card */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Tag className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium text-gray-900">{book.category?.name || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Doctor</div>
                  <div className="font-medium text-gray-900">{book.doctor?.user?.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">College / Department</div>
                  <div className="font-medium text-gray-900">
                    {book.college?.name || '—'}
                    {book.department && ` / ${book.department.name}`}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Total Pages</div>
                  <div className="font-medium text-gray-900">{book.totalPages || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Created At</div>
                  <div className="font-medium text-gray-900">
                    {new Date(book.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* File URL */}
          {book.fileUrl && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">File</h2>
              <a
                href={book.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline break-all"
              >
                {book.fileUrl}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;


