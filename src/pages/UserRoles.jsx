import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCog, Plus, Edit, Trash2, Search, Filter, ShieldCheck, ShieldAlert, Key } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const UserRoles = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user-roles');
      setUserRoles(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل مزامنة تعيينات أدوار المستخدمين' : 'Security: User role assignments sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignment) => {
    const result = await Swal.fire({
      title: t('pages.userRoles.revokeClearance'),
      text: t('pages.userRoles.revokeClearanceDesc'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.userRoles.confirmRevoke'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/user-roles/${assignment.id}`);
        toast.success(isRTL ? 'تم سحب التصريح الأمني' : 'Security clearance revoked');
        fetchUserRoles();
      } catch (error) {
        toast.error(isRTL ? 'فشل السحب: قيود السياسة الأمنية' : 'Revocation failed: Security policy restriction');
      }
    }
  };

  const columns = [
    {
      header: t('pages.userRoles.terminalOperator'),
      accessor: 'user',
      render: (userRole) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <UserCog size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight font-mono text-xs">{userRole.user?.phone || t('pages.userRoles.unknownTerminal')}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{userRole.user?.type || t('pages.userRoles.guest')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.userRoles.assignedSecurityGroup'),
      accessor: 'role',
      render: (userRole) => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-blue-500" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
            {userRole.role?.name || t('pages.userRoles.standardAccess')}
          </span>
        </div>
      ),
    },
    {
      header: t('pages.userRoles.registrySync'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (userRole) => (
        <span className="text-[10px] font-bold text-slate-400 font-mono">
          {new Date(userRole.createdAt).toLocaleString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      )
    },
    {
      header: t('pages.userRoles.operations'),
      accessor: 'actions',
      align: 'right',
      render: (userRole) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/user-roles/edit/${userRole.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(userRole)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  const filteredUserRoles = userRoles.filter((ur) => {
    const userPhone = ur.user?.phone?.toLowerCase() || '';
    const roleName = ur.role?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return userPhone.includes(search) || roleName.includes(search);
  });

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition pb-20">
      <PageHeader
        title={t('pages.userRoles.title')}
        subtitle={t('pages.userRoles.subtitle')}
        breadcrumbs={[{ label: isRTL ? 'صلاحيات الوصول' : 'RBAC' }, { label: t('menu.userRoles') }]}
        actionLabel={t('pages.userRoles.assignAccess')}
        actionPath="/user-roles/add"
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-4 2xl:gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.userRoles.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3.5 2xl:p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.userRoles.syncingRbac')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredUserRoles}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default UserRoles;
