import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const AddStaticPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSlugChange = (e) => {
    // Auto-format slug: lowercase, replace spaces with hyphens, remove special chars
    const slug = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({
      ...prev,
      slug,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/static-pages', formData);
      toast.success(t('pages.addStaticPage.success'));
      navigate('/static-pages');
    } catch (error) {
      toast.error(isRTL ? 'فشل تسجيل المحتوى' : 'Registration failed: Manifest error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.addStaticPage.title')}
        subtitle={t('pages.addStaticPage.subtitle')}
        breadcrumbs={[{ label: t('menu.staticPages'), path: '/static-pages' }, { label: t('pages.addStaticPage.draftPage') }]}
        backPath="/static-pages"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.addStaticPage.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.addStaticPage.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addStaticPage.pageTitle')}</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder={t('pages.addStaticPage.enterPageTitle')}
                    className="input-modern font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addStaticPage.slug')}</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    required
                    placeholder={t('pages.addStaticPage.slugPlaceholder')}
                    pattern="[a-z0-9-]+"
                    className="input-modern font-mono font-bold"
                  />
                  <p className="text-[10px] font-medium text-slate-400 italic">{t('pages.addStaticPage.slugHint')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addStaticPage.content')}</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows="15"
                  placeholder={t('pages.addStaticPage.enterContent')}
                  className="input-modern font-mono text-sm resize-none leading-relaxed"
                />
                <p className="text-[10px] font-medium text-slate-400 italic">{t('pages.addStaticPage.contentHint')}</p>
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
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.addStaticPage.initializeRegistry')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/static-pages')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.addStaticPage.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStaticPage;


