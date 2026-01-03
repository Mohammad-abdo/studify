import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCog, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const UserRoles = () => {
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user-roles');
      setUserRoles(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user role assignment?')) {
      return;
    }
    try {
      await api.delete(`/user-roles/${id}`);
      toast.success('User role deleted successfully');
      fetchUserRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user role');
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'user',
      render: (userRole) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserCog className="text-blue-600" size={20} />
          </div>
          <div>
            <span className="font-medium text-gray-900 block">
              {userRole.user?.phone || 'N/A'}
            </span>
            <span className="text-sm text-gray-500 capitalize">
              {userRole.user?.type?.toLowerCase() || 'N/A'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (userRole) => (
        <span className="font-medium text-gray-900">
          {userRole.role?.name || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (userRole) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/user-roles/edit/${userRole.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(userRole.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredUserRoles = userRoles.filter((userRole) => {
    const userPhone = userRole.user?.phone?.toLowerCase() || '';
    const roleName = userRole.role?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return userPhone.includes(search) || roleName.includes(search);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            User Roles
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage role assignments to users</p>
        </div>
        <button
          onClick={() => navigate('/user-roles/add')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Assign Role
        </button>
      </motion.div>

      <div className="relative glass-card border border-white/40 shadow-2xl overflow-hidden">
        <DataTable
          data={filteredUserRoles}
          columns={columns}
          loading={loading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search user roles..."
        />
      </div>
    </div>
  );
};

export default UserRoles;


