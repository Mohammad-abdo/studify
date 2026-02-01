import { useState, useEffect } from 'react';
import { UserCheck, BookOpen, Check, X, Search, Clock, ShieldAlert } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const PendingApprovals = () => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [type, setType] = useState('DOCTOR');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovals();
  }, [type]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/approvals?type=${type}`);
      setItems(response.data.data || []);
    } catch (error) {
      toast.error('Registry: Approval queue synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item) => {
    const result = await Swal.fire({
      title: t('pages.approvals.grantApproval'),
      text: t('pages.approvals.grantApprovalDesc').replace('{name}', type === 'DOCTOR' ? (item.name || item.user?.phone) : item.title),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: t('pages.approvals.authorizeEntry'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        const endpoint = type === 'DOCTOR' ? `/admin/doctors/${item.id}/approve` : `/admin/books/${item.id}/approve`;
        await api.post(endpoint);
        toast.success(isRTL ? 'تم منح الاعتماد بنجاح' : 'Authorization granted successfully');
        fetchApprovals();
      } catch (error) {
        toast.error(isRTL ? 'فشل الاعتماد: قيود السجل' : 'Authorization failed: Registry restriction');
      }
    }
  };

  const handleReject = async (item) => {
    const result = await Swal.fire({
      title: t('pages.approvals.rejectEntry'),
      text: t('pages.approvals.rejectEntryDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.approvals.rejectSubmission'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        const endpoint = type === 'DOCTOR' ? `/admin/doctors/${item.id}/reject` : `/admin/books/${item.id}/reject`;
        await api.post(endpoint);
        toast.success(isRTL ? 'تم رفض الطلب' : 'Submission rejected');
        fetchApprovals();
      } catch (error) {
        toast.error(isRTL ? 'فشل الرفض: خطأ في قاعدة البيانات' : 'Rejection failed: Database error');
      }
    }
  };

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition pb-20">
      <PageHeader
        title={t('pages.approvals.title')}
        subtitle={t('pages.approvals.subtitle')}
        breadcrumbs={[{ label: t('menu.approvals') }]}
      />

      <div className="flex flex-col xl:flex-row gap-6 2xl:gap-8 items-start">
        {/* Modern Tab Sidebar */}
        <div className="w-full xl:w-72 2xl:w-80 space-y-2 shrink-0">
          <button
            onClick={() => setType('DOCTOR')}
            className={`w-full flex items-center gap-4 px-5 py-4 2xl:py-5 rounded-2xl transition-all duration-300 ${
              type === 'DOCTOR'
                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 font-black scale-[1.02]'
                : 'bg-white text-slate-500 hover:bg-slate-50 font-bold border border-slate-100'
            }`}
          >
            <UserCheck size={20} />
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'} ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="text-sm">{t('pages.approvals.practitionerRequests')}</span>
              <span className={`text-[10px] uppercase tracking-widest ${type === 'DOCTOR' ? 'text-emerald-400' : 'text-slate-400'}`}>{t('pages.approvals.staffVerification')}</span>
            </div>
          </button>
          
          <button
            onClick={() => setType('BOOK')}
            className={`w-full flex items-center gap-4 px-5 py-4 2xl:py-5 rounded-2xl transition-all duration-300 ${
              type === 'BOOK'
                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 font-black scale-[1.02]'
                : 'bg-white text-slate-500 hover:bg-slate-50 font-bold border border-slate-100'
            }`}
          >
            <BookOpen size={20} />
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'} ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="text-sm">{t('pages.approvals.contentSubmissions')}</span>
              <span className={`text-[10px] uppercase tracking-widest ${type === 'BOOK' ? 'text-blue-400' : 'text-slate-400'}`}>{t('pages.approvals.assetReview')}</span>
            </div>
          </button>
        </div>

        {/* Queue View */}
        <div className="flex-1 w-full space-y-6">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4 card-premium bg-white">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.approvals.syncingQueue')}</span>
            </div>
          ) : items.length === 0 ? (
            <div className="card-premium p-20 text-center bg-white flex flex-col items-center">
              <div className="p-8 bg-slate-50 rounded-full text-slate-200 mb-6">
                <Clock size={48} />
              </div>
              <h3 className="text-xl font-black text-slate-900">{t('pages.approvals.queueCleared')}</h3>
              <p className="text-slate-400 font-medium text-sm mt-2">{t('pages.approvals.queueClearedDesc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-6 2xl:gap-8">
              {items.map((item) => (
                <div key={item.id} className="card-premium p-6 2xl:p-8 bg-white group hover:border-slate-900 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{t('pages.approvals.pendingReview')}</span>
                      <h3 className="text-base 2xl:text-lg font-black text-slate-900 tracking-tight">{type === 'DOCTOR' ? item.name : item.title}</h3>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      {type === 'DOCTOR' ? <UserCheck size={20} /> : <BookOpen size={20} />}
                    </div>
                  </div>

                  {type === 'DOCTOR' ? (
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.approvals.specialization')}</span>
                        <span className="text-sm font-bold text-slate-700">{item.specialization}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.approvals.terminalId')}</span>
                        <span className="text-xs font-mono font-bold text-slate-500">{item.user?.phone}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.approvals.academicCategory')}</span>
                        <span className="text-sm font-bold text-slate-700">{item.category?.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.approvals.contributor')}</span>
                        <span className="text-sm font-bold text-slate-700">{item.doctor?.name || t('pages.approvals.academicStaff')}</span>
                      </div>
                      <p className="text-xs 2xl:text-sm text-slate-500 font-medium line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">{item.description}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => handleApprove(item)}
                      className="flex-1 py-3.5 2xl:py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={16} strokeWidth={3} /> {t('pages.approvals.authorize')}
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      className="flex-1 py-3.5 2xl:py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={16} strokeWidth={3} /> {t('pages.approvals.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;
