import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

const AddOnboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    order: 0,
  });

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

      await api.post('/onboarding', payload);
      toast.success('Onboarding item created successfully');
      navigate('/onboarding');
    } catch (error) {
      console.error('Error creating onboarding item:', error);
      toast.error(error.response?.data?.message || 'Failed to create onboarding item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center gap-4 border border-white/40 shadow-2xl"
      >
        <button
          onClick={() => navigate('/onboarding')}
          className="p-3 glass rounded-xl hover:bg-white/80 transition-all hover:scale-105 group"
        >
          <ArrowLeft size={20} className="text-gray-700 group-hover:text-rose-600 transition-colors" />
        </button>
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
            Add Onboarding Item
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Create a new onboarding screen</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="relative glass-card p-8 space-y-8 border border-white/40 shadow-2xl">
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
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 glass rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all bg-white/50 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-400"
              placeholder="Enter onboarding title"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-5 py-3 glass rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all bg-white/50 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-400 resize-none"
              placeholder="Enter onboarding description"
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="w-full px-5 py-3 glass rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all bg-white/50 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-400"
              placeholder="0"
            />
            <p className="text-sm font-medium text-gray-600 mt-2 px-2">
              Display order (lower numbers appear first)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/30">
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="px-6 py-3 glass rounded-xl font-semibold text-gray-700 hover:bg-white/80 transition-all hover:scale-105 border border-white/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={20} />
                Create Onboarding Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddOnboarding;


