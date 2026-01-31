import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    isActive: true,
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      const userData = response.data.data || response.data;
      setUser(userData);
      setFormData({
        phone: userData.phone || '',
        email: userData.email || '',
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل المستخدم' : 'Failed to load user');
      navigate('/users');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/admin/users/${id}`, formData);
      toast.success(t('pages.editUser.success'));
      navigate(`/users/${id}`);
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث المستخدم' : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.editUser.loading')}</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.editUser.title')}
        subtitle={t('pages.editUser.subtitle')}
        breadcrumbs={[{ label: t('menu.users'), path: '/users' }, { label: t('pages.editUser.updateUser') }]}
        backPath={`/users/${id}`}
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200"><Fingerprint size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.editUser.terminalProfile')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.editUser.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.editUser.userType')}</label>
                  <input type="text" value={user.type} disabled className="input-modern opacity-60 cursor-not-allowed font-bold" />
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.editUser.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-modern font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.editUser.email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-modern font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.editUser.status')}</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('common.status')}</label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="true" className="text-slate-900">{t('pages.editUser.active')}</option>
                  <option value="false" className="text-slate-900">{t('pages.editUser.inactive')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.editUser.deployUpdates')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/users/${id}`)}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.editUser.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

