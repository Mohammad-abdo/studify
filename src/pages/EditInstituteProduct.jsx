import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save, Package, Image as ImageIcon, DollarSign, Plus, Trash2, Layers,
  Globe, Tag,
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const SEPARATOR = ' | ';

const splitBilingual = (value) => {
  if (!value) return ['', ''];
  const idx = value.indexOf(SEPARATOR);
  if (idx === -1) return [value, ''];
  return [value.substring(0, idx), value.substring(idx + SEPARATOR.length)];
};

const EditInstituteProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    categoryId: '',
    imageUrls: [],
    mainPrice: '',
    discountPrice: '',
    pricingStrategy: 'FIXED_TIERS',
  });

  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const p = res.data.data || res.data;
      let imgs = p.imageUrls || [];
      if (typeof imgs === 'string') {
        try { imgs = JSON.parse(imgs); } catch { imgs = []; }
      }

      const [nameAr, nameEn] = splitBilingual(p.name);
      const [descAr, descEn] = splitBilingual(p.description);

      let discountPrice = '';
      const pricingTiers = p.pricing || [];
      const singleUnitTier = pricingTiers.find(t => t.minQuantity === 1 && (t.maxQuantity === 1 || t.maxQuantity === null));
      if (singleUnitTier) {
        discountPrice = singleUnitTier.price ?? singleUnitTier.fixedPrice ?? '';
      }

      const otherTiers = pricingTiers.filter(t => !(t.minQuantity === 1 && t.maxQuantity === 1));

      setFormData({
        nameAr,
        nameEn,
        descriptionAr: descAr,
        descriptionEn: descEn,
        categoryId: p.categoryId || '',
        imageUrls: Array.isArray(imgs) ? imgs : [],
        mainPrice: p.basePrice ?? '',
        discountPrice,
        pricingStrategy: p.pricingStrategy || 'FIXED_TIERS',
      });

      if (otherTiers.length > 0) {
        setTiers(otherTiers.map(t => ({
          id: t.id,
          minQuantity: t.minQuantity,
          maxQuantity: t.maxQuantity ?? '',
          price: t.price,
        })));
      } else {
        setTiers([{ minQuantity: 1, maxQuantity: '', price: '' }]);
      }
    } catch {
      toast.error(isRTL ? 'فشل تحميل المنتج' : 'Failed to load product');
      navigate('/institute');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/products?isInstituteCategory=true');
      setCategories(res.data.data || res.data || []);
    } catch {
      toast.error(isRTL ? 'فشل تحميل الفئات' : 'Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTierChange = (idx, field, value) => {
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const nextMin = lastTier?.maxQuantity ? parseInt(lastTier.maxQuantity) + 1 : (lastTier?.minQuantity ? parseInt(lastTier.minQuantity) + 10 : 1);
    setTiers(prev => [...prev, { minQuantity: nextMin, maxQuantity: '', price: '' }]);
  };

  const removeTier = (idx) => {
    if (tiers.length <= 1) return;
    setTiers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const combinedName = [formData.nameAr.trim(), formData.nameEn.trim()].filter(Boolean).join(SEPARATOR);
      const combinedDesc = [formData.descriptionAr.trim(), formData.descriptionEn.trim()].filter(Boolean).join(SEPARATOR);

      const pricingTiers = tiers
        .filter(t => t.price && t.minQuantity)
        .map(t => ({
          minQuantity: parseInt(t.minQuantity),
          ...(t.maxQuantity && { maxQuantity: parseInt(t.maxQuantity) }),
          price: parseFloat(t.price),
        }));

      if (formData.discountPrice) {
        const hasQty1 = pricingTiers.some(t => t.minQuantity === 1 && t.maxQuantity === 1);
        if (!hasQty1) {
          pricingTiers.unshift({
            minQuantity: 1,
            maxQuantity: 1,
            price: parseFloat(formData.discountPrice),
          });
        }
      }

      const payload = {
        name: combinedName,
        description: combinedDesc,
        categoryId: formData.categoryId,
        isInstituteProduct: true,
        basePrice: formData.mainPrice ? parseFloat(formData.mainPrice) : undefined,
        pricingStrategy: formData.pricingStrategy,
        pricingTiers,
        ...(formData.imageUrls.length > 0 && { imageUrls: formData.imageUrls }),
      };

      await api.put(`/products/${id}`, payload);
      toast.success(isRTL ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully');
      navigate('/institute');
    } catch (err) {
      toast.error(err.response?.data?.message || (isRTL ? 'فشل تحديث المنتج' : 'Failed to update product'));
    } finally {
      setLoading(false);
    }
  };

  const lb = (ar, en) => isRTL ? ar : en;

  const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all';
  const labelCls = `text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`;

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lb('جاري تحميل بيانات المنتج...', 'Loading product data...')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={lb('تعديل منتج حكومي', 'Edit Government Product')}
        subtitle={lb('تحديث بيانات المنتج ومستويات التسعير', 'Update product data and pricing tiers')}
        breadcrumbs={[
          { label: lb('دوائر الدولة', 'Government'), path: '/institute' },
          { label: lb('تعديل المنتج', 'Edit Product') },
        ]}
        backPath="/institute"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-8">

          {/* Bilingual Product Info */}
          <div className="card-premium p-8 2xl:p-10 bg-white border-none shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Globe size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{lb('بيانات المنتج', 'Product Details')}</h3>
                <p className="text-sm font-medium text-slate-400">{lb('أدخل المعلومات باللغتين العربية والإنجليزية', 'Enter information in both Arabic and English')}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelCls}>
                    <span className="inline-flex items-center gap-1.5">
                      {lb('اسم المنتج (عربي)', 'Product Name (Arabic)')}
                      <span className="text-[8px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-black">AR</span>
                    </span>
                  </label>
                  <input type="text" name="nameAr" value={formData.nameAr} onChange={handleChange} required
                    placeholder={lb('أدخل اسم المنتج بالعربية', 'Enter product name in Arabic')}
                    className="input-modern font-bold text-lg" dir="rtl" />
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>
                    <span className="inline-flex items-center gap-1.5">
                      {lb('اسم المنتج (إنجليزي)', 'Product Name (English)')}
                      <span className="text-[8px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded font-black">EN</span>
                    </span>
                  </label>
                  <input type="text" name="nameEn" value={formData.nameEn} onChange={handleChange} required
                    placeholder={lb('أدخل اسم المنتج بالإنجليزية', 'Enter product name in English')}
                    className="input-modern font-bold text-lg" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelCls}>
                    <span className="inline-flex items-center gap-1.5">
                      {lb('الوصف (عربي)', 'Description (Arabic)')}
                      <span className="text-[8px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-black">AR</span>
                    </span>
                  </label>
                  <textarea name="descriptionAr" value={formData.descriptionAr} onChange={handleChange} required rows="4"
                    placeholder={lb('وصف تفصيلي بالعربية', 'Detailed description in Arabic')}
                    className="input-modern font-medium resize-none leading-relaxed" dir="rtl" />
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>
                    <span className="inline-flex items-center gap-1.5">
                      {lb('الوصف (إنجليزي)', 'Description (English)')}
                      <span className="text-[8px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded font-black">EN</span>
                    </span>
                  </label>
                  <textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleChange} required rows="4"
                    placeholder={lb('وصف تفصيلي بالإنجليزية', 'Detailed description in English')}
                    className="input-modern font-medium resize-none leading-relaxed" dir="ltr" />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card - Main Price + Discount Price */}
          <div className="card-premium p-8 2xl:p-10 bg-white border-none shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><DollarSign size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{lb('التسعير', 'Pricing')}</h3>
                <p className="text-sm font-medium text-slate-400">{lb('السعر الرئيسي وسعر الخصم', 'Main price and discount price')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelCls}>{lb('السعر الرئيسي ($)', 'Main Price ($)')}</label>
                <div className="relative">
                  <input type="number" step="0.01" min="0" name="mainPrice" value={formData.mainPrice}
                    onChange={handleChange} required placeholder="0.00"
                    className="input-modern font-black text-2xl text-slate-900 py-4" />
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'}`}>
                    <span className="text-xs font-black text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">{lb('السعر الأصلي', 'Original')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>{lb('سعر الخصم ($)', 'Discount Price ($)')}</label>
                <div className="relative">
                  <input type="number" step="0.01" min="0" name="discountPrice" value={formData.discountPrice}
                    onChange={handleChange} placeholder="0.00"
                    className="input-modern font-black text-2xl text-emerald-600 py-4" />
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-4' : 'right-4'}`}>
                    <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{lb('بعد الخصم', 'Discounted')}</span>
                  </div>
                </div>
              </div>
            </div>

            {formData.mainPrice && formData.discountPrice && parseFloat(formData.mainPrice) > 0 && parseFloat(formData.discountPrice) > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Tag size={16} className="text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700">{lb('نسبة الخصم', 'Discount Rate')}</span>
                  </div>
                  <span className="text-lg font-black text-emerald-600">
                    {Math.round(((parseFloat(formData.mainPrice) - parseFloat(formData.discountPrice)) / parseFloat(formData.mainPrice)) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="card-premium p-8 2xl:p-10 bg-white border-none shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><ImageIcon size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{lb('صور المنتج', 'Product Images')}</h3>
                <p className="text-sm font-medium text-slate-400">{lb('أضف حتى 5 صور', 'Upload up to 5 images')}</p>
              </div>
            </div>
            <ImageUpload
              value={formData.imageUrls}
              onChange={(urls) => setFormData(prev => ({ ...prev, imageUrls: Array.isArray(urls) ? urls : [urls] }))}
              label={lb('صور المنتج', 'Product Images')}
              multiple={true}
              maxImages={5}
            />
          </div>

          {/* Pricing Tiers */}
          <div className="card-premium p-8 2xl:p-10 bg-white border-none shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl"><Layers size={24} /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{lb('مستويات تسعير الجملة', 'Wholesale Pricing Tiers')}</h3>
                  <p className="text-sm font-medium text-slate-400">{lb('أسعار مخصصة حسب الكمية المطلوبة', 'Custom prices based on order quantity')}</p>
                </div>
              </div>
              <button type="button" onClick={addTier}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 text-violet-600 rounded-xl text-xs font-black hover:bg-violet-100 transition-all">
                <Plus size={16} />
                {lb('إضافة مستوى', 'Add Tier')}
              </button>
            </div>

            <div className="space-y-4">
              {tiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-black text-slate-400 border border-slate-100 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{lb('من كمية', 'Min Qty')}</label>
                      <input type="number" min="1" value={tier.minQuantity}
                        onChange={(e) => handleTierChange(idx, 'minQuantity', e.target.value)}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{lb('إلى كمية', 'Max Qty')}</label>
                      <input type="number" min="1" value={tier.maxQuantity}
                        onChange={(e) => handleTierChange(idx, 'maxQuantity', e.target.value)}
                        placeholder={lb('غير محدود', '∞')}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{lb('السعر ($)', 'Price ($)')}</label>
                      <input type="number" step="0.01" min="0" value={tier.price} required
                        onChange={(e) => handleTierChange(idx, 'price', e.target.value)}
                        className={inputCls} />
                    </div>
                  </div>
                  {tiers.length > 1 && (
                    <button type="button" onClick={() => removeTier(idx)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all shrink-0">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-96 space-y-6 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-8 bg-gradient-to-br from-blue-900 to-indigo-900 text-white border-none shadow-2xl shadow-blue-300/30">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
              <Package size={18} className="text-blue-300" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">{lb('تصنيف المنتج', 'Classification')}</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-blue-400">{lb('الفئة', 'Category')}</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:ring-2 focus:ring-blue-400 transition-all outline-none backdrop-blur-sm">
                  <option value="" className="text-slate-900">{lb('اختر الفئة', 'Select category')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="text-slate-900">{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-blue-400">{lb('استراتيجية التسعير', 'Pricing Strategy')}</label>
                <select name="pricingStrategy" value={formData.pricingStrategy} onChange={handleChange}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:ring-2 focus:ring-blue-400 transition-all outline-none backdrop-blur-sm">
                  <option value="FIXED_TIERS" className="text-slate-900">{lb('أسعار ثابتة', 'Fixed Tiers')}</option>
                  <option value="DISCOUNT_TIERS" className="text-slate-900">{lb('خصم تدريجي', 'Discount Tiers')}</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-300">
                  <Package size={14} />
                  <span>{lb('منتج دوائر الدولة', 'Government Product')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-300/30 font-black text-sm hover:shadow-blue-400/40 transition-all disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> {lb('حفظ التغييرات', 'Save Changes')}</>}
            </button>
            <button type="button" onClick={() => navigate('/institute')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
              {lb('إلغاء', 'Cancel')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditInstituteProduct;
