import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const StaticPages = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/static-pages');
      setPages(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load static pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) {
      return;
    }

    try {
      await api.delete(`/static-pages/${id}`);
      toast.success('Static page deleted successfully');
      fetchPages();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete static page');
    }
  };

  const filteredPages = pages.filter((page) =>
    page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Static Pages</h1>
          <p className="text-gray-600 mt-1">Manage static content pages</p>
        </div>
        <button 
          onClick={() => navigate('/static-pages/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Page
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="text-primary-600" size={20} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                    <p className="text-sm text-gray-500">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/static-pages/edit/${page.id}`)}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(page.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3">
                {page.content}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Updated: {new Date(page.updatedAt).toLocaleDateString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredPages.length === 0 && (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4">No static pages found</p>
        </div>
      )}
    </div>
  );
};

export default StaticPages;


