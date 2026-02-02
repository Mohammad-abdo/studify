import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Package, FileText, Printer, ChevronLeft, ChevronRight, X, Filter, Calendar } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { EmptyStates } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';

const Orders = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus, filterType]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('orderType', filterType);

      const response = await api.get(`/admin/orders?${params}`);
      const data = response.data.data || response.data;
      setOrders(Array.isArray(data) ? data : []);
      setTotal(response.data.pagination?.total || (Array.isArray(data) ? data.length : 0) || 0);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الطلبات' : 'Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      CREATED: 'badge-modern-info',
      PAID: 'badge-modern-success',
      PROCESSING: 'badge-modern-warning',
      SHIPPED: 'badge-modern-info',
      DELIVERED: 'badge-modern-success',
      CANCELLED: 'badge-modern-error',
    };
    return badges[status] || 'badge-modern-info';
  };

  const getOrderTypeStyles = (orderType) => {
    switch (orderType) {
      case 'PRODUCT':
        return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', label: t('pages.orders.physicalProduct') };
      case 'CONTENT':
        return { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', label: t('pages.orders.digitalContent') };
      case 'PRINT':
        return { icon: Printer, color: 'text-violet-600', bg: 'bg-violet-50', label: t('pages.orders.printManifest') };
      default:
        return { icon: ShoppingCart, color: 'text-slate-600', bg: 'bg-slate-50', label: orderType || 'PRODUCT' };
    }
  };

  const columns = [
    {
      header: t('pages.orders.refId'),
      accessor: 'id',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-slate-900 tracking-tight font-mono text-xs uppercase">
            #ORD-{item.id.substring(0, 8)}
          </span>
          <span className="text-[10px] font-medium text-slate-400">{t('pages.orders.transactionRegistry')}</span>
        </div>
      ),
    },
    {
      header: t('pages.orders.channel'),
      accessor: 'orderType',
      render: (item) => {
        const { icon: Icon, color, bg, label } = getOrderTypeStyles(item.orderType);
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center`}>
              <Icon size={16} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">{label}</span>
          </div>
        );
      },
    },
    {
      header: t('pages.orders.customerName'),
      accessor: 'customerName',
      hideOnMobile: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700">{item.customerName || item.user?.phone || t('pages.orders.guest')}</span>
          <span className="text-[10px] font-medium text-slate-400">{item.user?.phone}</span>
          {item.user?.email && <span className="text-[10px] font-medium text-slate-400">{item.user.email}</span>}
        </div>
      ),
    },
    {
      header: t('pages.orders.deliveryAddress'),
      accessor: 'deliveryAddress',
      hideOnMobile: true,
      render: (item) => (
        <div className="flex flex-col max-w-[180px]">
          <span className="text-xs font-medium text-slate-700 truncate" title={item.deliveryAddress || item.address || '—'}>
            {item.deliveryAddress || item.address || '—'}
          </span>
        </div>
      ),
    },
    {
      header: t('pages.orders.manifest'),
      accessor: 'items.length',
      align: 'center',
      hideOnMobile: true,
      render: (item) => (
        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-slate-900">{item.items?.length || 0}</span>
          <span className="text-[9px] font-black uppercase text-slate-400">{t('pages.orders.articles')}</span>
        </div>
      ),
    },
    {
      header: t('pages.orders.grossTotal'),
      accessor: 'total',
      align: 'right',
      render: (item) => (
        <div className="flex flex-col items-end">
          <span className="text-sm font-black text-slate-900">${item.total?.toFixed(2)}</span>
          <span className="text-[9px] font-black uppercase text-emerald-500">{t('pages.orders.vatInclusive')}</span>
        </div>
      ),
    },
    {
      header: t('pages.orders.fulfillment'),
      accessor: 'status',
      align: 'center',
      render: (item) => (
        <span className={`badge-modern ${getStatusBadge(item.status)}`}>
          {item.status}
        </span>
      ),
    },
    {
      header: t('pages.orders.timeline'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (item) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} />
          <span className="text-xs font-bold">
            {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.orders.title')}
        subtitle={t('pages.orders.subtitle')}
        breadcrumbs={[
          { label: t('menu.orders') },
        ]}
      />

      {/* Advanced Command Bar */}
      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Filter size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
              >
                <option value="">{t('pages.orders.allStatus')}</option>
                <option value="CREATED">{isRTL ? 'تم الإنشاء' : 'Created'}</option>
                <option value="PAID">{isRTL ? 'مدفوع' : 'Paid'}</option>
                <option value="PROCESSING">{isRTL ? 'قيد المعالجة' : 'Processing'}</option>
                <option value="SHIPPED">{isRTL ? 'تم الشحن' : 'Shipped'}</option>
                <option value="DELIVERED">{isRTL ? 'تم التسليم' : 'Delivered'}</option>
                <option value="CANCELLED">{isRTL ? 'ملغي' : 'Cancelled'}</option>
              </select>
            </div>

            <div className="relative flex-1">
              <Package size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'}`}
              >
                <option value="">{t('pages.orders.allTypes')}</option>
                <option value="PRODUCT">{t('pages.orders.physicalProduct')}</option>
                <option value="CONTENT">{t('pages.orders.digitalContent')}</option>
                <option value="PRINT">{t('pages.orders.printManifest')}</option>
              </select>
            </div>
          </div>
          
          {(filterStatus || filterType) && (
            <button 
              onClick={() => { setFilterStatus(''); setFilterType(''); setPage(1); }}
              className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <X size={16} />
              {t('pages.orders.resetFilters')}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'جاري معالجة بيانات الطلبات' : 'Processing Ledger Data'}</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="fade-in">
          <EmptyStates.Orders />
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={orders}
            columns={columns}
            loading={false}
            searchable={false}
            serverSide={true}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            onView={(item) => navigate(`/orders/${item.id}`)}
          />
        </div>
      )}
    </div>
  );
};

export default Orders;
