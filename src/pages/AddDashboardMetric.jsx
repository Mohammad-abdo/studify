import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, BarChart3, Hash } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const AddDashboardMetric = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ key: '', value: '', metadata: '' });
  const [metadataError, setMetadataError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'metadata') setMetadataError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let metadata;
    if (formData.metadata.trim()) {
      try {
        metadata = JSON.parse(formData.metadata);
      } catch {
        setMetadataError(isRTL ? 'الـ JSON غير صالح' : 'Invalid JSON');
        return;
      }
    }
    setLoading(true);
    try {
      await api.post('/dashboard-metrics', {
        key: formData.key.trim(),
        value: formData.value.trim(),
        ...(metadata !== undefined && { metadata }),
      });
      toast.success(isRTL ? 'تم إضافة المقياس بنجاح' : 'Metric added successfully');
      navigate('/dashboard-metrics');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
        (isRTL ? 'فشل إضافة المقياس' : 'Failed to add metric')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={isRTL ? 'إضافة مقياس' : 'Add Metric'}
        subtitle={isRTL ? 'إضافة مقياس جديد للوحة التحكم' : 'Add a new key-value metric to the dashboard'}
        breadcrumbs={[{ label: isRTL ? 'مقاييس اللوحة' : 'Dashboard Metrics', path: '/dashboard-metrics' }, { label: isRTL ? 'إضافة' : 'Add' }]}
        backPath="/dashboard-metrics"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-slate-100 text-slate-700 rounded-2xl"><BarChart3 size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isRTL ? 'تفاصيل المقياس' : 'Metric Details'}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                  {isRTL ? 'المفتاح فريد ولا يمكن تغييره لاحقاً' : 'Key is unique and cannot be changed later'}
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'المفتاح (key)' : 'Key'} *
                </label>
                <div className="relative">
                  <Hash size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                  <input
                    type="text"
                    name="key"
                    value={formData.key}
                    onChange={handleChange}
                    required
                    placeholder="e.g. total_users"
                    className={`input-modern font-mono font-bold ${isRTL ? 'pr-10' : 'pl-10'}`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  {isRTL ? 'استخدم حروف صغيرة وشرطة سفلية فقط' : 'Use lowercase letters and underscores only'}
                </p>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'القيمة (value)' : 'Value'} *
                </label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required
                  placeholder={isRTL ? 'قيمة المقياس...' : 'Metric value...'}
                  className="input-modern font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'البيانات الوصفية JSON (اختياري)' : 'Metadata JSON (Optional)'}
                </label>
                <textarea
                  name="metadata"
                  value={formData.metadata}
                  onChange={handleChange}
                  rows="4"
                  placeholder='{"key": "value"}'
                  className={`input-modern font-mono text-sm resize-none ${metadataError ? 'ring-2 ring-rose-500' : ''}`}
                />
                {metadataError && <p className="text-xs font-bold text-rose-500">{metadataError}</p>}
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
                : <><Save size={20} /> {isRTL ? 'حفظ المقياس' : 'Save Metric'}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard-metrics')}
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

export default AddDashboardMetric;
