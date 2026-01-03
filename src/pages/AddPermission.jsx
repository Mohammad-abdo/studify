import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const AddPermission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
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
      await api.post('/permissions', formData);
      toast.success('Permission created successfully');
      navigate('/permissions');
    } catch (error) {
      console.error('Error creating permission:', error);
      toast.error(error.response?.data?.message || 'Failed to create permission');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Add New Permission</h1>
          <p className="text-gray-600 mt-1">Create a new permission key</p>
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
                Creating...
              </>
            ) : (
              <>
                <Save size={18} />
                Create Permission
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPermission;


