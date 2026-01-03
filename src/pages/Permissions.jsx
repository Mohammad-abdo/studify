import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Permissions = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/permissions');
      setPermissions(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this permission?')) {
      return;
    }
    try {
      await api.delete(`/permissions/${id}`);
      toast.success('Permission deleted successfully');
      fetchPermissions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete permission');
    }
  };

  const columns = [
    {
      header: 'Key',
      accessor: 'key',
      render: (permission) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Key className="text-yellow-600" size={20} />
          </div>
          <span className="font-medium text-gray-900 font-mono text-sm">{permission.key}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (permission) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/permissions/edit/${permission.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(permission.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredPermissions = permissions.filter((permission) =>
    permission.key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permissions</h1>
          <p className="text-gray-600 mt-1">Manage system permissions</p>
        </div>
        <button
          onClick={() => navigate('/permissions/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Permission
        </button>
      </motion.div>

      <DataTable
        data={filteredPermissions}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search permissions..."
      />
    </div>
  );
};

export default Permissions;


