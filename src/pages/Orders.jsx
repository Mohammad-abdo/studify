import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Package } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      const response = await api.get(`/orders?page=${page}&limit=20`);
      setOrders(response.data.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      CREATED: 'badge-info',
      PAID: 'badge-success',
      PROCESSING: 'badge-warning',
      SHIPPED: 'badge-info',
      DELIVERED: 'badge-success',
      CANCELLED: 'badge-danger',
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-6 border border-white/40 shadow-2xl"
      >
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="text-gray-700 mt-1 font-semibold">View and manage all orders</p>
        </div>
      </motion.div>

      {/* Orders Table */}
      <div className="relative glass-card border border-white/40 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
              <div className="relative">
                <div className="w-16 h-16 border-4 border-pink-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-white/30">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-white/30">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-white/30">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-white/30">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-white/30">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-white/30">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-white/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/20 hover:bg-white/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-900">{order.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.user?.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700 font-semibold">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">${order.total?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full font-bold text-xs backdrop-blur-sm border-2 ${
                        order.status === 'DELIVERED' ? 'bg-green-500/30 text-green-800 border-green-500/50' :
                        order.status === 'PENDING' || order.status === 'CREATED' ? 'bg-yellow-500/30 text-yellow-800 border-yellow-500/50' :
                        order.status === 'CANCELLED' ? 'bg-red-500/30 text-red-800 border-red-500/50' :
                        'bg-blue-500/30 text-blue-800 border-blue-500/50'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button className="p-2.5 glass rounded-xl text-gray-600 hover:text-pink-600 hover:bg-white/80 transition-all hover:scale-110 group-hover:shadow-lg">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;