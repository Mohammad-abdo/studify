import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const AddDepartment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    collegeId: '',
  });

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load colleges');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/departments', formData);
      toast.success('Department created successfully');
      navigate('/departments');
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error(error.response?.data?.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center gap-4 border border-white/40 shadow-2xl"
      >
        <button
          onClick={() => navigate('/departments')}
          className="p-3 glass rounded-xl hover:bg-white/80 transition-all hover:scale-105 group"
        >
          <ArrowLeft size={20} className="text-gray-700 group-hover:text-violet-600 transition-colors" />
        </button>
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Add New Department
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Create a new department for your platform</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="relative glass-card p-8 space-y-8 border border-white/40 shadow-2xl">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
            Department Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 glass rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all bg-white/50 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-400"
            placeholder="Enter department name"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
            College <span className="text-red-500">*</span>
          </label>
          <select
            name="collegeId"
            value={formData.collegeId}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 glass rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all bg-white/50 backdrop-blur-sm font-medium text-gray-900"
          >
            <option value="">Select college</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/30">
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="px-6 py-3 glass rounded-xl font-semibold text-gray-700 hover:bg-white/80 transition-all hover:scale-105 border border-white/30"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={20} />
                Create Department
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDepartment;


