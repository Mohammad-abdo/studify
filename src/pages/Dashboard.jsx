import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  GraduationCap,
  Stethoscope,
  Truck,
  Briefcase,
  Star,
  Eye,
  ArrowRight,
  Activity,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Logo from '../components/Logo';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await api.get('/admin/dashboard/stats');
      setStats(statsResponse.data.data || statsResponse.data);

      // Fetch recent orders
      try {
        const ordersResponse = await api.get('/orders?page=1&limit=5');
        setRecentOrders(ordersResponse.data.data || ordersResponse.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }

      // Fetch recent books
      try {
        const booksResponse = await api.get('/books?page=1&limit=5');
        setRecentBooks(booksResponse.data.data || booksResponse.data || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      }

      // Fetch recent products
      try {
        const productsResponse = await api.get('/products?page=1&limit=5');
        setRecentProducts(productsResponse.data.data || productsResponse.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }

      // Fetch category stats
      try {
        const [bookCategories, productCategories] = await Promise.all([
          api.get('/categories/books'),
          api.get('/categories/products'),
        ]);
        
        const bookCats = bookCategories.data.data || bookCategories.data || [];
        const productCats = productCategories.data.data || productCategories.data || [];
        
        const categoryData = [
          ...bookCats.map(cat => ({ name: cat.name, value: cat._count?.books || 0, type: 'Book' })),
          ...productCats.map(cat => ({ name: cat.name, value: cat._count?.products || 0, type: 'Product' })),
        ].slice(0, 8);
        
        setCategoryStats(categoryData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      // Generate order stats for last 7 days (sample data structure)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          orders: Math.floor(Math.random() * 20) + 10, // Sample data - replace with real API
          revenue: Math.floor(Math.random() * 5000) + 2000,
        });
      }
      setOrderStats(last7Days);

    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: `${stats?.users?.doctors || 0} Doctors, ${stats?.users?.students || 0} Students`,
      link: '/users',
    },
    {
      title: 'Total Books',
      value: stats?.books?.total || 0,
      icon: BookOpen,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      subtitle: `${stats?.books?.pending || 0} Pending approval`,
      link: '/books',
    },
    {
      title: 'Total Products',
      value: stats?.products?.total || 0,
      icon: Package,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      subtitle: 'Active products',
      link: '/products',
    },
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingCart,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      subtitle: 'All time orders',
      link: '/orders',
    },
    {
      title: 'Pending Approvals',
      value: (stats?.approvals?.pendingDoctors || 0) + (stats?.approvals?.pendingBooks || 0),
      icon: AlertCircle,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      subtitle: `${stats?.approvals?.pendingDoctors || 0} Doctors, ${stats?.approvals?.pendingBooks || 0} Books`,
      link: '/approvals',
    },
    {
      title: 'Active Reviews',
      value: stats?.reviews?.total || 0,
      icon: Star,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: 'User reviews',
      link: '/reviews',
    },
  ];

  const userTypeData = [
    { name: 'Students', value: stats?.users?.students || 0, color: '#8b5cf6' },
    { name: 'Doctors', value: stats?.users?.doctors || 0, color: '#10b981' },
    { name: 'Delivery', value: stats?.users?.delivery || 0, color: '#3b82f6' },
    { name: 'Customers', value: stats?.users?.customers || 0, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  const approvalData = [
    { name: 'Approved', value: stats?.books?.total || 0, color: '#10b981' },
    { name: 'Pending', value: stats?.approvals?.pendingBooks || 0, color: '#f59e0b' },
    { name: 'Rejected', value: stats?.books?.rejected || 0, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const COLORS = ['#14b8a6', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black rounded-xl shadow-lg">
            <Logo size="default" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your platform.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => stat.link && navigate(stat.link)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-lg`}>
                  <Icon className="text-white" size={28} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Orders & Revenue Trend</h2>
            <Activity className="text-primary-600" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={orderStats}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="orders" 
                stroke="#14b8a6" 
                fillOpacity={1} 
                fill="url(#colorOrders)" 
                name="Orders"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                stroke="#f97316" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Revenue ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Types Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">User Types Distribution</h2>
            <Users className="text-primary-600" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Book Approval Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Book Approval Status</h2>
            <CheckCircle className="text-primary-600" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={approvalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {approvalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Top Categories</h2>
            <Package className="text-primary-600" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryStats.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="text-primary-600" size={18} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.total?.toFixed(2) || '0.00'}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent orders</p>
            )}
          </div>
        </motion.div>

        {/* Recent Books */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Books</h2>
            <button
              onClick={() => navigate('/books')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {recentBooks.length > 0 ? (
              recentBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <BookOpen className="text-teal-600" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{book.title}</p>
                    <p className="text-xs text-gray-500">
                      {book.category?.name || 'No category'} • {book.totalPages || 0} pages
                    </p>
                  </div>
                  <Eye className="text-gray-400" size={16} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent books</p>
            )}
          </div>
        </motion.div>

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Products</h2>
            <button
              onClick={() => navigate('/products')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {recentProducts.length > 0 ? (
              recentProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <Package className="text-orange-600" size={18} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.category?.name || 'No category'}
                    </p>
                  </div>
                  <Eye className="text-gray-400" size={16} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent products</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
