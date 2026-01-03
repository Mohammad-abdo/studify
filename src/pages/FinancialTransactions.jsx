import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Edit, Trash2, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const FinancialTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/financial-transactions');
      setTransactions(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load financial transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      await api.delete(`/financial-transactions/${id}`);
      toast.success('Transaction deleted successfully');
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const getTransactionIcon = (type) => {
    return type === 'CREDIT' ? (
      <ArrowUpCircle className="text-green-600" size={20} />
    ) : (
      <ArrowDownCircle className="text-red-600" size={20} />
    );
  };

  const columns = [
    {
      header: 'Type',
      accessor: 'type',
      render: (transaction) => (
        <div className="flex items-center gap-2">
          {getTransactionIcon(transaction.type)}
          <span className="font-medium text-gray-900 capitalize">{transaction.type?.toLowerCase() || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (transaction) => (
        <span className={`font-semibold ${
          transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'CREDIT' ? '+' : '-'}${transaction.amount?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (transaction) => (
        <span className="text-gray-600">{transaction.description || 'N/A'}</span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (transaction) => (
        <span className="text-gray-600">
          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (transaction) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/financial-transactions/edit/${transaction.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(transaction.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const description = transaction.description?.toLowerCase() || '';
    const type = transaction.type?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return description.includes(search) || type.includes(search);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Transactions</h1>
          <p className="text-gray-600 mt-1">Manage financial transactions and records</p>
        </div>
        <button
          onClick={() => navigate('/financial-transactions/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Transaction
        </button>
      </motion.div>

      <DataTable
        data={filteredTransactions}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search transactions..."
      />
    </div>
  );
};

export default FinancialTransactions;


