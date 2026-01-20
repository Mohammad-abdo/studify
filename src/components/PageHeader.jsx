import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit } from 'lucide-react';

/**
 * Unified Page Header Component
 * Provides consistent header structure across all pages
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

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {crumb.path ? (
                <button
                  onClick={() => navigate(crumb.path)}
                  className="hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBack && backPath && (
            <button
              onClick={() => navigate(backPath)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Go back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Action Button */}
        {(actionLabel || actionPath) && (
          <button
            onClick={handleAction}
            className="btn-primary flex items-center gap-2"
          >
            <ActionIcon size={18} />
            {actionLabel || 'Add New'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

