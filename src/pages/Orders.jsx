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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">View and manage all orders</p>
        </div>
      </motion.div>

      {/* Orders Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="font-mono text-xs">{order.id.substring(0, 8)}...</td>
                  <td>{order.user?.phone || 'N/A'}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td className="font-semibold">${order.total?.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;