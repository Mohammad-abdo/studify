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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Roles</h1>
          <p className="text-gray-600 mt-1">Manage role assignments to users</p>
        </div>
        <button
          onClick={() => navigate('/user-roles/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Assign Role
        </button>
      </motion.div>

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
  );
};

export default UserRoles;


