import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const EditCategory = () => {
  const { type, id } = useParams(); // type = 'books' or 'products'
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchCategory();
  }, [type, id]);

  const fetchCategory = async () => {
    try {
      const response = await api.get(`/categories/${type}/${id}`);
      const category = response.data.data || response.data;
      setFormData({
        name: category.name || '',
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل الفئة' : 'Failed to load category');
      navigate('/categories');
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
      await api.put(`/categories/${type}/${id}`, formData);
      toast.success(t('pages.editCategory.success'));
      navigate('/categories');
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث الفئة' : 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.editCategory.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.editCategory.title')}
        subtitle={t('pages.editCategory.subtitle')}
        breadcrumbs={[{ label: t('menu.categories'), path: '/categories' }, { label: t('pages.editCategory.updateCategory') }]}
        backPath="/categories"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl"><Tag size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.addCategory.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.addCategory.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addCategory.categoryName')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('pages.addCategory.enterCategoryName')}
                  className="input-modern font-bold text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{isRTL ? 'معلمات التصنيف' : 'Classification Params'}</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{isRTL ? 'نوع الأصل' : 'Asset Type'}</span>
                <span className="badge-modern badge-modern-info uppercase tracking-widest">{type}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.editCategory.updateCategory')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.editCategory.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;


