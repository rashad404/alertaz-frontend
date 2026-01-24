'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Plus, TrendingUp, Bitcoin, Globe, Cloud, DollarSign, Plane, Play, Pause, Trash2, Settings, Search, Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AlertsPageClientProps {
  lang: string;
}

type AlertService = 'crypto' | 'stocks' | 'website' | 'weather' | 'currency' | 'flight';
type AlertStatus = 'active' | 'paused';

interface Alert {
  id: string;
  name: string;
  service: AlertService;
  asset: string;
  threshold: string;
  operator: string;
  field: string;
  interval: string;
  channels: string[];
  status: AlertStatus;
  lastTriggered?: Date;
  createdAt: Date;
}

const serviceIcons = {
  crypto: Bitcoin,
  stock: TrendingUp,  // Backend uses 'stock' (singular)
  stocks: TrendingUp, // Keep plural for compatibility
  website: Globe,
  weather: Cloud,
  currency: DollarSign,
  flight: Plane,
};

const serviceGradients = {
  crypto: 'from-orange-500 to-yellow-500',
  stock: 'from-blue-500 to-cyan-500',  // Backend uses 'stock' (singular)
  stocks: 'from-blue-500 to-cyan-500', // Keep plural for compatibility
  website: 'from-green-500 to-emerald-500',
  weather: 'from-purple-500 to-pink-500',
  currency: 'from-indigo-500 to-purple-500',
  flight: 'from-sky-500 to-blue-500',
};

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

const AlertsPageClient: React.FC<AlertsPageClientProps> = ({ lang }) => {
  const t = useTranslations();
  const router = useRouter();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          // Laravel paginate returns data.data
          const alertsArray = Array.isArray(data.data) ? data.data : (data.data?.data || []);

          // Map API response to frontend format
          const loadedAlerts = alertsArray.map((alert: any) => ({
            id: alert.id.toString(),
            name: alert.name,
            service: alert.service_type || 'crypto',
            asset: alert.asset || '',
            threshold: alert.conditions?.value?.toString() || 'N/A',
            operator: alert.conditions?.operator || '',
            field: alert.conditions?.field || '',
            interval: alert.check_frequency ? `${alert.check_frequency}s` : '5min',
            channels: alert.notification_channels || [],
            status: alert.is_active ? 'active' : 'paused',
            lastTriggered: alert.last_triggered_at ? new Date(alert.last_triggered_at) : undefined,
            createdAt: new Date(alert.created_at),
          }));
          setAlerts(loadedAlerts);
        }
      } catch (error) {
        console.error('Failed to load alerts from API:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AlertStatus>('all');
  const [filterService, setFilterService] = useState<'all' | AlertService>('all');

  const handleCreateNew = () => {
    router.push(`/${lang}/alerts/quick-setup`);
  };

  const handleToggleStatus = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Update local state
        setAlerts(prevAlerts =>
          prevAlerts.map(alert =>
            alert.id === id
              ? { ...alert, status: alert.status === 'active' ? 'paused' : 'active' }
              : alert
          )
        );
      } else {
        console.error('Failed to toggle alert:', data.message);
        alert(data.message || 'Failed to toggle alert');
      }
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      alert('Failed to toggle alert. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    // Confirm before deleting
    if (!confirm(t('common.confirmDelete') || 'Are you sure you want to delete this alert?')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Update local state
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
      } else {
        console.error('Failed to delete alert:', data.message);
        alert(data.message || 'Failed to delete alert');
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
      alert('Failed to delete alert. Please try again.');
    }
  };

  const handleEdit = (id: string) => {
    // Navigate to edit page
    router.push(`/${lang}/alerts/${id}/edit`);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesService = filterService === 'all' || alert.service === filterService;
    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-10]">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t('nav.myAlerts')}
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              {t('dashboard.viewManageAlerts')}
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-3 md:px-6 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300 flex-shrink-0"
            title={t('alerts.createNew')}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t('alerts.createNew')}</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card-glass rounded-3xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative md:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | AlertStatus)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="all">{t('alerts.status')} - {t('common.all')}</option>
                <option value="active">{t('alerts.active')}</option>
                <option value="paused">{t('alerts.paused')}</option>
              </select>
            </div>

            {/* Service Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value as 'all' | AlertService)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
              >
                <option value="all">{t('alerts.type')} - {t('common.all')}</option>
                <option value="crypto">{t('services.crypto.name')}</option>
                <option value="stocks">{t('services.stocks.name')}</option>
                <option value="website">{t('services.website.name')}</option>
                <option value="weather">{t('services.weather.name')}</option>
                <option value="currency">{t('services.currency.name')}</option>
                <option value="flight">{t('services.flight.name')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('dashboard.activeAlerts')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('dashboard.notificationsSent')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter(a => a.lastTriggered).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="card-glass rounded-3xl p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]">
                  <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center">
                    <Bell className="w-10 h-10 text-gray-900 dark:text-white animate-pulse" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('common.loading')}
              </h2>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="card-glass rounded-3xl p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-xl" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]">
                  <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center">
                    <Bell className="w-10 h-10 text-gray-900 dark:text-white" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('dashboard.noAlertsYet')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('dashboard.noAlertsDescription')}
              </p>
              <button
                onClick={handleCreateNew}
                className="px-8 py-4 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                {t('dashboard.createFirstAlert')}
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const ServiceIcon = serviceIcons[alert.service] || Bell;
              const gradient = serviceGradients[alert.service] || 'from-gray-500 to-gray-600';

              return (
                <div
                  key={alert.id}
                  className="card-glass rounded-3xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-20 blur-xl`} />
                      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} p-[1px]`}>
                        <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
                          <ServiceIcon className="w-7 h-7 text-gray-900 dark:text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {alert.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alert.service === 'website' ? (
                              // Website: show URL - UP/DOWN
                              <>
                                {alert.asset} - {alert.field === 'is_up' ? t('alerts.statusUp') : t('alerts.statusDown')}
                              </>
                            ) : (
                              // Crypto/Stocks/Currency: show price with operator
                              <>
                                {alert.asset && `${alert.asset} `}
                                {alert.operator === 'greater' && '>'}
                                {alert.operator === 'less' && '<'}
                                {alert.operator === 'equals' && '='}
                                {alert.operator === 'greater_equal' && '≥'}
                                {alert.operator === 'less_equal' && '≤'}
                                {' $'}{Number(alert.threshold).toLocaleString()}
                              </>
                            )}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          alert.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {t(`alerts.${alert.status}`)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('alerts.notificationChannels')}:</span>
                          <div className="flex gap-1">
                            {alert.channels.map(channel => (
                              <span key={channel} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs">
                                {t(`alerts.quickSetup.channels.${channel}`)}
                              </span>
                            ))}
                          </div>
                        </div>
                        {alert.lastTriggered && (
                          <div>
                            <span className="font-medium">{t('alerts.lastTriggered')}:</span>{' '}
                            {new Date(alert.lastTriggered).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleStatus(alert.id)}
                        className="p-2 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
                        title={alert.status === 'active' ? 'Pause' : 'Resume'}
                      >
                        {alert.status === 'active' ? (
                          <Pause className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(alert.id)}
                        className="p-2 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
                        title={t('common.edit')}
                      >
                        <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-2 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-5 h-5 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPageClient;
