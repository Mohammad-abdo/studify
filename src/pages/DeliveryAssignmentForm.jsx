import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Truck, ShoppingBag, Clock, Save, Loader2, Info } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const STATUS_OPTIONS = ['CREATED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const DeliveryAssignmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [formData, setFormData] = useState({
    orderId: '',
    deliveryId: '',
    status: 'CREATED',
  });

  useEffect(() => {
    const initData = async () => {
      try {
        setFetching(true);
        // Fetch delivery agents
        const deliveriesRes = await api.get('/admin/users?type=DELIVERY&limit=100');
        const deliveryUsers = deliveriesRes.data?.data || [];
        setDeliveries(deliveryUsers);

        if (isEdit) {
          // Fetch existing assignment
          const assignmentRes = await api.get(`/delivery-assignments/${id}`);
          const assignmentData = assignmentRes.data?.data || assignmentRes.data;
          setFormData({
            orderId: assignmentData.orderId || '',
            deliveryId: assignmentData.deliveryId || '',
            status: assignmentData.status || 'CREATED',
          });
        } else {
          // Fetch unassigned orders (we fetch recent orders and filter if needed, or list all active orders)
          const ordersRes = await api.get('/admin/orders?limit=100');
          const allOrders = ordersRes.data?.data || [];
          setOrders(allOrders);
        }
      } catch (error) {
        toast.error(isRTL ? 'فشل تحميل البيانات المطلوبة' : 'Failed to load registry dependencies');
        navigate('/delivery-assignments');
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [id, isEdit, isRTL, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        // Edit only allows status updates on backend
        await api.put(`/delivery-assignments/${id}`, {
          status: formData.status,
        });
        toast.success(isRTL ? 'تم تحديث حالة التكليف بنجاح' : 'Assignment state deployed successfully');
      } else {
        await api.post('/delivery-assignments', {
          orderId: formData.orderId,
          deliveryId: formData.deliveryId,
          status: formData.status,
        });
        toast.success(isRTL ? 'تم تكليف المندوب بنجاح' : 'Agent dispatched and assigned successfully');
      }
      navigate('/delivery-assignments');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
        (isRTL ? 'فشل حفظ التكليف' : 'Failed to finalize assignment transaction')
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isRTL ? 'جاري مزامنة السجلات...' : 'Syncing records...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={isEdit ? (isRTL ? 'تعديل تكليف التوصيل' : 'Modify Deployment') : (isRTL ? 'تكليف مندوب توصيل' : 'Deploy Logistics Agent')}
        subtitle={isRTL ? 'تخصيص وإسناد الطلبات لموظفي التوصيل وتتبع حالتها' : 'Assign specific orders to transit personnel and manage statuses'}
        breadcrumbs={[
          { label: t('menu.sections.logistics') },
          { label: t('menu.assignments'), path: '/delivery-assignments' },
          { label: isEdit ? t('common.edit') : t('common.add') }
        ]}
        backPath="/delivery-assignments"
      />

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="card-premium p-8 md:p-10 bg-white space-y-10">
          {/* Header Section */}
          <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/5">
              <Truck size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{isRTL ? 'بيانات التكليف' : 'Deployment Manifest'}</h3>
              <p className="text-sm font-medium text-slate-400">{isRTL ? 'ربط معرف الطلب مع مندوب التوصيل المتاح' : 'Map order identifiers with an active transit node'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">
                {isRTL ? 'الطلب المستهدف' : 'Target Order'}
              </label>
              {isEdit ? (
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-500 font-mono text-sm">
                  #{formData.orderId}
                </div>
              ) : (
                <div className="relative group">
                  <select
                    name="orderId"
                    required
                    value={formData.orderId}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl py-4 px-6 font-bold text-slate-900 transition-all outline-none text-sm appearance-none"
                  >
                    <option value="">{isRTL ? 'اختر الطلب المتاح...' : 'Select unassigned order...'}</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id} className="font-mono">
                        {order.customerName || order.user?.phone || 'Guest'} - ORD-{order.id.slice(0, 8)} (${order.total})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Delivery Agent Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">
                {isRTL ? 'مندوب التوصيل' : 'Logistics Agent'}
              </label>
              {isEdit ? (
                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-500 text-sm">
                  {deliveries.find(d => d.id === formData.deliveryId)?.delivery?.name || deliveries.find(d => d.id === formData.deliveryId)?.phone || formData.deliveryId}
                </div>
              ) : (
                <div className="relative group">
                  <select
                    name="deliveryId"
                    required
                    value={formData.deliveryId}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl py-4 px-6 font-bold text-slate-900 transition-all outline-none text-sm appearance-none"
                  >
                    <option value="">{isRTL ? 'اختر مندوب التوصيل...' : 'Select active agent...'}</option>
                    {deliveries.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.delivery?.name || agent.phone} ({agent.delivery?.vehicleType || 'No Vehicle'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Assignment Status */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">
                {isRTL ? 'حالة التوصيل' : 'Deployment Status'}
              </label>
              <div className="relative group">
                <select
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-2xl py-4 px-6 font-bold text-slate-900 transition-all outline-none text-sm appearance-none"
                >
                  {STATUS_OPTIONS.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="flex items-start gap-4 p-6 bg-amber-50/50 rounded-2xl border border-amber-100/50">
              <Info className="text-amber-600 shrink-0 mt-1" size={20} />
              <div className="space-y-1">
                <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">{isRTL ? 'قيود التعديل' : 'Registry Constraint'}</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {isRTL 
                    ? 'بعد إسناد التكليف، لا يمكن تغيير الطلب أو المندوب المرتبط به لتجنب تعارض العمليات. يمكنك فقط تحديث حالة شحن وتوصيل الطلب.' 
                    : 'Once dispatched, the order-agent mapping is immutable to prevent transit conflicts. You can only update the operational status.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/delivery-assignments')}
            className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? (isRTL ? 'تحديث التكليف' : 'Deploy Updates') : (isRTL ? 'إنشاء التكليف' : 'Initialize Mission')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryAssignmentForm;
