import { useNavigate } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Unauthorized Access Page
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-50 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="text-center px-4 max-w-md page-transition">
        <div className="mb-8 flex justify-center">
          <div className="p-6 bg-rose-50 rounded-3xl shadow-xl shadow-rose-500/5">
            <Shield size={64} className="text-rose-600" />
          </div>
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t('pages.unauthorized.title')}</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          {t('pages.unauthorized.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
            {t('pages.unauthorized.goBack')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            <Home size={18} />
            {t('pages.unauthorized.goDashboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

