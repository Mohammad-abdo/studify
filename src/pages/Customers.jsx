import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  const columns = [
    {
      header: 'Customer',
      accessor: 'entityName',
      render: (customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
            {customer.entityName?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <span className="font-medium text-gray-900 block">{customer.entityName || 'N/A'}</span>
            <span className="text-sm text-gray-500">{customer.user?.phone || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Person',
      accessor: 'contactPerson',
      render: (customer) => (
        <span className="text-gray-600">{customer.contactPerson || 'N/A'}</span>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (customer) => (
        <span className="text-gray-600">{customer.phone || customer.user?.phone || 'N/A'}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (customer) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/customers/edit/${customer.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit Customer"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(customer.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Delete Customer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredCustomers = customers.filter((customer) => {
    const entityName = customer.entityName?.toLowerCase() || '';
    const contactPerson = customer.contactPerson?.toLowerCase() || '';
    const phone = customer.phone?.toLowerCase() || customer.user?.phone?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return entityName.includes(search) || contactPerson.includes(search) || phone.includes(search);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Customers
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Manage wholesale customers</p>
        </div>
        <button
          onClick={() => navigate('/customers/add')}
          className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </motion.div>

      <div className="relative glass-card border border-white/40 shadow-2xl overflow-hidden">
        <DataTable
          data={filteredCustomers}
          columns={columns}
          loading={loading}
          searchable
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search customers..."
        />
      </div>
    </div>
  );
};

export default Customers;

