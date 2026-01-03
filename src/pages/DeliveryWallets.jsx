import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, Plus, Edit, Trash2, Truck, DollarSign } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const DeliveryWallets = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-wallets');
      setWallets(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load delivery wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wallet?')) {
      return;
    }
    try {
      await api.delete(`/delivery-wallets/${id}`);
      toast.success('Wallet deleted successfully');
      fetchWallets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete wallet');
    }
  };

  const columns = [
    {
      header: 'Delivery',
      accessor: 'delivery',
      render: (wallet) => (
        <div className="flex items-center gap-3">
          <Truck className="text-blue-600" size={20} />
          <span className="font-medium text-gray-900">
            {wallet.delivery?.name || wallet.deliveryId || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Balance',
      accessor: 'balance',
      render: (wallet) => (
        <div className="flex items-center gap-2">
          <DollarSign className="text-green-600" size={18} />
          <span className="font-semibold text-gray-900">
            ${wallet.balance?.toFixed(2) || '0.00'}
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (wallet) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/delivery-wallets/edit/${wallet.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(wallet.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredWallets = wallets.filter((wallet) => {
    const deliveryName = wallet.delivery?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return deliveryName.includes(search);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Wallets</h1>
          <p className="text-gray-600 mt-1">Manage delivery wallets and balances</p>
        </div>
        <button
          onClick={() => navigate('/delivery-wallets/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Wallet
        </button>
      </motion.div>

      <DataTable
        data={filteredWallets}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search wallets..."
      />
    </div>
  );
};

export default DeliveryWallets;


