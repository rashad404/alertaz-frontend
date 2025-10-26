'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, TrendingUp, Bitcoin, Globe, Cloud, DollarSign, Plane, Check, ArrowRight, ArrowLeft, Sparkles, Edit3, Mail, Send, MessageCircle, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import alertsService from '@/lib/api/alerts';
import authService from '@/lib/api/auth';
import AuthModal from '@/components/auth/AuthModal';

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
  cryptoId?: string;
  threshold?: string;
  operator?: string;
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
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);

  const [mode, setMode] = useState<'ai' | 'manual'>('ai'); // AI mode is default
  const [fieldsEnabled, setFieldsEnabled] = useState(false); // Fields start disabled in AI mode
  const [hideAiInput, setHideAiInput] = useState(false); // Hide AI input when pre-filled
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [config, setConfig] = useState<AlertConfig>({
    service: (searchParams.get('service') as AlertService) || 'crypto',
    description: searchParams.get('description') || '',
    name: '',
    crypto: 'BTC',
    cryptoId: 'bitcoin',
    threshold: '',
    operator: 'above',
    interval: '1hour',
    channels: [],
  });

  useEffect(() => {
    // Check if AI parsing failed - go back to step 0
    if (searchParams.get('ai_failed') === 'true') {
      setStep(0);
      setParseError(t('alerts.quickSetup.aiParseFailed'));
      return;
    }

    if (searchParams.get('description')) {
      setConfig(prev => ({
        ...prev,
        name: searchParams.get('description') || '',
      }));
    }

    // Auto-fill from AI parse (from index page)
    if (searchParams.get('from_ai') === 'true') {
      const cryptoId = searchParams.get('crypto_id');
      const cryptoSymbol = searchParams.get('crypto_symbol');
      const operator = searchParams.get('operator');
      const value = searchParams.get('value');

      if (cryptoId && cryptoSymbol) {
        setConfig(prev => ({
          ...prev,
          crypto: cryptoSymbol,
          cryptoId: cryptoId,
          operator: operator || 'above',
          threshold: value || '',
        }));
        setFieldsEnabled(true);
        setHideAiInput(true); // Hide AI input when data is pre-filled
        setParsedData({ success: true }); // Mark as parsed
      }
    }
  }, [searchParams]);

  // Fetch cryptocurrency list and available channels from API
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

    const fetchAvailableChannels = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // If not authenticated, assume all channels need setup
      if (!token) {
        setAvailableChannels([]);
        setIsLoadingChannels(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          setAvailableChannels([]);
          setIsLoadingChannels(false);
          return;
        }

        const data = await response.json();
        if (data.status === 'success' && data.data.available_notification_channels) {
          setAvailableChannels(data.data.available_notification_channels);
        } else {
          setAvailableChannels([]);
        }
      } catch (error) {
        console.error('Error fetching available channels:', error);
        setAvailableChannels([]);
      } finally {
        setIsLoadingChannels(false);
      }
    };

    fetchCryptos();
    fetchAvailableChannels();
  }, []);

  // Remove unavailable channels from selection when available channels load
  useEffect(() => {
    if (!isLoadingChannels && availableChannels.length >= 0) {
      const validChannels = config.channels.filter(ch => availableChannels.includes(ch));
      if (validChannels.length !== config.channels.length) {
        setConfig(prev => ({ ...prev, channels: validChannels }));
      }
    }
  }, [isLoadingChannels, availableChannels]);

  // Verify selected crypto exists in the list after cryptocurrencies load
  useEffect(() => {
    if (cryptocurrencies.length > 0 && config.crypto && config.service === 'crypto') {
      const exists = cryptocurrencies.some(c => c.symbol === config.crypto);

      if (!exists && config.cryptoId) {
        // Try to find by cryptoId if symbol doesn't match
        const byCryptoId = cryptocurrencies.find(c => c.id === config.cryptoId);
        if (byCryptoId) {
          console.log(`[QuickSetup] Correcting crypto symbol from ${config.crypto} to ${byCryptoId.symbol}`);
          setConfig(prev => ({ ...prev, crypto: byCryptoId.symbol }));
        }
      }
    }
  }, [cryptocurrencies, config.crypto, config.cryptoId, config.service]);

  // Parse alert input with LLM
  const handleParse = useCallback(async () => {
    if (!config.name.trim() || config.name.trim().length < 3) {
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const result = await alertsService.parseAlert(config.name);
      setParsedData(result);

      // Auto-fill fields based on parsed result
      if (result.service === 'crypto' && result.crypto_id) {
        // Find matching crypto in the list
        const matchedCrypto = cryptocurrencies.find(c =>
          c.symbol.toUpperCase() === result.crypto_symbol?.toUpperCase() ||
          c.id === result.crypto_id
        );

        setConfig(prev => ({
          ...prev,
          service: 'crypto',
          crypto: matchedCrypto?.symbol || result.crypto_symbol || prev.crypto,
          cryptoId: matchedCrypto?.id || result.crypto_id || prev.cryptoId,
          operator: result.operator || prev.operator,
          threshold: result.value?.toString() || prev.threshold,
        }));

        // Enable fields after successful parse
        setFieldsEnabled(true);
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      // If AI fails, offer to switch to manual mode
      setParseError('Could not understand your request. Try switching to Manual mode or be more specific.');
    } finally {
      setIsParsing(false);
    }
  }, [config.name, cryptocurrencies]);

  const handleModeToggle = (newMode: 'ai' | 'manual') => {
    setMode(newMode);
    if (newMode === 'manual') {
      setFieldsEnabled(true); // Enable fields in manual mode
    } else {
      setFieldsEnabled(false); // Disable fields in AI mode until parsed
    }
  };

  const handleNext = () => {
    if (step === 0 && config.service) {
      setStep(1);
    } else if (step === 1) {
      // In manual mode, generate a name if not provided
      if (mode === 'manual' && !config.name.trim() && config.threshold?.trim()) {
        // Auto-generate name based on service and threshold
        let generatedName = '';
        if (config.service === 'crypto') {
          generatedName = `${config.crypto} ${config.operator === 'above' ? '>' : config.operator === 'below' ? '<' : '='} $${config.threshold}`;
        } else if (config.service === 'website') {
          generatedName = `Monitor ${config.threshold}`;
        } else if (config.service === 'weather') {
          generatedName = `Weather alert for ${config.threshold}`;
        } else if (config.service === 'flight') {
          generatedName = `Flight ${config.threshold}`;
        } else if (config.service === 'stocks' || config.service === 'currency') {
          generatedName = `${config.service} ${config.operator === 'above' ? '>' : config.operator === 'below' ? '<' : '='} $${config.threshold}`;
        }
        setConfig(prev => ({ ...prev, name: generatedName }));
      }

      // Proceed to next step if we have required data
      if ((mode === 'ai' && fieldsEnabled) || (mode === 'manual' && config.threshold?.trim())) {
        setStep(2);
      }
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

  const handleAuthSuccess = () => {
    // Close modal
    setShowAuthModal(false);
    // User is now logged in, they can try to create alert again
    // Config data is already in state so it persists
  };

  const handleCreate = async () => {
    if (config.channels.length === 0) return;

    // Check if user is authenticated before making API call
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      // Show auth modal - config is already in state so it persists
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);

    try {
      // Map service type to alert_type_id
      const serviceToTypeId: Record<AlertService, number> = {
        crypto: 1,
        weather: 2,
        website: 3,
        stocks: 4,  // Frontend uses "stocks" but maps to "stock" type id 4
        currency: 5,
        flight: 6,  // Assuming flight would be id 6 if it exists
      };

      // Map operator to backend format
      const operatorMap: Record<string, string> = {
        above: 'greater',
        below: 'less',
        equals: 'equals',
      };

      // Prepare alert data for API
      const alertData = {
        alert_type_id: serviceToTypeId[config.service],
        name: config.name,
        asset: config.service === 'crypto' ? config.crypto : undefined,
        conditions: {
          field: 'price',  // For crypto/stocks/currency, we're checking price
          operator: operatorMap[config.operator || 'above'] || 'greater',
          value: parseFloat(config.threshold) || 0,
        },
        notification_channels: config.channels,
        is_recurring: false, // One-time alert by default
      };

      // Create alert via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Redirect to alerts list - it will fetch from API
        router.push('/alerts');
      } else {
        console.error('Failed to create alert:', data.message);
        alert(data.message || 'Failed to create alert. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
      alert('Failed to create alert. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ServiceIcon = serviceIcons[config.service];
  const gradient = serviceGradients[config.service];

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
                {/* Error Message from AI failure */}
                {parseError && (
                  <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <p className="text-sm text-orange-600 dark:text-orange-400">{parseError}</p>
                  </div>
                )}
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
              {/* Mode Toggle */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <button
                  onClick={() => handleModeToggle('ai')}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    mode === 'ai'
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t('alerts.quickSetup.smartFill')}
                  </span>
                </button>
                <button
                  onClick={() => handleModeToggle('manual')}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    mode === 'manual'
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    {t('alerts.quickSetup.manual')}
                  </span>
                </button>
              </div>

              {/* AI Mode Input - Only show if not pre-filled from index */}
              {mode === 'ai' && !hideAiInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alerts.quickSetup.describeYourAlert')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => {
                        setConfig({ ...config, name: e.target.value });
                        setParsedData(null);
                        setParseError(null);
                      }}
                      placeholder={t(`alerts.quickSetup.aiDescriptionPlaceholder.${config.service}`) || 'e.g., Bitcoin above $100k'}
                      className="flex-1 px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <button
                      onClick={handleParse}
                      disabled={isParsing || !config.name.trim() || config.name.trim().length < 3}
                      className={`px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition-all duration-300 ${
                        isParsing || !config.name.trim() || config.name.trim().length < 3
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                          : `bg-gradient-to-r ${gradient} text-white hover:shadow-lg hover:scale-105`
                      }`}
                    >
                      {isParsing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          <span>{t('alerts.quickSetup.analyzing')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{t('alerts.quickSetup.generate')}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Success Message */}
                  {fieldsEnabled && parsedData && (
                    <div className="mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ {t('alerts.quickSetup.alertConfigured')}
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {parseError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{parseError}</p>
                  )}
                </div>
              )}

              {/* Success banner when pre-filled from index */}
              {mode === 'ai' && hideAiInput && fieldsEnabled && (
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {t('alerts.quickSetup.aiConfigured')}
                      </p>
                      <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                        {t('alerts.quickSetup.reviewSettings')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Mode: Alert Name (Optional) */}
              {mode === 'manual' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alerts.quickSetup.alertName')} <span className="text-gray-400 text-xs">({t('alerts.quickSetup.optional')})</span>
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    placeholder={t(`alerts.quickSetup.alertNamePlaceholder.${config.service}`) || 'e.g., Bitcoin hits $100k'}
                    className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('alerts.quickSetup.leaveEmptyToAutoGenerate')}
                  </p>
                </div>
              )}

              {/* Crypto: Select Cryptocurrency */}
              {config.service === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alerts.quickSetup.selectCrypto') || 'Cryptocurrency'}
                  </label>
                  <select
                    key={`crypto-select-${cryptocurrencies.length}-${config.crypto}`}
                    value={config.crypto}
                    onChange={(e) => {
                      const selectedSymbol = e.target.value;
                      const selectedCrypto = cryptocurrencies.find(c => c.symbol === selectedSymbol);
                      setConfig(prev => ({
                        ...prev,
                        crypto: selectedSymbol,
                        cryptoId: selectedCrypto?.id || prev.cryptoId,
                      }));
                    }}
                    disabled={mode === 'ai' && !fieldsEnabled}
                    className={`w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                      mode === 'ai' && !fieldsEnabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                        <option value="ETC">Ethereum Classic (ETC)</option>
                        <option value="BNB">BNB (BNB)</option>
                        <option value="XRP">XRP (XRP)</option>
                        <option value="SOL">Solana (SOL)</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Crypto, Stocks, Currency: Operator and Price Threshold */}
              {(config.service === 'crypto' || config.service === 'stocks' || config.service === 'currency') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('alerts.quickSetup.alertCondition')}
                    </label>
                    <select
                      value={config.operator}
                      onChange={(e) => setConfig({ ...config, operator: e.target.value })}
                      disabled={mode === 'ai' && !fieldsEnabled}
                      className={`w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        mode === 'ai' && !fieldsEnabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="above">{t('alerts.quickSetup.priceGoesAbove')}</option>
                      <option value="below">{t('alerts.quickSetup.priceGoesBelow')}</option>
                      <option value="equals">{t('alerts.quickSetup.priceEquals')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('alerts.quickSetup.threshold') || 'Price Threshold'}
                    </label>
                    <input
                      type="text"
                      value={config.threshold}
                      onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
                      disabled={mode === 'ai' && !fieldsEnabled}
                      placeholder={t('alerts.quickSetup.thresholdPlaceholder') || 'e.g., 100000'}
                      className={`w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        mode === 'ai' && !fieldsEnabled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Website Monitoring: URL */}
              {config.service === 'website' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('alerts.quickSetup.websiteUrl')}
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
                    {t('alerts.quickSetup.location')}
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
                    {t('alerts.quickSetup.flightNumber')}
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
                  {channels.map((channel) => {
                    const ChannelIcon = channel.icon;
                    const isAvailable = availableChannels.includes(channel.id);
                    const isSelected = config.channels.includes(channel.id);

                    return (
                      <div key={channel.id} className="relative">
                        <button
                          onClick={() => {
                            if (isAvailable) {
                              handleChannelToggle(channel.id);
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
                onClick={() => router.push('/')}
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
                disabled={mode === 'ai' ? !fieldsEnabled : !config.threshold?.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white transition-all duration-300 ${
                  (mode === 'ai' ? fieldsEnabled : config.threshold?.trim())
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
