import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Image as ImageIcon, Link as LinkIcon, Layers } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import ImageUpload from '../components/ImageUpload';
import { useLanguage } from '../context/LanguageContext';

const EditSlider = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    linkUrl: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSlider();
  }, [id]);

  const fetchSlider = async () => {
    try {
      const response = await api.get(`/sliders/${id}`);
      const item = response.data.data || response.data;
      setFormData({
        imageUrl: item.imageUrl || '',
        title: item.title || '',
        description: item.description || '',
        linkUrl: item.linkUrl || '',
        order: item.order ?? 0,
        isActive: item.isActive ?? true,
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل بيانات الشريحة' : 'Failed to load slider');
      navigate('/sliders');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error(isRTL ? 'يرجى رفع صورة الشريحة' : 'Please upload a slider image');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/sliders/${id}`, {
        imageUrl: formData.imageUrl,
        title: formData.title || undefined,
        description: formData.description || undefined,
        linkUrl: formData.linkUrl || undefined,
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
      });
      toast.success(isRTL ? 'تم تحديث الشريحة بنجاح' : 'Slider updated successfully');
      navigate('/sliders');
    } catch (error) {
      toast.error(isRTL ? 'فشل تحديث الشريحة' : 'Failed to update slider');
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
        title={isRTL ? 'تعديل الشريحة' : 'Edit Slider'}
        subtitle={isRTL ? 'تحديث بيانات شريحة العرض' : 'Update slider banner details'}
        breadcrumbs={[{ label: isRTL ? 'الشرائح' : 'Sliders', path: '/sliders' }, { label: isRTL ? 'تعديل' : 'Edit' }]}
        backPath="/sliders"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Layers size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isRTL ? 'معلومات الشريحة' : 'Slider Information'}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                  {isRTL ? 'عنوان ووصف الشريحة اختياريان' : 'Title and description are optional'}
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'العنوان (اختياري)' : 'Title (Optional)'}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={isRTL ? 'عنوان الشريحة...' : 'Slider title...'}
                  className="input-modern font-bold text-lg"
                />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'الوصف (اختياري)' : 'Description (Optional)'}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder={isRTL ? 'وصف قصير للشريحة...' : 'Short description...'}
                  className="input-modern font-medium resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  <LinkIcon size={12} className="inline mr-1" />
                  {isRTL ? 'رابط الوجهة (اختياري)' : 'Destination Link (Optional)'}
                </label>
                <input
                  type="url"
                  name="linkUrl"
                  value={formData.linkUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="input-modern font-mono"
                />
              </div>
            </div>
          </div>

          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><ImageIcon size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isRTL ? 'صورة الشريحة' : 'Slider Image'}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                  {isRTL ? 'يُنصح بأبعاد 1920×600 بكسل' : 'Recommended size: 1920×600 px'}
                </p>
              </div>
            </div>
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              label={isRTL ? 'صورة الشريحة' : 'Slider image'}
              multiple={false}
            />
          </div>
        </div>

        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-10 bg-slate-900 text-white border-none shadow-2xl shadow-slate-300">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-10">
              {isRTL ? 'إعدادات النشر' : 'Publishing Settings'}
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                  {isRTL ? 'الترتيب' : 'Order'}
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span className="text-xs font-bold text-slate-300">
                  {isRTL ? 'الشريحة نشطة' : 'Slider is active'}
                </span>
              </label>
            </div>
          </div>

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
              onClick={() => navigate('/sliders')}
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

export default EditSlider;
