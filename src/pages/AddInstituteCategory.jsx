import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Save, Tag, FolderTree, Building2, ChevronRight, Loader2,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const AddInstituteCategory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [categoryType, setCategoryType] = useState(searchParams.get('type') || 'main');

  const [formData, setFormData] = useState({
    name: '',
    parentCategoryId: '',
  });

  useEffect(() => {
    if (categoryType === 'sub') fetchParentCategories();
  }, [categoryType]);

  const fetchParentCategories = async () => {
    setLoadingParents(true);
    try {
      const res = await api.get('/categories/products');
      const cats = res.data.data || res.data || [];
      const list = Array.isArray(cats) ? cats : [];
      // Only main institute categories (name must not contain " / " — matches seed-institute.js)
      const mains = list.filter((c) => c.isInstituteCategory && !String(c.name || '').includes(' / '));
      setParentCategories(mains);
    } catch {
      toast.error(isRTL ? 'فشل تحميل الفئات الرئيسية' : 'Failed to load main categories');
    } finally {
      setLoadingParents(false);
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
      let categoryName = formData.name.trim();

      if (categoryType === 'sub' && formData.parentCategoryId) {
        const parent = parentCategories.find(c => c.id === formData.parentCategoryId);
        if (parent) {
          categoryName = `${parent.name} / ${categoryName}`;
        }
      }

      const payload = {
        name: categoryName,
        isInstituteCategory: true,
      };

      await api.post('/categories/products', payload);
      toast.success(isRTL ? 'تم إنشاء الفئة بنجاح' : 'Category created successfully');
      navigate('/institute');
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? 'فشل إنشاء الفئة' : 'Failed to create category'));
    } finally {
      setLoading(false);
    }
  };

  const lb = (ar, en) => isRTL ? ar : en;

  const typeConfig = {
    main: {
      icon: Tag,
      gradient: 'from-blue-600 to-blue-700',
      shadowColor: 'shadow-blue-300/30',
      lightBg: 'bg-blue-50',
      lightText: 'text-blue-600',
      borderActive: 'border-blue-500/30',
      title: lb('فئة رئيسية', 'Main Category'),
      desc: lb('فئة أساسية لتصنيف منتجات دوائر الدولة', 'Primary category for government products'),
    },
    sub: {
      icon: FolderTree,
      gradient: 'from-indigo-600 to-violet-600',
      shadowColor: 'shadow-indigo-300/30',
      lightBg: 'bg-indigo-50',
      lightText: 'text-indigo-600',
      borderActive: 'border-indigo-500/30',
      title: lb('فئة فرعية', 'Sub Category'),
      desc: lb('فئة فرعية تتبع فئة رئيسية من دوائر الدولة', 'Sub-category that follows a main government category'),
    },
  };

  const cfg = typeConfig[categoryType];
  const TypeIcon = cfg.icon;

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={lb('إضافة فئة حكومية', 'Add Government Category')}
        subtitle={lb('إنشاء فئة جديدة خاصة بمنتجات دوائر الدولة', 'Create a new category for government products')}
        breadcrumbs={[
          { label: lb('دوائر الدولة', 'Government'), path: '/institute' },
          { label: lb('إضافة فئة', 'Add Category') },
        ]}
        backPath="/institute"
      />

      {/* Category Type Selector */}
      <div className="grid grid-cols-2 gap-4">
        {(['main', 'sub']).map((type) => {
          const tc = typeConfig[type];
          const TIcon = tc.icon;
          const isActive = categoryType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                setCategoryType(type);
                setFormData(prev => ({ ...prev, parentCategoryId: '' }));
              }}
              className={`card-premium p-6 text-start transition-all duration-300 border-2 ${
                isActive
                  ? `${tc.borderActive} bg-gradient-to-br ${tc.gradient} text-white shadow-2xl ${tc.shadowColor}`
                  : 'border-transparent bg-white hover:border-slate-200 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? 'bg-white/20' : tc.lightBg}`}>
                  <TIcon size={22} className={isActive ? 'text-white' : tc.lightText} />
                </div>
                {isActive && (
                  <div className="w-3 h-3 rounded-full bg-white/80 animate-pulse" />
                )}
              </div>
              <h3 className={`text-lg font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                {tc.title}
              </h3>
              <p className={`text-xs mt-1 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                {tc.desc}
              </p>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-8">
          {/* Category Info Card */}
          <div className="card-premium p-8 2xl:p-10 bg-white border-none shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
              <div className={`p-4 ${cfg.lightBg} ${cfg.lightText} rounded-2xl`}>
                <TypeIcon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{lb('بيانات الفئة', 'Category Details')}</h3>
                <p className="text-sm font-medium text-slate-400">{cfg.desc}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Parent Category - only for sub-categories */}
              {categoryType === 'sub' && (
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                    {lb('الفئة الرئيسية', 'Parent Category')} <span className="text-rose-500">*</span>
                  </label>
                  {loadingParents ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                      <Loader2 size={18} className="animate-spin text-slate-400" />
                      <span className="text-sm text-slate-400 font-bold">{lb('جاري تحميل الفئات...', 'Loading categories...')}</span>
                    </div>
                  ) : parentCategories.length === 0 ? (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-sm font-bold text-amber-700">
                        {lb('لا توجد فئات رئيسية. يرجى إنشاء فئة رئيسية أولاً', 'No main categories found. Please create a main category first')}
                      </p>
                    </div>
                  ) : (
                    <select
                      name="parentCategoryId"
                      value={formData.parentCategoryId}
                      onChange={handleChange}
                      required
                      className="input-modern font-bold"
                    >
                      <option value="">{lb('اختر الفئة الرئيسية...', 'Select parent category...')}</option>
                      {parentCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Category Name */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {categoryType === 'main' ? lb('اسم الفئة الرئيسية', 'Main Category Name') : lb('اسم الفئة الفرعية', 'Sub Category Name')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={categoryType === 'main'
                    ? lb('مثال: لوازم مكتبية حكومية', 'e.g., Government Office Supplies')
                    : lb('مثال: أوراق رسمية', 'e.g., Official Papers')
                  }
                  className="input-modern font-bold text-lg"
                />
              </div>

              {/* Preview for sub-category */}
              {categoryType === 'sub' && formData.parentCategoryId && formData.name && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-400 block mb-2">
                    {lb('معاينة اسم الفئة', 'Category Name Preview')}
                  </label>
                  <div className="flex items-center gap-2 text-sm font-black text-indigo-900">
                    <Tag size={14} className="text-indigo-400" />
                    <span>{parentCategories.find(c => c.id === formData.parentCategoryId)?.name}</span>
                    <ChevronRight size={14} className="text-indigo-300" />
                    <FolderTree size={14} className="text-indigo-400" />
                    <span>{formData.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-96 space-y-6 shrink-0 lg:sticky lg:top-28">
          <div className={`card-premium p-8 bg-gradient-to-br ${cfg.gradient} text-white border-none shadow-2xl`}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <Building2 size={18} className="text-white/70" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{lb('معلومات الفئة', 'Category Info')}</h3>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60">{lb('النوع', 'Type')}</span>
                <span className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-black tracking-wider uppercase backdrop-blur-sm">
                  {cfg.title}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/60">{lb('التصنيف', 'Classification')}</span>
                <span className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-black tracking-wider uppercase backdrop-blur-sm">
                  {lb('دوائر الدولة', 'Government')}
                </span>
              </div>

              {categoryType === 'sub' && formData.parentCategoryId && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white/60">{lb('تتبع', 'Follows')}</span>
                  <span className="px-3 py-1.5 bg-white/15 rounded-lg text-[10px] font-black tracking-wider backdrop-blur-sm max-w-[160px] truncate">
                    {parentCategories.find(c => c.id === formData.parentCategoryId)?.name || '—'}
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mt-4">
                <div className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-white/50" />
                  <span className="text-[10px] font-bold text-white/60">
                    {categoryType === 'main'
                      ? lb('سيتم إنشاء فئة رئيسية جديدة لدوائر الدولة', 'A new main government category will be created')
                      : lb('سيتم إنشاء فئة فرعية تابعة للفئة الرئيسية', 'A sub-category under the selected parent will be created')
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || (categoryType === 'sub' && parentCategories.length === 0)}
              className={`w-full bg-gradient-to-r ${cfg.gradient} text-white py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl font-black text-sm hover:opacity-90 transition-all disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={20} /> {lb('إنشاء الفئة', 'Create Category')}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/institute')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {lb('إلغاء', 'Cancel')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddInstituteCategory;
