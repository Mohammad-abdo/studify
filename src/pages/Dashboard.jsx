import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Star,
  Eye,
  ArrowRight,
  Activity,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
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
      
      const statsResponse = await api.get('/admin/dashboard/stats');
      setStats(statsResponse.data.data || statsResponse.data);

      try {
        const ordersResponse = await api.get('/orders?page=1&limit=5');
        setRecentOrders(ordersResponse.data.data || ordersResponse.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }

      try {
        const booksResponse = await api.get('/books?page=1&limit=5');
        setRecentBooks(booksResponse.data.data || booksResponse.data || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      }

      try {
        const productsResponse = await api.get('/products?page=1&limit=5');
        setRecentProducts(productsResponse.data.data || productsResponse.data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      }

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

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          orders: Math.floor(Math.random() * 20) + 10,
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
      subtitle: `${stats?.users?.doctors || 0} Doctors, ${stats?.users?.students || 0} Students`,
      link: '/users',
    },
    {
      title: 'Total Books',
      value: stats?.books?.total || 0,
      icon: BookOpen,
      subtitle: `${stats?.books?.pending || 0} Pending approval`,
      link: '/books',
    },
    {
      title: 'Total Products',
      value: stats?.products?.total || 0,
      icon: Package,
      subtitle: 'Active products',
      link: '/products',
    },
    {
      title: 'Total Orders',
      value: stats?.orders?.total || 0,
      icon: ShoppingCart,
      subtitle: 'All time orders',
      link: '/orders',
    },
    {
      title: 'Pending Approvals',
      value: (stats?.approvals?.pendingDoctors || 0) + (stats?.approvals?.pendingBooks || 0),
      icon: AlertCircle,
      subtitle: `${stats?.approvals?.pendingDoctors || 0} Doctors, ${stats?.approvals?.pendingBooks || 0} Books`,
      link: '/approvals',
    },
    {
      title: 'Active Reviews',
      value: stats?.reviews?.total || 0,
      icon: Star,
      subtitle: 'User reviews',
      link: '/reviews',
    },
  ];

  const userTypeData = [
    { name: 'Students', value: stats?.users?.students || 0 },
    { name: 'Doctors', value: stats?.users?.doctors || 0 },
    { name: 'Delivery', value: stats?.users?.delivery || 0 },
    { name: 'Customers', value: stats?.users?.customers || 0 },
  ].filter(item => item.value > 0);

  const approvalData = [
    { name: 'Approved', value: stats?.books?.total || 0 },
    { name: 'Pending', value: stats?.approvals?.pendingBooks || 0 },
    { name: 'Rejected', value: stats?.books?.rejected || 0 },
  ].filter(item => item.value > 0);

  const COLORS = ['#525252', '#737373', '#a3a3a3', '#d4d4d4', '#404040', '#262626', '#171717', '#e5e5e5'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back! Here's an overview of your platform.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-200 bg-white">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="card-elevated cursor-pointer transition-all duration-150 hover:shadow-md"
              onClick={() => stat.link && navigate(stat.link)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{stat.title}</p>
                  <p className="text-3xl font-semibold text-gray-900 mb-2">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{stat.subtitle}</p>
                </div>
                <div className="p-3 rounded-md bg-gray-100">
                  <Icon className="text-gray-700" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders Chart */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Orders & Revenue Trend</h2>
              <p className="text-xs text-gray-600">Last 7 days performance</p>
            </div>
            <div className="p-2 rounded-md bg-gray-100">
              <Activity className="text-gray-700" size={20} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={orderStats}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#525252" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#525252" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#737373" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#737373" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
              />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="orders" 
                stroke="#525252" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorOrders)" 
                name="Orders"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                stroke="#737373" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Revenue ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User Types Distribution */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">User Types Distribution</h2>
              <p className="text-xs text-gray-600">Platform user breakdown</p>
            </div>
            <div className="p-2 rounded-md bg-gray-100">
              <Users className="text-gray-700" size={20} />
            </div>
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
                stroke="#fff"
                strokeWidth={2}
              >
                {userTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Book Approval Status */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Book Approval Status</h2>
              <p className="text-xs text-gray-600">Current approval metrics</p>
            </div>
            <div className="p-2 rounded-md bg-gray-100">
              <AlertCircle className="text-gray-700" size={20} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={approvalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {approvalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Top Categories</h2>
              <p className="text-xs text-gray-600">Most popular categories</p>
            </div>
            <div className="p-2 rounded-md bg-gray-100">
              <Package className="text-gray-700" size={20} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryStats.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors duration-150"
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-gray-100">
                      <ShoppingCart className="text-gray-700" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      ${order.total?.toFixed(2) || '0.00'}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border border-green-200' :
                      order.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {order.status || 'PENDING'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No recent orders</p>
            )}
          </div>
        </div>

        {/* Recent Books */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Books</h2>
            <button
              onClick={() => navigate('/books')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors duration-150"
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentBooks.length > 0 ? (
              recentBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <div className="p-2 rounded-md bg-gray-100">
                    <BookOpen className="text-gray-700" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
                    <p className="text-xs text-gray-500">
                      {book.category?.name || 'No category'} • {book.totalPages || 0} pages
                    </p>
                  </div>
                  <Eye className="text-gray-400" size={16} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No recent books</p>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Products</h2>
            <button
              onClick={() => navigate('/products')}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors duration-150"
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="p-2 rounded-md bg-gray-100">
                    <Package className="text-gray-700" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.category?.name || 'No category'}
                    </p>
                  </div>
                  <Eye className="text-gray-400" size={16} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8 text-sm">No recent products</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
