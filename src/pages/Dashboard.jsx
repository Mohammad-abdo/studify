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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 glass-card rounded-3xl blur-xl"></div>
          <div className="relative glass-card p-12 rounded-3xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-gray-600 font-semibold">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card p-8 flex items-center justify-between border border-white/40 shadow-2xl"
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none"></div>
        
        <div className="relative flex items-center gap-6 z-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform">
              <Logo size="default" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-gray-700 mt-1 font-semibold text-lg">Welcome back! Here's an overview of your platform.</p>
          </div>
        </div>
        <div className="relative flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-white/30 shadow-lg z-10">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <Clock size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last updated</p>
            <span className="text-sm font-bold text-gray-800">{new Date().toLocaleTimeString()}</span>
          </div>
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
              className="relative glass-card p-8 glass-hover cursor-pointer group overflow-hidden border border-white/40 shadow-xl"
              onClick={() => stat.link && navigate(stat.link)}
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl"></div>
              </div>
              
              <div className="relative flex items-center justify-between z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:scale-150 transition-transform"></div>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">{stat.title}</p>
                  </div>
                  <p className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform inline-block">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-gray-600 bg-gray-100/50 px-3 py-1.5 rounded-lg inline-block">{stat.subtitle}</p>
                </div>
                <div className={`relative ${stat.color} p-6 rounded-3xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <div className="absolute inset-0 bg-white/30 rounded-3xl blur-sm"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl"></div>
                  <Icon className="text-white relative z-10 drop-shadow-lg" size={36} />
                </div>
              </div>
              
              {/* Shine sweep effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
          className="glass-card p-8 border border-white/40 shadow-2xl relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Orders & Revenue Trend
              </h2>
              <p className="text-sm font-medium text-gray-600">Last 7 days performance</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-4 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-xl">
                <Activity className="text-white drop-shadow-lg" size={28} />
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={orderStats}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                    <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="50%" stopColor="#f97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis dataKey="name" stroke="#64748b" strokeWidth={2} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <YAxis yAxisId="left" stroke="#64748b" strokeWidth={2} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" strokeWidth={2} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{ fontWeight: 700, color: '#1e293b' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                  name="Orders"
                  dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue ($)"
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Types Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8 border border-white/40 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                User Types Distribution
              </h2>
              <p className="text-sm font-medium text-gray-600">Platform user breakdown</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl">
                <Users className="text-white drop-shadow-lg" size={28} />
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={3}
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    padding: '12px 16px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Book Approval Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 border border-white/40 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Book Approval Status
              </h2>
              <p className="text-sm font-medium text-gray-600">Current approval metrics</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl">
                <CheckCircle className="text-white drop-shadow-lg" size={28} />
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={approvalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis dataKey="name" stroke="#64748b" strokeWidth={2} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <YAxis stroke="#64748b" strokeWidth={2} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{ fontWeight: 700, color: '#1e293b' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} strokeWidth={2}>
                  {approvalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 border border-white/40 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                Top Categories
              </h2>
              <p className="text-sm font-medium text-gray-600">Most popular categories</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-xl">
                <Package className="text-white drop-shadow-lg" size={28} />
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categoryStats.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
                <XAxis type="number" stroke="#64748b" strokeWidth={2} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" width={120} stroke="#64748b" strokeWidth={2} tick={{ fill: '#64748b', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    padding: '12px 16px'
                  }}
                  labelStyle={{ fontWeight: 700, color: '#1e293b' }}
                />
                <Bar dataKey="value" radius={[0, 12, 12, 0]} strokeWidth={2}>
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 glass rounded-xl text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
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
                  className="flex items-center justify-between p-5 glass rounded-2xl hover:bg-white/95 transition-all cursor-pointer group border border-white/40 shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-center gap-4 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      <div className="relative p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all">
                        <ShoppingCart className="text-white drop-shadow-md" size={20} />
                      </div>
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 text-sm mb-1">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs font-semibold text-gray-600">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="relative text-right z-10">
                    <p className="font-extrabold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                      ${order.total?.toFixed(2) || '0.00'}
                    </p>
                    <span className={`text-xs px-4 py-1.5 rounded-full font-bold backdrop-blur-sm ${
                      order.status === 'DELIVERED' ? 'bg-green-500/30 text-green-800 border-2 border-green-500/50 shadow-lg' :
                      order.status === 'PENDING' ? 'bg-yellow-500/30 text-yellow-800 border-2 border-yellow-500/50 shadow-lg' :
                      'bg-blue-500/30 text-blue-800 border-2 border-blue-500/50 shadow-lg'
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
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Books</h2>
            <button
              onClick={() => navigate('/books')}
              className="px-4 py-2 glass rounded-xl text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
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
                  className="flex items-center gap-4 p-5 glass rounded-2xl hover:bg-white/95 transition-all cursor-pointer group border border-white/40 shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all">
                      <BookOpen className="text-white drop-shadow-md" size={20} />
                    </div>
                  </div>
                  <div className="relative flex-1 min-w-0 z-10">
                    <p className="font-extrabold text-gray-900 text-sm truncate mb-1">{book.title}</p>
                    <p className="text-xs font-semibold text-gray-600">
                      {book.category?.name || 'No category'} • {book.totalPages || 0} pages
                    </p>
                  </div>
                  <Eye className="text-gray-400 group-hover:text-indigo-600 transition-colors relative z-10" size={18} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8 font-medium">No recent books</p>
            )}
          </div>
        </motion.div>

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
            <button
              onClick={() => navigate('/products')}
              className="px-4 py-2 glass rounded-xl text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-2 transition-all hover:scale-105"
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
                  className="flex items-center gap-4 p-5 glass rounded-2xl hover:bg-white/95 transition-all cursor-pointer group border border-white/40 shadow-lg hover:shadow-xl hover:scale-[1.02] relative overflow-hidden"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all">
                      <Package className="text-white drop-shadow-md" size={20} />
                    </div>
                  </div>
                  <div className="relative flex-1 min-w-0 z-10">
                    <p className="font-extrabold text-gray-900 text-sm truncate mb-1">{product.name}</p>
                    <p className="text-xs font-semibold text-gray-600">
                      {product.category?.name || 'No category'}
                    </p>
                  </div>
                  <Eye className="text-gray-400 group-hover:text-indigo-600 transition-colors relative z-10" size={18} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8 font-medium">No recent products</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
