'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight, Database, Hash, Calendar, ToggleLeft, List } from 'lucide-react';
import { AttributeSchema } from '@/lib/api/campaigns';

interface VariablePickerProps {
  attributes: AttributeSchema[];
  onInsertVariable: (variable: string) => void;
  activeField: 'sms' | 'email_subject' | 'email_body';
}

/**
 * Convert plural key to singular for array field variables
 * hostings -> hosting, domains -> domain, vps_list -> vps
 */
function toSingular(key: string): string {
  // Handle _list suffix first (vps_list -> vps)
  if (key.endsWith('_list')) {
    return key.replace('_list', '');
  }
  // Handle -ies suffix (companies -> company)
  if (key.endsWith('ies')) {
    return key.slice(0, -3) + 'y';
  }
  // Handle -es suffix for words ending in s, x, z, ch, sh (boxes -> box)
  if (key.endsWith('es') && (key.endsWith('ses') || key.endsWith('xes') || key.endsWith('zes') || key.endsWith('ches') || key.endsWith('shes'))) {
    return key.slice(0, -2);
  }
  // Handle regular -s suffix (hostings -> hosting, domains -> domain)
  if (key.endsWith('s')) {
    return key.slice(0, -1);
  }
  return key;
}

/**
 * Get icon for property type
 */
function getTypeIcon(type: string) {
  switch (type) {
    case 'date':
      return Calendar;
    case 'boolean':
      return ToggleLeft;
    case 'number':
    case 'integer':
      return Hash;
    default:
      return Database;
  }
}

export default function VariablePicker({ attributes, onInsertVariable, activeField }: VariablePickerProps) {
  const t = useTranslations();
  const [expandedArrays, setExpandedArrays] = useState<Set<string>>(new Set());

  // Separate simple attributes from array attributes
  const simpleAttributes = attributes.filter(attr => attr.type !== 'array');
  const arrayAttributes = attributes.filter(attr => attr.type === 'array' && attr.properties);

  const toggleExpanded = (key: string) => {
    setExpandedArrays(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleInsert = (variable: string) => {
    onInsertVariable(variable);
  };

  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('smsApi.campaigns.variables')}
      </h4>
      <p className="text-xs text-gray-500 mb-2">{t('smsApi.campaigns.variablesDesc')}</p>
      <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-3">
        {t('smsApi.campaigns.variablesTarget')}: {' '}
        <span className="font-medium">
          {activeField === 'sms' && t('smsApi.campaigns.messageTemplate')}
          {activeField === 'email_subject' && t('smsApi.campaigns.emailSubject')}
          {activeField === 'email_body' && t('smsApi.campaigns.emailBody')}
        </span>
      </p>

      {/* Simple attributes + built-in variables */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Built-in phone variable */}
        <button
          type="button"
          onClick={() => handleInsert('{{phone}}')}
          className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
        >
          {'{{phone}}'}
        </button>

        {/* Built-in email variable */}
        <button
          type="button"
          onClick={() => handleInsert('{{email}}')}
          className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
        >
          {'{{email}}'}
        </button>

        {/* Simple attributes */}
        {simpleAttributes.map((attr) => (
          <button
            key={attr.key}
            type="button"
            onClick={() => handleInsert(`{{${attr.key}}}`)}
            className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
            title={attr.label}
          >
            {`{{${attr.key}}}`}
          </button>
        ))}
      </div>

      {/* Array attributes with expandable fields */}
      {arrayAttributes.length > 0 && (
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <List className="w-3 h-3" />
            {t('smsApi.campaigns.arrayVariables') || 'Array fields (click to expand)'}
          </p>
          {arrayAttributes.map((attr) => {
            const isExpanded = expandedArrays.has(attr.key);
            const singularKey = toSingular(attr.key);
            const properties = attr.properties || {};

            return (
              <div key={attr.key} className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header - clickable to expand */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(attr.key)}
                  className="cursor-pointer w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {attr.label || attr.key}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({Object.keys(properties).length} {t('smsApi.campaigns.fields') || 'fields'})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                    {`{{${singularKey}_...}}`}
                  </span>
                </button>

                {/* Expanded content - property buttons */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(properties).map(([propKey, propType]) => {
                        const variable = `{{${singularKey}_${propKey}}}`;
                        const Icon = getTypeIcon(propType);

                        return (
                          <button
                            key={propKey}
                            type="button"
                            onClick={() => handleInsert(variable)}
                            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            title={`${propKey} (${propType})`}
                          >
                            <Icon className="w-3 h-3" />
                            {variable}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {t('smsApi.campaigns.arrayFieldsHint') || 'These variables show the first matching item from the array.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
