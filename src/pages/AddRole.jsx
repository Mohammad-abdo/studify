import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Shield } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const AddRole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    permissionIds: [],
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/roles', formData);
      toast.success('Role created successfully');
      navigate('/roles');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error.response?.data?.message || 'Failed to create role');
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
          onClick={() => navigate('/roles')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Role</h1>
          <p className="text-gray-600 mt-1">Create a new role with permissions</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Enter role name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Permissions
          </label>
          <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
            {permissions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No permissions available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions.map((permission) => (
                  <label
                    key={permission.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-200"
                  >
                    <input
                      type="checkbox"
                      checked={formData.permissionIds.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <Shield className="text-primary-600" size={18} />
                    <span className="text-sm font-mono text-gray-700">{permission.key}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/roles')}
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
                Create Role
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRole;


