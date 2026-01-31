import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Phone, Mail, Calendar, UserCheck, UserX, GraduationCap, Stethoscope, Truck, Briefcase, Shield, Building, MapPin, Fingerprint, ShieldAlert, Activity } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.data || response.data);
    } catch (error) {
      toast.error(isRTL ? 'فشل استرجاع الملف الشخصي' : 'Identity: Profile retrieval failed');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeStyles = (type) => {
    switch (type) {
      case 'STUDENT': return { icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', label: t('menu.students') };
      case 'DOCTOR': return { icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50', label: t('menu.doctors') };
      case 'DELIVERY': return { icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50', label: t('menu.delivery') };
      case 'CUSTOMER': return { icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50', label: t('menu.customers') };
      case 'ADMIN': return { icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50', label: isRTL ? 'مسؤول' : 'Admin' };
      default: return { icon: Users, color: 'text-slate-600', bg: 'bg-slate-50', label: type };
    }
  };

  const getUserProfileInfo = (user) => {
    if (user.student) {
      return {
        type: t('menu.students'),
        name: user.student.name,
        fields: [
          { label: isRTL ? 'عقدة الكلية' : 'College Node', value: user.student.college?.name || 'N/A', icon: Building },
          { label: isRTL ? 'القسم الأكاديمي' : 'Academic Dept', value: user.student.department?.name || 'N/A', icon: GraduationCap },
        ],
      };
    }
    if (user.doctor) {
      return {
        type: t('menu.doctors'),
        name: user.doctor.name,
        fields: [
          { label: t('pages.approvals.specialization'), value: user.doctor.specialization || 'N/A', icon: Stethoscope },
          { label: isRTL ? 'العقدة السريرية' : 'Clinical Node', value: user.doctor.college?.name || 'N/A', icon: Building },
        ],
      };
    }
    if (user.delivery) {
      return {
        type: t('menu.delivery'),
        name: user.delivery.name,
        fields: [
          { label: isRTL ? 'أصل النقل' : 'Transit Asset', value: user.delivery.vehicleType || 'N/A', icon: Truck },
          { label: isRTL ? 'الحالة التشغيلية' : 'Operational State', value: user.delivery.isAvailable ? (isRTL ? 'نشط' : 'ACTIVE') : (isRTL ? 'استعداد' : 'STANDBY'), icon: Activity },
        ],
      };
    }
    if (user.customer) {
      return {
        type: t('menu.customers'),
        name: user.customer.entityName || user.customer.contactPerson,
        fields: [
          { label: isRTL ? 'مسؤول الاتصال' : 'Contact Lead', value: user.customer.contactPerson || 'N/A', icon: Users },
          { label: isRTL ? 'هوية التاجر' : 'Merchant Identity', value: user.customer.entityName || 'N/A', icon: Briefcase },
        ],
      };
    }
    return {
      type: 'ADMIN',
      name: isRTL ? 'مسؤول النظام' : 'Root Administrator',
      fields: [],
    };
  };

  const handleToggleStatus = async () => {
    const action = user.isActive ? (isRTL ? 'إيقاف' : 'Suspend') : (isRTL ? 'إعادة تنشيط' : 'Reinstate');
    const result = await Swal.fire({
      title: isRTL ? `${action} الوصول؟` : `${action} Access?`,
      text: isRTL ? `المستخدم ${user.phone} سيتم ${user.isActive ? 'منعه من' : 'منحه'} الوصول للنظام.` : `User ${user.phone} will be ${user.isActive ? 'blocked from' : 'granted'} system access.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.isActive ? '#f43f5e' : '#10b981',
      confirmButtonText: isRTL ? `تأكيد ${action}` : `Confirm ${action}`,
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/users/${id}`, { isActive: !user.isActive });
        toast.success(isRTL ? `تمت ${user.isActive ? 'إيقاف' : 'إعادة تنشيط'} وصول المستخدم` : `User access ${user.isActive ? 'suspended' : 'reinstated'}`);
        fetchUser();
      } catch (error) {
        toast.error(isRTL ? 'خطأ داخلي: فشل تحديث الوصول' : 'Internal Server Error: Access update failed');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.userDetail.loadingProfile')}</span>
      </div>
    );
  }

  const profileInfo = getUserProfileInfo(user);
  const { icon: TypeIcon, color: typeColor, bg: typeBg, label: typeLabel } = getUserTypeStyles(user.type);

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.userDetail.title')}
        subtitle={t('pages.userDetail.subtitle')}
        breadcrumbs={[{ label: t('menu.users'), path: '/users' }, { label: isRTL ? 'الملف الشخصي' : 'Profile' }]}
        backPath="/users"
        actionLabel={t('pages.userDetail.editProfile')}
        actionPath={`/users/edit/${id}`}
      />

      <div className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Profile Area */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-xl shadow-slate-200">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Users size={48} /></div>
                  )}
                </div>
                <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-white shadow-lg ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  {user.isActive ? <UserCheck size={20} className="text-white" /> : <UserX size={20} className="text-white" />}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{profileInfo.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${typeBg} ${typeColor}`}>
                        <TypeIcon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{typeLabel}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{t('pages.userDetail.uuid')}: {user.id}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.userDetail.terminalIdentity')}</span>
                    <div className={`flex items-center gap-3 text-slate-900 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Phone size={16} className="text-blue-500" />
                      {user.phone}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.userDetail.systemMailbox')}</span>
                    <div className={`flex items-center gap-3 text-slate-900 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Mail size={16} className="text-indigo-500" />
                      {user.email || (isRTL ? 'لا يوجد بريد إلكتروني' : 'No registry email')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.userDetail.onboardingSequence')}</span>
                    <div className={`flex items-center gap-3 text-slate-900 font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar size={16} className="text-slate-400" />
                      {new Date(user.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.userDetail.registryState')}</span>
                    <div className={`flex items-center gap-2 font-black text-xs uppercase tracking-widest ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className={user.isActive ? 'text-emerald-600' : 'text-slate-400'}>{user.isActive ? t('pages.userDetail.activelySynced') : t('pages.userDetail.registryLocked')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {profileInfo.fields.length > 0 && (
            <div className="card-premium p-10 bg-white">
              <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200"><Fingerprint size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.userDetail.classificationData').replace('{type}', typeLabel)}</h3>
                  <p className="text-sm font-medium text-slate-400">{t('pages.userDetail.profileAttributes')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {profileInfo.fields.map((field, index) => {
                  const Icon = field.icon;
                  return (
                    <div key={index} className={`flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-500/30 transition-all duration-300 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                      <div className="p-3 bg-white text-slate-400 rounded-xl group-hover:text-blue-600 shadow-sm transition-all"><Icon size={20} /></div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{field.label}</span>
                        <span className="text-sm font-black text-slate-900">{field.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Sidebar */}
        <div className="w-full xl:w-80 space-y-6 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-8 bg-white border-2 border-slate-900 shadow-2xl shadow-slate-200">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">{t('pages.userDetail.accessOverride')}</h4>
            <div className="space-y-3">
              <button onClick={() => navigate(`/users/edit/${id}`)} className="w-full btn-modern-primary py-4 rounded-2xl flex items-center justify-center gap-3">
                <Edit size={18} /> {t('pages.userDetail.deployUpdate')}
              </button>
              <button 
                onClick={handleToggleStatus} 
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 flex items-center justify-center gap-3 active:scale-95 ${
                  user.isActive 
                    ? 'border-rose-100 text-rose-600 hover:bg-rose-50' 
                    : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {user.isActive ? <><UserX size={18} /> {t('pages.userDetail.lockTerminal')}</> : <><UserCheck size={18} /> {t('pages.userDetail.authorizeNode')}</>}
              </button>
            </div>
          </div>

          <div className="card-premium p-8 bg-rose-50 border-none">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <ShieldAlert size={20} strokeWidth={2.5} />
              <span className="text-xs font-black uppercase tracking-widest">{t('pages.userDetail.restrictedZone')}</span>
            </div>
            <p className="text-[10px] font-bold text-rose-400 leading-relaxed mb-6 uppercase tracking-wider">{t('pages.userDetail.irreversibleDestruction')}</p>
            <button className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95">{t('pages.userDetail.purgeEntity')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
