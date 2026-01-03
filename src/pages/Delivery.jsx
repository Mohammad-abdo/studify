import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Plus, Edit, Trash2, Eye } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Delivery = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      // Fetch all users and filter by DELIVERY type
      const response = await api.get('/admin/users');
      const allUsers = response.data.data || response.data || [];
      const deliveryUsers = allUsers.filter(user => user.type === 'DELIVERY');
      
      // Transform to match expected structure
      const deliveriesData = deliveryUsers.map(user => ({
        id: user.id,
        userId: user.id,
        name: user.delivery?.name || user.phone,
        user: user,
        vehicleType: user.delivery?.vehicleType || 'N/A',
        isAvailable: user.delivery?.isAvailable ?? true,
      }));
      
      setDeliveries(deliveriesData);
    } catch (error) {
      toast.error('Failed to load delivery users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery user?')) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Delivery user deleted successfully');
      fetchDeliveries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete delivery user');
    }
  };

  const columns = [
    {
      header: 'Delivery',
      accessor: 'name',
      render: (delivery) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {delivery.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <div>
            <span className="font-medium text-gray-900 block">{delivery.name || 'N/A'}</span>
            <span className="text-sm text-gray-500">{delivery.user?.phone || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Vehicle Type',
      accessor: 'vehicleType',
      render: (delivery) => (
        <span className="text-gray-600 capitalize">{delivery.vehicleType || 'N/A'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'isAvailable',
      render: (delivery) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          delivery.isAvailable
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {delivery.isAvailable ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (delivery) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/users/${delivery.userId}`)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => navigate(`/users/edit/${delivery.userId}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(delivery.userId)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredDeliveries = deliveries.filter((delivery) => {
    const name = delivery.name?.toLowerCase() || '';
    const phone = delivery.user?.phone?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Delivery Users
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage delivery user profiles</p>
        </div>
      </motion.div>

      <div className="relative glass-card border border-white/40 shadow-2xl overflow-hidden">
        <DataTable
          data={filteredDeliveries}
          columns={columns}
          loading={loading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search delivery users..."
        />
      </div>
    </div>
  );
};

export default Delivery;


