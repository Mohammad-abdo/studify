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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
            Onboarding
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage onboarding screens</p>
        </div>
        <button 
          onClick={() => navigate('/onboarding/add')}
          className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Onboarding Item
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="relative glass-card p-6 border border-white/40 shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
          <Search className="text-rose-600" size={20} />
          <input
            type="text"
            placeholder="Search onboarding items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent font-medium text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-rose-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start gap-4">
                {/* Image */}
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
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
                      <GripVertical className="text-rose-600" size={20} />
                      <span className="text-sm font-bold text-gray-600 px-3 py-1 glass rounded-lg border border-white/30">Order: {item.order}</span>
                      <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/onboarding/edit/${item.id}`)}
                        className="p-2.5 glass rounded-xl text-gray-600 hover:text-rose-600 hover:bg-white/80 transition-all hover:scale-110"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2.5 glass rounded-xl text-gray-600 hover:text-red-600 hover:bg-white/80 transition-all hover:scale-110"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl text-center">
          <ArrowRight className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4 font-semibold">No onboarding items found</p>
        </div>
      )}
    </div>
  );
};

export default Onboarding;


