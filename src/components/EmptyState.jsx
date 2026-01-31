import { FileText, Package, Users, ShoppingCart, BookOpen, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Professional Empty State
 */
const EmptyState = ({ 
  icon: Icon = FileText, 
  title,
  description,
  actionLabel,
  onAction 
}) => {
  const { t } = useLanguage();
  return (
    <div className="card-premium text-center py-20 px-10">
      <div className="flex justify-center mb-8">
        <div className="p-8 bg-slate-50 rounded-full text-slate-300">
          <Icon size={48} />
        </div>
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-2">{title || t('common.noDataAvailable')}</h3>
      <p className="text-sm font-medium text-slate-400 mb-10 max-w-sm mx-auto leading-relaxed">{description || t('common.noDataDesc')}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-modern-primary py-4 px-10 uppercase tracking-widest text-[10px]">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// Pre-configured empty states
export const EmptyStates = {
  Books: () => {
    const { t } = useLanguage();
    return (
      <EmptyState
        icon={BookOpen}
        title={t('common.libraryEmpty')}
        description={t('common.libraryEmptyDesc')}
        actionLabel={t('common.uploadFirstBook')}
        onAction={() => window.location.href = '/books/add'}
      />
    );
  },
  Products: () => {
    const { t } = useLanguage();
    return (
      <EmptyState
        icon={Package}
        title={t('common.noInventory')}
        description={t('common.noInventoryDesc')}
        actionLabel={t('common.createProduct')}
        onAction={() => window.location.href = '/products/add'}
      />
    );
  },
  Users: () => {
    const { t } = useLanguage();
    return (
      <EmptyState
        icon={Users}
        title={t('common.userListEmpty')}
        description={t('common.userListEmptyDesc')}
      />
    );
  },
  Orders: () => {
    const { t } = useLanguage();
    return (
      <EmptyState
        icon={ShoppingCart}
        title={t('common.awaitingSales')}
        description={t('common.awaitingSalesDesc')}
      />
    );
  },
  Search: ({ searchTerm }) => {
    const { t } = useLanguage();
    return (
      <EmptyState
        icon={Search}
        title={t('common.zeroResults')}
        description={t('common.zeroResultsDesc').replace('{searchTerm}', searchTerm)}
      />
    );
  },
};

export default EmptyState;
