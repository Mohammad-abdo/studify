import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingCart, Package, User, Calendar, DollarSign, Clock,
  MapPin, CheckCircle, XCircle, RefreshCw, ArrowUpRight, Building2,
  Phone, Mail, Hash,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const WholesaleOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wholesale-orders/${id}`);
      setOrder(response.data.data || response.data);
    } catch {
      toast.error(isRTL ? 'فشل تحميل تفاصيل الطلب' : 'Failed to load order details');
      navigate('/institute');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const map = {
      CREATED: { cls: 'bg-slate-100 text-slate-700', icon: Clock, label: isRTL ? 'جديد' : 'Created' },
      PAID: { cls: 'bg-amber-100 text-amber-700', icon: DollarSign, label: isRTL ? 'مدفوع' : 'Paid' },
      PROCESSING: { cls: 'bg-indigo-100 text-indigo-700', icon: RefreshCw, label: isRTL ? 'قيد المعالجة' : 'Processing' },
      SHIPPED: { cls: 'bg-cyan-100 text-cyan-700', icon: ArrowUpRight, label: isRTL ? 'تم الشحن' : 'Shipped' },
      DELIVERED: { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: isRTL ? 'تم التسليم' : 'Delivered' },
      CANCELLED: { cls: 'bg-rose-100 text-rose-700', icon: XCircle, label: isRTL ? 'ملغي' : 'Cancelled' },
    };
    return map[status] || map.CREATED;
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isRTL ? 'جاري التحميل...' : 'Loading...'}
        </span>
      </div>
    );
  }

  if (!order) return null;

  const status = getStatusStyle(order.status);
  const StatusIcon = status.icon;
  const total = parseFloat(order.total || 0);

  return (
    <div className="space-y-8 page-transition pb-20">
      <PageHeader
        title={`${isRTL ? 'طلب جملة' : 'Wholesale Order'} #${order.id?.slice(0, 8)}`}
        subtitle={isRTL ? 'تفاصيل طلب دوائر الدولة' : 'Government wholesale order details'}
        breadcrumbs={[
          { label: isRTL ? 'دوائر الدولة' : 'Government', path: '/institute' },
          { label: isRTL ? 'تفاصيل الطلب' : 'Order Detail' },
        ]}
        backPath="/institute"
      />

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 w-full space-y-8">
          {/* Status & Overview */}
          <div className="card-premium p-8 bg-white border-none shadow-xl shadow-slate-200/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                  <ShoppingCart size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {isRTL ? 'طلب جملة — دوائر الدولة' : 'Wholesale Order — Government'}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono uppercase">
                    #{order.id?.slice(0, 8)}
                  </h2>
                </div>
              </div>
              <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider ${status.cls}`}>
                <StatusIcon size={16} />
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  {isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}
                </span>
                <span className="text-2xl font-black text-slate-900">${total.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  {isRTL ? 'عدد العناصر' : 'Items'}
                </span>
                <span className="text-2xl font-black text-slate-900">{order.items?.length || 0}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  {isRTL ? 'الكمية الإجمالية' : 'Total Qty'}
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  {isRTL ? 'تاريخ الطلب' : 'Order Date'}
                </span>
                <span className="text-lg font-black text-slate-900">
                  {new Date(order.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card-premium bg-white border-none shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h3 className="text-lg font-black text-slate-900">{isRTL ? 'عناصر الطلب' : 'Order Items'}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table-premium w-full">
                <thead>
                  <tr>
                    <th className="text-start">{isRTL ? 'المنتج' : 'Product'}</th>
                    <th className="text-center">{isRTL ? 'الكمية' : 'Qty'}</th>
                    <th className="text-end">{isRTL ? 'سعر الوحدة' : 'Unit Price'}</th>
                    <th className="text-end">{isRTL ? 'الإجمالي' : 'Line Total'}</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, idx) => {
                    const images = (() => {
                      if (!item.product?.imageUrls) return [];
                      if (typeof item.product.imageUrls === 'string') {
                        try { return JSON.parse(item.product.imageUrls); } catch { return []; }
                      }
                      return Array.isArray(item.product.imageUrls) ? item.product.imageUrls : [];
                    })();
                    const firstImg = images[0];

                    return (
                      <tr key={item.id || idx}>
                        <td>
                          <div className="flex items-center gap-4">
                            {firstImg ? (
                              <div className="w-12 h-12 rounded-xl border-2 border-white shadow-sm overflow-hidden bg-white shrink-0">
                                <img
                                  src={firstImg.startsWith('http') ? firstImg : `${api.defaults.baseURL.replace('/api', '')}${firstImg}`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=P&background=8b5cf6&color=fff&size=48`; }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-300 border-2 border-white shadow-sm shrink-0">
                                <Package size={20} />
                              </div>
                            )}
                            <div>
                              <span className="font-black text-slate-900 text-sm">{item.product?.name || `Product #${item.productId?.slice(0, 8)}`}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 font-black text-slate-700 text-sm">
                            {item.quantity}
                          </span>
                        </td>
                        <td className="text-end">
                          <span className="font-bold text-slate-600">${parseFloat(item.price || 0).toFixed(2)}</span>
                        </td>
                        <td className="text-end">
                          <span className="font-black text-slate-900">${(parseFloat(item.price || 0) * (item.quantity || 0)).toLocaleString()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-100">
                    <td colSpan={3} className="text-end">
                      <span className="text-sm font-black uppercase tracking-widest text-slate-400">
                        {isRTL ? 'المجموع الكلي' : 'Grand Total'}
                      </span>
                    </td>
                    <td className="text-end">
                      <span className="text-xl font-black text-slate-900">${total.toLocaleString()}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-96 space-y-6">
          {/* Customer Info */}
          {order.customer && (
            <div className="card-premium p-8 bg-white border-none shadow-xl shadow-slate-200/50">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                {isRTL ? 'معلومات العميل' : 'Client Information'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Building2 size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">{order.customer.entityName}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                      {isRTL ? 'دائرة حكومية' : 'Government Dept.'}
                    </span>
                  </div>
                </div>
                {order.customer.contactPerson && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <User size={16} className="text-slate-400" />
                    <span className="text-sm font-bold">{order.customer.contactPerson}</span>
                  </div>
                )}
                {(order.customer.phone || order.customer.user?.phone) && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={16} className="text-slate-400" />
                    <span className="text-sm font-bold font-mono">{order.customer.phone || order.customer.user?.phone}</span>
                  </div>
                )}
                {order.customer.user?.email && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-sm font-bold">{order.customer.user.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order.address && (
            <div className="card-premium p-8 bg-white border-none shadow-xl shadow-slate-200/50">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
                {isRTL ? 'عنوان التسليم' : 'Delivery Address'}
              </h3>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                <span className="text-sm font-bold text-slate-700 leading-relaxed">{order.address}</span>
              </div>
            </div>
          )}

          {/* Order ID */}
          <div className="card-premium p-8 bg-white border-none shadow-xl shadow-slate-200/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
              {isRTL ? 'معرّف النظام' : 'System ID'}
            </h3>
            <div className="flex items-center gap-3">
              <Hash size={16} className="text-slate-400" />
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg break-all">{order.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesaleOrderDetail;
