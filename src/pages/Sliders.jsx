import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Sliders = () => {
  const navigate = useNavigate();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sliders?limit=100');
      setSliders(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) {
      return;
    }
    try {
      await api.delete(`/sliders/${id}`);
      toast.success('Slider deleted successfully');
      fetchSliders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete slider');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/sliders/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(`Slider ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchSliders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update slider');
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: 'imageUrl',
      render: (slider) => (
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={slider.imageUrl}
            alt={slider.title || 'Slider'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150';
            }}
          />
        </div>
      ),
    },
    {
      header: 'Title',
      accessor: 'title',
      render: (slider) => (
        <span className="font-medium text-gray-900">{slider.title || 'No title'}</span>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (slider) => (
        <span className="text-gray-600 text-sm line-clamp-2">
          {slider.description || 'No description'}
        </span>
      ),
    },
    {
      header: 'Order',
      accessor: 'order',
      render: (slider) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
          {slider.order || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (slider) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          slider.isActive 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {slider.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (slider) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleActive(slider.id, slider.isActive)}
            className={`p-2 rounded-lg transition-colors ${
              slider.isActive
                ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
            }`}
            title={slider.isActive ? 'Deactivate' : 'Activate'}
          >
            {slider.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={() => navigate(`/sliders/edit/${slider.id}`)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(slider.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredSliders = sliders.filter((slider) => {
    const title = slider.title?.toLowerCase() || '';
    const description = slider.description?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return title.includes(search) || description.includes(search);
  });

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
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Sliders
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage homepage banners and sliders</p>
        </div>
        <button
          onClick={() => navigate('/sliders/add')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Slider
        </button>
      </motion.div>

      <div className="relative glass-card border border-white/40 shadow-2xl overflow-hidden">
        <DataTable
          data={filteredSliders}
          columns={columns}
          loading={loading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search sliders..."
        />
      </div>
    </div>
  );
};

export default Sliders;


