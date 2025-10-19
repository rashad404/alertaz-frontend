"use client";

import React, { useState, useEffect } from 'react';
import { WizardData } from '../AlertCreationWizard';

interface ConditionBuilderProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
}

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ data, onUpdate }) => {
  const [alertName, setAlertName] = useState(data.name || '');
  const [selectedField, setSelectedField] = useState(data.conditions?.field || 'price');
  const [selectedOperator, setSelectedOperator] = useState(data.conditions?.operator || 'greater');
  const [value, setValue] = useState<string>(String(data.conditions?.value || ''));
  const [checkFrequency, setCheckFrequency] = useState(data.check_frequency || 300);
  const [isRecurring, setIsRecurring] = useState(data.is_recurring !== false);

  useEffect(() => {
    updateConditions();
  }, [selectedField, selectedOperator, value, alertName, checkFrequency, isRecurring]);

  const updateConditions = () => {
    if (value && alertName) {
      onUpdate({
        name: alertName,
        conditions: {
          field: selectedField,
          operator: selectedOperator,
          value: isNaN(Number(value)) ? value : Number(value),
        },
        check_frequency: checkFrequency,
        is_recurring: isRecurring,
      });
    }
  };

  if (!data.alertType) {
    return <div>Please select a service first.</div>;
  }

  const fields = data.alertType.condition_fields || { price: 'Price' };
  const operators = data.alertType.operators || {
    equals: { label: 'Equals', symbol: '=' },
    greater: { label: 'Greater than', symbol: '>' },
    greater_equal: { label: 'Greater or equal', symbol: '>=' },
    less: { label: 'Less than', symbol: '<' },
    less_equal: { label: 'Less or equal', symbol: '<=' },
    not_equals: { label: 'Not equals', symbol: '!=' },
  };

  const frequencies = [
    { value: 60, label: 'Every minute' },
    { value: 300, label: 'Every 5 minutes' },
    { value: 600, label: 'Every 10 minutes' },
    { value: 1800, label: 'Every 30 minutes' },
    { value: 3600, label: 'Every hour' },
    { value: 21600, label: 'Every 6 hours' },
    { value: 86400, label: 'Daily' },
  ];

  const generateAlertPreview = () => {
    if (!alertName || !selectedField || !selectedOperator || !value) return '';

    const fieldLabel = fields[selectedField] || selectedField;
    const operatorLabel = operators[selectedOperator]?.symbol || selectedOperator;
    const asset = data.asset || data.alertType.slug;

    return `When ${asset} ${fieldLabel} ${operatorLabel} ${value}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Set Alert Conditions
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Define when you want to be notified.
        </p>
      </div>

      {/* Alert Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Alert Name *
        </label>
        <input
          type="text"
          value={alertName}
          onChange={(e) => setAlertName(e.target.value)}
          placeholder={`e.g., ${data.asset || 'BTC'} reaches $100k`}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Condition Builder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Field Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Monitor Field
          </label>
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {Object.entries(fields).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Operator Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Condition
          </label>
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {Object.entries(operators).map(([key, op]) => (
              <option key={key} value={key}>
                {op.label} ({op.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Value *
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g., 100000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Check Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Check Frequency
        </label>
        <select
          value={checkFrequency}
          onChange={(e) => setCheckFrequency(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {frequencies.map((freq) => (
            <option key={freq.value} value={freq.value}>
              {freq.label}
            </option>
          ))}
        </select>
      </div>

      {/* Recurring Option */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">
          Recurring alert (notify multiple times when condition is met)
        </label>
      </div>

      {/* Preview */}
      {alertName && value && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Alert Preview:
          </p>
          <p className="text-lg text-blue-800 dark:text-blue-200">
            "{alertName}"
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {generateAlertPreview()}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Checking {frequencies.find(f => f.value === checkFrequency)?.label.toLowerCase()}
            {!isRecurring && ' (one-time alert)'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConditionBuilder;