import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Phone, Mail, Building2, GraduationCap, BookOpen, FileText, CheckCircle, XCircle, Clock, Edit } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctors/${id}`);
      setDoctor(response.data.data || response.data);
    } catch (error) {
      toast.error(t('pages.doctors.retrieveFailed'));
      navigate('/doctors');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'APPROVED': return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'REJECTED': return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' };
      default: return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' };
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.doctors.retrieving')}</span>
      </div>
    );
  }

  if (!doctor) return null;

  const { icon: StatusIcon, color: statusColor, bg: statusBg } = getStatusStyles(doctor.approvalStatus);

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.doctors.detailTitle')}
        subtitle={t('pages.doctors.detailSubtitle')}
        breadcrumbs={[{ label: t('menu.doctors'), path: '/doctors' }, { label: doctor.name || t('pages.doctors.staffMember') }]}
        backPath="/doctors"
        actionLabel={t('pages.doctors.modifyPractitioner')}
        actionPath={`/doctors/edit/${id}`}
      />

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-10">
          {/* Profile card */}
          <div className="card-premium p-10 bg-white">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-emerald-50 overflow-hidden border-4 border-white shadow-xl shadow-slate-200 flex items-center justify-center">
                  {doctor.user?.avatarUrl ? (
                    <img src={doctor.user.avatarUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <span className="text-4xl font-black text-emerald-600">
                      {(doctor.name || 'D').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-white shadow-lg ${statusBg} ${statusColor}`}>
                  <StatusIcon size={20} />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{doctor.name || t('pages.doctors.staffMember')}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`badge-modern ${doctor.approvalStatus === 'APPROVED' ? 'badge-modern-success' : doctor.approvalStatus === 'REJECTED' ? 'badge-modern-error' : 'badge-modern-warning'}`}>
                    {doctor.approvalStatus}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">{doctor.id}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.doctors.specialization')}</span>
                    <div className={`flex items-center gap-3 text-slate-900 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Stethoscope size={16} className="text-emerald-500" />
                      {doctor.specialization || t('pages.doctors.generalSpecialist')}
                    </div>
                  </div>
                  {doctor.college && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.doctors.college')}</span>
                      <div className={`flex items-center gap-3 text-slate-900 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Building2 size={16} className="text-blue-500" />
                        {doctor.college.name}
                      </div>
                    </div>
                  )}
                  {doctor.department && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.doctors.department')}</span>
                      <div className={`flex items-center gap-3 text-slate-900 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <GraduationCap size={16} className="text-indigo-500" />
                        {doctor.department.name}
                      </div>
                    </div>
                  )}
                </div>
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
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.doctors.contact')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.doctors.phone')} &amp; {t('pages.doctors.email')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm"><Phone size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.doctors.phone')}</span>
                  <span className="text-sm font-black text-slate-900">{doctor.user?.phone || '—'}</span>
                </div>
              </div>
              <div className={`flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm"><Mail size={20} /></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.doctors.email')}</span>
                  <span className="text-sm font-black text-slate-900">{doctor.user?.email || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Recent books */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-premium p-8 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><BookOpen size={24} /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{t('pages.doctors.booksCount')}</h3>
                  <p className="text-3xl font-black text-emerald-600">{doctor._count?.books ?? 0}</p>
                </div>
              </div>
            </div>
            <div className="card-premium p-8 bg-white">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><FileText size={24} /></div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{t('pages.doctors.materialsCount')}</h3>
                  <p className="text-3xl font-black text-indigo-600">{doctor._count?.materials ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          {doctor.books?.length > 0 && (
            <div className="card-premium p-10 bg-white">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200"><BookOpen size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.doctors.recentBooks')}</h3>
                  <p className="text-sm font-medium text-slate-400">{doctor._count?.books ?? 0} {t('pages.doctors.booksCount').toLowerCase()}</p>
                </div>
              </div>
              <ul className="space-y-3">
                {doctor.books.map((book) => (
                  <li key={book.id}>
                    <button
                      onClick={() => navigate(`/books/${book.id}`)}
                      className={`w-full flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all text-left ${isRTL ? 'text-right flex-row-reverse' : ''}`}
                    >
                      <span className="font-bold text-slate-900">{book.title}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {book.category?.name || t('pages.doctors.uncategorized')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="w-full xl:w-80 space-y-6 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-8 bg-white border-2 border-slate-900 shadow-2xl shadow-slate-200">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{t('pages.doctors.modifyPractitioner')}</h4>
            <button
              onClick={() => navigate(`/doctors/edit/${id}`)}
              className="w-full btn-modern-primary py-4 rounded-2xl flex items-center justify-center gap-3"
            >
              <Edit size={18} /> {t('pages.doctors.modifyPractitioner')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
