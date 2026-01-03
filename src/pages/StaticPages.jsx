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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent">
            Static Pages
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage static content pages</p>
        </div>
        <button 
          onClick={() => navigate('/static-pages/add')}
          className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Page
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="relative glass-card p-6 border border-white/40 shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
          <Search className="text-slate-600" size={20} />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent font-medium text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-slate-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-500 rounded-lg shadow-lg">
                      <FileText className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{page.title}</h3>
                      <p className="text-sm font-semibold text-gray-500">/{page.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/static-pages/edit/${page.id}`)}
                      className="p-2.5 glass rounded-xl text-gray-600 hover:text-slate-600 hover:bg-white/80 transition-all hover:scale-110"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(page.id)}
                      className="p-2.5 glass rounded-xl text-gray-600 hover:text-red-600 hover:bg-white/80 transition-all hover:scale-110"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 text-sm font-medium line-clamp-3 mb-2">
                  {page.content}
                </p>
                <p className="text-xs font-semibold text-gray-500">
                  Updated: {new Date(page.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredPages.length === 0 && (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl text-center">
          <FileText className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4 font-semibold">No static pages found</p>
        </div>
      )}
    </div>
  );
};

export default StaticPages;


