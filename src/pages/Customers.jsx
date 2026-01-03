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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Manage wholesale customers</p>
        </div>
        <button
          onClick={() => navigate('/customers/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </motion.div>

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
  );
};

export default Customers;

