import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Plus, Edit, Trash2, Search, ShieldAlert, Lock } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const Permissions = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/permissions');
      setPermissions(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'نطاقات الأمان: فشل مزامنة نطاق الصلاحيات' : 'Security: Permission scope sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (permission) => {
    const result = await Swal.fire({
      title: t('pages.permissions.restrictScope'),
      text: t('pages.permissions.restrictScopeDesc').replace('{key}', permission.key),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.permissions.confirmRestriction'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/permissions/${permission.id}`);
        toast.success(isRTL ? 'تم تقييد نطاق الصلاحيات' : 'Permission scope restricted');
        fetchPermissions();
      } catch (error) {
        toast.error(isRTL ? 'فشل العملية: تم رفض الوصول' : 'Operation failed: Access denied');
      }
    }
  };

  const filteredPermissions = permissions.filter((permission) =>
    permission.key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: t('pages.permissions.scopeKey'),
      accessor: 'key',
      render: (permission) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
            <Lock size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tight font-mono text-sm uppercase">{permission.key}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">{t('pages.permissions.systemPermissionNode')}</span>
          </div>
        </div>
      ),
    },
    {
      header: t('pages.permissions.securityLevel'),
      accessor: 'id',
      align: 'center',
      render: (permission) => (
        <div className="flex items-center justify-center gap-1.5">
          <ShieldAlert size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase text-amber-600">{t('pages.permissions.restrictedNode')}</span>
        </div>
      )
    },
    {
      header: t('pages.permissions.registryId'),
      accessor: 'id',
      hideOnMobile: true,
      render: (permission) => <span className="text-[10px] font-mono text-slate-300">{t('pages.userDetail.uuid')}: {permission.id.slice(0, 12)}...</span>
    },
    {
      header: t('pages.permissions.operations'),
      accessor: 'actions',
      align: 'right',
      render: (permission) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/permissions/edit/${permission.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18} /></button>
          <button onClick={() => handleDelete(permission)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 2xl:space-y-8 page-transition">
      <PageHeader
        title={t('pages.permissions.title')}
        subtitle={t('pages.permissions.subtitle')}
        breadcrumbs={[{ label: isRTL ? 'صلاحيات الوصول' : 'RBAC' }, { label: t('menu.permissions') }]}
        actionLabel={t('pages.permissions.registerScope')}
        actionPath="/permissions/add"
      />

      <div className="card-premium p-4 2xl:p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="relative max-w-2xl">
          <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={t('pages.permissions.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full bg-slate-50 border-none rounded-2xl py-3.5 2xl:py-4 font-bold text-sm 2xl:text-base focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.permissions.syncingNodes')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredPermissions}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default Permissions;
