import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Plus, Search, Edit, Trash2, Filter, BookOpen, Package } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const Categories = () => {
  const navigate = useNavigate();
  const [bookCategories, setBookCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'products'

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [bookRes, productRes] = await Promise.all([
        api.get('/categories/books'),
        api.get('/categories/products'),
      ]);
      setBookCategories(bookRes.data.data || bookRes.data || []);
      setProductCategories(productRes.data.data || productRes.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type} category?`)) {
      return;
    }

    try {
      await api.delete(`/categories/${type}/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const categories = activeTab === 'books' ? bookCategories : productCategories;
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Categories
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage book and product categories</p>
        </div>
        <button 
          onClick={() => navigate(`/categories/add?type=${activeTab}`)}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="relative glass-card p-2 border border-white/40 shadow-2xl flex gap-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'books'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg scale-105'
              : 'glass text-gray-700 hover:bg-white/80 border border-white/30'
          }`}
        >
          <BookOpen size={18} />
          Book Categories
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg scale-105'
              : 'glass text-gray-700 hover:bg-white/80 border border-white/30'
          }`}
        >
          <Package size={18} />
          Product Categories
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative glass-card p-6 border border-white/40 shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
          <Search className="text-teal-600" size={20} />
          <input
            type="text"
            placeholder={`Search ${activeTab} categories...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent font-medium text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-teal-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`relative p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform ${
                    activeTab === 'books' 
                      ? 'bg-gradient-to-br from-teal-500 to-cyan-500' 
                      : 'bg-gradient-to-br from-orange-500 to-amber-500'
                  }`}>
                    <Tag className="text-white drop-shadow-md" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                    {category._count && (
                      <p className="text-sm font-semibold text-gray-600 mt-1">
                        {activeTab === 'books' 
                          ? `${category._count.books || 0} Books`
                          : `${category._count.products || 0} Products`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-end gap-2 pt-4 border-t border-white/30">
                <button 
                  onClick={() => navigate(`/categories/edit/${activeTab}/${category.id}`)}
                  className="p-2.5 glass rounded-xl text-gray-600 hover:text-teal-600 hover:bg-white/80 transition-all hover:scale-110"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(category.id, activeTab)}
                  className="p-2.5 glass rounded-xl text-gray-600 hover:text-red-600 hover:bg-white/80 transition-all hover:scale-110"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredCategories.length === 0 && (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl text-center">
          <Tag className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4 font-semibold">No categories found</p>
        </div>
      )}
    </div>
  );
};

export default Categories;


