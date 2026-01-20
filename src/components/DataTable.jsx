import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * Enhanced DataTable Component
 * Supports both client-side and server-side pagination
 */
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  // Server-side pagination props
  serverSide = false,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  // Custom empty state
  emptyState,
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [currentPage, setCurrentPage] = useState(1);

  // Use server-side pagination if enabled, otherwise use client-side
  const isServerSide = serverSide && onPageChange;
  const itemsPerPage = isServerSide ? limit : 10;

  useEffect(() => {
    if (isServerSide) {
      setCurrentPage(page);
    }
  }, [page, isServerSide]);

  const getValue = (item, key) => {
    if (typeof key === 'function') {
      return key(item);
    }
    const keys = key.split('.');
    let value = item;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  };

  // Filter columns for mobile (hide some columns on small screens)
  const getVisibleColumns = () => {
    return columns.filter(col => col.hideOnMobile !== true);
  };

  // Calculate pagination for client-side
  const totalPages = isServerSide 
    ? Math.ceil(total / limit)
    : Math.ceil(data.length / itemsPerPage);
  
  const startIndex = isServerSide
    ? (page - 1) * limit
    : (currentPage - 1) * itemsPerPage;
  
  const endIndex = isServerSide
    ? Math.min(page * limit, total)
    : startIndex + itemsPerPage;
  
  const currentData = isServerSide ? data : data.slice(startIndex, endIndex);
  const displayTotal = isServerSide ? total : data.length;
  const displayStart = isServerSide ? startIndex + 1 : startIndex + 1;
  const displayEnd = isServerSide ? endIndex : Math.min(endIndex, data.length);

  const handlePageChange = (newPage) => {
    if (isServerSide) {
      onPageChange?.(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="card-elevated overflow-hidden">
      {/* Search Bar */}
      {searchable && (
        <div className="px-4 md:px-5 lg:px-6 xl:px-7 py-3 md:py-3.5 lg:py-4 border-b border-blue-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>
      )}

      {/* Table - Responsive wrapper */}
      <div className="table-wrapper overflow-x-auto">
        <table className="table min-w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              {getVisibleColumns().map((column, index) => (
                <th
                  key={index}
                  className={`${
                    column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                  } ${column.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className={isRTL ? 'text-left' : 'text-right'}>
                  <span className="hidden sm:inline">Actions</span>
                  <span className="sm:hidden">Act</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={getVisibleColumns().length + (onView || onEdit || onDelete ? 1 : 0)} className="px-4 py-8 sm:py-12 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
                  </div>
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={getVisibleColumns().length + (onView || onEdit || onDelete ? 1 : 0)} className="px-4 py-8 sm:py-12 text-center">
                  {emptyState || (
                    <div className="text-gray-500 text-sm">No data available</div>
                  )}
                </td>
              </tr>
            ) : (
              currentData.map((item, rowIndex) => (
                <tr key={item.id || rowIndex} className="hover:bg-gray-50 transition-colors duration-100">
                  {getVisibleColumns().map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`${
                        column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                      } ${column.hideOnMobile ? 'hidden sm:table-cell' : ''}`}
                    >
                      {column.render ? column.render(item) : getValue(item, column.accessor)}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className={isRTL ? 'text-left' : 'text-right'}>
                      <div className={`flex items-center gap-1 sm:gap-2 ${
                        isRTL ? 'justify-start' : 'justify-end'
                      }`}>
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                            title="View"
                          >
                            <Eye size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150"
                            title="Edit"
                          >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 md:px-5 lg:px-6 xl:px-7 py-3 md:py-3.5 lg:py-4 border-t border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm md:text-base font-medium text-gray-700">
            Showing <span className="font-semibold">{displayStart}</span> to{' '}
            <span className="font-semibold">{displayEnd}</span> of{' '}
            <span className="font-semibold">{displayTotal}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(isServerSide ? page - 1 : currentPage - 1)}
              disabled={isServerSide ? page === 1 : currentPage === 1}
              className="btn-secondary p-2 min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-2 rounded-md border border-blue-200 bg-white text-sm font-medium text-gray-900">
              Page {isServerSide ? page : currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(isServerSide ? page + 1 : currentPage + 1)}
              disabled={isServerSide ? page >= totalPages : currentPage >= totalPages}
              className="btn-secondary p-2 min-h-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
