import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Truck,
  Search,
  Filter,
  ShoppingBag,
  Clock,
  Package,
  LayoutGrid,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const DeliveryAssignments = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/delivery-assignments');
      const data = response.data?.data ?? response.data ?? [];
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(isRTL ? 'لوجستيات: فشل مزامنة مصفوفة التكليفات' : 'Logistics: Assignment matrix sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignment) => {
    const result = await Swal.fire({
      title: t('pages.deliveryAssignments.voidAssignment'),
      text: t('pages.deliveryAssignments.voidAssignmentDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.deliveryAssignments.confirmVoid'),
      reverseButtons: isRTL,
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/delivery-assignments/${assignment.id}`);
        toast.success(isRTL ? 'تم إلغاء التكليف' : 'Assignment voided');
        fetchAssignments();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الإلغاء: السجل مقفل' : 'Void operation failed: Record locked');
      }
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const deliveryName = assignment.delivery?.name?.toLowerCase() || '';
    const orderId = assignment.orderId?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return deliveryName.includes(search) || orderId.includes(search);
  });

  const formatTime = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : null;
    if (!d || isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString(isRTL ? 'ar-EG' : undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const getAssignmentTime = (a) => a.assignedAt || a.createdAt;

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.deliveryAssignments.title')}
        subtitle={t('pages.deliveryAssignments.subtitle')}
        breadcrumbs={[{ label: t('menu.sections.logistics') }, { label: t('menu.assignments') }]}
        actionLabel={t('pages.deliveryAssignments.deployAgent')}
        actionPath="/delivery-assignments/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.deliveryAssignments.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all" title={t('pages.deliveryAssignments.missionStatus')}>
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {t('pages.deliveryAssignments.syncingDeployment')}
          </span>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="card-premium p-12 bg-white border-none shadow-xl shadow-slate-200/50 rounded-3xl text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <LayoutGrid size={40} />
          </div>
          <h3 className="font-black text-slate-800 text-lg mb-2">{t('pages.deliveryAssignments.noAssignments')}</h3>
          <p className="text-slate-500 text-sm mb-6">{t('pages.deliveryAssignments.noAssignmentsHint')}</p>
          <button
            onClick={() => navigate('/delivery-assignments/add')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            {t('pages.deliveryAssignments.deployAgent')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 fade-in">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:border-blue-200/60 transition-all duration-200"
            >
              {/* Card header: delivery node icon + name */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                    <Truck size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t('pages.deliveryAssignments.deploymentNode')}
                    </p>
                    <p className="font-black text-slate-900 truncate">
                      {assignment.delivery?.name || t('pages.deliveryAssignments.assignedAgent')}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">ID: {assignment.deliveryId?.slice(0, 8)}</p>
                  </div>
                </div>
                <span
                  className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                    assignment.status === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : assignment.status === 'PICKED_UP'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {assignment.status}
                </span>
              </div>

              {/* Order / target manifest */}
              <div className="flex items-center gap-2 mb-3 py-2 px-3 rounded-xl bg-slate-50">
                <ShoppingBag size={16} className="text-slate-500 flex-shrink-0" />
                <span className="font-mono text-xs font-bold text-slate-700 uppercase">
                  #{assignment.orderId?.slice(0, 8)}
                </span>
                <span className="text-[10px] text-slate-400">{t('pages.deliveryAssignments.targetManifest')}</span>
              </div>

              {/* Dispatch time */}
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                <Clock size={14} className="flex-shrink-0" />
                <span className="font-bold">{formatTime(getAssignmentTime(assignment))}</span>
                <span className="text-[10px] text-slate-400">{t('pages.deliveryAssignments.dispatchTime')}</span>
              </div>

              {/* Actions */}
              <div className={`flex items-center gap-2 pt-3 border-t border-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => assignment.orderId && navigate(`/orders/${assignment.orderId}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
                  title={t('pages.deliveryAssignments.viewOrder')}
                >
                  <Package size={16} />
                  {t('pages.deliveryAssignments.viewOrder')}
                </button>
                <button
                  onClick={() => navigate(`/delivery-assignments/edit/${assignment.id}`)}
                  className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                  title={t('pages.deliveryAssignments.operations')}
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(assignment)}
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title={t('pages.deliveryAssignments.confirmVoid')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryAssignments;
