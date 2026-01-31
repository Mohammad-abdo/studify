import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Professional Page Header
 * High-density design with improved breadcrumbs
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actionLabel, 
  actionIcon: ActionIcon = Plus,
  onAction,
  actionPath,
  backPath,
  showBack = true 
}) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div className="mb-8 2xl:mb-10">
      {/* Dynamic Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
          >
            {t('menu.dashboard') || 'Dashboard'}
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <ChevronRight size={12} className={`text-slate-300 ${isRTL ? 'rotate-180' : ''}`} />
              {crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          {showBack && backPath && (
            <button
              onClick={() => navigate(backPath)}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:border-slate-300 hover:shadow-lg transition-all"
            >
              <ArrowIcon size={22} />
            </button>
          )}
          <div>
            <h1 className="text-3xl md:text-4xl 2xl:text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-slate-500 font-medium mt-1 max-w-2xl 2xl:text-base leading-relaxed">{subtitle}</p>
            )}
          </div>
        </div>

        {(actionLabel || actionPath) && (
          <button
            onClick={handleAction}
            className="btn-modern-primary py-4 px-8 flex items-center gap-2"
          >
            <ActionIcon size={20} className="stroke-[3]" />
            <span className="uppercase tracking-widest text-xs font-black">{actionLabel || (isRTL ? 'إنشاء جديد' : 'Create New')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
