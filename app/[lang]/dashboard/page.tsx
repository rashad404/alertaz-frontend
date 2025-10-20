'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Plus, TrendingUp, Activity, Settings, Bitcoin, Globe, BarChart3, Play, Pause } from 'lucide-react';
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

const serviceIcons = {
  crypto: Bitcoin,
  stocks: BarChart3,
  website: Globe,
  weather: Bell,
  currency: TrendingUp,
  flight: Activity,
};

const serviceGradients = {
  crypto: 'from-orange-500 to-yellow-500',
  stocks: 'from-blue-500 to-cyan-500',
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

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const triggeredCount = alerts.filter(a => a.lastTriggered).length;

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Mock user data - replace with actual API call
    setUser({ name: 'User', email: 'user@example.com' });

    // Load alerts from localStorage
    const stored = localStorage.getItem('alerts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const loadedAlerts = parsed.map((alert: any) => ({
          ...alert,
          lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : undefined,
          createdAt: new Date(alert.createdAt),
        }));
        setAlerts(loadedAlerts);
      } catch (e) {
        console.error('Failed to load alerts:', e);
      }
    }
    setIsLoading(false);
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-indigo-600 dark:text-indigo-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-10]">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('dashboard.welcome', { name: user.name })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <Link
            href="/alerts/quick-setup"
            className="inline-flex items-center gap-2 btn-primary group"
          >
            <Plus className="w-5 h-5" />
            <span>{t('alerts.createNew')}</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Active Alerts */}
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{activeAlertsCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.activeAlerts')}</div>
          </div>

          {/* Notifications Sent */}
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{triggeredCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.notificationsSent')}</div>
          </div>

          {/* System Status */}
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{t('dashboard.ready')}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.systemStatus')}</div>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card-glass rounded-3xl p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.yourAlerts')}
            </h2>
            <Link
              href="/alerts"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
            >
              {t('dashboard.allAlerts')} →
            </Link>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-xl" />
                  <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-[1px]">
                    <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center">
                      <Bell className="w-8 h-8 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('dashboard.noAlertsYet')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('dashboard.noAlertsDescription')}
                </p>
                <Link
                  href="/alerts/quick-setup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  {t('dashboard.createFirstAlert')}
                </Link>
              </div>
            ) : (
              alerts.slice(0, 3).map((alert) => {
                const ServiceIcon = serviceIcons[alert.service];
                const gradient = serviceGradients[alert.service];

                return (
                  <div
                    key={alert.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
                  >
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} p-[1px]`}>
                        <div className="w-full h-full rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center">
                          <ServiceIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {alert.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.threshold} • {t(`alerts.quickSetup.interval.${normalizeInterval(alert.interval)}`)}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      alert.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {t(`alerts.${alert.status}`)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/settings"
            className="card-glass rounded-3xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {t('nav.settings')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('settings.manageAccount')}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/alerts"
            className="card-glass rounded-3xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {t('dashboard.allAlerts')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('dashboard.viewManageAlerts')}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
