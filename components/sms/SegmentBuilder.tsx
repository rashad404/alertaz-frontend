'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Users, ChevronDown, Filter } from 'lucide-react';
import { campaignsApi, AttributeSchema, SegmentFilter, Condition } from '@/lib/api/campaigns';

interface SegmentBuilderProps {
  value: SegmentFilter;
  onChange: (filter: SegmentFilter) => void;
  showPreview?: boolean;
}

interface PreviewData {
  total_count: number;
  preview_count: number;
  preview_contacts: Array<{
    id: number;
    phone: string;
    attributes: Record<string, any>;
  }>;
}

const OPERATORS_WITHOUT_VALUE = [
  'is_empty', 'is_not_empty', 'is_true', 'is_false', 'is_set', 'is_not_set',
  'not_empty', 'any_expiry_today'
];

export default function SegmentBuilder({ value, onChange, showPreview = true }: SegmentBuilderProps) {
  const t = useTranslations();
  const [attributes, setAttributes] = useState<AttributeSchema[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(true);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      setIsLoadingAttributes(true);
      const data = await campaignsApi.getAttributes();
      setAttributes(data.attributes);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load attributes');
    } finally {
      setIsLoadingAttributes(false);
    }
  };

  const loadPreview = useCallback(async () => {
    if (value.conditions.length === 0) {
      setPreview(null);
      return;
    }

    const hasIncompleteConditions = value.conditions.some(
      (c) => !c.key || !c.operator || (!OPERATORS_WITHOUT_VALUE.includes(c.operator) && c.value === undefined)
    );

    if (hasIncompleteConditions) {
      return;
    }

    try {
      setIsLoadingPreview(true);
      const data = await campaignsApi.previewSegment(value, 5);
      setPreview(data);
    } catch (err: any) {
      console.error('Preview failed:', err);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showPreview) {
        loadPreview();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [value, showPreview, loadPreview]);

  const addCondition = () => {
    const newConditions = [...value.conditions, { key: '', operator: '', value: '' }];
    onChange({ ...value, conditions: newConditions });
  };

  const removeCondition = (index: number) => {
    const newConditions = value.conditions.filter((_, i) => i !== index);
    onChange({ ...value, conditions: newConditions });
  };

  const updateCondition = (index: number, field: keyof Condition, fieldValue: any) => {
    const newConditions = [...value.conditions];
    newConditions[index] = { ...newConditions[index], [field]: fieldValue };

    // Reset value when operator doesn't need it
    if (field === 'operator' && OPERATORS_WITHOUT_VALUE.includes(fieldValue)) {
      delete newConditions[index].value;
    }

    // Reset operator and value when attribute changes
    if (field === 'key') {
      newConditions[index].operator = '';
      newConditions[index].value = '';
    }

    onChange({ ...value, conditions: newConditions });
  };

  const updateLogic = (logic: 'AND' | 'OR') => {
    onChange({ ...value, logic });
  };

  const getAttributeByKey = (key: string): AttributeSchema | undefined => {
    return attributes.find((a) => a.key === key);
  };

  const getOperatorLabel = (operator: string): string => {
    const key = `smsApi.segments.operators.${operator}`;
    const translation = t(key);
    return translation === key ? operator.replace(/_/g, ' ') : translation;
  };

  const renderValueInput = (condition: Condition, index: number) => {
    if (OPERATORS_WITHOUT_VALUE.includes(condition.operator)) {
      return null;
    }

    const attribute = getAttributeByKey(condition.key);
    if (!attribute) return null;

    // Array operators that need days input
    const arrayDaysOperators = ['any_expiry_within', 'any_expiry_in_days', 'any_expiry_after', 'any_expiry_expired_since'];
    if (attribute.type === 'array' && arrayDaysOperators.includes(condition.operator)) {
      return (
        <input
          type="number"
          value={condition.value || ''}
          onChange={(e) => updateCondition(index, 'value', parseInt(e.target.value) || '')}
          placeholder={t('smsApi.segments.enterDays')}
          min="0"
          className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      );
    }

    // Array count operator needs number with comparison operator
    if (attribute.type === 'array' && condition.operator === 'count') {
      return (
        <div className="flex items-center gap-2">
          <select
            value={typeof condition.value === 'object' ? condition.value.operator || 'equals' : 'equals'}
            onChange={(e) => updateCondition(index, 'value', {
              operator: e.target.value,
              count: typeof condition.value === 'object' ? condition.value.count || 0 : 0
            })}
            className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          >
            <option value="equals">=</option>
            <option value="greater_than">&gt;</option>
            <option value="greater_than_or_equal">≥</option>
            <option value="less_than">&lt;</option>
            <option value="less_than_or_equal">≤</option>
          </select>
          <input
            type="number"
            value={typeof condition.value === 'object' ? condition.value.count || '' : ''}
            onChange={(e) => updateCondition(index, 'value', {
              operator: typeof condition.value === 'object' ? condition.value.operator || 'equals' : 'equals',
              count: parseInt(e.target.value) || 0
            })}
            placeholder="0"
            min="0"
            className="w-20 px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      );
    }

    if (attribute.type === 'boolean') {
      return (
        <select
          value={condition.value?.toString() || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value === 'true')}
          className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
          <option value="">-</option>
          <option value="true">{t('smsApi.segments.operators.is_true')}</option>
          <option value="false">{t('smsApi.segments.operators.is_false')}</option>
        </select>
      );
    }

    if (attribute.type === 'enum' && attribute.options) {
      return (
        <select
          value={condition.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
          <option value="">{t('smsApi.segments.enterValue')}</option>
          {attribute.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (attribute.type === 'date') {
      // Operators that need number input (days)
      const daysOperators = [
        'expires_within', 'expired_since',
        'expires_in_days_eq', 'expires_in_days_gt', 'expires_in_days_gte',
        'expires_in_days_lt', 'expires_in_days_lte',
        'days_ago_eq', 'days_ago_gt', 'days_ago_gte', 'days_ago_lt', 'days_ago_lte'
      ];

      if (daysOperators.includes(condition.operator)) {
        return (
          <input
            type="number"
            value={condition.value || ''}
            onChange={(e) => updateCondition(index, 'value', parseInt(e.target.value) || '')}
            placeholder={t('smsApi.segments.enterDays')}
            min="0"
            className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        );
      }
      return (
        <input
          type="date"
          value={condition.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      );
    }

    if (attribute.type === 'number' || attribute.type === 'integer') {
      return (
        <input
          type="number"
          value={condition.value || ''}
          onChange={(e) => updateCondition(index, 'value', e.target.value ? parseFloat(e.target.value) : '')}
          placeholder={t('smsApi.segments.enterValue')}
          className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      );
    }

    return (
      <input
        type="text"
        value={condition.value || ''}
        onChange={(e) => updateCondition(index, 'value', e.target.value)}
        placeholder={t('smsApi.segments.enterValue')}
        className="flex-1 min-w-[120px] px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    );
  };

  if (isLoadingAttributes) {
    return (
      <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('smsApi.segments.title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('smsApi.segments.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Logic Selector */}
      {value.conditions.length > 1 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('smsApi.segments.logic')}:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateLogic('AND')}
              className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                value.logic === 'AND'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-500'
              }`}
            >
              {t('smsApi.segments.logicAnd')}
            </button>
            <button
              type="button"
              onClick={() => updateLogic('OR')}
              className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                value.logic === 'OR'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-indigo-500'
              }`}
            >
              {t('smsApi.segments.logicOr')}
            </button>
          </div>
        </div>
      )}

      {/* Conditions */}
      <div className="space-y-3">
        {value.conditions.length === 0 ? (
          <div className="text-center py-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <Filter className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t('smsApi.segments.noConditions')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {t('smsApi.segments.noConditionsDesc')}
            </p>
          </div>
        ) : (
          value.conditions.map((condition, index) => {
            const attribute = getAttributeByKey(condition.key);
            return (
              <div
                key={index}
                className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
              >
                {/* Attribute Selector */}
                <div className="relative min-w-[180px]">
                  <select
                    value={condition.key}
                    onChange={(e) => updateCondition(index, 'key', e.target.value)}
                    className="w-full px-3 py-2.5 pr-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">{t('smsApi.segments.selectAttribute')}</option>
                    {attributes.map((attr) => (
                      <option key={attr.key} value={attr.key}>
                        {attr.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Operator Selector */}
                {condition.key && attribute && (
                  <div className="relative min-w-[160px]">
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                      className="w-full px-3 py-2.5 pr-8 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">{t('smsApi.segments.selectOperator')}</option>
                      {attribute.conditions.map((op) => (
                        <option key={op} value={op}>
                          {getOperatorLabel(op)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                )}

                {/* Value Input */}
                {condition.operator && renderValueInput(condition, index)}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="cursor-pointer p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title={t('smsApi.segments.removeCondition')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Condition Button */}
      <button
        type="button"
        onClick={addCondition}
        className="cursor-pointer w-full py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        {t('smsApi.segments.addCondition')}
      </button>

      {/* Preview */}
      {showPreview && value.conditions.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('smsApi.segments.previewResults')}
              </p>
              {isLoadingPreview ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  <span className="text-sm text-gray-500">...</span>
                </div>
              ) : preview ? (
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {preview.total_count} {t('smsApi.segments.matchingContacts')}
                </p>
              ) : (
                <p className="text-sm text-gray-500">-</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
