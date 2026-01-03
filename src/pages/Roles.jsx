import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Roles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      setRoles(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (role) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Shield className="text-primary-600" size={20} />
          </div>
          <span className="font-medium text-gray-900">{role.name}</span>
        </div>
      ),
    },
    {
      header: 'Permissions',
      accessor: 'permissions',
      render: (role) => (
        <span className="text-gray-600">
          {role.permissions?.length || 0} permissions
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (role) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/roles/edit/${role.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(role.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredRoles = roles.filter((role) =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Roles
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => navigate('/roles/add')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Role
        </button>
      </motion.div>

      <div className="relative glass-card border border-white/40 shadow-2xl overflow-hidden">
        <DataTable
          data={filteredRoles}
          columns={columns}
          loading={loading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search roles..."
        />
      </div>
    </div>
  );
};

export default Roles;


