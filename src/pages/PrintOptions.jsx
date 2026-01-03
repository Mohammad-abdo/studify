import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Printer, Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const PrintOptions = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/print-options');
      setOptions(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load print options');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this print option?')) {
      return;
    }
    try {
      await api.delete(`/print-options/${id}`);
      toast.success('Print option deleted successfully');
      fetchOptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete print option');
    }
  };

  const columns = [
    {
      header: 'Book',
      accessor: 'book',
      render: (option) => (
        <div className="flex items-center gap-3">
          <BookOpen className="text-primary-600" size={20} />
          <span className="font-medium text-gray-900">{option.book?.title || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Color Type',
      accessor: 'colorType',
      render: (option) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
          {option.colorType?.toLowerCase() || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Paper Size',
      accessor: 'paperSize',
      render: (option) => (
        <span className="text-gray-600 capitalize">{option.paperSize || 'N/A'}</span>
      ),
    },
    {
      header: 'Price/Page',
      accessor: 'pricePerPage',
      render: (option) => (
        <span className="font-semibold text-gray-900">
          ${option.pricePerPage?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (option) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/print-options/edit/${option.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(option.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredOptions = options.filter((option) => {
    const bookTitle = option.book?.title?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return bookTitle.includes(search);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Print Options</h1>
          <p className="text-gray-600 mt-1">Manage print options for books</p>
        </div>
        <button
          onClick={() => navigate('/print-options/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Option
        </button>
      </motion.div>

      <DataTable
        data={filteredOptions}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search print options..."
      />
    </div>
  );
};

export default PrintOptions;


