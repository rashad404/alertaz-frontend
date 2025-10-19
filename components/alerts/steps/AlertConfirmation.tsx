"use client";

import React from 'react';
import { WizardData } from '../AlertCreationWizard';
import alertsService from '@/lib/api/alerts';

interface AlertConfirmationProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
}

const AlertConfirmation: React.FC<AlertConfirmationProps> = ({ data, onUpdate }) => {
  if (!data.alertType || !data.name || !data.conditions || !data.notification_channels?.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Please complete all previous steps before confirming your alert.
        </p>
      </div>
    );
  }

  const getName = (alertType: any) => {
    if (typeof alertType.name === 'object') {
      return alertType.name.en || alertType.name.az || '';
    }
    return alertType.name || '';
  };

  const getOperatorLabel = () => {
    const operators = data.alertType.operators || {};
    const operator = operators[data.conditions.operator];
    return operator ? `${operator.label} (${operator.symbol})` : data.conditions.operator;
  };

  const getFieldLabel = () => {
    const fields = data.alertType.condition_fields || {};
    return fields[data.conditions.field] || data.conditions.field;
  };

  const getFrequencyLabel = () => {
    const minutes = (data.check_frequency || 300) / 60;
    if (minutes < 60) {
      return `Every ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
      const hours = minutes / 60;
      return `Every ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      const days = minutes / 1440;
      return `Every ${days} day${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Confirm Your Alert
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Review your alert settings before creating it.
        </p>
      </div>

      {/* Alert Summary Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h4 className="text-2xl font-bold mb-2">{data.name}</h4>
        <p className="text-blue-100 text-sm">
          {data.is_recurring ? 'Recurring Alert' : 'One-time Alert'}
        </p>
      </div>

      {/* Alert Details */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-2xl">📊</div>
          <div className="flex-1">
            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Service</h5>
            <p className="text-gray-600 dark:text-gray-400">
              {getName(data.alertType)}
              {data.asset && (
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  ({data.asset})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-2xl">⚡</div>
          <div className="flex-1">
            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Condition</h5>
            <p className="text-gray-600 dark:text-gray-400">
              When <span className="font-medium">{getFieldLabel()}</span>{' '}
              <span className="font-medium">{getOperatorLabel()}</span>{' '}
              <span className="font-bold text-gray-900 dark:text-white">
                {data.conditions.value}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-2xl">⏰</div>
          <div className="flex-1">
            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Frequency</h5>
            <p className="text-gray-600 dark:text-gray-400">
              Checking {getFrequencyLabel()}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-2xl">🔔</div>
          <div className="flex-1">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Notification Channels</h5>
            <div className="flex flex-wrap gap-2">
              {data.notification_channels.map((channel) => (
                <span
                  key={channel}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  <span>{alertsService.getChannelIcon(channel)}</span>
                  <span>{alertsService.getChannelLabel(channel)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
          📌 Important
        </h5>
        <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
          <li>• Your alert will start monitoring immediately after creation</li>
          <li>• You can pause or delete alerts at any time from your dashboard</li>
          <li>• Make sure your notification channels are properly configured</li>
          {!data.is_recurring && (
            <li>• This is a one-time alert and will be disabled after triggering</li>
          )}
        </ul>
      </div>

      {/* Final CTA */}
      <div className="text-center pt-4">
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
          Ready to create your alert?
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Click "Create Alert" below to activate monitoring
        </p>
      </div>
    </div>
  );
};

export default AlertConfirmation;