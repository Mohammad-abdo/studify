import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, BookOpen, Check, X } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const PendingApprovals = () => {
  const [type, setType] = useState('DOCTOR');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, [type]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/approvals?type=${type}`);
      setItems(response.data.data);
    } catch (error) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const endpoint = type === 'DOCTOR' ? `/admin/doctors/${id}/approve` : `/admin/books/${id}/approve`;
      await api.post(endpoint);
      toast.success(`${type} approved successfully`);
      fetchApprovals();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      const endpoint = type === 'DOCTOR' ? `/admin/doctors/${id}/reject` : `/admin/books/${id}/reject`;
      await api.post(endpoint);
      toast.success(`${type} rejected successfully`);
      fetchApprovals();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve pending items</p>
        </div>
      </motion.div>

      {/* Type Tabs */}
      <div className="card">
        <div className="flex gap-4">
          <button
            onClick={() => setType('DOCTOR')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              type === 'DOCTOR'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <UserCheck size={20} className="inline mr-2" />
            Doctors ({items.length})
          </button>
          <button
            onClick={() => setType('BOOK')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              type === 'BOOK'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen size={20} className="inline mr-2" />
            Books ({items.length})
          </button>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No pending {type.toLowerCase()}s found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              {type === 'DOCTOR' ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.user?.name || item.name}</h3>
                      <p className="text-sm text-gray-600">{item.specialization}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.user?.phone}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.category?.name}</p>
                  <p className="text-xs text-gray-500">By: {item.doctor?.user?.name}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                </>
              )}
              
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="flex-1 btn-danger flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;

