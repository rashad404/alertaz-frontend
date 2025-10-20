'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Bell, TrendingUp, Bitcoin, Globe, Cloud, DollarSign, Plane, Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

type AlertService = 'crypto' | 'stocks' | 'website' | 'weather' | 'currency' | 'flight';

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
}

interface AlertConfig {
  service: AlertService;
  description: string;
  name: string;
  crypto?: string;
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
  // Start at step 0 if no service is provided, otherwise start at step 1
  const [step, setStep] = useState(searchParams.get('service') ? 1 : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);

  const [config, setConfig] = useState<AlertConfig>({
    service: (searchParams.get('service') as AlertService) || 'crypto',
    description: searchParams.get('description') || '',
    name: '',
    crypto: 'BTC',
    threshold: '',
    interval: '1hour',
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

  // Fetch cryptocurrency list from API
  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch('http://100.89.150.50:8007/api/cryptos');
        const data = await response.json();
        if (data.success && data.data) {
          setCryptocurrencies(data.data);
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
      }
    };

    fetchCryptos();
  }, []);

  const handleNext = () => {
    if (step === 0 && config.service) {
      setStep(1);
    } else if (step === 1 && config.name.trim()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleServiceSelect = (service: AlertService) => {
    setConfig(prev => ({
      ...prev,
      service,
    }));
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

    try {
      // Create new alert object
      const newAlert = {
        id: Date.now().toString(),
        name: config.name,
        service: config.service,
        crypto: config.service === 'crypto' ? config.crypto : undefined,
        threshold: config.threshold || 'N/A',
        interval: config.interval,
        channels: config.channels,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      // Load existing alerts from localStorage
      const stored = localStorage.getItem('alerts');
      const existingAlerts = stored ? JSON.parse(stored) : [];

      // Add new alert
      existingAlerts.push(newAlert);

      // Save back to localStorage
      localStorage.setItem('alerts', JSON.stringify(existingAlerts));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to alerts list
      router.push('/alerts');
    } catch (error) {
      console.error('Failed to create alert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ServiceIcon = serviceIcons[config.service];
  const gradient = serviceGradients[config.service];

  const intervals = [
    { value: '5min', label: t('alerts.quickSetup.interval.5min') },
    { value: '15min', label: t('alerts.quickSetup.interval.15min') },
    { value: '30min', label: t('alerts.quickSetup.interval.30min') },
    { value: '1hour', label: t('alerts.quickSetup.interval.1hour') },
    { value: '6hours', label: t('alerts.quickSetup.interval.6hours') },
    { value: '24hours', label: t('alerts.quickSetup.interval.24hours') },
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
          {step === 0 ? (
            // Step 0: Select Service
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('alerts.quickSetup.selectService')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('alerts.quickSetup.selectServiceDesc')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Crypto */}
                <button
                  onClick={() => handleServiceSelect('crypto')}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Bitcoin className="w-12 h-12 text-orange-500 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.crypto.name')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('services.crypto.description')}
                  </p>
                </button>

                {/* Stocks */}
                <button
                  onClick={() => handleServiceSelect('stocks')}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <TrendingUp className="w-12 h-12 text-blue-500 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.stocks.name')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('services.stocks.description')}
                  </p>
                </button>

                {/* Website */}
                <button
                  onClick={() => handleServiceSelect('website')}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Globe className="w-12 h-12 text-green-500 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.website.name')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('services.website.description')}
                  </p>
                </button>

                {/* Weather */}
                <button
                  onClick={() => handleServiceSelect('weather')}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Cloud className="w-12 h-12 text-purple-500 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.weather.name')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('services.weather.description')}
                  </p>
                </button>

                {/* Currency */}
                <button
                  onClick={() => handleServiceSelect('currency')}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <DollarSign className="w-12 h-12 text-indigo-500 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.currency.name')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('services.currency.description')}
                  </p>
                </button>

                {/* Flight */}
                <button
                  onClick={() => handleServiceSelect('flight')}
                  className="group relative p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-sky-500 dark:hover:border-sky-500 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Plane className="w-12 h-12 text-sky-500 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {t('services.flight.name')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('services.flight.description')}
                  </p>
                </button>
              </div>
            </div>
          ) : step === 1 ? (
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
                  placeholder={t(`alerts.quickSetup.alertNamePlaceholder.${config.service}`)}
                  className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Crypto: Select Cryptocurrency */}
              {config.service === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alerts.quickSetup.selectCrypto')}
                  </label>
                  <select
                    value={config.crypto}
                    onChange={(e) => setConfig({ ...config, crypto: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {cryptocurrencies.length > 0 ? (
                      cryptocurrencies.map((crypto) => (
                        <option key={crypto.id} value={crypto.symbol}>
                          {crypto.name} ({crypto.symbol})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="BNB">BNB (BNB)</option>
                        <option value="XRP">XRP (XRP)</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Crypto, Stocks, Currency: Price Threshold */}
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

              {/* Website Monitoring: URL */}
              {config.service === 'website' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={config.threshold}
                    onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              {/* Weather: Location */}
              {config.service === 'weather' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={config.threshold}
                    onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
                    placeholder="Baku, Azerbaijan"
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              {/* Flight: Flight Number */}
              {config.service === 'flight' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    value={config.threshold}
                    onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
                    placeholder="J2 123 or GYD-IST"
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
            {step === 0 ? (
              <button
                onClick={() => router.push('/alerts')}
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
