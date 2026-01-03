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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Colleges</h1>
          <p className="text-gray-600 mt-1">Manage all colleges in the system</p>
        </div>
        <button 
          onClick={() => navigate('/colleges/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add College
        </button>
      </motion.div>

      {/* Search Bar */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* Colleges List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college, index) => (
            <motion.div
              key={college.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{college.name}</h3>
                    {college._count && (
                      <p className="text-sm text-gray-600">
                        {college._count.departments || 0} Departments
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button 
                  onClick={() => navigate(`/colleges/edit/${college.id}`)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(college.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredColleges.length === 0 && (
        <div className="card text-center py-12">
          <Building2 className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4">No colleges found</p>
        </div>
      )}
    </div>
  );
};

export default Colleges;


