import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Package, Tag, DollarSign, Calendar } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data || response.data;
      // Parse imageUrls if it's a string
      if (productData.imageUrls && typeof productData.imageUrls === 'string') {
        productData.imageUrls = JSON.parse(productData.imageUrls);
      }
      setProduct(productData);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  const images = Array.isArray(product.imageUrls) ? product.imageUrls : [];

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
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">Product Details</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/products/edit/${product.id}`)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit size={18} />
          Edit Product
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
                      src={img.startsWith('http') ? img : `${api.defaults.baseURL.replace('/api', '')}${img}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f97316&color=fff&size=200`;
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
              <Package className="text-primary-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Pricing */}
          {product.pricing && product.pricing.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Tiers</h2>
              <div className="space-y-3">
                {product.pricing.map((price, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">
                        Min. Quantity: {price.minQuantity}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-primary-600">${price.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 text-sm font-medium">
                            {review.user?.phone?.[0] || 'U'}
                          </span>
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
          {/* Information Card */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Tag className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium text-gray-900">{product.category?.name || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-gray-500">Created At</div>
                  <div className="font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price Tiers</span>
                <span className="font-semibold text-gray-900">
                  {product.pricing?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Reviews</span>
                <span className="font-semibold text-gray-900">
                  {product.reviews?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Images</span>
                <span className="font-semibold text-gray-900">
                  {images.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

