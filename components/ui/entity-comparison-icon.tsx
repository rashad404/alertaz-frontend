'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Scale, X, ChevronRight, CreditCard, Home, Shield, Banknote, Building2, GraduationCap, Briefcase, Car, Zap, MapPin, DollarSign, Circle } from 'lucide-react';
import { useEntityComparison } from '@/contexts/entity-comparison-context';
import { cn } from '@/lib/utils';
import { fetchEntityTypes, getEntityTypeDisplayName, getEntityTypeIcon, type EntityType } from '@/lib/api/entity-types';

interface EntityComparisonIconProps {
  locale: string;
}

// Icon component mapping
const iconComponents: Record<string, any> = {
  Banknote,
  GraduationCap, 
  Briefcase,
  Car,
  Home,
  Zap,
  Shield,
  CreditCard,
  Building2,
  MapPin,
  DollarSign,
  Circle,
};

export function EntityComparisonIcon({ locale }: EntityComparisonIconProps) {
  const { 
    items, 
    getItemCount, 
    getTypesCounts, 
    removeFromComparison, 
    clearComparison, 
    clearAll 
  } = useEntityComparison();
  
  const [isOpen, setIsOpen] = useState(false);
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemCount = getItemCount();
  const typesCounts = getTypesCounts();

  // Load entity types from API
  useEffect(() => {
    const loadEntityTypes = async () => {
      try {
        const types = await fetchEntityTypes(locale);
        setEntityTypes(types);
      } catch (error) {
        console.error('Failed to load entity types:', error);
      }
    };
    
    loadEntityTypes();
  }, [locale]);

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
      clearType: 'Bu kateqoriyanı təmizlə',
      remove: 'Sil',
      empty: 'Müqayisə siyahısı boşdur',
      addItems: 'Müqayisə üçün məhsullar əlavə edin',
      viewComparison: 'Müqayisəyə bax',
      compareNow: 'İndi müqayisə et',
      itemsSelected: 'seçilib',
    },
    en: {
      compare: 'Compare',
      compareItems: 'Compare items',
      clearAll: 'Clear all',
      clearType: 'Clear this category',
      remove: 'Remove',
      empty: 'Comparison list is empty',
      addItems: 'Add products to compare',
      viewComparison: 'View comparison',
      compareNow: 'Compare now',
      itemsSelected: 'selected',
    },
    ru: {
      compare: 'Сравнить',
      compareItems: 'Сравнить товары',
      clearAll: 'Очистить все',
      clearType: 'Очистить эту категорию',
      remove: 'Удалить',
      empty: 'Список сравнения пуст',
      addItems: 'Добавьте товары для сравнения',
      viewComparison: 'Посмотреть сравнение',
      compareNow: 'Сравнить сейчас',
      itemsSelected: 'выбрано',
    }
  };

  const t = translations[locale as keyof typeof translations] || translations.az;

  const getEntityTypeName = (entityType: string) => {
    // Fallback display names if entityTypes haven't loaded
    const fallbackNames: Record<string, Record<string, string>> = {
      'cash_loans': { az: 'Nağd kreditlər', en: 'Cash Loans', ru: 'Наличные кредиты' },
      'auto_loans': { az: 'Avto kreditlər', en: 'Auto Loans', ru: 'Автокредиты' },
      'education_loans': { az: 'Təhsil kreditləri', en: 'Education Loans', ru: 'Образовательные кредиты' },
      'mortgage_loans': { az: 'İpoteka kreditləri', en: 'Mortgage Loans', ru: 'Ипотечные кредиты' },
      'business_loans': { az: 'Biznes kreditləri', en: 'Business Loans', ru: 'Бизнес кредиты' },
      'credit_lines': { az: 'Kredit xətləri', en: 'Credit Lines', ru: 'Кредитные линии' },
      'pawnshop_loans': { az: 'Girov kreditləri', en: 'Pawnshop Loans', ru: 'Ломбардные кредиты' }
    };
    
    // Try to get from loaded entity types first
    const displayName = getEntityTypeDisplayName(entityType, entityTypes, locale);
    
    // If not found or still equals entityType, use fallback
    if (displayName === entityType && fallbackNames[entityType]) {
      return fallbackNames[entityType][locale] || fallbackNames[entityType]['en'] || entityType;
    }
    
    return displayName;
  };

  const getEntityIcon = (entityType: string) => {
    const iconName = getEntityTypeIcon(entityType, entityTypes);
    const IconComponent = iconComponents[iconName] || Circle;
    return IconComponent;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-sm border border-gray-200/50 dark:border-gray-700/50 relative group"
        aria-label={t.compare}
      >
        <Scale className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors" />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-brand-orange to-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
            {itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
          <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-brand-orange/10 to-blue-500/10">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-orange" />
                {t.compareItems}
              </h3>
              {itemCount > 0 && (
                <button
                  onClick={() => {
                    clearAll();
                    setIsOpen(false);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                >
                  {t.clearAll}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {itemCount === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Scale className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">{t.empty}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{t.addItems}</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {Object.entries(items).map(([entityType, typeItems]) => {
                  if (typeItems.length === 0) return null;
                  
                  console.log('EntityComparisonIcon - entityType:', entityType);
                  console.log('EntityComparisonIcon - typeItems:', typeItems);
                  
                  // Skip undefined entity types
                  if (entityType === 'undefined' || !entityType) {
                    console.error('Found items with undefined entityType:', typeItems);
                    return null;
                  }
                  
                  const Icon = getEntityIcon(entityType);
                  const typeName = getEntityTypeName(entityType);
                  console.log('EntityComparisonIcon - typeName result:', typeName);
                  
                  return (
                    <div key={entityType} className="group">
                      {/* Entity Type Card - Clickable */}
                      <Link
                        href={typeItems.length >= 2 ? `/${locale}/muqayise/${entityType}` : '#'}
                        className={cn(
                          "block p-4 rounded-xl border transition-all duration-200",
                          typeItems.length >= 2
                            ? "bg-gradient-to-r from-brand-orange/10 to-green-500/10 border-brand-orange/20 hover:from-brand-orange/20 hover:to-green-500/20 hover:border-brand-orange/40 cursor-pointer"
                            : "bg-gray-50 dark:bg-gray-700/30 border-gray-200/30 dark:border-gray-600/30 cursor-default"
                        )}
                        onClick={(e) => {
                          if (typeItems.length < 2) {
                            e.preventDefault();
                          } else {
                            setIsOpen(false);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              typeItems.length >= 2 ? "bg-brand-orange/20" : "bg-gray-200 dark:bg-gray-600"
                            )}>
                              <Icon className={cn(
                                "w-6 h-6",
                                typeItems.length >= 2 ? "text-brand-orange" : "text-gray-500"
                              )} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {typeName}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {typeItems.length} {t.itemsSelected}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {typeItems.length >= 2 && (
                              <div className="flex items-center gap-1 px-3 py-1.5 bg-brand-orange/20 text-brand-orange rounded-full text-xs font-semibold">
                                <ChevronRight className="w-3 h-3" />
                                {t.compareNow}
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                clearComparison(entityType);
                              }}
                              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                              title={t.clearType}
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Show preview of items */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {typeItems.slice(0, 3).map((item) => (
                            <div key={item.entityId} className="flex items-center gap-1 px-2 py-1 bg-white/60 dark:bg-gray-800/60 rounded-md text-xs">
                              <span className="truncate max-w-20">{item.companyName}</span>
                              {item.attributes?.interest_rate && (
                                <span className="text-brand-orange font-medium">
                                  {item.attributes.interest_rate}%
                                </span>
                              )}
                            </div>
                          ))}
                          {typeItems.length > 3 && (
                            <div className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-400">
                              +{typeItems.length - 3}
                            </div>
                          )}
                        </div>
                        
                        {typeItems.length < 2 && (
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                            {locale === 'az' ? 'Müqayisə üçün ən azı 2 məhsul lazımdır' : 
                             locale === 'ru' ? 'Нужно минимум 2 продукта для сравнения' : 
                             'Need at least 2 items to compare'}
                          </p>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {itemCount > 0 && Object.keys(typesCounts).length > 1 && (
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(typesCounts).map(([type, count]) => {
                  const Icon = getEntityIcon(type);
                  return (
                    <div key={type} className="flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <Icon className="w-3 h-3 text-brand-orange" />
                      <span className="text-gray-600 dark:text-gray-400">{getEntityTypeName(type)}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}