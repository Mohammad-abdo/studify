import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Search, Edit, Trash2, GripVertical } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/onboarding');
      setItems(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load onboarding items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this onboarding item?')) {
      return;
    }

    try {
      await api.delete(`/onboarding/${id}`);
      toast.success('Onboarding item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete onboarding item');
    }
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-600 mt-1">Manage onboarding screens</p>
        </div>
        <button 
          onClick={() => navigate('/onboarding/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Onboarding Item
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search onboarding items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Image */}
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-gray-400" size={20} />
                      <span className="text-sm font-medium text-gray-500">Order: {item.order}</span>
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/onboarding/edit/${item.id}`)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="card text-center py-12">
          <ArrowRight className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4">No onboarding items found</p>
        </div>
      )}
    </div>
  );
};

export default Onboarding;


