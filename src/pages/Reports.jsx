import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileBarChart, Plus, Edit, Trash2, Download } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Reports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports');
      setReports(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  };

  const handleDownload = (fileUrl) => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (report) => (
        <div className="flex items-center gap-3">
          <FileBarChart className="text-blue-600" size={20} />
          <span className="font-medium text-gray-900">{report.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'File',
      accessor: 'fileUrl',
      render: (report) => (
        <button
          onClick={() => handleDownload(report.fileUrl)}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
        >
          <Download size={16} />
          <span className="text-sm">Download</span>
        </button>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (report) => (
        <span className="text-gray-600">
          {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (report) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/reports/edit/${report.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(report.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredReports = reports.filter((report) =>
    report.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            Reports
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage system reports</p>
        </div>
        <button
          onClick={() => navigate('/reports/add')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Report
        </button>
      </motion.div>

      <div className="relative glass-card border border-white/40 shadow-2xl overflow-hidden">
        <DataTable
          data={filteredReports}
          columns={columns}
          loading={loading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search reports..."
        />
      </div>
    </div>
  );
};

export default Reports;


