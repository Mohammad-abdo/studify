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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Users
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage system users</p>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="relative glass-card p-6 border border-white/40 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
            <Search className="text-indigo-600" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none bg-transparent font-medium text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {userTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                  filterType === type
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'glass text-gray-700 hover:bg-white/80 border border-white/30'
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
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {user.phone?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{user.phone}</h3>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{user.type}</p>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/30">
                <span className={`px-4 py-1.5 rounded-full font-bold text-xs backdrop-blur-sm ${
                  user.isActive 
                    ? 'bg-green-500/30 text-green-800 border-2 border-green-500/50' 
                    : 'bg-red-500/30 text-red-800 border-2 border-red-500/50'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 glass rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-white/80 transition-all hover:scale-110">
                    <UserCheck size={18} />
                  </button>
                  <button className="p-2.5 glass rounded-lg text-gray-600 hover:text-red-600 hover:bg-white/80 transition-all hover:scale-110">
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