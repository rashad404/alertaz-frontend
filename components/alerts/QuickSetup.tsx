'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Bell, TrendingUp, Bitcoin, Globe, Cloud, DollarSign, Plane, Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

type AlertService = 'crypto' | 'stocks' | 'website' | 'weather' | 'currency' | 'flight';

interface AlertConfig {
  service: AlertService;
  description: string;
  name: string;
  threshold?: string;
  interval?: string;
  channels: string[];
}

const serviceIcons = {
  crypto: Bitcoin,
  stocks: TrendingUp,
  website: Globe,
  weather: Cloud,
  currency: DollarSign,
  flight: Plane,
};

const serviceGradients = {
  crypto: 'from-orange-500 to-yellow-500',
  stocks: 'from-blue-500 to-cyan-500',
  website: 'from-green-500 to-emerald-500',
  weather: 'from-purple-500 to-pink-500',
  currency: 'from-indigo-500 to-purple-500',
  flight: 'from-sky-500 to-blue-500',
};

export default function QuickSetup() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [config, setConfig] = useState<AlertConfig>({
    service: (searchParams.get('service') as AlertService) || 'crypto',
    description: searchParams.get('description') || '',
    name: '',
    threshold: '',
    interval: '1h',
    channels: [],
  });

  useEffect(() => {
    if (searchParams.get('description')) {
      setConfig(prev => ({
        ...prev,
        name: searchParams.get('description') || '',
      }));
    }
  }, [searchParams]);

  const handleNext = () => {
    if (step === 1 && config.name.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleChannelToggle = (channel: string) => {
    setConfig(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleCreate = async () => {
    if (config.channels.length === 0) return;

    setIsLoading(true);

    // TODO: API call to create alert
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Redirect to dashboard or alerts list
    router.push('/dashboard');
  };

  const ServiceIcon = serviceIcons[config.service];
  const gradient = serviceGradients[config.service];

  const intervals = [
    { value: '5m', label: t('alerts.quickSetup.interval.5min') },
    { value: '15m', label: t('alerts.quickSetup.interval.15min') },
    { value: '30m', label: t('alerts.quickSetup.interval.30min') },
    { value: '1h', label: t('alerts.quickSetup.interval.1hour') },
    { value: '6h', label: t('alerts.quickSetup.interval.6hours') },
    { value: '24h', label: t('alerts.quickSetup.interval.24hours') },
  ];

  const channels = [
    { id: 'email', name: t('alerts.quickSetup.channels.email'), icon: '📧', description: t('alerts.quickSetup.channels.emailDesc') },
    { id: 'telegram', name: t('alerts.quickSetup.channels.telegram'), icon: '✈️', description: t('alerts.quickSetup.channels.telegramDesc') },
    { id: 'whatsapp', name: t('alerts.quickSetup.channels.whatsapp'), icon: '💬', description: t('alerts.quickSetup.channels.whatsappDesc') },
    { id: 'sms', name: t('alerts.quickSetup.channels.sms'), icon: '📱', description: t('alerts.quickSetup.channels.smsDesc') },
    { id: 'push', name: t('alerts.quickSetup.channels.push'), icon: '🔔', description: t('alerts.quickSetup.channels.pushDesc') },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-10]">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 relative">
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-20 blur-xl`} />
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} p-[1px]`}>
              <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
                <ServiceIcon className="w-8 h-8 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('alerts.quickSetup.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('alerts.quickSetup.subtitle')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                step >= 1
                  ? `bg-gradient-to-br ${gradient} text-white`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className={`text-sm font-medium ${
                step >= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500'
              }`}>
                {t('alerts.quickSetup.step1')}
              </span>
            </div>

            {/* Divider */}
            <div className={`w-12 h-0.5 transition-all duration-300 ${
              step > 1 ? `bg-gradient-to-r ${gradient}` : 'bg-gray-200 dark:bg-gray-700'
            }`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                step >= 2
                  ? `bg-gradient-to-br ${gradient} text-white`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${
                step >= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-500'
              }`}>
                {t('alerts.quickSetup.step2')}
              </span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="card-glass rounded-3xl p-8">
          {step === 1 ? (
            // Step 1: Configure Alert
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('alerts.quickSetup.alertName')}
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder={t('alerts.quickSetup.alertNamePlaceholder')}
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {(config.service === 'crypto' || config.service === 'stocks' || config.service === 'currency') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alerts.quickSetup.threshold')}
                  </label>
                  <input
                    type="text"
                    value={config.threshold}
                    onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
                    placeholder={t('alerts.quickSetup.thresholdPlaceholder')}
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('alerts.quickSetup.checkInterval')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {intervals.map((interval) => (
                    <button
                      key={interval.value}
                      onClick={() => setConfig({ ...config, interval: interval.value })}
                      className={`px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                        config.interval === interval.value
                          ? `bg-gradient-to-br ${gradient} text-white shadow-lg`
                          : 'bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Sparkles className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    {t('alerts.quickSetup.aiTip')}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {t('alerts.quickSetup.aiTipDesc')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Step 2: Choose Channels
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('alerts.quickSetup.selectChannels')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  {t('alerts.quickSetup.selectChannelsDesc')}
                </p>

                <div className="space-y-3">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleChannelToggle(channel.id)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                        config.channels.includes(channel.id)
                          ? `border-indigo-500 bg-indigo-500/10`
                          : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{channel.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {channel.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {channel.description}
                            </p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          config.channels.includes(channel.id)
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {config.channels.includes(channel.id) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {config.channels.length > 0 && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">
                    {t('alerts.quickSetup.channelsSelected', { count: config.channels.length })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {step === 1 ? (
              <button
                onClick={() => router.back()}
                className="px-6 py-3 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              >
                {t('common.cancel')}
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('common.back')}
              </button>
            )}

            {step === 1 ? (
              <button
                onClick={handleNext}
                disabled={!config.name.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white transition-all duration-300 ${
                  config.name.trim()
                    ? `bg-gradient-to-r ${gradient} hover:shadow-lg hover:scale-105`
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                }`}
              >
                {t('common.next')}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={config.channels.length === 0 || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white transition-all duration-300 ${
                  config.channels.length > 0 && !isLoading
                    ? `bg-gradient-to-r ${gradient} hover:shadow-lg hover:scale-105`
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {t('alerts.quickSetup.creating')}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {t('alerts.quickSetup.createAlert')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
