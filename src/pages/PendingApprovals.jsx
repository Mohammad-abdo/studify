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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            Pending Approvals
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">Review and approve pending items</p>
        </div>
      </motion.div>

      {/* Type Tabs */}
      <div className="relative glass-card p-4 border border-white/40 shadow-2xl">
        <div className="flex gap-4">
          <button
            onClick={() => setType('DOCTOR')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              type === 'DOCTOR'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                : 'glass text-gray-700 hover:bg-white/80 border border-white/30'
            }`}
          >
            <UserCheck size={20} />
            Doctors ({items.length})
          </button>
          <button
            onClick={() => setType('BOOK')}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              type === 'BOOK'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg scale-105'
                : 'glass text-gray-700 hover:bg-white/80 border border-white/30'
            }`}
          >
            <BookOpen size={20} />
            Books ({items.length})
          </button>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
            <div className="relative">
              <div className="w-16 h-16 border-4 border-yellow-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="relative glass-card p-12 border border-white/40 shadow-2xl text-center">
          <p className="text-gray-600 font-semibold text-lg">No pending {type.toLowerCase()}s found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative glass-card p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                {type === 'DOCTOR' ? (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{item.user?.name || item.name}</h3>
                        <p className="text-sm font-semibold text-gray-600 mt-1">{item.specialization}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">{item.user?.phone}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm font-semibold text-gray-600 mb-2">{item.category?.name}</p>
                    <p className="text-xs font-medium text-gray-500 mb-2">By: {item.doctor?.user?.name}</p>
                    <p className="text-sm font-medium text-gray-700 mt-2 line-clamp-2">{item.description}</p>
                  </>
                )}
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/30">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;

