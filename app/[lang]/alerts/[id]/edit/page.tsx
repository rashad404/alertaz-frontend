'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, ArrowLeft, Save, Mail, Send, MessageCircle, Smartphone, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

type AlertService = 'crypto' | 'stocks' | 'website' | 'weather' | 'currency' | 'flight';
type AlertStatus = 'active' | 'paused';
type AlertCondition = 'above' | 'below' | 'equals';

interface Alert {
  id: string;
  name: string;
  service: AlertService;
  crypto?: string;
  condition?: AlertCondition;
  threshold: string;
  interval?: string;
  channels: string[];
  status: AlertStatus;
  lastTriggered?: Date;
  createdAt: Date;
}

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

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
  const [crypto, setCrypto] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [threshold, setThreshold] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  // Crypto data
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loadingCryptos, setLoadingCryptos] = useState(false);

  // Fetch cryptocurrencies list for crypto service
  useEffect(() => {
    const fetchCryptos = async () => {
      setLoadingCryptos(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cryptos`);
        const data = await response.json();
        if (data.status === 'success') {
          setCryptos(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch cryptocurrencies:', error);
      } finally {
        setLoadingCryptos(false);
      }
    };

    fetchCryptos();
  }, []);

  // Load alert from API
  useEffect(() => {
    const fetchAlert = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts/${alertId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          const apiAlert = data.data;
          const foundAlert: Alert = {
            id: apiAlert.id.toString(),
            name: apiAlert.name,
            service: apiAlert.service_type,
            crypto: apiAlert.config?.crypto,
            condition: apiAlert.config?.condition || 'above',
            threshold: apiAlert.config?.threshold?.toString() || '',
            channels: apiAlert.notification_channels || [],
            status: apiAlert.is_active ? 'active' : 'paused',
            lastTriggered: apiAlert.last_triggered_at ? new Date(apiAlert.last_triggered_at) : undefined,
            createdAt: new Date(apiAlert.created_at),
          };

          setAlert(foundAlert);
          setName(foundAlert.name);
          setCrypto(foundAlert.crypto || '');
          setCondition(foundAlert.condition || 'above');
          setThreshold(foundAlert.threshold);
          setSelectedChannels(foundAlert.channels);
        }
      } catch (error) {
        console.error('Failed to load alert:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlert();
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

    // Validate crypto-specific fields
    if (alert.service === 'crypto' && !crypto) {
      window.alert('Please select a cryptocurrency');
      return;
    }

    setIsSaving(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setIsSaving(false);
      return;
    }

    try {
      // Prepare update data
      const updateData = {
        name: name.trim(),
        config: {
          crypto: alert.service === 'crypto' ? crypto : undefined,
          condition,
          threshold: parseFloat(threshold) || 0,
        },
        notification_channels: selectedChannels,
      };

      // Update alert via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Redirect back to alerts list
        router.push('/alerts');
      } else {
        console.error('Failed to save alert:', data.message);
        window.alert(data.message || 'Failed to save alert. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save alert:', error);
      window.alert('Failed to save alert. Please check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

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

  const conditions = [
    { value: 'above' as AlertCondition, label: t('alerts.quickSetup.priceGoesAbove') },
    { value: 'below' as AlertCondition, label: t('alerts.quickSetup.priceGoesBelow') },
    { value: 'equals' as AlertCondition, label: t('alerts.quickSetup.priceEquals') },
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
              placeholder={alert?.service ? t(`alerts.quickSetup.alertNamePlaceholder.${alert.service}`) : t('alerts.quickSetup.alertName')}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Crypto Selection - Only for crypto service */}
          {alert.service === 'crypto' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('alerts.quickSetup.selectCrypto')}
              </label>
              <div className="relative">
                <select
                  value={crypto}
                  onChange={(e) => setCrypto(e.target.value)}
                  disabled={loadingCryptos}
                  className="w-full px-4 py-3 pr-10 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">{loadingCryptos ? 'Loading...' : 'Select cryptocurrency'}</option>
                  {cryptos.map((c) => (
                    <option key={c.id} value={c.symbol}>
                      {c.name} ({c.symbol})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Condition Selection - For services with conditions */}
          {(alert.service === 'crypto' || alert.service === 'stocks' || alert.service === 'currency') && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('alerts.quickSetup.alertCondition')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {conditions.map((cond) => (
                  <button
                    key={cond.value}
                    onClick={() => setCondition(cond.value)}
                    className={`px-4 py-3 rounded-2xl font-medium transition-all ${
                      condition === cond.value
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-indigo-500'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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

          {/* Notification Channels */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              {t('alerts.quickSetup.selectChannels')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('alerts.quickSetup.selectChannelsDesc')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((channel) => {
                const ChannelIcon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);

                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${channel.color} flex items-center justify-center flex-shrink-0`}>
                        <ChannelIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {channel.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {channel.description}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
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
              disabled={!name.trim() || selectedChannels.length === 0 || isSaving || (alert.service === 'crypto' && !crypto)}
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
