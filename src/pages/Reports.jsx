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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Manage system reports</p>
        </div>
        <button
          onClick={() => navigate('/reports/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Report
        </button>
      </motion.div>

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
  );
};

export default Reports;


