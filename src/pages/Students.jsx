import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, Edit, Trash2, Eye } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students');
      setStudents(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const columns = [
    {
      header: 'Student',
      accessor: 'name',
      render: (student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
            {student.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <span className="font-medium text-gray-900 block">{student.name || 'N/A'}</span>
            <span className="text-sm text-gray-500">{student.user?.phone || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'College',
      accessor: 'college',
      render: (student) => (
        <span className="text-gray-600">{student.college?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      render: (student) => (
        <span className="text-gray-600">{student.department?.name || 'N/A'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (student) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/students/${student.id}`)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => navigate(`/students/edit/${student.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(student.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredStudents = students.filter((student) => {
    const name = student.name?.toLowerCase() || '';
    const phone = student.user?.phone?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student profiles</p>
        </div>
        <button
          onClick={() => navigate('/students/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Student
        </button>
      </motion.div>

      <DataTable
        data={filteredStudents}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search students..."
      />
    </div>
  );
};

export default Students;

