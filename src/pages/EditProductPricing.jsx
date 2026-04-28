import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Package, DollarSign } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const EditProductPricing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [pricing, setPricing] = useState(null);
  const [formData, setFormData] = useState({
    minQuantity: '',
    maxQuantity: '',
    price: '',
    fixedPrice: '',
    discountPercent: '',
  });

  useEffect(() => {
    fetchPricing();
  }, [id]);

  const fetchPricing = async () => {
    try {
      const response = await api.get(`/product-pricing/${id}`);
      const item = response.data.data || response.data;
      setPricing(item);
      setFormData({
        minQuantity: item.minQuantity ?? '',
        maxQuantity: item.maxQuantity ?? '',
        price: item.price ?? '',
        fixedPrice: item.fixedPrice ?? '',
        discountPercent: item.discountPercent ?? '',
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل بيانات التسعيرة' : 'Failed to load pricing');
      navigate('/product-pricing');
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
      const payload = {
        minQuantity: parseInt(formData.minQuantity),
        price: parseFloat(formData.price),
      };
      if (formData.maxQuantity !== '') payload.maxQuantity = parseInt(formData.maxQuantity);
      if (formData.fixedPrice !== '') payload.fixedPrice = parseFloat(formData.fixedPrice);
      if (formData.discountPercent !== '') payload.discountPercent = parseFloat(formData.discountPercent);

      await api.put(`/product-pricing/${id}`, payload);
      toast.success(isRTL ? 'تم تحديث التسعيرة بنجاح' : 'Pricing updated successfully');
      navigate('/product-pricing');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
        (isRTL ? 'فشل تحديث التسعيرة' : 'Failed to update pricing')
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={isRTL ? 'تعديل تسعيرة المنتج' : 'Edit Product Pricing'}
        subtitle={pricing?.product?.name || ''}
        breadcrumbs={[{ label: isRTL ? 'تسعيرة المنتجات' : 'Product Pricing', path: '/product-pricing' }, { label: isRTL ? 'تعديل' : 'Edit' }]}
        backPath="/product-pricing"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-10">
          {pricing && (
            <div className="card-premium p-6 bg-orange-50 border border-orange-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-orange-600 rounded-xl shadow-sm"><Package size={20} /></div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-orange-400">{isRTL ? 'المنتج' : 'Product'}</p>
                  <p className="font-black text-slate-900">{pricing.product?.name || pricing.productId}</p>
                </div>
              </div>
            </div>
          )}

          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><DollarSign size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isRTL ? 'تعديل الشريحة' : 'Update Tier'}
                </h3>
              </div>
            </div>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                    {isRTL ? 'الحد الأدنى للكمية' : 'Min Quantity'} *
                  </label>
                  <input
                    type="number"
                    name="minQuantity"
                    value={formData.minQuantity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="input-modern font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                    {isRTL ? 'الحد الأقصى (اختياري)' : 'Max Quantity (Optional)'}
                  </label>
                  <input
                    type="number"
                    name="maxQuantity"
                    value={formData.maxQuantity}
                    onChange={handleChange}
                    min="1"
                    className="input-modern font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'سعر الوحدة' : 'Unit Price'} *
                </label>
                <div className="relative">
                  <DollarSign size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`input-modern font-black text-lg ${isRTL ? 'pr-10' : 'pl-10'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                    {isRTL ? 'سعر ثابت (اختياري)' : 'Fixed Price (Optional)'}
                  </label>
                  <input
                    type="number"
                    name="fixedPrice"
                    value={formData.fixedPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input-modern font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                    {isRTL ? 'نسبة الخصم % (اختياري)' : 'Discount % (Optional)'}
                  </label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="input-modern font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={20} /> {isRTL ? 'حفظ التغييرات' : 'Save Changes'}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/product-pricing')}
              className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductPricing;
