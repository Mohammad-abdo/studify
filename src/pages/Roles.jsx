import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Edit, Trash2, Search, Key, ShieldCheck } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Roles = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      setRoles(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'الأمان: سجل الأدوار غير متاح' : 'Security: Role registry unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (role) => {
    const result = await Swal.fire({
      title: t('pages.roles.abolishRole'),
      text: t('pages.roles.abolishRoleDesc').replace('{name}', role.name),
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: t('pages.roles.confirmAbolish'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/roles/${role.id}`);
        toast.success(isRTL ? 'تم إلغاء دور الأمان' : 'Security role abolished');
        fetchRoles();
      } catch (error) {
        toast.error(isRTL ? 'فشل العملية: قيود الجذر' : 'Operation failed: Root restriction');
      }
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: t('pages.roles.roleIdentity'),
      accessor: 'name',
      render: (role) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Shield size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight uppercase text-sm">{role.name}</span>
            <span className="text-[10px] font-bold text-slate-400 font-mono">{t('pages.userDetail.uuid')}: {role.id.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.roles.permissionMatrix'),
      accessor: 'permissions',
      render: (role) => (
        <div className="flex items-center gap-2">
          <Key size={14} className="text-blue-500" />
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
            {role.permissions?.length || 0} {t('pages.roles.scopeControls')}
          </span>
        </div>
      ),
    },
    {
      header: t('pages.roles.accessLevel'),
      accessor: 'id',
      align: 'center',
      render: (role) => (
        <div className="flex items-center justify-center gap-1">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 uppercase">{t('pages.roles.authorized')}</span>
        </div>
      )
    },
    {
      header: t('pages.roles.operations'),
      accessor: 'actions',
      align: 'right',
      render: (role) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/roles/edit/${role.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(role)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.roles.title')}
        subtitle={t('pages.roles.subtitle')}
        breadcrumbs={[{ label: isRTL ? 'صلاحيات الوصول' : 'RBAC' }, { label: t('menu.roles') }]}
        actionLabel={t('pages.roles.defineNewRole')}
        actionPath="/roles/add"
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.roles.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.roles.syncingMatrices')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredRoles}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Roles;
