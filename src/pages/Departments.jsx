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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage all departments in the system</p>
        </div>
        <button 
          onClick={() => navigate('/departments/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Department
        </button>
      </motion.div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3">
            <Search className="text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="text-gray-400" size={20} />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="input-field w-auto"
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <GraduationCap className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-600">{dept.college?.name}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <button 
                  onClick={() => navigate(`/departments/edit/${dept.id}`)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(dept.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredDepartments.length === 0 && (
        <div className="card text-center py-12">
          <GraduationCap className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-600 mt-4">No departments found</p>
        </div>
      )}
    </div>
  );
};

export default Departments;


