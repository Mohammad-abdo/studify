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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => navigate('/departments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Department</h1>
          <p className="text-gray-600 mt-1">Create a new department</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="Enter department name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            College <span className="text-red-500">*</span>
          </label>
          <select
            name="collegeId"
            value={formData.collegeId}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select college</option>
            {colleges.map((college) => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={18} />
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


