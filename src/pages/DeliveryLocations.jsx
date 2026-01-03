import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plus, Edit, Trash2, Truck } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const DeliveryLocations = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-locations');
      setLocations(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load delivery locations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }
    try {
      await api.delete(`/delivery-locations/${id}`);
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete location');
    }
  };

  const columns = [
    {
      header: 'Delivery',
      accessor: 'delivery',
      render: (location) => (
        <div className="flex items-center gap-3">
          <Truck className="text-blue-600" size={20} />
          <span className="font-medium text-gray-900">
            {location.delivery?.name || location.deliveryId || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: 'address',
      render: (location) => (
        <div className="flex items-center gap-2">
          <MapPin className="text-red-600" size={18} />
          <div>
            <span className="text-gray-900 block">{location.address || 'N/A'}</span>
            {location.latitude && location.longitude && (
              <span className="text-xs text-gray-500">
                {location.latitude}, {location.longitude}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (location) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/delivery-locations/edit/${location.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(location.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredLocations = locations.filter((location) => {
    const address = location.address?.toLowerCase() || '';
    const deliveryName = location.delivery?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return address.includes(search) || deliveryName.includes(search);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Locations</h1>
          <p className="text-gray-600 mt-1">Manage delivery locations and tracking</p>
        </div>
        <button
          onClick={() => navigate('/delivery-locations/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Location
        </button>
      </motion.div>

      <DataTable
        data={filteredLocations}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search locations..."
      />
    </div>
  );
};

export default DeliveryLocations;


