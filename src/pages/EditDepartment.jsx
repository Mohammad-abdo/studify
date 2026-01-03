import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    collegeId: '',
  });

  useEffect(() => {
    fetchColleges();
    fetchDepartment();
  }, [id]);

  const fetchColleges = async () => {
    try {
      const response = await api.get('/colleges');
      setColleges(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load colleges');
    }
  };

  const fetchDepartment = async () => {
    try {
      const response = await api.get(`/departments/${id}`);
      const dept = response.data.data || response.data;
      setFormData({
        name: dept.name || '',
        collegeId: dept.collegeId || '',
      });
    } catch (error) {
      toast.error('Failed to load department');
      navigate('/departments');
    } finally {
      setFetching(false);
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
      await api.put(`/departments/${id}`, formData);
      toast.success('Department updated successfully');
      navigate('/departments');
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error(error.response?.data?.message || 'Failed to update department');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Department</h1>
          <p className="text-gray-600 mt-1">Update department information</p>
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
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Update Department
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDepartment;


