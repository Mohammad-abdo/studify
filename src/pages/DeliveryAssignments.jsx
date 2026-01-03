import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Edit, Trash2, Truck } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';

const DeliveryAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-assignments');
      setAssignments(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load delivery assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    try {
      await api.delete(`/delivery-assignments/${id}`);
      toast.success('Assignment deleted successfully');
      fetchAssignments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    }
  };

  const columns = [
    {
      header: 'Delivery',
      accessor: 'delivery',
      render: (assignment) => (
        <div className="flex items-center gap-3">
          <Truck className="text-blue-600" size={20} />
          <span className="font-medium text-gray-900">
            {assignment.delivery?.name || assignment.deliveryId || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Order',
      accessor: 'order',
      render: (assignment) => (
        <span className="text-gray-600">{assignment.orderId || 'N/A'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (assignment) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
          {assignment.status?.toLowerCase() || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (assignment) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/delivery-assignments/edit/${assignment.id}`)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(assignment.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const filteredAssignments = assignments.filter((assignment) => {
    const deliveryName = assignment.delivery?.name?.toLowerCase() || '';
    const orderId = assignment.orderId?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return deliveryName.includes(search) || orderId.includes(search);
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivery Assignments</h1>
          <p className="text-gray-600 mt-1">Manage delivery assignments to orders</p>
        </div>
        <button
          onClick={() => navigate('/delivery-assignments/add')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Assign Delivery
        </button>
      </motion.div>

      <DataTable
        data={filteredAssignments}
        columns={columns}
        loading={loading}
        searchable
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search assignments..."
      />
    </div>
  );
};

export default DeliveryAssignments;


