import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, BarChart3 } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const EditDashboardMetric = () => {
  const { key } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ value: '', metadata: '' });
  const [metadataError, setMetadataError] = useState('');

  useEffect(() => {
    fetchMetric();
  }, [key]);

  const fetchMetric = async () => {
    try {
      const response = await api.get(`/dashboard-metrics/${key}`);
      const item = response.data.data || response.data;
      setFormData({
        value: String(item.value ?? ''),
        metadata: item.metadata ? JSON.stringify(item.metadata, null, 2) : '',
      });
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل بيانات المقياس' : 'Failed to load metric');
      navigate('/dashboard-metrics');
    } finally {
      setFetching(false);
    }
  };

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
      await api.put(`/dashboard-metrics/${key}`, {
        value: formData.value.trim(),
        ...(metadata !== undefined && { metadata }),
      });
      toast.success(isRTL ? 'تم تحديث المقياس بنجاح' : 'Metric updated successfully');
      navigate('/dashboard-metrics');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
        (isRTL ? 'فشل تحديث المقياس' : 'Failed to update metric')
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
        title={isRTL ? `تعديل المقياس: ${key}` : `Edit Metric: ${key}`}
        subtitle={isRTL ? 'تحديث قيمة المقياس والبيانات الوصفية' : 'Update metric value and metadata'}
        breadcrumbs={[{ label: isRTL ? 'مقاييس اللوحة' : 'Dashboard Metrics', path: '/dashboard-metrics' }, { label: isRTL ? 'تعديل' : 'Edit' }]}
        backPath="/dashboard-metrics"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-6 bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white text-slate-600 rounded-xl shadow-sm"><BarChart3 size={20} /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{isRTL ? 'مفتاح المقياس' : 'Metric Key'}</p>
                <p className="font-black text-slate-900 font-mono text-lg">{key}</p>
              </div>
            </div>
          </div>

          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-slate-100 text-slate-700 rounded-2xl"><BarChart3 size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isRTL ? 'تعديل القيمة' : 'Update Value'}
                </h3>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'القيمة' : 'Value'} *
                </label>
                <input
                  type="text"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required
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
                  rows="5"
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
                : <><Save size={20} /> {isRTL ? 'حفظ التغييرات' : 'Save Changes'}</>}
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

export default EditDashboardMetric;
