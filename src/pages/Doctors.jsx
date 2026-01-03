import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, Plus, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctors');
      setDoctors(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) {
      return;
    }
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="text-green-600" size={18} />;
      case 'REJECTED':
        return <XCircle className="text-red-600" size={18} />;
      default:
        return <Clock className="text-yellow-600" size={18} />;
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classes[status] || classes.PENDING}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      header: 'Doctor',
      accessor: 'name',
      render: (doctor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
            {doctor.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <div>
            <span className="font-medium text-gray-900 block">{doctor.name || 'N/A'}</span>
            <span className="text-sm text-gray-500">{doctor.user?.phone || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Specialization',
      accessor: 'specialization',
      render: (doctor) => (
        <span className="text-gray-600">{doctor.specialization || 'N/A'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'approvalStatus',
      render: (doctor) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(doctor.approvalStatus)}
          {getStatusBadge(doctor.approvalStatus)}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (doctor) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/doctors/edit/${doctor.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit Doctor"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(doctor.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Delete Doctor"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor.name?.toLowerCase() || '';
    const phone = doctor.user?.phone?.toLowerCase() || '';
    const specialization = doctor.specialization?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || phone.includes(search) || specialization.includes(search);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Doctors
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage doctor profiles and approvals</p>
        </div>
        <button
          onClick={() => navigate('/doctors/add')}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Doctor
        </button>
      </motion.div>

      <div className="relative glass-card border border-white/40 shadow-2xl overflow-hidden">
        <DataTable
          data={filteredDoctors}
          columns={columns}
          loading={loading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search doctors..."
        />
      </div>
    </div>
  );
};

export default Doctors;

