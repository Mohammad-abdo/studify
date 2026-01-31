import { useLanguage } from '../context/LanguageContext';

/**
 * Professional Loading State
 */
const LoadingState = ({ message, fullScreen = false }) => {
  const { t } = useLanguage();
  const displayMessage = message || t('common.loading');
  
  const content = (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{displayMessage}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-xl z-50">
        {content}
      </div>
    );
  }

  return <div className="card-premium">{content}</div>;
};

export default LoadingState;
