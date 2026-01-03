import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';

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

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
      {/* Search Bar */}
      {searchable && (
        <div className="px-6 py-4 border-b border-white/30 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 glass rounded-xl border border-white/30">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full bg-transparent outline-none font-medium text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/50 backdrop-blur-sm border-b border-white/30">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider ${
                    column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {(onView || onEdit || onDelete) && (
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white/30 divide-y divide-white/20">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              currentData.map((item, rowIndex) => (
                <motion.tr
                  key={item.id || rowIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.02 }}
                  className="hover:bg-white/50 transition-colors group"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${
                        column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      {column.render ? column.render(item) : getValue(item, column.accessor)}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-2.5 glass rounded-xl text-gray-600 hover:text-blue-600 hover:bg-white/80 transition-all hover:scale-110"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2.5 glass rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-white/80 transition-all hover:scale-110"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2.5 glass rounded-xl text-gray-600 hover:text-red-600 hover:bg-white/80 transition-all hover:scale-110"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-white/30 bg-white/40 backdrop-blur-sm flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">
            Showing <span className="font-bold">{startIndex + 1}</span> to{' '}
            <span className="font-bold">{Math.min(endIndex, data.length)}</span> of{' '}
            <span className="font-bold">{data.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2.5 glass rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 border border-white/30"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-5 py-2.5 glass rounded-xl text-sm font-bold text-gray-900 border border-white/30">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 glass rounded-xl hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 border border-white/30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;


