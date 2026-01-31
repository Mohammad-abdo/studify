import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Shield, Key, Info } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const EditRole = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    permissionIds: [],
  });

  useEffect(() => {
    fetchPermissions();
    fetchRole();
  }, [id]);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load permissions:', error);
    }
  };

  const fetchRole = async () => {
    try {
      const response = await api.get(`/roles/${id}`);
      const role = response.data.data || response.data;
      setFormData({
        name: role.name || '',
        permissionIds: role.permissions?.map(p => p.id) || [],
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الدور' : 'Failed to load role');
      navigate('/roles');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/roles/${id}`, formData);
      toast.success(t('pages.editRole.success'));
      navigate('/roles');
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث الدور' : 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.editRole.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.editRole.title')}
        subtitle={t('pages.editRole.subtitle')}
        breadcrumbs={[{ label: t('menu.roles'), path: '/roles' }, { label: t('pages.editRole.updateRole') }]}
        backPath="/roles"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Shield size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.editBook.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.editBook.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.roles.roleIdentity')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('pages.roles.search')}
                  className="input-modern font-bold text-lg uppercase"
                />
              </div>

              <div className="space-y-4">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.roles.permissionMatrix')}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {permissions.length === 0 ? (
                    <p className="text-slate-400 text-sm italic py-4">{t('pages.editRole.noPermissions')}</p>
                  ) : (
                    permissions.map((permission) => (
                      <label
                        key={permission.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                          formData.permissionIds.includes(permission.id)
                            ? 'border-blue-600 bg-blue-50/30 shadow-md shadow-blue-500/5'
                            : 'border-slate-50 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-colors ${
                          formData.permissionIds.includes(permission.id) ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                        }`}>
                          <Key size={16} />
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.permissionIds.includes(permission.id)}
                          onChange={() => handlePermissionToggle(permission.id)}
                          className="hidden"
                        />
                        <span className={`text-sm font-bold font-mono uppercase ${
                          formData.permissionIds.includes(permission.id) ? 'text-blue-900' : 'text-slate-600'
                        }`}>{permission.key}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{isRTL ? 'ملخص الصلاحيات' : 'Permission Summary'}</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{isRTL ? 'النطاقات المختارة' : 'Selected Scopes'}</span>
                <span className="badge-modern badge-modern-info">{formData.permissionIds.length} {t('pages.roles.scopeControls')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.editRole.deployUpdates')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/roles')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.editBook.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditRole;
