import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

const EditOnboarding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    order: 0,
  });

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/onboarding/${id}`);
      const item = response.data.data || response.data;
      setFormData({
        imageUrl: item.imageUrl || '',
        title: item.title || '',
        description: item.description || '',
        order: item.order || 0,
      });
    } catch (error) {
      toast.error('Failed to load onboarding item');
      navigate('/onboarding');
    } finally {
      setFetching(false);
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
        imageUrl: formData.imageUrl,
        title: formData.title,
        description: formData.description,
        order: parseInt(formData.order) || 0,
      };

      await api.put(`/onboarding/${id}`, payload);
      toast.success('Onboarding item updated successfully');
      navigate('/onboarding');
    } catch (error) {
      console.error('Error updating onboarding item:', error);
      toast.error(error.response?.data?.message || 'Failed to update onboarding item');
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
          onClick={() => navigate('/onboarding')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Onboarding Item</h1>
          <p className="text-gray-600 mt-1">Update onboarding screen information</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="md:col-span-2">
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              label="Onboarding Image"
              multiple={false}
            />
          </div>

          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter onboarding title"
            />
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
              placeholder="Enter onboarding description"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="input-field"
              placeholder="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              Display order (lower numbers appear first)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
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
                Update Onboarding Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditOnboarding;


