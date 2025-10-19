'use client';

import React, { useState } from 'react';
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
  threshold: string;
  interval: string;
  channels: string[];
  status: AlertStatus;
  lastTriggered?: Date;
  createdAt: Date;
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

const AlertsPageClient: React.FC<AlertsPageClientProps> = ({ lang }) => {
  const t = useTranslations();
  const router = useRouter();

  // Mock data - replace with API call later
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'Bitcoin reaches $100k',
      service: 'crypto',
      threshold: '$100,000',
      interval: '1hour',
      channels: ['email', 'telegram'],
      status: 'active',
      lastTriggered: new Date('2025-01-15T10:30:00'),
      createdAt: new Date('2025-01-10T08:00:00'),
    },
    {
      id: '2',
      name: 'Website downtime alert',
      service: 'website',
      threshold: 'Response time > 5s',
      interval: '5min',
      channels: ['sms', 'push'],
      status: 'active',
      createdAt: new Date('2025-01-12T14:20:00'),
    },
    {
      id: '3',
      name: 'Stock price drop warning',
      service: 'stocks',
      threshold: 'Price drops 5%',
      interval: '15min',
      channels: ['email'],
      status: 'paused',
      createdAt: new Date('2025-01-08T09:15:00'),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | AlertStatus>('all');
  const [filterService, setFilterService] = useState<'all' | AlertService>('all');

  const handleCreateNew = () => {
    router.push(`/${lang}/alerts/quick-setup`);
  };

  const handleToggleStatus = (id: string) => {
    // TODO: API call to toggle alert status
    console.log('Toggle alert:', id);
  };

  const handleDelete = (id: string) => {
    // TODO: API call to delete alert
    console.log('Delete alert:', id);
  };

  const handleEdit = (id: string) => {
    // TODO: Navigate to edit page
    console.log('Edit alert:', id);
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
              {t('alerts.createNew')}
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
                <option value="all">{t('alerts.status')} - All</option>
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
                <option value="all">{t('alerts.type')} - All</option>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {t('dashboard.systemStatus')}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard.ready')}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
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
              const ServiceIcon = serviceIcons[alert.service];
              const gradient = serviceGradients[alert.service];

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
                            {alert.threshold} • {t(`alerts.quickSetup.interval.${alert.interval}`)}
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
                          <span className="font-medium">{t('alerts.quickSetup.selectChannels')}:</span>
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
                            <span className="font-medium">Last triggered:</span>{' '}
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
