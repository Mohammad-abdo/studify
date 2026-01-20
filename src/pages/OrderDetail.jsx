import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, ShoppingCart, Package, FileText, Printer, User, Calendar, DollarSign } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      const orderData = response.data.data || response.data;
      setOrder(orderData);
    } catch (error) {
      toast.error('Failed to load order');
      navigate('/orders');
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
    return badges[status] || 'badge-neutral';
  };

  const getOrderTypeIcon = (orderType) => {
    switch (orderType) {
      case 'PRODUCT':
        return <Package size={20} className="text-blue-600" />;
      case 'CONTENT':
        return <FileText size={20} className="text-green-600" />;
      case 'PRINT':
        return <Printer size={20} className="text-purple-600" />;
      default:
        return <ShoppingCart size={20} className="text-gray-600" />;
    }
  };

  if (loading) {
    return <LoadingState message="Loading order..." />;
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order #${order.id.substring(0, 8)}`}
        subtitle="Order Details"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Orders', path: '/orders' },
          { label: `Order #${order.id.substring(0, 8)}` },
        ]}
        backPath="/orders"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Type */}
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getOrderTypeIcon(order.orderType)}
                <div>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="ml-2 badge badge-neutral">
                    {order.orderType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="card-elevated">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.referenceType}: {item.referenceId?.substring(0, 8) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantity: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Info */}
          {order.shippingAddress && (
            <div className="card-elevated">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{order.shippingAddress}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="card-elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={18} />
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">
                  ${(order.total - (order.tax || 0) - (order.shippingCost || 0)).toFixed(2)}
                </span>
              </div>
              {order.tax > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900 font-medium">${order.tax.toFixed(2)}</span>
                </div>
              )}
              {order.shippingCost > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-medium">${order.shippingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">${order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {order.user && (
            <div className="card-elevated">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} />
                Customer
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="text-gray-600">Phone:</span> {order.user.phone || 'N/A'}
                </p>
                <p className="text-gray-900">
                  <span className="text-gray-600">Email:</span> {order.user.email || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Order Dates */}
          <div className="card-elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Dates
            </h3>
            <div className="space-y-2">
              <p className="text-gray-900">
                <span className="text-gray-600">Created:</span>{' '}
                {new Date(order.createdAt).toLocaleString()}
              </p>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <p className="text-gray-900">
                  <span className="text-gray-600">Updated:</span>{' '}
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

