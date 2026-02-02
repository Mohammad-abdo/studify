import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { LogIn, Phone, Lock } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submitLock = useRef(false);
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLock.current || loading) return;
    submitLock.current = true;
    setLoading(true);

    try {
      const result = await login(phone, password);
      if (result.success) {
        toast.success(t('login.accessGranted'));
        navigate('/');
      } else {
        const msg = result.error === 'TOO_MANY_REQUESTS' ? t('login.tooManyRequests') : (result.error || t('login.verificationFailed'));
        toast.error(msg);
      }
    } catch (error) {
      toast.error(t('login.authError'));
    } finally {
      setLoading(false);
      submitLock.current = false;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden ${isRTL ? 'font-arabic' : ''}`}>
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10 page-transition">
        <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 border border-white/10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-2xl mb-6 shadow-xl shadow-blue-500/10">
              <Logo size="medium" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t('login.title')}</h1>
            <p className="text-slate-400 font-medium text-sm">{t('login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('login.phone')}</label>
              <div className="relative">
                <Phone size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  placeholder="+20 123 456 7890"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400 ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('login.password')}</label>
              <div className="relative">
                <Lock size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-50 border-none rounded-2xl py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-modern-primary py-5 rounded-2xl shadow-xl shadow-slate-200 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="uppercase tracking-[0.2em] text-xs font-black">{t('login.authorize')}</span>
                  <LogIn size={18} className={`${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'} transition-transform`} />
                </div>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t('login.copyright')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
