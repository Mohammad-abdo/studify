import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Edit, ShoppingCart, Package, FileText, Printer, User, Calendar, DollarSign, ArrowLeft, ShieldCheck, Clock, MapPin, CreditCard, Navigation } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import { useLanguage } from '../context/LanguageContext';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
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
      toast.error(t('pages.orderDetail.syncError'));
      navigate('/orders');
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
      case 'PRODUCT': return { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'CONTENT': return { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'PRINT': return { icon: Printer, color: 'text-violet-600', bg: 'bg-violet-50' };
      default: return { icon: ShoppingCart, color: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.orderDetail.loading')}</span>
      </div>
    );
  }

  if (!order) return null;

  const { icon: TypeIcon, color: typeColor, bg: typeBg } = getOrderTypeStyles(order.orderType);

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={`${t('pages.orderDetail.title')} #ORD-${order.id.substring(0, 8)}`}
        subtitle={t('pages.orderDetail.subtitle')}
        breadcrumbs={[{ label: t('menu.orders'), path: '/orders' }, { label: t('pages.orderDetail.title') }]}
        backPath="/orders"
      />

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Content */}
        <div className="flex-1 w-full space-y-10">
          {/* Manifest Overview */}
          <div className="card-premium p-10 bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-10 border-b border-slate-50">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-3xl ${typeBg} ${typeColor} shadow-xl shadow-current/5`}>
                  <TypeIcon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.orderDetail.classification')}</span>
                    <span className="text-xs font-black text-slate-900">{order.orderType}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{t('pages.orderDetail.registryEntry')}</h2>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.orderDetail.deploymentState')}</span>
                <div className="flex items-center gap-3">
                  <span className={`badge-modern ${getStatusBadge(order.status)} px-6 py-2.5 rounded-2xl text-xs`}>
                    {order.status}
                  </span>
                  {(order.status === 'PROCESSING' || order.status === 'SHIPPED') && (
                    <Link 
                      to={`/orders/${order.id}/track`}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                    >
                      <Navigation size={14} className="animate-pulse" />
                      {t('pages.orderDetail.liveTrack')}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.orderDetail.referenceToken')}</span>
                <p className="font-mono text-xs font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100 uppercase">{order.id}</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.orderDetail.nodeSyncTime')}</span>
                <div className="flex items-center gap-3 text-slate-900 font-bold p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <Clock size={16} className="text-blue-500" />
                  <span className="text-xs">{new Date(order.createdAt).toLocaleString(isRTL ? 'ar-EG' : undefined)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.orderDetail.paymentProtocol')}</span>
                <div className="flex items-center gap-3 text-slate-900 font-bold p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <CreditCard size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase">{t('pages.orderDetail.standardTransaction')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manifest Items */}
          <div className="card-premium overflow-hidden bg-white">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('pages.orderDetail.assetManifest')}</h3>
              <p className="text-xs font-medium text-slate-400">{t('pages.orderDetail.logicalBreakdown')}</p>
            </div>
            <div className="divide-y divide-slate-50">
              {order.items?.map((item, index) => (
                <div key={index} className="p-8 hover:bg-slate-50/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-slate-300 group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                        <Package size={24} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{item.referenceType}</span>
                        <span className="text-lg font-black text-slate-900 tracking-tight">Resource #{item.referenceId?.substring(0, 8)}</span>
                        <span className="text-xs font-medium text-slate-400">{t('pages.orderDetail.allocation')}: {item.quantity} {isRTL ? 'وحدات' : 'Unit(s)'}</span>
                      </div>
                    </div>
                    <div className={isRTL ? 'text-left' : 'text-right'}>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">{t('pages.orderDetail.valuation')}</span>
                      <span className="text-xl font-black text-slate-900">${((item.quantity || 1) * (item.price || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Target */}
          {order.shippingAddress && (
            <div className="card-premium p-10 bg-white">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><MapPin size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.orderDetail.geographicTarget')}</h3>
                  <p className="text-sm font-medium text-slate-400">{t('pages.orderDetail.endpointDeployment')}</p>
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-lg font-bold text-slate-700 leading-relaxed whitespace-pre-wrap">{order.shippingAddress}</p>
              </div>
            </div>
          )}
        </div>

        {/* Financial Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.orderDetail.financialSettlement')}</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">{t('pages.orderDetail.assetSubtotal')}</span>
                <span className="text-sm font-black tracking-tight">${(order.total - (order.tax || 0) - (order.shippingCost || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">{t('pages.orderDetail.systemSurcharge')}</span>
                <span className="text-sm font-black tracking-tight">${(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400">{t('pages.orderDetail.logisticsCost')}</span>
                <span className="text-sm font-black tracking-tight">${(order.shippingCost || 0).toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-10"></div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 block mb-1">{t('pages.orderDetail.grossSettlement')}</span>
                  <span className="text-4xl font-black tracking-tighter">${order.total?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
                  <ShieldCheck size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="card-premium p-8 bg-white border-2 border-slate-50">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{t('pages.orderDetail.operatorNode')}</h4>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100"><User size={24} /></div>
              <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="text-lg font-black text-slate-900 tracking-tight">{order.user?.phone || t('pages.orderDetail.guestNode')}</span>
                <span className="text-[10px] font-black uppercase text-slate-400 truncate max-w-[180px]">{order.user?.email || t('pages.orderDetail.offlineRegistry')}</span>
              </div>
            </div>
            <button onClick={() => navigate(`/users/${order.user?.id}`)} className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">{t('pages.orderDetail.reviewOperator')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
