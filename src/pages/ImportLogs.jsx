import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const ImportLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/import-logs');
      setLogs(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load import logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (success, failed) => {
    if (failed === 0) return <CheckCircle className="text-green-600" size={20} />;
    if (success === 0) return <XCircle className="text-red-600" size={20} />;
    return <Clock className="text-yellow-600" size={20} />;
  };

  const columns = [
    {
      header: 'Type',
      accessor: 'type',
      render: (log) => (
        <div className="flex items-center gap-3">
          <Upload className="text-primary-600" size={20} />
          <span className="font-medium text-gray-900 capitalize">{log.type?.toLowerCase() || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (log) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(log.success || 0, log.failed || 0)}
          <div>
            <div className="text-sm font-medium text-gray-900">
              {log.success || 0} Success, {log.failed || 0} Failed
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'File',
      accessor: 'fileUrl',
      render: (log) => (
        <a
          href={log.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          View File
        </a>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (log) => (
        <span className="text-gray-600">
          {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  const filteredLogs = logs.filter((log) => {
    const type = log.type?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return type.includes(search);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Logs</h1>
          <p className="text-gray-600 mt-1">View import history and logs</p>
        </div>
      </motion.div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search import logs..."
      />
    </div>
  );
};

export default ImportLogs;


