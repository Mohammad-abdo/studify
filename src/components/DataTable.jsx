import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  searchable = true,
  searchPlaceholder = '',
  searchValue = '',
  onSearchChange,
  serverSide = false,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  emptyState,
}) => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [currentPage, setCurrentPage] = useState(1);

  const isServerSide = serverSide && onPageChange;
  const itemsPerPage = isServerSide ? limit : 10;

  useEffect(() => {
    if (isServerSide) setCurrentPage(page);
  }, [page, isServerSide]);

  const getValue = (item, key) => {
    if (typeof key === 'function') return key(item);
    return key.split('.').reduce((obj, i) => obj?.[i], item);
  };

  const totalPages = isServerSide ? Math.ceil(total / limit) : Math.ceil(data.length / itemsPerPage);
  const currentData = isServerSide ? data : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="card-premium overflow-hidden bg-white border-none shadow-xl shadow-slate-200/50">
      {/* Header with Search and Filters */}
      {(searchable || onView) && (
        <div className="p-6 md:p-8 2xl:p-8 bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-md 2xl:max-w-xl">
              <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={searchPlaceholder || t('common.quickSearch')}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={`w-full bg-slate-50 border-none rounded-2xl py-4 2xl:py-4 text-sm 2xl:text-base font-medium focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
              />
            </div>
          )}
          <div className="flex gap-2">
            <button className="p-4 2xl:p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
              <SlidersHorizontal size={20} className="2xl:w-6 2xl:h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Table Body */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="table-premium">
          <thead>
            <tr>
              {columns.filter(c => !c.hideOnMobile).map((col, i) => (
                <th key={i} className={`2xl:px-8 2xl:py-5 ${col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start'}`}>
                  {col.header}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="2xl:px-8 2xl:py-5 text-end">
                  {t('common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={100} className="py-8 2xl:py-8"><div className="h-4 bg-slate-50 rounded-full w-full"></div></td>
                </tr>
              ))
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={100} className="py-24 2xl:py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-6 2xl:p-8 bg-slate-50 rounded-full text-slate-300"><Search size={48} className="2xl:w-16 2xl:h-16" /></div>
                    <div>
                      <p className="text-lg 2xl:text-2xl font-black text-slate-900">{t('common.noResults')}</p>
                      <p className="text-slate-400 text-sm 2xl:text-base font-medium">{t('common.noResultsDesc')}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              currentData.map((item, idx) => (
                <tr key={item.id || idx}>
                  {columns.filter(c => !c.hideOnMobile).map((col, i) => (
                    <td key={i} className={`2xl:px-8 2xl:py-6 ${col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : 'text-start'}`}>
                      {col.render ? col.render(item) : <span className="text-slate-600 font-semibold 2xl:text-lg">{getValue(item, col.accessor)}</span>}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="2xl:px-8 2xl:py-6 text-end">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button onClick={() => onView(item)} className="p-3 2xl:p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                            <Eye size={18} className="2xl:w-6 2xl:h-6" />
                          </button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="p-3 2xl:p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                            <Edit size={18} className="2xl:w-6 2xl:h-6" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="p-3 2xl:p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 size={18} className="2xl:w-6 2xl:h-6" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Refined Pagination */}
      {totalPages > 1 && (
        <div className="p-8 2xl:p-10 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-[10px] 2xl:text-xs font-black uppercase tracking-widest text-slate-400">
            {t('common.page')} <span className="text-slate-900 font-bold">{isServerSide ? page : currentPage}</span> {t('common.of')} {totalPages} — {total || data.length} {t('common.records')}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={isServerSide ? page === 1 : currentPage === 1}
              className="btn-modern-secondary h-12 w-12 2xl:h-14 2xl:w-14 p-0 flex items-center justify-center disabled:opacity-20"
            >
              <ChevronLeft size={20} className={`2xl:w-8 2xl:h-8 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = i + 1;
                const isCurrent = (isServerSide ? page : currentPage) === p;
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange?.(p) || setCurrentPage(p)}
                    className={`h-12 w-12 2xl:h-14 2xl:w-14 rounded-xl text-xs 2xl:text-sm font-black transition-all ${isCurrent ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-100'}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={isServerSide ? page >= totalPages : currentPage >= totalPages}
              className="btn-modern-secondary h-12 w-12 2xl:h-14 2xl:w-14 p-0 flex items-center justify-center disabled:opacity-20"
            >
              <ChevronRight size={20} className={`2xl:w-8 2xl:h-8 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
