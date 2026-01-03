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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => navigate('/roles/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Role
        </button>
      </motion.div>

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
  );
};

export default Roles;


