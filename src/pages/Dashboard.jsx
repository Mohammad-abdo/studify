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
  ArrowLeft,
  Activity,
  Building2,
  GraduationCap,
  Truck,
  Store,
  ShoppingBag,
  Image,
  FileText,
  ChevronRight,
  Plus,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [orderStats, setOrderStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, booksRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/orders?page=1&limit=6'),
        api.get('/books?page=1&limit=6'),
      ]);

      setStats(statsRes.data?.data ?? null);
      setRecentOrders(Array.isArray(ordersRes.data?.data) ? ordersRes.data.data : []);
      setRecentBooks(Array.isArray(booksRes.data?.data) ? booksRes.data.data : []);

      // Mock chart data for high-end look
      const days = isRTL ? ['الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setOrderStats(days.map(day => ({
        name: day,
        revenue: Math.floor(Math.random() * 5000) + 2000,
        orders: Math.floor(Math.random() * 50) + 20,
      })));

    } catch (error) {
      if (error.response?.status === 429) {
        toast.error(isRTL ? 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.' : 'Too many requests. Please try again later.');
      } else {
        console.error(error);
        toast.error(isRTL ? 'فشل تحميل بيانات لوحة التحكم' : 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const mainStats = [
    { title: t('dashboard.revenue'), value: `$${(stats?.revenue?.total ?? 0).toLocaleString()}`, growth: '+12%', icon: DollarSign, color: 'emerald' },
    { title: t('dashboard.newOrders'), value: stats?.orders?.total ?? 0, growth: '+5%', icon: ShoppingBag, color: 'blue' },
    { title: t('dashboard.activeStudents'), value: stats?.users?.students ?? 0, growth: '+18%', icon: Users, color: 'violet' },
    { title: t('dashboard.totalBooks'), value: stats?.books?.total ?? 0, growth: '+2%', icon: BookOpen, color: 'amber' },
  ];
  const pendingPaymentCount = stats?.orders?.pendingPayment ?? 0;

  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
    violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600',
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 2xl:space-y-8">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <span className="text-blue-600 font-black uppercase tracking-widest text-[10px] mb-1 block">{t('dashboard.enterpriseOverview')}</span>
          <h1 className="text-3xl 2xl:text-4xl font-black text-slate-900 tracking-tight">{t('dashboard.systemAnalytics')}</h1>
          <p className="text-slate-500 font-medium mt-1 max-w-xl leading-relaxed text-sm 2xl:text-base">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/books')} className="btn-modern-secondary">{t('dashboard.manageContent')}</button>
          <button onClick={() => navigate('/orders')} className="btn-modern-primary">
            <Plus size={18} />
            {t('dashboard.newReport')}
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4 2xl:gap-6">
        {mainStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card-premium p-6 2xl:p-8 group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl transition-all duration-300 ${colorClasses[stat.color]} group-hover:text-white`}>
                  <Icon size={22} className="2xl:w-7 2xl:h-7" />
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{stat.growth}</span>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl 2xl:text-3xl font-black text-slate-900">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Analytical Visuals */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 2xl:gap-8">
        <div className="xl:col-span-2 card-premium p-8 2xl:p-10 bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg 2xl:text-xl font-black text-slate-900 tracking-tight">{t('dashboard.growthProjection')}</h3>
              <p className="text-slate-400 text-xs 2xl:text-sm font-medium">{t('dashboard.revenueAndOrderVolume')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-lg shadow-blue-200"></div>
                <span className="text-[9px] font-black uppercase text-slate-400">{t('dashboard.revenue')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                <span className="text-[9px] font-black uppercase text-slate-400">{t('dashboard.newOrders')}</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] 2xl:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderStats}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }} 
                  itemStyle={{ fontWeight: 800, fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="orders" stroke="#e2e8f0" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-8 2xl:p-10 flex flex-col">
          <h3 className="text-lg 2xl:text-xl font-black text-slate-900 tracking-tight mb-1">{t('dashboard.categoryHealth')}</h3>
          <p className="text-slate-400 text-xs 2xl:text-sm font-medium mb-8">{t('dashboard.topPerformingSegments')}</p>
          <div className="flex-1 space-y-6 2xl:space-y-8">
            {[
              { label: isRTL ? 'الهندسة' : 'Engineering', val: 75, bg: 'bg-blue-500' },
              { label: isRTL ? 'الطب' : 'Medicine', val: 62, bg: 'bg-rose-500' },
              { label: isRTL ? 'التجارة' : 'Business', val: 45, bg: 'bg-amber-500' },
              { label: isRTL ? 'الفنون' : 'Arts', val: 30, bg: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] 2xl:text-xs font-black text-slate-700 uppercase tracking-widest">{item.label}</span>
                  <span className="text-[10px] 2xl:text-xs font-black text-slate-400">{item.val}%</span>
                </div>
                <div className="h-1.5 2xl:h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.bg} rounded-full transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/categories')} className="mt-8 w-full py-3.5 2xl:py-4 bg-slate-50 rounded-2xl text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
            {t('dashboard.viewAllPerformance')}
          </button>
        </div>
      </div>

      {/* Pending payment notice */}
      {pendingPaymentCount > 0 && (
        <div className="card-premium p-4 2xl:p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <p className="text-amber-800 text-sm 2xl:text-base font-bold">
            {isRTL ? `${pendingPaymentCount} طلب بانتظار تأكيد الدفع` : `${pendingPaymentCount} order(s) awaiting payment confirmation`}
          </p>
          <button onClick={() => navigate('/orders?status=CREATED')} className="btn-modern-secondary text-xs py-2 px-3">
            {isRTL ? 'عرض' : 'View'}
          </button>
        </div>
      )}

      {/* Dense Activity Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 2xl:gap-8">
        <div className="card-premium overflow-hidden">
          <div className="p-6 2xl:p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base 2xl:text-lg font-black text-slate-900">{t('dashboard.liveOrders')}</h3>
            <button onClick={() => navigate('/orders')} className="p-2 bg-slate-50 rounded-xl hover:text-blue-600 transition-all">
              {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th className="2xl:px-6 2xl:py-4">{t('dashboard.refId')}</th>
                  <th className="2xl:px-6 2xl:py-4">{t('dashboard.customer')}</th>
                  <th className="2xl:px-6 2xl:py-4">{t('dashboard.amount')}</th>
                  <th className="2xl:px-6 2xl:py-4">{t('dashboard.status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="2xl:px-6 2xl:py-8 text-center text-slate-400 text-sm font-medium">
                      {isRTL ? 'لا توجد طلبات' : 'No orders yet'}
                    </td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="font-black text-slate-900 2xl:px-6 2xl:py-4">{order.id?.slice(0, 8) ?? '—'}</td>
                      <td className="font-medium text-slate-500 2xl:px-6 2xl:py-4">{order.user?.phone ?? t('dashboard.guest')}</td>
                      <td className="font-black text-slate-900 2xl:px-6 2xl:py-4">${Number(order.total ?? 0).toFixed(2)}</td>
                      <td className="2xl:px-6 2xl:py-4">
                        <span className={`badge-modern ${
                          order.status === 'DELIVERED' ? 'badge-modern-success' :
                          order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED' ? 'badge-modern-info' :
                          order.status === 'CREATED' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500' : 'badge-modern-info'
                        }`}>
                          {order.status}
                          {order.paymentMethod && order.status !== 'CREATED' ? ` · ${order.paymentMethod}` : ''}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-premium overflow-hidden">
          <div className="p-6 2xl:p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base 2xl:text-lg font-black text-slate-900">{t('dashboard.approvalQueue')}</h3>
            <button onClick={() => navigate('/approvals')} className="p-2 bg-slate-50 rounded-xl hover:text-blue-600 transition-all">
              {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th className="2xl:px-6 2xl:py-4">{t('dashboard.title')}</th>
                  <th className="2xl:px-6 2xl:py-4">{t('dashboard.author')}</th>
                  <th className="2xl:px-6 2xl:py-4">{t('dashboard.category')}</th>
                  <th className="2xl:px-6 2xl:py-4">{t('dashboard.action')}</th>
                </tr>
              </thead>
              <tbody>
                {recentBooks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="2xl:px-6 2xl:py-8 text-center text-slate-400 text-sm font-medium">
                      {isRTL ? 'لا توجد كتب' : 'No books yet'}
                    </td>
                  </tr>
                ) : (
                  recentBooks.map(book => (
                  <tr key={book.id}>
                    <td className="font-black text-slate-900 max-w-[150px] 2xl:max-w-[300px] truncate 2xl:px-6 2xl:py-4">{book.title ?? '—'}</td>
                    <td className="text-slate-500 font-medium 2xl:px-6 2xl:py-4">{book.doctor?.name || t('dashboard.academic')}</td>
                    <td className="2xl:px-6 2xl:py-4"><span className="text-[9px] 2xl:text-xs font-black uppercase tracking-widest text-slate-400">{book.category?.name || t('dashboard.general')}</span></td>
                    <td className="2xl:px-6 2xl:py-4">
                      <button onClick={() => navigate(`/books/${book.id}`)} className="p-1.5 hover:bg-slate-100 rounded-lg text-blue-600 font-bold transition-all text-xs">{t('dashboard.review')}</button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
