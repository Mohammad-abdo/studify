import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, UserX } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || user.type === filterType;
    return matchesSearch && matchesType;
  });

  const userTypes = ['ALL', 'STUDENT', 'DOCTOR', 'DELIVERY', 'CUSTOMER', 'ADMIN'];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {userTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                  {user.phone?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.phone}</h3>
                  <p className="text-sm text-gray-600">{user.type}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <UserCheck size={18} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <UserX size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersPage;