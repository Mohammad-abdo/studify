import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Edit, Trash2, Package } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const ProductPricing = () => {
  const navigate = useNavigate();
  const [pricings, setPricings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPricings();
  }, []);

  const fetchPricings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/product-pricing');
      setPricings(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load product pricing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pricing?')) {
      return;
    }
    try {
      await api.delete(`/product-pricing/${id}`);
      toast.success('Product pricing deleted successfully');
      fetchPricings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product pricing');
    }
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'product',
      render: (pricing) => (
        <div className="flex items-center gap-3">
          <Package className="text-orange-600" size={20} />
          <span className="font-medium text-gray-900">{pricing.product?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Min Quantity',
      accessor: 'minQuantity',
      render: (pricing) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          {pricing.minQuantity || 0}
        </span>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (pricing) => (
        <span className="font-semibold text-gray-900">${pricing.price?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (pricing) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/product-pricing/edit/${pricing.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(pricing.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredPricings = pricings.filter((pricing) => {
    const productName = pricing.product?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return productName.includes(search);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Pricing</h1>
          <p className="text-gray-600 mt-1">Manage wholesale product pricing</p>
        </div>
        <button
          onClick={() => navigate('/product-pricing/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Pricing
        </button>
      </motion.div>

      <DataTable
        data={filteredPricings}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search product pricing..."
      />
    </div>
  );
};

export default ProductPricing;


