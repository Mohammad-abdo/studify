import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const EditStaticPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchPage();
  }, [id]);

  const fetchPage = async () => {
    try {
      const response = await api.get(`/static-pages/${id}`);
      const page = response.data.data || response.data;
      setFormData({
        slug: page.slug || '',
        title: page.title || '',
        content: page.content || '',
      });
    } catch (error) {
      toast.error('Failed to load static page');
      navigate('/static-pages');
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

  const handleSlugChange = (e) => {
    const slug = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({
      ...prev,
      slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/static-pages/${id}`, formData);
      toast.success('Static page updated successfully');
      navigate('/static-pages');
    } catch (error) {
      console.error('Error updating static page:', error);
      toast.error(error.response?.data?.message || 'Failed to update static page');
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
          onClick={() => navigate('/static-pages')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Static Page</h1>
          <p className="text-gray-600 mt-1">Update static page information</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              className="input-field"
              placeholder="about-app, privacy-policy, etc."
              pattern="[a-z0-9-]+"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL-friendly identifier (lowercase letters, numbers, and hyphens only)
            </p>
          </div>

          {/* Title */}
          <div>
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
              placeholder="Enter page title"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="15"
              className="input-field resize-none font-mono text-sm"
              placeholder="Enter page content (HTML supported)"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can use HTML formatting in the content
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/static-pages')}
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
                Update Page
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStaticPage;


