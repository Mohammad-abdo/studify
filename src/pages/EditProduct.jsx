import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    imageUrls: [],
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      const product = response.data.data || response.data;
      setFormData({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        imageUrls: product.imageUrls || [],
      });
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/products');
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        ...(formData.imageUrls.length > 0 && { imageUrls: formData.imageUrls }),
      };
      await api.put(`/products/${id}`, payload);
      toast.success('Product updated successfully');
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update product information</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter product name"
            />
          </div>

          {/* Product Images */}
          <div className="md:col-span-2">
            <ImageUpload
              value={formData.imageUrls}
              onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: Array.isArray(urls) ? urls : [urls] }))}
              label="Product Images"
              multiple={true}
              maxImages={5}
            />
          </div>

          {/* Category */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="input-field resize-none"
              placeholder="Enter product description"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;

