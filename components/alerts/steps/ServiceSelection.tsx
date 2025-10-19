"use client";

import React from 'react';
import { AlertType } from '@/lib/api/alerts';
import { WizardData } from '../AlertCreationWizard';

interface ServiceSelectionProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  alertTypes: AlertType[];
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({ data, onUpdate, alertTypes }) => {
  const getIcon = (slug: string) => {
    const icons: Record<string, string> = {
      crypto: '₿',
      weather: '🌤️',
      website: '🌐',
      stock: '📈',
      currency: '💱',
    };
    return icons[slug] || '📊';
  };

  const getDescription = (alertType: AlertType) => {
    // Assuming the description is translatable
    if (typeof alertType.description === 'object') {
      return alertType.description.en || alertType.description.az || '';
    }
    return alertType.description || '';
  };

  const getName = (alertType: AlertType) => {
    // Assuming the name is translatable
    if (typeof alertType.name === 'object') {
      return alertType.name.en || alertType.name.az || '';
    }
    return alertType.name || '';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          What would you like to monitor?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose the type of service you want to set up alerts for.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alertTypes.map((alertType) => (
          <button
            key={alertType.id}
            onClick={() => onUpdate({ alertType })}
            className={`
              p-6 rounded-lg border-2 transition-all text-left
              ${data.alertType?.id === alertType.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }
            `}
          >
            <div className="text-3xl mb-3">{getIcon(alertType.slug)}</div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {getName(alertType)}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getDescription(alertType)}
            </p>
            {alertType.is_active && (
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-green-600 dark:text-green-400">Active</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {data.alertType && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Selected:</strong> {getName(data.alertType)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Check interval: Every {data.alertType.check_interval / 60} minutes
          </p>
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;