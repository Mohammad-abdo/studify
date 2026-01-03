import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const Departments = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');

  useEffect(() => {
    fetchColleges();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [selectedCollege]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load colleges');
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const url = selectedCollege 
        ? `/departments?collegeId=${selectedCollege}`
        : '/departments';
      const response = await api.get(url);
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
            Departments
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage all departments in the system</p>
        </div>
        <button 
          onClick={() => navigate('/departments/add')}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Department
        </button>
      </motion.div>

      {/* Filters */}
      <div className="relative glass-card p-6 border border-white/40 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
            <Search className="text-violet-600" size={20} />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none bg-transparent font-medium text-gray-900 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
            <Filter className="text-violet-600" size={20} />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="flex-1 outline-none bg-transparent font-medium text-gray-900"
            >
              <option value="">All Colleges</option>
              {colleges.map((college) => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Departments List */}
      {loading ? (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative p-4 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <GraduationCap className="text-white drop-shadow-md" size={24} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{dept.name}</h3>
                    <p className="text-sm font-semibold text-gray-600 mt-1">{dept.college?.name}</p>
                  </div>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-end gap-2 pt-4 border-t border-white/30">
                <button 
                  onClick={() => navigate(`/departments/edit/${dept.id}`)}
                  className="p-2.5 glass rounded-xl text-gray-600 hover:text-violet-600 hover:bg-white/80 transition-all hover:scale-110"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(dept.id)}
                  className="p-2.5 glass rounded-xl text-gray-600 hover:text-red-600 hover:bg-white/80 transition-all hover:scale-110"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredDepartments.length === 0 && (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl text-center">
          <GraduationCap className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4 font-semibold">No departments found</p>
        </div>
      )}
    </div>
  );
};

export default Departments;


