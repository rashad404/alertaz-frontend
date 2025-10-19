'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Scale, X, ChevronRight } from 'lucide-react';
import { useComparison } from '@/contexts/comparison-context';
import { getTranslation } from '@/lib/utils';

interface ComparisonIconProps {
  locale: string;
}

export function ComparisonIcon({ locale }: ComparisonIconProps) {
  const { getItemCount, getItemsByCategory, removeFromComparison, clearComparison } = useComparison();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemCount = getItemCount();
  const itemsByCategory = getItemsByCategory();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const translations = {
    az: {
      compare: 'Müqayisə',
      compareItems: 'Müqayisə et',
      clearAll: 'Hamısını sil',
      remove: 'Sil',
      empty: 'Müqayisə siyahısı boşdur',
      addItems: 'Müqayisə üçün məhsullar əlavə edin',
      viewComparison: 'Müqayisəyə bax',
    },
    en: {
      compare: 'Compare',
      compareItems: 'Compare items',
      clearAll: 'Clear all',
      remove: 'Remove',
      empty: 'Comparison list is empty',
      addItems: 'Add products to compare',
      viewComparison: 'View comparison',
    },
    ru: {
      compare: 'Сравнить',
      compareItems: 'Сравнить товары',
      clearAll: 'Очистить все',
      remove: 'Удалить',
      empty: 'Список сравнения пуст',
      addItems: 'Добавьте товары для сравнения',
      viewComparison: 'Посмотреть сравнение',
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
        aria-label={t.compare}
      >
        <Scale className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">{t.compareItems}</h3>
              {itemCount > 0 && (
                <button
                  onClick={() => {
                    clearComparison();
                    setIsOpen(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  {t.clearAll}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {itemCount === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">{t.empty}</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">{t.addItems}</p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(itemsByCategory).map(([categorySlug, items]) => (
                  <div key={categorySlug} className="mb-3">
                    <div className="px-2 py-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {items[0]?.categoryName} ({items.length})
                        </h4>
                      </div>
                      <div className="space-y-1">
                        {items.map((item) => (
                          <div
                            key={`${categorySlug}-${item.offer.id}`}
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {getTranslation(item.offer.title, locale)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.offer.company && getTranslation(item.offer.company.name, locale)}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromComparison(item.offer.id, categorySlug)}
                              className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                              aria-label={t.remove}
                            >
                              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {items.length >= 2 && (
                        <Link
                          href={`/${locale}/kreditler/muqayise?category=${categorySlug}&ids=${items.map(i => i.offer.id).join(',')}`}
                          className="mt-2 flex items-center justify-center gap-1 w-full px-3 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-medium rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {t.viewComparison} ({items.length})
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}