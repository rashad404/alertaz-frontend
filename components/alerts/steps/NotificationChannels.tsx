"use client";

import React, { useState, useEffect } from 'react';
import { WizardData } from '../AlertCreationWizard';
import { ChannelValidationResponse } from '@/lib/api/alerts';
import alertsService from '@/lib/api/alerts';

interface NotificationChannelsProps {
  data: WizardData;
  onUpdate: (data: Partial<WizardData>) => void;
  channelValidation: ChannelValidationResponse | null;
  onValidateChannels: (channels: string[]) => Promise<ChannelValidationResponse | null>;
  isAuthenticated: boolean;
}

const NotificationChannels: React.FC<NotificationChannelsProps> = ({
  data,
  onUpdate,
  channelValidation,
  onValidateChannels,
  isAuthenticated,
}) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    data.notification_channels || []
  );
  const [isValidating, setIsValidating] = useState(false);

  const availableChannels = [
    { id: 'email', name: 'Email', icon: '✉️', description: 'Get alerts via email' },
    { id: 'sms', name: 'SMS', icon: '📱', description: 'Text message alerts' },
    { id: 'telegram', name: 'Telegram', icon: '✈️', description: 'Telegram bot notifications' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', description: 'WhatsApp messages' },
    { id: 'slack', name: 'Slack', icon: '#️⃣', description: 'Slack workspace notifications' },
    { id: 'push', name: 'Push', icon: '🔔', description: 'Browser push notifications' },
  ];

  useEffect(() => {
    if (isAuthenticated && selectedChannels.length > 0) {
      validateChannels();
    }
  }, [selectedChannels, isAuthenticated]);

  const validateChannels = async () => {
    if (selectedChannels.length === 0) return;

    setIsValidating(true);
    const validation = await onValidateChannels(selectedChannels);
    setIsValidating(false);

    if (validation) {
      onUpdate({ notification_channels: selectedChannels });
    }
  };

  const handleChannelToggle = (channelId: string) => {
    const newChannels = selectedChannels.includes(channelId)
      ? selectedChannels.filter(id => id !== channelId)
      : [...selectedChannels, channelId];

    setSelectedChannels(newChannels);
  };

  const getChannelStatus = (channelId: string) => {
    if (!channelValidation || !selectedChannels.includes(channelId)) {
      return null;
    }

    const status = channelValidation.channels[channelId];
    if (!status) return null;

    return {
      isReady: status.status === 'ready',
      message: status.message,
    };
  };

  const hasAllRequiredInfo = () => {
    if (!channelValidation) return false;
    return channelValidation.all_channels_ready;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Choose Notification Channels
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Select how you want to receive alerts. We'll check if you have the required information for each channel.
        </p>
      </div>

      {!isAuthenticated && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please sign in to configure notification channels.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {availableChannels.map((channel) => {
          const isSelected = selectedChannels.includes(channel.id);
          const status = getChannelStatus(channel.id);

          return (
            <div
              key={channel.id}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }
              `}
              onClick={() => handleChannelToggle(channel.id)}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{channel.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {channel.name}
                    </h4>
                    {isSelected && status && (
                      <div className="flex items-center gap-1">
                        {status.isReady ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs">Ready</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs">Setup Required</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {channel.description}
                  </p>
                  {isSelected && status && (
                    <p className={`text-xs mt-2 ${status.isReady ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {status.message}
                    </p>
                  )}
                </div>
                <div className="mt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedChannels.length > 0 && channelValidation && !channelValidation.all_channels_ready && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
            Setup Required
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            Some selected channels need additional information. Please configure:
          </p>
          <ul className="space-y-2">
            {selectedChannels.map((channelId) => {
              const status = channelValidation.channels[channelId];
              if (status && status.status !== 'ready') {
                return (
                  <li key={channelId} className="flex items-center gap-2 text-sm">
                    <span className="text-amber-600 dark:text-amber-400">•</span>
                    <span className="font-medium">{alertsService.getChannelLabel(channelId)}:</span>
                    <span className="text-amber-700 dark:text-amber-300">{status.message}</span>
                  </li>
                );
              }
              return null;
            })}
          </ul>
          <button
            onClick={() => window.open('/settings/notifications', '_blank')}
            className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
          >
            Configure Notification Settings
          </button>
        </div>
      )}

      {selectedChannels.length === 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please select at least one notification channel.
          </p>
        </div>
      )}

      {isValidating && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Validating channels...
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationChannels;