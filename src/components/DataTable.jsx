import { useState } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Search Bar */}
      {searchable && (
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all duration-150">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full bg-transparent outline-none text-sm sm:text-base text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {/* Table - Responsive wrapper */}
      <div className="table-wrapper overflow-x-auto">
        <table className="table min-w-full">
          <thead>
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
                <th className="text-right">
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
                <td colSpan={getVisibleColumns().length + (onView || onEdit || onDelete ? 1 : 0)} className="px-4 py-8 sm:py-12 text-center text-gray-500 text-sm">
                  No data available
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
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
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
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm font-medium text-gray-700">
            Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
            <span className="font-semibold">{Math.min(endIndex, data.length)}</span> of{' '}
            <span className="font-semibold">{data.length}</span> results
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronLeft size={16} className="sm:w-4 sm:h-4" />
            </button>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-900">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronRight size={16} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
