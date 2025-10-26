'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, ArrowLeft, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AlertFormFields from '@/components/alerts/AlertFormFields';
import NotificationChannelSelector from '@/components/alerts/NotificationChannelSelector';

type AlertService = 'crypto' | 'stocks' | 'website' | 'weather' | 'currency' | 'flight';
type AlertStatus = 'active' | 'paused';
type AlertCondition = 'above' | 'below' | 'equals';
type WebsiteCondition = 'down' | 'up';

interface Alert {
  id: string;
  name: string;
  service: AlertService;
  status: AlertStatus;
  lastTriggered?: Date;
  createdAt: Date;
}

interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
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
  const [crypto, setCrypto] = useState('BTC');
  const [cryptoId, setCryptoId] = useState('bitcoin');
  const [stock, setStock] = useState('AAPL');
  const [condition, setCondition] = useState<AlertCondition>('above');
  const [websiteCondition, setWebsiteCondition] = useState<WebsiteCondition>('down');
  const [threshold, setThreshold] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  // Crypto data
  const [cryptocurrencies, setCryptocurrencies] = useState<Cryptocurrency[]>([]);
  const [loadingCryptos, setLoadingCryptos] = useState(false);

  // Available channels
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);

  // Fetch cryptocurrencies list for crypto service
  useEffect(() => {
    const fetchCryptos = async () => {
      setLoadingCryptos(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cryptos`);
        const data = await response.json();
        if (data.status === 'success') {
          setCryptocurrencies(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch cryptocurrencies:', error);
      } finally {
        setLoadingCryptos(false);
      }
    };

    fetchCryptos();
  }, []);

  // Fetch available notification channels
  useEffect(() => {
    const fetchAvailableChannels = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

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

    fetchAvailableChannels();
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
          // Normalize service type (backend returns 'stock', frontend uses 'stocks')
          let serviceType = apiAlert.service_type as AlertService;
          if (serviceType === 'stock' as any) {
            serviceType = 'stocks';
          }

          // Create alert object
          const foundAlert: Alert = {
            id: apiAlert.id.toString(),
            name: apiAlert.name,
            service: serviceType,
            status: apiAlert.is_active ? 'active' : 'paused',
            lastTriggered: apiAlert.last_triggered_at ? new Date(apiAlert.last_triggered_at) : undefined,
            createdAt: new Date(apiAlert.created_at),
          };

          setAlert(foundAlert);
          setName(foundAlert.name);
          setSelectedChannels(apiAlert.notification_channels || []);

          // Parse service-specific data
          if (serviceType === 'crypto') {
            // For crypto: asset contains symbol, conditions contains operator and value
            const cryptoSymbol = apiAlert.asset || 'BTC';
            setCrypto(cryptoSymbol);

            // Map backend operator to UI operator
            const backendOperator = apiAlert.conditions?.operator || 'greater';
            const uiOperator = backendOperator === 'greater' ? 'above' :
                             backendOperator === 'less' ? 'below' : 'equals';
            setCondition(uiOperator);

            setThreshold(apiAlert.conditions?.value?.toString() || '');

            // Try to find crypto ID from list
            if (cryptocurrencies.length > 0) {
              const matchedCrypto = cryptocurrencies.find(c => c.symbol === cryptoSymbol);
              if (matchedCrypto) {
                setCryptoId(matchedCrypto.id);
              }
            }
          } else if (serviceType === 'stocks') {
            // For stocks: asset contains symbol
            const stockSymbol = apiAlert.asset || 'AAPL';
            setStock(stockSymbol);

            // Map backend operator to UI operator
            const backendOperator = apiAlert.conditions?.operator || 'greater';
            const uiOperator = backendOperator === 'greater' ? 'above' :
                             backendOperator === 'less' ? 'below' : 'equals';
            setCondition(uiOperator);

            setThreshold(apiAlert.conditions?.value?.toString() || '');
          } else if (serviceType === 'website') {
            // For website: asset contains URL, conditions.field indicates status
            const url = apiAlert.asset || '';
            setThreshold(url);

            // Map conditions.field to UI condition
            const field = apiAlert.conditions?.field || 'is_down';
            const uiCondition = field === 'is_up' ? 'up' : 'down';
            setWebsiteCondition(uiCondition);
          } else if (serviceType === 'weather' || serviceType === 'flight' || serviceType === 'currency') {
            // For other services: use threshold for now
            setThreshold(apiAlert.asset || '');
          }
        }
      } catch (error) {
        console.error('Failed to load alert:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlert();
  }, [alertId, cryptocurrencies]);

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSave = async () => {
    if (!alert || !name.trim() || selectedChannels.length === 0) return;

    // Validate service-specific fields
    if ((alert.service === 'crypto' || alert.service === 'stocks' || alert.service === 'stock' as any || alert.service === 'currency') && !threshold) {
      window.alert('Please enter a threshold value');
      return;
    }

    if (alert.service === 'website' && !threshold) {
      window.alert('Please enter a website URL');
      return;
    }

    setIsSaving(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setIsSaving(false);
      return;
    }

    try {
      // Prepare update data based on service type
      let asset = '';
      let conditions: any = {};

      if (alert.service === 'crypto') {
        asset = crypto;
        const backendOperator = condition === 'above' ? 'greater' :
                               condition === 'below' ? 'less' : 'equals';
        conditions = {
          field: 'price',
          operator: backendOperator,
          value: parseFloat(threshold) || 0,
        };
      } else if (alert.service === 'stocks' || alert.service === 'stock' as any) {
        asset = stock;
        const backendOperator = condition === 'above' ? 'greater' :
                               condition === 'below' ? 'less' : 'equals';
        conditions = {
          field: 'price',
          operator: backendOperator,
          value: parseFloat(threshold) || 0,
        };
      } else if (alert.service === 'website') {
        asset = threshold; // URL
        conditions = {
          field: websiteCondition === 'up' ? 'is_up' : 'is_down',
          operator: 'equals',
          value: 1,
        };
      } else {
        // For weather, flight, currency - use threshold as asset
        asset = threshold;
        conditions = {
          field: 'value',
          operator: 'equals',
          value: threshold,
        };
      }

      const updateData = {
        name: name.trim(),
        asset,
        conditions,
        notification_channels: selectedChannels,
      };

      console.log('[EditAlert] Sending update data:', updateData);
      console.log('[EditAlert] Alert service:', alert.service);

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('alerts.notFound')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('alerts.notFoundDesc')}
          </p>
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
            {t('alerts.editSubtitle')}
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
              placeholder={t('alerts.quickSetup.alertName')}
              className="w-full px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Service-Specific Form Fields */}
          <AlertFormFields
            service={alert.service}
            crypto={crypto}
            cryptoId={cryptoId}
            onCryptoChange={(symbol, id) => {
              setCrypto(symbol);
              setCryptoId(id);
            }}
            cryptocurrencies={cryptocurrencies}
            loadingCryptos={loadingCryptos}
            stock={stock}
            onStockChange={setStock}
            condition={condition}
            onConditionChange={setCondition}
            websiteCondition={websiteCondition}
            onWebsiteConditionChange={setWebsiteCondition}
            threshold={threshold}
            onThresholdChange={setThreshold}
          />

          {/* Notification Channels */}
          <NotificationChannelSelector
            selectedChannels={selectedChannels}
            availableChannels={availableChannels}
            isLoadingChannels={isLoadingChannels}
            onChannelToggle={handleChannelToggle}
          />

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
                  <span>{t('common.saving')}</span>
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
