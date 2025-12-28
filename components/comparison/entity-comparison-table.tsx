'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/lib/navigation';
import { useRouter } from 'next/navigation';
import { 
  Check, X, TrendingUp, TrendingDown, Minus, AlertCircle, 
  Building2, Percent, Calendar, DollarSign, Clock, FileText,
  ChevronUp, ChevronDown, Star, Award, Shield, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api/client';
import { useEntityComparison } from '@/contexts/entity-comparison-context';

interface EntityComparisonTableProps {
  entities: any[];
  entityType: string;
  locale: string;
}

// Attribute groups for better organization
const attributeGroups = {
  main: {
    az: 'Əsas məlumatlar',
    en: 'Main Information',
    ru: 'Основная информация'
  },
  financial: {
    az: 'Maliyyə şərtləri',
    en: 'Financial Terms',
    ru: 'Финансовые условия'
  },
  requirements: {
    az: 'Tələblər',
    en: 'Requirements',
    ru: 'Требования'
  },
  additional: {
    az: 'Əlavə məlumatlar',
    en: 'Additional Information',
    ru: 'Дополнительная информация'
  }
};

// Map attributes to groups and display names
const attributeConfig: Record<string, { group: string; icon?: any; format?: string; displayNames: Record<string, string> }> = {
  interest_rate: {
    group: 'financial',
    icon: Percent,
    format: 'percent',
    displayNames: { az: 'Faiz dərəcəsi', en: 'Interest Rate', ru: 'Процентная ставка' }
  },
  min_amount: {
    group: 'financial',
    icon: DollarSign,
    format: 'currency',
    displayNames: { az: 'Minimum məbləğ', en: 'Minimum Amount', ru: 'Минимальная сумма' }
  },
  max_amount: {
    group: 'financial',
    icon: DollarSign,
    format: 'currency',
    displayNames: { az: 'Maksimum məbləğ', en: 'Maximum Amount', ru: 'Максимальная сумма' }
  },
  min_term_months: {
    group: 'financial',
    icon: Calendar,
    format: 'months',
    displayNames: { az: 'Minimum müddət', en: 'Minimum Term', ru: 'Минимальный срок' }
  },
  max_term_months: {
    group: 'financial',
    icon: Calendar,
    format: 'months',
    displayNames: { az: 'Maksimum müddət', en: 'Maximum Term', ru: 'Максимальный срок' }
  },
  processing_time: {
    group: 'additional',
    icon: Clock,
    displayNames: { az: 'Baxılma müddəti', en: 'Processing Time', ru: 'Время обработки' }
  },
  commission: {
    group: 'financial',
    icon: Percent,
    format: 'percent',
    displayNames: { az: 'Komissiya', en: 'Commission', ru: 'Комиссия' }
  },
  requirements: {
    group: 'requirements',
    icon: FileText,
    displayNames: { az: 'Tələblər', en: 'Requirements', ru: 'Требования' }
  },
  loan_type: {
    group: 'main',
    icon: Shield,
    displayNames: { az: 'Kredit növü', en: 'Loan Type', ru: 'Тип кредита' }
  },
  monthly_payment: {
    group: 'financial',
    icon: DollarSign,
    format: 'currency',
    displayNames: { az: 'Aylıq ödəniş', en: 'Monthly Payment', ru: 'Ежемесячный платеж' }
  }
};

export default function EntityComparisonTable({ entities, entityType, locale }: EntityComparisonTableProps) {
  const router = useRouter();
  const { removeFromComparison, addToComparison } = useEntityComparison();
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    main: true,
    financial: true,
    requirements: false,
    additional: false
  });
  
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableEntities, setAvailableEntities] = useState<any[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(false);
  
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };
  
  // Fetch available entities when modal opens
  useEffect(() => {
    if (showAddModal) {
      fetchAvailableEntities();
    }
  }, [showAddModal]);
  
  const fetchAvailableEntities = async () => {
    setLoadingEntities(true);
    try {
      // Determine loan type from URL or entities
      let loanType;
      
      if (entities.length > 0) {
        // Get the loan type from the first entity's attributes
        loanType = entities[0]?.loan_type;
        
        // If not found at top level, check in attributes
        if (!loanType) {
          const attrs = entities[0]?.attributes;
          if (attrs) {
            loanType = attrs['loan_type'] || 
                       attrs['Loan Type'] || 
                       attrs['loan_type'];
          }
        }
      } else {
        // No entities, determine from entityType URL parameter
        const urlToLoanTypeMap: Record<string, string> = {
          'cash_loans': 'cash',
          'auto_loans': 'auto',
          'education_loans': 'student',
          'mortgage_loans': 'mortgage',
          'business_loans': 'business'
        };
        loanType = urlToLoanTypeMap[entityType];
      }
      
      // Fetch all entities of the same type
      const response = await apiClient.get(`/entities/credit_loan`);
      
      // Filter by loan type and exclude already compared entities
      const comparedIds = entities.map(e => e.entity_id || e.id);
      const available = response.data?.data?.filter((e: any) => {
        // Check if entity has the same loan type
        const entityLoanType = e.loan_type || 
                              e.attributes?.loan_type || 
                              e.attributes?.['Loan Type'];
        
        const isSameLoanType = entityLoanType === loanType;
        const isNotCompared = !comparedIds.includes(e.entity_id || e.id);
        
        return isSameLoanType && isNotCompared;
      }) || [];
      setAvailableEntities(available);
    } catch (error) {
      console.error('Error fetching entities:', error);
      setAvailableEntities([]);
    } finally {
      setLoadingEntities(false);
    }
  };
  
  const handleAddEntity = (entity: any) => {
    // Map entity type for context
    const contextEntityType = getLoanTypeDisplayKey(entity.loan_type || entity.attributes?.loan_type);
    
    // Get proper entity type name for display
    const entityTypeName = contextEntityType === 'cash_loans' ? 'Cash Loans' :
                          contextEntityType === 'auto_loans' ? 'Auto Loans' :
                          contextEntityType === 'education_loans' ? 'Education Loans' :
                          contextEntityType === 'mortgage_loans' ? 'Mortgage Loans' :
                          contextEntityType === 'business_loans' ? 'Business Loans' :
                          contextEntityType;
    
    // Add to context
    const comparisonItem = {
      entityId: entity.entity_id || entity.id,
      entityType: contextEntityType,
      entityTypeName: entityTypeName,
      entityName: parseEntityName(entity.entity_name),
      companyId: entity.company_id,
      companyName: entity.company_name,
      companySlug: entity.company_slug,
      companyType: entity.company_type || 'credit_organization',
      attributes: {
        interest_rate: entity.interest_rate,
        loan_type: entity.loan_type || entity.attributes?.loan_type,
        min_amount: entity.min_amount,
        max_amount: entity.max_amount,
        max_term_months: entity.max_term_months
      }
    };
    
    const success = addToComparison(comparisonItem);
    
    if (success) {
      // Close modal
      setShowAddModal(false);
      // Fetch available entities again to update the list
      fetchAvailableEntities();
    }
  };
  
  const handleRemoveEntity = (entityId: number, entity: any) => {
    // Map entity type for context
    const contextEntityType = getLoanTypeDisplayKey(entity.loan_type || entity.attributes?.loan_type);
    
    // Remove from context
    removeFromComparison(entityId, contextEntityType);
  };
  
  // Helper function to map loan types to display keys
  const getLoanTypeDisplayKey = (loanType: string): string => {
    const typeMap: Record<string, string> = {
      'cash': 'cash_loans',
      'auto': 'auto_loans',
      'student': 'education_loans',
      'mortgage': 'mortgage_loans',
      'business': 'business_loans'
    };
    return typeMap[loanType] || loanType;
  };
  
  // Parse entity name from JSON if needed
  const parseEntityName = (name: any) => {
    if (typeof name === 'string') {
      try {
        const parsed = JSON.parse(name);
        return parsed[locale] || parsed['en'] || parsed['az'] || name;
      } catch {
        return name;
      }
    }
    if (typeof name === 'object' && name !== null) {
      return name[locale] || name['en'] || name['az'] || 'Unknown';
    }
    return name || 'Unknown';
  };
  
  // Format value based on type
  const formatValue = (value: any, format?: string) => {
    if (value === null || value === undefined) return '—';
    
    switch (format) {
      case 'percent':
        return `${value}%`;
      case 'currency':
        return `${value.toLocaleString()} AZN`;
      case 'months':
        const months = parseInt(value);
        if (locale === 'az') return `${months} ay`;
        if (locale === 'ru') return `${months} мес.`;
        return `${months} months`;
      default:
        return value;
    }
  };
  
  // Get attribute display name
  const getAttributeName = (key: string) => {
    const config = attributeConfig[key];
    if (config) {
      return config.displayNames[locale] || config.displayNames['az'] || key;
    }
    // Fallback: Convert snake_case to Title Case
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Check if values are different across entities
  const isDifferent = (attributeKey: string) => {
    if (!highlightDifferences) return false;
    const values = entities.map(e => e[attributeKey] || e.attributes?.[attributeKey]);
    const uniqueValues = [...new Set(values.map(v => JSON.stringify(v)))];
    return uniqueValues.length > 1;
  };
  
  // Get best value indicator
  const getBestValue = (attributeKey: string, value: any, allValues: any[]) => {
    if (!value || value === '—') return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    
    const numValues = allValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (numValues.length < 2) return null;
    
    const min = Math.min(...numValues);
    const max = Math.max(...numValues);
    
    // For interest rates and commissions, lower is better
    if (attributeKey === 'interest_rate' || attributeKey === 'commission') {
      if (numValue === min) return 'best';
      if (numValue === max) return 'worst';
    }
    
    // For amounts and terms, higher might be better
    if (attributeKey.includes('max_')) {
      if (numValue === max) return 'best';
      if (numValue === min) return 'worst';
    }
    
    return null;
  };
  
  // Collect all unique attributes
  const allAttributes = new Set<string>();
  entities.forEach(entity => {
    Object.keys(entity).forEach(key => {
      if (!['id', 'entity_id', 'entity_name', 'entity_type', 'company_id', 'company_name', 'company_slug', 'attributes'].includes(key)) {
        allAttributes.add(key);
      }
    });
    if (entity.attributes) {
      Object.keys(entity.attributes).forEach(key => allAttributes.add(key));
    }
  });
  
  // Group attributes
  const groupedAttributes: Record<string, string[]> = {
    main: [],
    financial: [],
    requirements: [],
    additional: []
  };
  
  allAttributes.forEach(attr => {
    const config = attributeConfig[attr];
    const group = config?.group || 'additional';
    groupedAttributes[group].push(attr);
  });
  
  const translations = {
    az: {
      highlightDifferences: 'Fərqləri vurğula',
      viewDetails: 'Ətraflı bax',
      apply: 'Müraciət et',
      best: 'Ən yaxşı',
      expandAll: 'Hamısını aç',
      collapseAll: 'Hamısını bağla'
    },
    en: {
      highlightDifferences: 'Highlight differences',
      viewDetails: 'View details',
      apply: 'Apply',
      best: 'Best',
      expandAll: 'Expand all',
      collapseAll: 'Collapse all'
    },
    ru: {
      highlightDifferences: 'Выделить различия',
      viewDetails: 'Подробнее',
      apply: 'Подать заявку',
      best: 'Лучший',
      expandAll: 'Развернуть все',
      collapseAll: 'Свернуть все'
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.az;
  
  // Handle empty state - show just the Add button
  if (entities.length === 0) {
    return (
      <>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-12 text-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex flex-col items-center gap-3 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-brand-orange dark:hover:border-brand-orange hover:bg-brand-orange/5 transition-all group"
            >
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-orange/10 flex items-center justify-center transition-colors">
                <Plus className="w-10 h-10 text-gray-400 group-hover:text-brand-orange transition-colors" />
              </div>
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400 group-hover:text-brand-orange transition-colors">
                {locale === 'az' ? 'Məhsul əlavə et' : locale === 'ru' ? 'Добавить продукты' : 'Add products'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Add More Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {locale === 'az' ? 'Müqayisəyə əlavə et' : 
                     locale === 'ru' ? 'Добавить к сравнению' : 
                     'Add to comparison'}
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingEntities ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                  </div>
                ) : availableEntities.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    {locale === 'az' ? 'Əlavə etmək üçün məhsul yoxdur' : 
                     locale === 'ru' ? 'Нет продуктов для добавления' : 
                     'No products available to add'}
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {availableEntities.map((entity) => {
                      const entityName = parseEntityName(entity.entity_name);
                      const isAdded = entities.some(e => 
                        (e.entity_id === entity.entity_id) || 
                        (e.id === entity.entity_id) ||
                        (e.entity_id === entity.id) ||
                        (e.id === entity.id)
                      );
                      
                      if (isAdded) return null;
                      
                      return (
                        <div key={entity.entity_id || entity.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-brand-orange dark:hover:border-brand-orange transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {entityName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {entity.company_name}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddEntity(entity)}
                              className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-dark transition-colors"
                            >
                              {locale === 'az' ? 'Əlavə et' : locale === 'ru' ? 'Добавить' : 'Add'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Controls */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.highlightDifferences}
              </span>
            </label>
            
            <button
              onClick={() => {
                const allExpanded = Object.values(expandedGroups).every(v => v);
                setExpandedGroups({
                  main: !allExpanded,
                  financial: !allExpanded,
                  requirements: !allExpanded,
                  additional: !allExpanded
                });
              }}
              className="text-sm font-medium text-brand-orange hover:text-brand-orange-dark transition-colors"
            >
              {Object.values(expandedGroups).every(v => v) ? t.collapseAll : t.expandAll}
            </button>
          </div>
        </div>
      </div>
      
      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10">
                {/* Attribute names column */}
              </th>
              {entities.map((entity, index) => (
                <th key={entity.entity_id} className="p-4 text-center min-w-[200px] relative">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveEntity(entity.entity_id, entity)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors group"
                    title={locale === 'az' ? 'Sil' : locale === 'ru' ? 'Удалить' : 'Remove'}
                  >
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                  
                  <div className="space-y-3">
                    {/* Company Logo/Icon */}
                    <div className="w-16 h-16 mx-auto rounded-xl bg-brand-orange/10 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-brand-orange" />
                    </div>
                    
                    {/* Entity Name */}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {parseEntityName(entity.entity_name)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {entity.company_name}
                      </p>
                    </div>
                    
                    {/* Interest Rate Badge */}
                    {entity.interest_rate && (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange font-bold">
                        <Percent className="w-4 h-4" />
                        {entity.interest_rate}%
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Link
                        href={`/sirketler/kredit-teskilatlari/nagd-kreditler/${entity.entity_id}`}
                        className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                      >
                        {t.viewDetails}
                      </Link>
                      <button className="w-full px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-semibold rounded-lg transition-colors">
                        {t.apply}
                      </button>
                    </div>
                  </div>
                </th>
              ))}
              
              {/* Add More Column */}
              {entities.length < 5 && (
                <th className="p-4 text-center min-w-[200px]">
                  <div className="h-full flex items-center justify-center">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-brand-orange dark:hover:border-brand-orange hover:bg-brand-orange/5 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-brand-orange/10 flex items-center justify-center transition-colors">
                        <Plus className="w-8 h-8 text-gray-400 group-hover:text-brand-orange transition-colors" />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-brand-orange transition-colors">
                        {locale === 'az' ? 'Əlavə et' : locale === 'ru' ? 'Добавить еще' : 'Add more'}
                      </span>
                    </button>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          
          <tbody>
            {Object.entries(groupedAttributes).map(([group, attributes]) => {
              if (attributes.length === 0) return null;
              
              return (
                <React.Fragment key={group}>
                  {/* Group Header */}
                  <tr
                    className="border-t border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => toggleGroup(group)}
                  >
                    <td colSpan={entities.length < 5 ? entities.length + 2 : entities.length + 1} className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {expandedGroups[group] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {attributeGroups[group as keyof typeof attributeGroups][locale]}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {attributes.length} {locale === 'az' ? 'xüsusiyyət' : locale === 'ru' ? 'характеристик' : 'features'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Group Attributes */}
                  {expandedGroups[group] && attributes.map(attr => {
                    const config = attributeConfig[attr];
                    const Icon = config?.icon;
                    const different = isDifferent(attr);
                    
                    return (
                      <tr key={attr} className={cn(
                        "border-t border-gray-100 dark:border-gray-800",
                        different && highlightDifferences && "bg-yellow-50 dark:bg-yellow-900/20"
                      )}>
                        <td className="p-4 font-medium text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-800 z-10">
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                            {getAttributeName(attr)}
                            {different && highlightDifferences && (
                              <AlertCircle className="w-3 h-3 text-yellow-600" />
                            )}
                          </div>
                        </td>
                        {entities.map(entity => {
                          const value = entity[attr] || entity.attributes?.[attr];
                          const formattedValue = formatValue(value, config?.format);
                          const allValues = entities.map(e => e[attr] || e.attributes?.[attr]);
                          const bestIndicator = getBestValue(attr, value, allValues);
                          
                          return (
                            <td key={entity.entity_id} className="p-4 text-center">
                              <div className={cn(
                                "inline-flex items-center gap-1",
                                bestIndicator === 'best' && "text-green-600 dark:text-green-400 font-semibold",
                                bestIndicator === 'worst' && "text-red-600 dark:text-red-400"
                              )}>
                                {bestIndicator === 'best' && <Star className="w-4 h-4 fill-current" />}
                                {formattedValue}
                              </div>
                            </td>
                          );
                        })}
                        {/* Empty cell for Add More column */}
                        {entities.length < 5 && (
                          <td className="p-4 text-center bg-gray-50/50 dark:bg-gray-900/50">
                            {/* Empty cell */}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Add More Modal - Moved outside to be accessible from both empty and non-empty states */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {locale === 'az' ? 'Müqayisəyə əlavə et' : 
                   locale === 'ru' ? 'Добавить к сравнению' : 
                   'Add to comparison'}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingEntities ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {locale === 'az' ? 'Yüklənir...' : 
                     locale === 'ru' ? 'Загрузка...' : 
                     'Loading...'}
                  </p>
                </div>
              ) : availableEntities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    {locale === 'az' ? 'Əlavə ediləcək məhsul yoxdur' : 
                     locale === 'ru' ? 'Нет продуктов для добавления' : 
                     'No products available to add'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableEntities.map((entity) => (
                    <div
                      key={entity.entity_id || entity.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {parseEntityName(entity.entity_name)}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {entity.company_name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {entity.interest_rate && (
                            <span className="text-brand-orange font-semibold">
                              {entity.interest_rate}%
                            </span>
                          )}
                          {entity.max_amount && (
                            <span className="text-gray-600 dark:text-gray-400">
                              {locale === 'az' ? 'Maks:' : locale === 'ru' ? 'Макс:' : 'Max:'} {entity.max_amount.toLocaleString()} AZN
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddEntity(entity)}
                        className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-dark text-white rounded-lg font-medium transition-colors"
                      >
                        {locale === 'az' ? 'Əlavə et' : 
                         locale === 'ru' ? 'Добавить' : 
                         'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add React import for Fragment
import React from 'react';