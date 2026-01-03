import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const EditPermission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    key: '',
  });

  useEffect(() => {
    fetchPermission();
  }, [id]);

  const fetchPermission = async () => {
    try {
      const response = await api.get(`/permissions/${id}`);
      const permission = response.data.data || response.data;
      setFormData({
        key: permission.key || '',
      });
    } catch (error) {
      toast.error('Failed to load permission');
      navigate('/permissions');
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
      await api.put(`/permissions/${id}`, formData);
      toast.success('Permission updated successfully');
      navigate('/permissions');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error(error.response?.data?.message || 'Failed to update permission');
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
          onClick={() => navigate('/permissions')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Permission</h1>
          <p className="text-gray-600 mt-1">Update permission key</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Permission Key <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="key"
            value={formData.key}
            onChange={handleChange}
            required
            className="input-field font-mono"
            placeholder="e.g., users.create, books.delete"
          />
          <p className="text-sm text-gray-500 mt-1">
            Use dot notation (e.g., module.action)
          </p>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/permissions')}
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
                Update Permission
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPermission;


