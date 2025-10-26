'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Mail, Send, MessageCircle, Smartphone, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NotificationChannelSelectorProps {
  selectedChannels: string[];
  availableChannels: string[];
  isLoadingChannels: boolean;
  onChannelToggle: (channelId: string) => void;
}

export default function NotificationChannelSelector({
  selectedChannels,
  availableChannels,
  isLoadingChannels,
  onChannelToggle,
}: NotificationChannelSelectorProps) {
  const t = useTranslations();

  const channels = [
    {
      id: 'email',
      name: t('alerts.quickSetup.channels.email'),
      icon: Mail,
      description: t('alerts.quickSetup.channels.emailDesc'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'telegram',
      name: t('alerts.quickSetup.channels.telegram'),
      icon: Send,
      description: t('alerts.quickSetup.channels.telegramDesc'),
      color: 'from-sky-400 to-cyan-500'
    },
    {
      id: 'whatsapp',
      name: t('alerts.quickSetup.channels.whatsapp'),
      icon: MessageCircle,
      description: t('alerts.quickSetup.channels.whatsappDesc'),
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'sms',
      name: t('alerts.quickSetup.channels.sms'),
      icon: Smartphone,
      description: t('alerts.quickSetup.channels.smsDesc'),
      color: 'from-orange-500 to-amber-600'
    },
    {
      id: 'push',
      name: t('alerts.quickSetup.channels.push'),
      icon: Bell,
      description: t('alerts.quickSetup.channels.pushDesc'),
      color: 'from-purple-500 to-indigo-600'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('alerts.quickSetup.selectChannels')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t('alerts.quickSetup.selectChannelsDesc')}
        </p>

        <div className="space-y-3">
          {channels.map((channel) => {
            const ChannelIcon = channel.icon;
            const isAvailable = availableChannels.includes(channel.id);
            const isSelected = selectedChannels.includes(channel.id);

            return (
              <div key={channel.id} className="relative">
                <button
                  onClick={() => {
                    if (isAvailable) {
                      onChannelToggle(channel.id);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                    isSelected && isAvailable
                      ? `border-indigo-500 bg-indigo-500/10`
                      : !isAvailable
                      ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10 opacity-75'
                      : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800'
                  } ${!isAvailable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${channel.color} flex items-center justify-center flex-shrink-0 ${!isAvailable ? 'opacity-50' : ''}`}>
                        <ChannelIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${!isAvailable ? 'text-gray-500 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                            {channel.name}
                          </p>
                          {!isAvailable && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                              {t('alerts.quickSetup.setupRequired')}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${!isAvailable ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>
                          {channel.description}
                        </p>
                      </div>
                    </div>
                    {isAvailable ? (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    ) : null}
                  </div>
                </button>
                {!isAvailable && (
                  <Link
                    href="/settings/notifications"
                    className="absolute top-4 right-4 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium hover:underline"
                  >
                    {t('alerts.quickSetup.setUp')}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* No available channels warning */}
      {!isLoadingChannels && availableChannels.length === 0 && (
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
          <p className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-2">
            {t('alerts.quickSetup.noChannelsConfigured')}
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-400 mb-3">
            {t('alerts.quickSetup.noChannelsConfiguredDesc')}
          </p>
          <Link
            href="/settings/notifications"
            className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
          >
            {t('alerts.quickSetup.goToSettings')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {/* Selected channels count */}
      {selectedChannels.length > 0 && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm font-medium text-green-900 dark:text-green-300">
            {t('alerts.quickSetup.channelsSelected', { count: selectedChannels.length })}
          </p>
        </div>
      )}
    </div>
  );
}
