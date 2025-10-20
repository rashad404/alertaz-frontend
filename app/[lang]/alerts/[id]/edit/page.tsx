'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, ArrowLeft, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

type AlertService = 'crypto' | 'stocks' | 'website' | 'weather' | 'currency' | 'flight';
type AlertStatus = 'active' | 'paused';

interface Alert {
  id: string;
  name: string;
  service: AlertService;
  threshold: string;
  interval: string;
  channels: string[];
  status: AlertStatus;
  lastTriggered?: Date;
  createdAt: Date;
}

// Helper function to normalize old interval formats to new ones
const normalizeInterval = (interval: string): string => {
  const intervalMap: { [key: string]: string } = {
    '5m': '5min',
    '15m': '15min',
    '30m': '30min',
    '1h': '1hour',
    '6h': '6hours',
    '24h': '24hours',
  };
  return intervalMap[interval] || interval;
};

export default function EditAlertPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const alertId = params.id as string;

  const [alert, setAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState('');
  const [interval, setInterval] = useState('1hour');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  // Load alert from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('alerts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const alerts = parsed.map((alert: any) => ({
          ...alert,
          lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : undefined,
          createdAt: new Date(alert.createdAt),
        }));

        const foundAlert = alerts.find((a: Alert) => a.id === alertId);
        if (foundAlert) {
          setAlert(foundAlert);
          setName(foundAlert.name);
          setThreshold(foundAlert.threshold);
          setInterval(normalizeInterval(foundAlert.interval));
          setSelectedChannels(foundAlert.channels);
        }
      } catch (e) {
        console.error('Failed to load alert:', e);
      }
    }
    setIsLoading(false);
  }, [alertId]);

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSave = async () => {
    if (!alert || !name.trim() || selectedChannels.length === 0) return;

    setIsSaving(true);

    try {
      // Update alert in localStorage
      const stored = localStorage.getItem('alerts');
      if (stored) {
        const alerts = JSON.parse(stored);
        const updatedAlerts = alerts.map((a: any) =>
          a.id === alertId
            ? {
                ...a,
                name: name.trim(),
                threshold: threshold.trim(),
                interval,
                channels: selectedChannels,
              }
            : a
        );
        localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect back to alerts list
      router.push('/alerts');
    } catch (error) {
      console.error('Failed to save alert:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const intervals = [
    { value: '5min', label: t('alerts.quickSetup.interval.5min') },
    { value: '15min', label: t('alerts.quickSetup.interval.15min') },
    { value: '30min', label: t('alerts.quickSetup.interval.30min') },
    { value: '1hour', label: t('alerts.quickSetup.interval.1hour') },
    { value: '6hours', label: t('alerts.quickSetup.interval.6hours') },
    { value: '24hours', label: t('alerts.quickSetup.interval.24hours') },
  ];

  const channels = [
    { id: 'email', icon: '📧', label: t('alerts.quickSetup.channels.email'), desc: t('alerts.quickSetup.channels.emailDesc') },
    { id: 'telegram', icon: '✈️', label: t('alerts.quickSetup.channels.telegram'), desc: t('alerts.quickSetup.channels.telegramDesc') },
    { id: 'whatsapp', icon: '💬', label: t('alerts.quickSetup.channels.whatsapp'), desc: t('alerts.quickSetup.channels.whatsappDesc') },
    { id: 'sms', icon: '📱', label: t('alerts.quickSetup.channels.sms'), desc: t('alerts.quickSetup.channels.smsDesc') },
    { id: 'push', icon: '🔔', label: t('alerts.quickSetup.channels.push'), desc: t('alerts.quickSetup.channels.pushDesc') },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 relative">
            <Bell className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Alert Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The alert you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/alerts')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-10]">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/alerts')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('common.edit')} {t('alerts.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your alert settings
          </p>
        </div>

        {/* Edit Form */}
        <div className="card-glass rounded-3xl p-8 space-y-8">
          {/* Alert Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('alerts.quickSetup.alertName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('alerts.quickSetup.alertNamePlaceholder')}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Threshold */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('alerts.quickSetup.threshold')}
            </label>
            <input
              type="text"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={t('alerts.quickSetup.thresholdPlaceholder')}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Check Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              {t('alerts.quickSetup.checkInterval')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {intervals.map((int) => (
                <button
                  key={int.value}
                  onClick={() => setInterval(int.value)}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all ${
                    interval === int.value
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-indigo-500'
                  }`}
                >
                  {int.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('alerts.quickSetup.selectChannels')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('alerts.quickSetup.selectChannelsDesc')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelToggle(channel.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedChannels.includes(channel.id)
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{channel.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {channel.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {channel.desc}
                      </div>
                    </div>
                    {selectedChannels.includes(channel.id) && (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {selectedChannels.length > 0 && (
              <p className="mt-3 text-sm text-indigo-600 dark:text-indigo-400">
                {t('alerts.quickSetup.channelsSelected', { count: selectedChannels.length })}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/alerts')}
              className="flex-1 px-6 py-3 rounded-2xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || selectedChannels.length === 0 || isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{t('common.save')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
