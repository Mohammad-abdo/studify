import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Package, ShoppingCart, Tag, Search, Filter,
  Phone, Mail, UserCircle, Eye, Trash2, ChevronDown,
  DollarSign, Clock, CheckCircle, XCircle, Layers,
  ArrowUpRight, RefreshCw, Plus,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const TABS = ['customers', 'products', 'orders', 'categories'];

const InstituteDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState('customers');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({ customers: 0, products: 0, orders: 0, categories: 0, revenue: 0 });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [instituteCategories, setInstituteCategories] = useState([]);

  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const LIMIT = 10;

  const labels = {
    title: isRTL ? 'دوائر الدولة' : 'Government Departments',
    subtitle: isRTL ? 'إدارة عملاء دوائر الدولة والمنتجات والطلبات والفئات المخصصة لهم' : 'Manage government clients, their products, wholesale orders, and dedicated categories',
    tabs: {
      customers: isRTL ? 'العملاء' : 'Clients',
      products: isRTL ? 'المنتجات' : 'Products',
      orders: isRTL ? 'الطلبات' : 'Orders',
      categories: isRTL ? 'الفئات' : 'Categories',
    },
    stats: {
      customers: isRTL ? 'العملاء' : 'Clients',
      products: isRTL ? 'المنتجات' : 'Products',
      orders: isRTL ? 'الطلبات' : 'Orders',
      revenue: isRTL ? 'الإيرادات' : 'Revenue',
    },
    search: isRTL ? 'البحث في دوائر الدولة...' : 'Search government records...',
    parentCats: isRTL ? 'الفئات الرئيسية' : 'Main Categories',
    subCats: isRTL ? 'الفئات الفرعية' : 'Sub Categories',
    noCustomers: isRTL ? 'لا يوجد عملاء مسجلين' : 'No clients registered',
    noProducts: isRTL ? 'لا توجد منتجات دوائر الدولة' : 'No government products',
    noOrders: isRTL ? 'لا توجد طلبات جملة' : 'No wholesale orders',
    noCategories: isRTL ? 'لا توجد فئات مخصصة' : 'No dedicated categories',
    allStatuses: isRTL ? 'جميع الحالات' : 'All Statuses',
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, prodRes, orderRes, catRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products?isInstituteProduct=true&limit=10&page=1'),
        api.get('/wholesale-orders?limit=10&page=1'),
        api.get('/categories/products'),
      ]);

      const custData = custRes.data.data || custRes.data || [];
      setCustomers(Array.isArray(custData) ? custData : []);

      const prodData = prodRes.data.data || prodRes.data || [];
      const parsedProds = (Array.isArray(prodData) ? prodData : []).map(p => {
        if (p.imageUrls && typeof p.imageUrls === 'string') {
          try { p.imageUrls = JSON.parse(p.imageUrls); } catch { p.imageUrls = []; }
        }
        return p;
      });
      setProducts(parsedProds);
      setProductTotal(prodRes.data.pagination?.total || parsedProds.length);

      const ordData = orderRes.data.data || orderRes.data || [];
      setOrders(Array.isArray(ordData) ? ordData : []);
      setOrderTotal(orderRes.data.pagination?.total || (Array.isArray(ordData) ? ordData.length : 0));

      const allCats = catRes.data.data || catRes.data || [];
      const instituteCats = (Array.isArray(allCats) ? allCats : []).filter(c => c.isInstituteCategory);
      setInstituteCategories(instituteCats);

      const totalRevenue = (Array.isArray(ordData) ? ordData : []).reduce((sum, o) => sum + (parseFloat(o.total) || parseFloat(o.totalAmount) || 0), 0);

      setStats({
        customers: Array.isArray(custData) ? custData.length : 0,
        products: prodRes.data.pagination?.total || parsedProds.length,
        orders: orderRes.data.pagination?.total || (Array.isArray(ordData) ? ordData.length : 0),
        categories: instituteCats.length || 0,
        revenue: totalRevenue,
      });
    } catch (err) {
      toast.error(isRTL ? 'فشل في تحميل بيانات دوائر الدولة' : 'Failed to load government data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isRTL]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchProducts = useCallback(async (pg) => {
    try {
      const params = new URLSearchParams({ page: pg.toString(), limit: LIMIT.toString(), isInstituteProduct: 'true' });
      if (searchTerm) params.append('search', searchTerm);
      const res = await api.get(`/products?${params}`);
      const data = res.data.data || res.data || [];
      const parsed = (Array.isArray(data) ? data : []).map(p => {
        if (p.imageUrls && typeof p.imageUrls === 'string') {
          try { p.imageUrls = JSON.parse(p.imageUrls); } catch { p.imageUrls = []; }
        }
        return p;
      });
      setProducts(parsed);
      setProductTotal(res.data.pagination?.total || parsed.length);
    } catch { /* silently fail, data stays as is */ }
  }, [searchTerm]);

  const fetchOrders = useCallback(async (pg) => {
    try {
      const params = new URLSearchParams({ page: pg.toString(), limit: LIMIT.toString() });
      if (orderStatusFilter) params.append('status', orderStatusFilter);
      const res = await api.get(`/wholesale-orders?${params}`);
      const data = res.data.data || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
      setOrderTotal(res.data.pagination?.total || (Array.isArray(data) ? data.length : 0));
    } catch { /* silently fail */ }
  }, [orderStatusFilter]);

  useEffect(() => { if (activeTab === 'products') fetchProducts(productPage); }, [productPage, activeTab, fetchProducts]);
  useEffect(() => { if (activeTab === 'orders') fetchOrders(orderPage); }, [orderPage, activeTab, fetchOrders]);

  const handleDeleteCustomer = async (customer) => {
    const result = await Swal.fire({
      title: isRTL ? 'حذف العميل؟' : 'Remove Client?',
      text: isRTL ? `هل تريد حذف "${customer.entityName}"؟` : `Remove "${customer.entityName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: isRTL ? 'تأكيد الحذف' : 'Confirm',
      reverseButtons: isRTL,
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/customers/${customer.id}`);
        toast.success(isRTL ? 'تم الحذف بنجاح' : 'Client removed');
        fetchAll();
      } catch {
        toast.error(isRTL ? 'فشل الحذف' : 'Delete failed');
      }
    }
  };

  const statCards = [
    { label: labels.stats.customers, value: stats.customers, icon: Users, color: 'from-blue-500 to-blue-600', lightBg: 'bg-blue-50', lightText: 'text-blue-600' },
    { label: labels.stats.products, value: stats.products, icon: Package, color: 'from-emerald-500 to-emerald-600', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600' },
    { label: labels.stats.orders, value: stats.orders, icon: ShoppingCart, color: 'from-violet-500 to-violet-600', lightBg: 'bg-violet-50', lightText: 'text-violet-600' },
    { label: labels.stats.revenue, value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: 'from-amber-500 to-amber-600', lightBg: 'bg-amber-50', lightText: 'text-amber-600' },
  ];

  const customerColumns = [
    {
      header: isRTL ? 'الجهة' : 'Entity',
      accessor: 'entityName',
      render: (c) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-200">
            {c.entityName?.charAt(0)?.toUpperCase() || 'G'}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{c.entityName || (isRTL ? 'بدون اسم' : 'Unnamed')}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{isRTL ? 'دائرة حكومية' : 'Government Dept.'}</span>
          </div>
        </div>
      ),
    },
    {
      header: isRTL ? 'المسؤول' : 'Contact',
      accessor: 'contactPerson',
      render: (c) => (
        <div className="flex items-center gap-3">
          <UserCircle size={16} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{c.contactPerson || '—'}</span>
        </div>
      ),
    },
    {
      header: isRTL ? 'معلومات الاتصال' : 'Contact Info',
      accessor: 'phone',
      render: (c) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone size={12} />
            <span className="text-xs font-bold font-mono">{c.phone || c.user?.phone || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Mail size={12} />
            <span className="text-[10px] font-medium">{c.user?.email || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      header: isRTL ? 'الحالة' : 'Status',
      accessor: 'id',
      align: 'center',
      render: () => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
          <CheckCircle size={12} />
          {isRTL ? 'مفعّل' : 'Active'}
        </span>
      ),
    },
    {
      header: isRTL ? 'الإجراءات' : 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          {c.userId && (
            <button onClick={() => navigate(`/users/${c.userId}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Eye size={18} /></button>
          )}
          <button onClick={() => handleDeleteCustomer(c)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const productColumns = [
    {
      header: isRTL ? 'الصورة' : 'Image',
      accessor: 'imageUrls',
      width: '80px',
      render: (p) => {
        const images = Array.isArray(p.imageUrls) ? p.imageUrls : [];
        const first = images[0];
        return first ? (
          <div className="w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-white">
            <img
              src={first.startsWith('http') ? first : `${api.defaults.baseURL.replace('/api', '')}${first}`}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=8b5cf6&color=fff&size=48`; }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-300 border-2 border-white shadow-sm">
            <Package size={20} />
          </div>
        );
      },
    },
    {
      header: isRTL ? 'المنتج' : 'Product',
      accessor: 'name',
      render: (p) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-slate-900 tracking-tight">{p.name}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">{p.category?.name || (isRTL ? 'عام' : 'General')}</span>
        </div>
      ),
    },
    {
      header: isRTL ? 'السعر الأساسي' : 'Base Price',
      accessor: 'basePrice',
      render: (p) => (
        <div className="flex flex-col">
          <span className="text-sm font-black text-slate-900">{p.basePrice ? `$${parseFloat(p.basePrice).toFixed(2)}` : '—'}</span>
          {p.pricing?.length > 0 && (
            <span className="text-[10px] font-medium text-violet-500">{p.pricing.length} {isRTL ? 'مستويات تسعير' : 'pricing tiers'}</span>
          )}
        </div>
      ),
    },
    {
      header: isRTL ? 'التاريخ' : 'Date',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (p) => (
        <span className="text-xs font-bold text-slate-500">
          {new Date(p.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ];

  const getOrderStatusStyle = (status) => {
    const map = {
      CREATED: { cls: 'bg-slate-50 text-slate-700 border-slate-200', icon: Clock, label: isRTL ? 'جديد' : 'Created' },
      PAID: { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: DollarSign, label: isRTL ? 'مدفوع' : 'Paid' },
      PROCESSING: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: RefreshCw, label: isRTL ? 'قيد المعالجة' : 'Processing' },
      SHIPPED: { cls: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: ArrowUpRight, label: isRTL ? 'تم الشحن' : 'Shipped' },
      DELIVERED: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, label: isRTL ? 'تم التسليم' : 'Delivered' },
      CANCELLED: { cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle, label: isRTL ? 'ملغي' : 'Cancelled' },
    };
    return map[status] || map.CREATED;
  };

  const orderColumns = [
    {
      header: isRTL ? 'رقم الطلب' : 'Order ID',
      accessor: 'id',
      render: (o) => (
        <span className="font-black text-slate-900 tracking-tight font-mono text-xs uppercase">
          #{o.id?.slice(0, 8)}
        </span>
      ),
    },
    {
      header: isRTL ? 'العميل' : 'Client',
      accessor: 'customer',
      render: (o) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-800 text-sm">{o.customer?.entityName || '—'}</span>
          <span className="text-[10px] text-slate-400 font-mono">{o.customer?.user?.phone || ''}</span>
        </div>
      ),
    },
    {
      header: isRTL ? 'العناصر' : 'Items',
      accessor: 'items',
      align: 'center',
      render: (o) => (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-sm font-black text-slate-700">
            {o.items?.length || 0}
          </span>
        </div>
      ),
    },
    {
      header: isRTL ? 'المبلغ' : 'Amount',
      accessor: 'total',
      render: (o) => (
        <span className="text-sm font-black text-slate-900">${parseFloat(o.total || o.totalAmount || 0).toLocaleString()}</span>
      ),
    },
    {
      header: isRTL ? 'الحالة' : 'Status',
      accessor: 'status',
      align: 'center',
      render: (o) => {
        const s = getOrderStatusStyle(o.status);
        const Icon = s.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${s.cls}`}>
            <Icon size={12} />
            {s.label}
          </span>
        );
      },
    },
    {
      header: isRTL ? 'التاريخ' : 'Date',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (o) => (
        <span className="text-xs font-bold text-slate-500">
          {new Date(o.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ];

  const categoryColumns = [
    {
      header: isRTL ? 'الفئة' : 'Category',
      accessor: 'name',
      render: (c) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-500">
            <Tag size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight">{c.name}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              {isRTL ? 'فئة دوائر الدولة' : 'Government Category'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: isRTL ? 'المنتجات' : 'Products',
      accessor: 'products',
      align: 'center',
      render: (c) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-sm font-black text-slate-700">
          {c._count?.products ?? c.products?.length ?? '—'}
        </span>
      ),
    },
    {
      header: isRTL ? 'الكلية' : 'College',
      accessor: 'college',
      render: (c) => (
        <span className="text-sm font-bold text-slate-500">
          {c.college?.name || '—'}
        </span>
      ),
    },
    {
      header: isRTL ? 'التاريخ' : 'Date',
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (c) => (
        <span className="text-xs font-bold text-slate-500">
          {new Date(c.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
  ];

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (c.entityName?.toLowerCase() || '').includes(q)
      || (c.contactPerson?.toLowerCase() || '').includes(q)
      || (c.phone?.toLowerCase() || c.user?.phone?.toLowerCase() || '').includes(q);
  });

  const filteredCategories = instituteCategories.filter((c) => {
    if (!searchTerm) return true;
    return (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
  });

  const tabIcons = { customers: Users, products: Package, orders: ShoppingCart, categories: Tag };

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition pb-20">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        breadcrumbs={[{ label: isRTL ? 'دوائر الدولة' : 'Government' }]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="card-premium p-5 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50 group hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${card.lightBg} flex items-center justify-center`}>
                  <Icon size={22} className={card.lightText} />
                </div>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </div>
              <p className="text-2xl 2xl:text-3xl font-black text-slate-900 tracking-tight">{typeof card.value === 'number' ? card.value.toLocaleString() : card.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="card-premium p-2 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tabIcons[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 2xl:py-4 rounded-2xl text-sm font-black transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-300'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{labels.tabs[tab]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={labels.search}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (activeTab === 'products') setProductPage(1);
              }}
              className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          {activeTab === 'orders' && (
            <div className="relative">
              <select
                value={orderStatusFilter}
                onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
                className="appearance-none bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 px-5 pr-10 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              >
                <option value="">{labels.allStatuses}</option>
                <option value="CREATED">{isRTL ? 'جديد' : 'Created'}</option>
                <option value="PAID">{isRTL ? 'مدفوع' : 'Paid'}</option>
                <option value="PROCESSING">{isRTL ? 'قيد المعالجة' : 'Processing'}</option>
                <option value="SHIPPED">{isRTL ? 'تم الشحن' : 'Shipped'}</option>
                <option value="DELIVERED">{isRTL ? 'تم التسليم' : 'Delivered'}</option>
                <option value="CANCELLED">{isRTL ? 'ملغي' : 'Cancelled'}</option>
              </select>
              <ChevronDown size={16} className="absolute top-1/2 -translate-y-1/2 right-4 text-slate-400 pointer-events-none" />
            </div>
          )}
          <div className="flex items-center gap-3">
            <button className="p-3.5 2xl:p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isRTL ? 'جاري تحميل بيانات دوائر الدولة...' : 'Loading government data...'}
          </span>
        </div>
      ) : (
        <div className="fade-in">
          {/* Customers Tab */}
          {activeTab === 'customers' && (
            filteredCustomers.length === 0 ? (
              <EmptyBlock icon={Users} message={labels.noCustomers} />
            ) : (
              <DataTable data={filteredCustomers} columns={customerColumns} loading={false} searchable={false} />
            )
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/institute/products/add')}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60 transition-all"
                >
                  <Plus size={18} />
                  {isRTL ? 'إضافة منتج حكومي' : 'Add Government Product'}
                </button>
              </div>
              {products.length === 0 ? (
                <EmptyBlock icon={Package} message={labels.noProducts} />
              ) : (
                <DataTable
                  data={products}
                  columns={productColumns}
                  loading={false}
                  searchable={false}
                  serverSide={true}
                  total={productTotal}
                  page={productPage}
                  limit={LIMIT}
                  onPageChange={setProductPage}
                  onView={(p) => navigate(`/products/${p.id}`)}
                  onEdit={(p) => navigate(`/institute/products/edit/${p.id}`)}
                />
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            orders.length === 0 ? (
              <EmptyBlock icon={ShoppingCart} message={labels.noOrders} />
            ) : (
              <DataTable
                data={orders}
                columns={orderColumns}
                loading={false}
                searchable={false}
                serverSide={true}
                total={orderTotal}
                page={orderPage}
                limit={LIMIT}
                onPageChange={setOrderPage}
                onView={(o) => navigate(`/wholesale-orders/${o.id}`)}
              />
            )
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Layers size={16} className="text-blue-600" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    {isRTL ? 'فئات دوائر الدولة' : 'Government Categories'}
                  </h3>
                  <span className="text-xs font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{filteredCategories.length}</span>
                </div>
                <button
                  onClick={() => navigate('/institute/categories/add')}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60 transition-all"
                >
                  <Plus size={18} />
                  {isRTL ? 'إضافة فئة' : 'Add Category'}
                </button>
              </div>
              {filteredCategories.length === 0 ? (
                <EmptyBlock icon={Tag} message={labels.noCategories} />
              ) : (
                <DataTable
                  data={filteredCategories}
                  columns={categoryColumns}
                  loading={false}
                  searchable={false}
                  onEdit={(c) => navigate(`/categories/edit/products/${c.id}`)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EmptyBlock = ({ icon: Icon, message }) => (
  <div className="card-premium p-16 bg-white border-none shadow-xl shadow-slate-200/50 flex flex-col items-center gap-4">
    <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center">
      <Icon size={36} className="text-slate-300" />
    </div>
    <p className="text-lg font-black text-slate-400">{message}</p>
  </div>
);

export default InstituteDashboard;
