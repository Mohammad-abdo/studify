import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, User, Phone, Lock, Mail } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const USER_TYPES = ['ADMIN', 'STUDENT', 'DOCTOR', 'DELIVERY', 'CUSTOMER', 'INSTITUTE', 'PRINT_CENTER'];

const AddUser = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    name: '',
    email: '',
    type: searchParams.get('type') || 'STUDENT',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', {
        phone: formData.phone.trim(),
        password: formData.password,
        type: formData.type,
        ...(formData.name && { name: formData.name.trim() }),
        ...(formData.email && { email: formData.email.trim() }),
      });
      toast.success(isRTL ? 'تم إنشاء المستخدم بنجاح' : 'User created successfully');
      navigate('/users');
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
        (isRTL ? 'فشل إنشاء المستخدم' : 'Failed to create user')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={isRTL ? 'إضافة مستخدم' : 'Add User'}
        subtitle={isRTL ? 'إنشاء حساب مستخدم جديد في المنصة' : 'Create a new user account on the platform'}
        breadcrumbs={[{ label: isRTL ? 'المستخدمون' : 'Users', path: '/users' }, { label: isRTL ? 'إضافة' : 'Add' }]}
        backPath="/users"
      />

      <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-10">
          <div className="card-premium p-10 bg-white">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><User size={24} /></div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isRTL ? 'بيانات المستخدم' : 'User Details'}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                  {isRTL ? 'رقم الهاتف وكلمة المرور إلزاميان' : 'Phone and password are required'}
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  {isRTL ? 'نوع المستخدم' : 'User Type'} *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="input-modern font-bold"
                >
                  {USER_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  <Phone size={12} className="inline mr-1" />
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+20..."
                  className="input-modern font-mono font-bold"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                  <Lock size={12} className="inline mr-1" />
                  {isRTL ? 'كلمة المرور' : 'Password'} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder={isRTL ? 'على الأقل 8 أحرف' : 'At least 8 characters'}
                  className="input-modern font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                    {isRTL ? 'الاسم (اختياري)' : 'Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={isRTL ? 'اسم المستخدم...' : 'User name...'}
                    className="input-modern font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                    <Mail size={12} className="inline mr-1" />
                    {isRTL ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className="input-modern font-bold"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-96 space-y-8 shrink-0 lg:sticky lg:top-28">
          <div className="card-premium p-8 bg-slate-900 text-white border-none">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
              {isRTL ? 'ملاحظة' : 'Note'}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isRTL
                ? 'سيتم إنشاء الحساب بدون التحقق من رقم الهاتف. يمكن للمستخدم تسجيل الدخول فوراً.'
                : 'The account will be created without phone verification. The user can log in immediately.'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl flex items-center justify-center gap-3 shadow-2xl"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={20} /> {isRTL ? 'إنشاء المستخدم' : 'Create User'}</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/users')}
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

export default AddUser;
