import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Lock, Info } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const EditPermission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    key: '',
  });

  useEffect(() => {
    fetchPermission();
  }, [id]);

  const fetchPermission = async () => {
    try {
      const response = await api.get(`/permissions/${id}`);
      const permission = response.data.data || response.data;
      setFormData({
        key: permission.key || '',
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الصلاحية' : 'Failed to load permission');
      navigate('/permissions');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/permissions/${id}`, formData);
      toast.success(t('pages.editPermission.success'));
      navigate('/permissions');
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث الصلاحية' : 'Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.editPermission.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.editPermission.title')}
        subtitle={t('pages.editPermission.subtitle')}
        breadcrumbs={[{ label: t('menu.permissions'), path: '/permissions' }, { label: t('pages.editPermission.updatePermission') }]}
        backPath="/permissions"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Lock size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.editBook.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.editBook.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.permissions.scopeKey')}</label>
                <input
                  type="text"
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  required
                  placeholder="e.g., users.create, books.delete"
                  className="input-modern font-mono font-bold text-lg"
                />
                <p className="text-[10px] font-medium text-slate-400 italic">{isRTL ? 'استخدم ترميز النقطة (مثال: module.action)' : 'Use dot notation (e.g., module.action)'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.editPermission.deployUpdates')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/permissions')}
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

export default EditPermission;
