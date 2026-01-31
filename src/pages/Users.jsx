import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Filter, X, UserCheck, UserX, GraduationCap, Stethoscope, Truck, Briefcase, Shield, ChevronLeft, ChevronRight, Search, Mail, Phone, MoreHorizontal, Eye } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const UsersPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  useEffect(() => {
    fetchUsers();
  }, [page, filterType, filterStatus, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('isActive', filterStatus);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      toast.error(t('pages.users.syncError') || (isRTL ? 'خدمات الهوية غير متاحة حالياً' : 'Identity services currently unavailable'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? t('pages.users.confirmSuspend') : t('pages.users.confirmReinstate');
    const result = await Swal.fire({
      title: user.isActive ? t('pages.users.suspendAccess') : t('pages.users.reinstateAccess'),
      text: user.isActive 
        ? t('pages.users.suspendDesc').replace('{phone}', user.phone)
        : t('pages.users.reinstateDesc').replace('{phone}', user.phone),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.isActive ? '#f43f5e' : '#10b981',
      confirmButtonText: action,
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.put(`/admin/users/${user.id}`, { isActive: !user.isActive });
        toast.success(user.isActive ? t('pages.users.suspendSuccess') : t('pages.users.reinstateSuccess'));
        fetchUsers();
      } catch (error) {
        toast.error(t('pages.users.updateError') || (isRTL ? 'فشل تحديث مستوى الوصول' : 'Failed to update access level'));
      }
    }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: t('pages.users.irreversibleAction'),
      text: t('pages.users.purgeDesc').replace('{phone}', user.phone),
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: t('pages.users.purgeAccount'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/users/${user.id}`);
        toast.success(t('pages.users.purgeSuccess'));
        fetchUsers();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الحذف' : 'Purge operation failed');
      }
    }
  };

  const getUserTypeStyles = (type) => {
    switch (type) {
      case 'STUDENT': return { icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', label: t('menu.students') };
      case 'DOCTOR': return { icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50', label: t('menu.doctors') };
      case 'DELIVERY': return { icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50', label: t('menu.delivery') };
      case 'CUSTOMER': return { icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50', label: t('menu.customers') };
      case 'ADMIN': return { icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50', label: t('pages.users.admin') };
      default: return { icon: Users, color: 'text-slate-600', bg: 'bg-slate-50', label: type };
    }
  };

  const getUserProfileInfo = (user) => {
    if (user.student) return { name: user.student.name, info: user.student.college?.name || t('dashboard.academic') };
    if (user.doctor) return { name: user.doctor.name, info: user.doctor.specialization || t('pages.users.professional') };
    if (user.delivery) return { name: user.delivery.name, info: isRTL ? 'اللوجستيات' : 'Logistics' };
    if (user.customer) return { name: user.customer.entityName || user.customer.contactPerson, info: t('pages.users.merchant') };
    return { name: t('dashboard.admin'), info: t('pages.users.rootAccess') };
  };

  const columns = [
    {
      header: t('pages.users.operator'),
      accessor: 'phone',
      render: (user) => {
        const { name, info } = getUserProfileInfo(user);
        return (
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Users size={20} /></div>
                )}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
            </div>
            <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
              <span className="font-black text-slate-900 tracking-tight">{name}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{info}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: t('pages.users.classification'),
      accessor: 'type',
      render: (user) => {
        const { icon: Icon, color, bg, label } = getUserTypeStyles(user.type);
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${bg} ${color}`}>
            <Icon size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
          </div>
        );
      }
    },
    {
      header: t('pages.users.communication'),
      accessor: 'contact',
      hideOnMobile: true,
      render: (user) => (
        <div className={`flex flex-col gap-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center gap-2 text-slate-600">
            <Phone size={12} />
            <span className="text-xs font-bold font-mono">{user.phone}</span>
          </div>
          {user.email && (
            <div className="flex items-center gap-2 text-slate-400">
              <Mail size={12} />
              <span className="text-[10px] font-medium">{user.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: t('pages.users.systemRegistry'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (user) => (
        <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
          <span className="text-xs font-bold text-slate-500">{new Date(user.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-[10px] font-medium text-slate-300 uppercase tracking-tighter">{t('pages.users.onboardingDate')}</span>
        </div>
      )
    },
    {
      header: t('pages.users.accessControl'),
      accessor: 'actions',
      align: 'right',
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/users/${user.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <Eye size={18} />
          </button>
          <button onClick={() => handleToggleStatus(user)} className={`p-3 rounded-xl transition-all ${user.isActive ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
            {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
          </button>
          <button onClick={() => handleDelete(user)} className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition pb-20">
      <PageHeader
        title={t('pages.users.title')}
        subtitle={t('pages.users.subtitle')}
        breadcrumbs={[{ label: t('menu.users') }]}
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.users.search')}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="bg-slate-50 border-none rounded-2xl px-5 py-3.5 2xl:py-4 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
            >
              <option value="">{t('pages.users.classificationAll')}</option>
              <option value="STUDENT">{t('menu.students')}</option>
              <option value="DOCTOR">{t('menu.doctors')}</option>
              <option value="DELIVERY">{t('menu.delivery')}</option>
              <option value="CUSTOMER">{t('menu.customers')}</option>
              <option value="ADMIN">{isRTL ? 'مسؤول' : 'Administrator'}</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="bg-slate-50 border-none rounded-2xl px-5 py-3.5 2xl:py-4 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
            >
              <option value="">{t('pages.users.statusUniversal')}</option>
              <option value="true">{t('pages.users.stateActive')}</option>
              <option value="false">{t('pages.users.stateSuspended')}</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.users.syncingIdentity')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={users}
            columns={columns}
            loading={false}
            searchable={false}
            serverSide={true}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default UsersPage;
