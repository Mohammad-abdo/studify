import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, MapPin, Phone, Mail, Lock, Shield, ArrowLeft, Loader2, Save } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const PrintCenterForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    password: '',
    isActive: true,
  });

  useEffect(() => {
    if (isEdit) {
      fetchCenter();
    }
  }, [id]);

  const fetchCenter = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/print-centers/${id}`);
      const data = response.data.data;
      setFormData({
        name: data.name,
        location: data.location || '',
        phone: data.user.phone,
        email: data.user.email || '',
        isActive: data.isActive,
        password: '', // Don't show password
      });
    } catch (error) {
      toast.error(isRTL ? 'خطأ في استرجاع بيانات المطبعة' : 'Error fetching center data');
      navigate('/print-centers');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isEdit) {
        await api.put(`/print-centers/${id}`, {
          name: formData.name,
          location: formData.location,
          isActive: formData.isActive,
        });
        toast.success(isRTL ? 'تم تحديث البيانات بنجاح' : 'Center updated successfully');
      } else {
        // For new center, we need to create a user first
        // Usually handled by a dedicated endpoint, but we'll use auth/register
        await api.post('/auth/register', {
          phone: formData.phone,
          password: formData.password,
          email: formData.email,
          name: formData.name,
          type: 'PRINT_CENTER',
        });
        
        // After user creation, we might need to update the location if the register doesn't support it
        // But our updated authService already creates the PrintCenter profile
        toast.success(isRTL ? 'تم تسجيل المطبعة بنجاح' : 'Print center registered successfully');
      }
      navigate('/print-centers');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || (isRTL ? 'فشل في حفظ البيانات' : 'Failed to save data'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isRTL ? 'جاري تحميل البيانات...' : 'Loading Data...'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={isEdit ? (isRTL ? 'تعديل مطبعة' : 'Edit Print Center') : (isRTL ? 'تسجيل مطبعة جديدة' : 'Register New Center')}
        subtitle={isRTL ? 'إدارة بيانات ومعلومات الوصول لمركز الطباعة' : 'Manage print center credentials and operational details'}
        breadcrumbs={[{ label: isRTL ? 'المطابع' : 'Print Centers', path: '/print-centers' }, { label: isEdit ? t('common.edit') : t('common.add') }]}
        backPath="/print-centers"
      />

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="card-premium p-8 md:p-10 bg-white space-y-10">
          {/* Header Section */}
          <div className="flex items-center gap-6 pb-8 border-b border-slate-50">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-600/5">
              <Printer size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{isRTL ? 'بيانات الهوية' : 'Identity Manifest'}</h3>
              <p className="text-sm font-medium text-slate-400">{isRTL ? 'المعلومات الأساسية والتعريفية للمطبعة' : 'Core identification and production node details'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Center Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">{isRTL ? 'اسم المطبعة' : 'Center Name'}</label>
              <div className="relative group">
                <Printer size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isRTL ? 'أدخل اسم المطبعة...' : 'Enter center name...'}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-2xl py-4 pr-14 pl-6 font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">{isRTL ? 'رقم الهاتف (معرف الدخول)' : 'Terminal ID (Phone)'}</label>
              <div className="relative group">
                <Phone size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                <input
                  type="text"
                  required
                  disabled={isEdit}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+20xxxxxxxxx"
                  dir="ltr"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-2xl py-4 pr-14 pl-6 font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">{isRTL ? 'البريد الإلكتروني' : 'System Mailbox'}</label>
              <div className="relative group">
                <Mail size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                <input
                  type="email"
                  disabled={isEdit}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="print@example.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-2xl py-4 pr-14 pl-6 font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            {!isEdit && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">{isRTL ? 'كلمة المرور' : 'Access Key'}</label>
                <div className="relative group">
                  <Lock size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                  <input
                    type="password"
                    required={!isEdit}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-2xl py-4 pr-14 pl-6 font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-4">{isRTL ? 'الموقع الجغرافي' : 'Geographic Node'}</label>
              <div className="relative group">
                <MapPin size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={isRTL ? 'أدخل الموقع التفصيلي للمطبعة...' : 'Enter physical location details...'}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-teal-600/20 focus:bg-white rounded-2xl py-4 pr-14 pl-6 font-bold text-slate-900 placeholder:text-slate-300 transition-all outline-none text-sm"
                />
              </div>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 md:col-span-2">
              <div className="flex-1">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{isRTL ? 'حالة التفعيل' : 'Operational State'}</h4>
                <p className="text-xs font-medium text-slate-400">{isRTL ? 'تمكين أو تعطيل وصول المطبعة للنظام' : 'Enable or disable system access for this production node'}</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`w-14 h-8 rounded-full transition-all relative ${formData.isActive ? 'bg-teal-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${isRTL ? (formData.isActive ? 'left-1' : 'right-1') : (formData.isActive ? 'right-1' : 'left-1')}`}></div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/print-centers')}
            className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? (isRTL ? 'تحديث البيانات' : 'Deploy Updates') : (isRTL ? 'تسجيل المطبعة' : 'Initialize Node')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrintCenterForm;
