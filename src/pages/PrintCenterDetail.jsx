import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Printer,
  MapPin,
  Phone,
  Mail,
  Edit,
  ArrowLeft,
  Package,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const PrintCenterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenter();
  }, [id]);

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/print-centers/${id}`);
      setCenter(response.data.data || response.data);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل تفاصيل المطبعة' : 'Failed to load print center details');
      navigate('/print-centers');
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'CANCELLED':
        return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' };
      case 'PRINTING':
      case 'READY_FOR_PICKUP':
        return { icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-100' };
      case 'ACCEPTED':
        return { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' };
      default:
        return { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100' };
    }
  };

  const getCustomerName = (order) => {
    const user = order?.user;
    if (!user) return '—';
    return (
      user.student?.name ||
      user.doctor?.name ||
      user.customer?.contactPerson ||
      user.customer?.entityName ||
      user.phone ||
      '—'
    );
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isRTL ? 'جاري تحميل التفاصيل...' : 'Loading details...'}
        </span>
      </div>
    );
  }

  if (!center) return null;

  const stats = center.stats || { totalAssignments: 0, byStatus: {} };
  const assignments = center.printAssignments || [];

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.printCenters.detailTitle')}
        subtitle={t('pages.printCenters.detailSubtitle')}
        breadcrumbs={[
          { label: t('menu.sections.logistics'), path: '/print-centers' },
          { label: isRTL ? 'المطابع' : 'Print Centers', path: '/print-centers' },
          { label: center.name || (isRTL ? 'المطبعة' : 'Print Center') },
        ]}
        backPath="/print-centers"
        actionLabel={t('common.edit')}
        actionPath={`/print-centers/edit/${id}`}
      />

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-10">
          {/* Profile card */}
          <div className="card-premium p-10 bg-white">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-teal-50 overflow-hidden border-4 border-white shadow-xl shadow-slate-200 flex items-center justify-center">
                  {center.user?.avatarUrl ? (
                    <img src={center.user.avatarUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Printer size={48} className="text-teal-600" />
                  )}
                </div>
                <div
                  className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-xl border-2 border-white shadow-lg text-xs font-black uppercase ${
                    center.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {center.isActive ? t('pages.printCenters.active') : t('pages.printCenters.inactive')}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{center.name}</h2>
                <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">ID: {center.id}</p>

                {(center.location || center.address) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                    {center.location && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t('pages.printCenters.location')}
                        </span>
                        <div className={`flex items-center gap-3 text-slate-900 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin size={16} className="text-teal-500" />
                          {center.location}
                        </div>
                      </div>
                    )}
                    {center.address && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {t('pages.printCenters.address')}
                        </span>
                        <div className={`flex items-center gap-3 text-slate-900 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <MapPin size={16} className="text-rose-500" />
                          <span className="whitespace-pre-wrap">{center.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
              <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.printCenters.contact')}</h3>
                <p className="text-sm font-medium text-slate-400">{isRTL ? 'الهاتف والبريد الإلكتروني' : 'Phone & Email'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm"><Phone size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'الهاتف' : 'Phone'}</span>
                  <span className="text-sm font-black text-slate-900">{center.user?.phone || '—'}</span>
                </div>
              </div>
              <div className={`flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm"><Mail size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'البريد' : 'Email'}</span>
                  <span className="text-sm font-black text-slate-900">{center.user?.email || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-premium p-6 bg-white">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl"><Package size={24} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.printCenters.totalAssignments')}</p>
                  <p className="text-2xl font-black text-teal-600">{stats.totalAssignments ?? 0}</p>
                </div>
              </div>
            </div>
            {['PENDING', 'ACCEPTED', 'PRINTING', 'COMPLETED'].map((status) => (
              <div key={status} className="card-premium p-6 bg-white">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl"><FileText size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{status}</p>
                    <p className="text-2xl font-black text-slate-900">{stats.byStatus?.[status] ?? 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Print Assignments */}
          <div className="card-premium overflow-hidden bg-white">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('pages.printCenters.printAssignments')}</h3>
              <p className="text-xs font-medium text-slate-400">{t('pages.printCenters.assignmentsByStatus')}</p>
            </div>
            {assignments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Package size={32} />
                </div>
                <p className="font-bold text-slate-700 mb-1">{t('pages.printCenters.noAssignments')}</p>
                <p className="text-sm text-slate-500">{t('pages.printCenters.noAssignmentsHint')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {assignments.map((assignment) => {
                  const { icon: StatusIcon, color: statusColor, bg: statusBg } = getAssignmentStatusStyle(assignment.status);
                  const order = assignment.order || {};
                  return (
                    <div
                      key={assignment.id}
                      className={`p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-12 h-12 rounded-xl ${statusBg} ${statusColor} flex items-center justify-center shrink-0`}>
                          <StatusIcon size={20} className={assignment.status === 'PRINTING' ? 'animate-spin' : ''} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-black text-slate-900 uppercase">
                            #ORD-{order.id?.slice(0, 8) || assignment.orderId?.slice(0, 8)}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                            <User size={12} />
                            {getCustomerName(order)}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            <Clock size={12} />
                            {assignment.assignedAt
                              ? new Date(assignment.assignedAt).toLocaleString(isRTL ? 'ar-EG' : undefined, {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${statusBg} ${statusColor}`}>
                          {assignment.status}
                        </span>
                        <button
                          onClick={() => order.id && navigate(`/orders/${order.id}`)}
                          className="px-4 py-2 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold hover:bg-teal-100 transition-all"
                        >
                          {t('pages.printCenters.viewOrder')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-80 space-y-6 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-8 bg-white border-2 border-teal-100 shadow-xl shadow-slate-200">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">{t('common.edit')}</h4>
            <button
              onClick={() => navigate(`/print-centers/edit/${id}`)}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
            >
              <Edit size={18} /> {t('common.edit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCenterDetail;
