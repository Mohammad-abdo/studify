import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const AddUserRole = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    roleId: '',
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load roles:', error);
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
      await api.post('/user-roles', formData);
      toast.success('Role assigned successfully');
      navigate('/user-roles');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(error.response?.data?.message || 'Failed to assign role');
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
          onClick={() => navigate('/user-roles')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assign Role to User</h1>
          <p className="text-gray-600 mt-1">Assign a role to a user</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User <span className="text-red-500">*</span>
          </label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.phone} ({user.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/user-roles')}
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
                Assigning...
              </>
            ) : (
              <>
                <Save size={18} />
                Assign Role
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserRole;


