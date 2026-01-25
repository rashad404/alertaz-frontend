'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, X, Check } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  selectable?: boolean;
  selectedIds?: Set<number | string>;
  onSelectionChange?: (ids: Set<number | string>) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  initialSearch?: string;
  onSearch?: (query: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  actions?: (item: T) => React.ReactNode;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  initialSearch = '',
  onSearch,
  pagination,
  loading = false,
  emptyMessage = 'No data found',
  actions,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const allSelected = data.length > 0 && data.every(item => selectedIds.has(item[keyField]));
  const someSelected = data.some(item => selectedIds.has(item[keyField]));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      const newIds = new Set(data.map(item => item[keyField]));
      onSelectionChange(newIds);
    }
  };

  const handleSelectItem = (id: number | string) => {
    if (!onSelectionChange) return;
    const newIds = new Set(selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    onSelectionChange(newIds);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = aVal < bVal ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="relative rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    onSearch?.('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg transition-all duration-300"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {selectable && (
                <th className="w-12 p-4">
                  <button
                    onClick={handleSelectAll}
                    className={`w-5 h-5 rounded border ${
                      allSelected
                        ? 'bg-indigo-600 border-indigo-600'
                        : someSelected
                        ? 'bg-indigo-600/50 border-indigo-600'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    } flex items-center justify-center transition-colors`}
                  >
                    {(allSelected || someSelected) && <Check className="w-3 h-3 text-white" />}
                  </button>
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`p-4 text-left text-sm font-medium text-gray-600 dark:text-gray-400 ${col.sortable ? 'cursor-pointer hover:text-gray-900 dark:hover:text-white' : ''}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-indigo-600 dark:text-indigo-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="w-20 p-4"></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="p-8 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="p-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item) => {
                const id = item[keyField];
                const isSelected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                  >
                    {selectable && (
                      <td className="w-12 p-4">
                        <button
                          onClick={() => handleSelectItem(id)}
                          className={`w-5 h-5 rounded border ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          } flex items-center justify-center transition-colors`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="p-4 text-sm text-gray-900 dark:text-white">
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="p-4">
                        {actions(item)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} - {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-white" />
            </button>
            <span className="text-sm text-gray-900 dark:text-white px-3">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-700 dark:text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Selection actions */}
      {selectable && selectedIds.size > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
          <div className="flex items-center gap-4">
            <span className="text-sm text-indigo-700 dark:text-indigo-400">{selectedIds.size} selected</span>
          </div>
        </div>
      )}
    </div>
  );
}
