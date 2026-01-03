import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const Colleges = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this college?')) {
      return;
    }

    try {
      await api.delete(`/colleges/${id}`);
      toast.success('College deleted successfully');
      fetchColleges();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete college');
    }
  };

  const filteredColleges = colleges.filter((college) =>
    college.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Colleges
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage all colleges in the system</p>
        </div>
        <button 
          onClick={() => navigate('/colleges/add')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add College
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="relative glass-card p-6 border border-white/40 shadow-2xl">
        <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
          <Search className="text-blue-600" size={20} />
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent font-medium text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Colleges List */}
      {loading ? (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college, index) => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Building2 className="text-white drop-shadow-md" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{college.name}</h3>
                    {college._count && (
                      <p className="text-sm font-semibold text-gray-600 mt-1">
                        {college._count.departments || 0} Departments
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-end gap-2 pt-4 border-t border-white/30">
                <button 
                  onClick={() => navigate(`/colleges/edit/${college.id}`)}
                  className="p-2.5 glass rounded-xl text-gray-600 hover:text-blue-600 hover:bg-white/80 transition-all hover:scale-110"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(college.id)}
                  className="p-2.5 glass rounded-xl text-gray-600 hover:text-red-600 hover:bg-white/80 transition-all hover:scale-110"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredColleges.length === 0 && (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl text-center">
          <Building2 className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4 font-semibold">No colleges found</p>
        </div>
      )}
    </div>
  );
};

export default Colleges;


