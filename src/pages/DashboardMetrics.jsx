import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const DashboardMetrics = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard-metrics');
      setMetrics(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm('Are you sure you want to delete this metric?')) {
      return;
    }
    try {
      await api.delete(`/dashboard-metrics/${key}`);
      toast.success('Metric deleted successfully');
      fetchMetrics();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete metric');
    }
  };

  const columns = [
    {
      header: 'Key',
      accessor: 'key',
      render: (metric) => (
        <div className="flex items-center gap-3">
          <BarChart3 className="text-primary-600" size={20} />
          <span className="font-medium text-gray-900 font-mono text-sm">{metric.key || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Value',
      accessor: 'value',
      render: (metric) => (
        <span className="text-gray-600">{String(metric.value || 'N/A')}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'updatedAt',
      render: (metric) => (
        <span className="text-gray-600">
          {metric.updatedAt ? new Date(metric.updatedAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (metric) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/dashboard-metrics/edit/${metric.key}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(metric.key)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredMetrics = metrics.filter((metric) =>
    metric.key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Metrics</h1>
          <p className="text-gray-600 mt-1">Manage dashboard metrics and statistics</p>
        </div>
        <button
          onClick={() => navigate('/dashboard-metrics/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Metric
        </button>
      </motion.div>

      <DataTable
        data={filteredMetrics}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search metrics..."
      />
    </div>
  );
};

export default DashboardMetrics;


