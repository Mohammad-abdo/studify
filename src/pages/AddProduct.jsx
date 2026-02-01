import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Package, Image as ImageIcon } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const AddProduct = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    imageUrls: [], // For product images (multiple)
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/products');
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        ...(formData.imageUrls.length > 0 && { imageUrls: formData.imageUrls }),
      };
      await api.post('/products', payload);
      toast.success(t('pages.addProduct.success'));
      navigate('/products');
    } catch (error) {
      toast.error(isRTL ? 'فشل إنشاء المنتج' : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.addProduct.title')}
        subtitle={t('pages.addProduct.subtitle')}
        breadcrumbs={[{ label: t('menu.products'), path: '/products' }, { label: t('pages.addProduct.addProduct') }]}
        backPath="/products"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        {/* Main Entry Form */}
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><Package size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.addProduct.technicalManifest')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.addProduct.primaryIdentification')}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addProduct.productName')}</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t('pages.addProduct.enterProductName')}
                  className="input-modern font-bold text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('pages.addProduct.logicalContent')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder={t('pages.addProduct.enterDescription')}
                  className="input-modern font-medium resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><ImageIcon size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t('pages.addProduct.visualEvidence')}</h3>
                <p className="text-sm font-medium text-slate-400">{t('pages.addProduct.primaryIdentification')}</p>
              </div>
            </div>
            <ImageUpload
              value={formData.imageUrls}
              onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: Array.isArray(urls) ? urls : [urls] }))}
              label={t('pages.addProduct.assetVisualMatrix')}
              multiple={true}
              maxImages={5}
            />
          </div>
        </div>

        {/* Configuration Sidebar */}
        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">{t('pages.addProduct.classification')}</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('pages.categories.title')}</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                >
                  <option value="" className="text-slate-900">{t('pages.addProduct.selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-slate-900">{cat.name}</option>
                  ))}
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
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> {t('pages.addProduct.initializeRegistry')}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {t('pages.addProduct.abortMission')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

