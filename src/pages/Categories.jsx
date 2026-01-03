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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage book and product categories</p>
        </div>
        <button 
          onClick={() => navigate(`/categories/add?type=${activeTab}`)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'books'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} />
            Book Categories
          </div>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'products'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package size={18} />
            Product Categories
          </div>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${activeTab} categories...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* Categories List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    activeTab === 'books' ? 'bg-primary-100' : 'bg-orange-100'
                  }`}>
                    <Tag className={activeTab === 'books' ? 'text-primary-600' : 'text-orange-600'} size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    {category._count && (
                      <p className="text-sm text-gray-600">
                        {activeTab === 'books' 
                          ? `${category._count.books || 0} Books`
                          : `${category._count.products || 0} Products`
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button 
                  onClick={() => navigate(`/categories/edit/${activeTab}/${category.id}`)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(category.id, activeTab)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredCategories.length === 0 && (
        <div className="card text-center py-12">
          <Tag className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4">No categories found</p>
        </div>
      )}
    </div>
  );
};

export default Categories;


