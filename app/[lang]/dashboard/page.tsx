'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { Bell, Plus, Bitcoin, Globe, BarChart3, MessageSquare, Mail, Loader2, ArrowRight, FolderOpen, TrendingUp, Activity, Play, Pause } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import { getLocaleFromPathname } from '@/lib/utils/walletAuth';

type AlertService = 'crypto' | 'stocks' | 'website' | 'weather' | 'currency' | 'flight';
type AlertStatus = 'active' | 'paused';

interface Alert {
  id: string;
  name: string;
  service: AlertService;
  asset: string;
  status: AlertStatus;
  lastTriggered?: Date;
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

export default function DashboardPage() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const [user, setUser] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [totalMessages, setTotalMessages] = useState<number>(0);
  const [togglingAlert, setTogglingAlert] = useState<string | null>(null);

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const triggeredTodayCount = alerts.filter(a => {
    if (!a.lastTriggered) return false;
    const today = new Date();
    const triggered = new Date(a.lastTriggered);
    return triggered.toDateString() === today.toDateString();
  }).length;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    setIsAuthenticated(true);

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.status === 'success') {
            setUser(userData.data);
          }
        }

        // Fetch alerts
        const alertsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          if (alertsData.status === 'success') {
            const alertsArray = Array.isArray(alertsData.data) ? alertsData.data : (alertsData.data?.data || []);
            const loadedAlerts = alertsArray.map((alert: any) => ({
              id: alert.id.toString(),
              name: alert.name,
              service: alert.service_type || 'crypto',
              asset: alert.asset || '',
              status: alert.is_active ? 'active' : 'paused',
              lastTriggered: alert.last_triggered_at ? new Date(alert.last_triggered_at) : undefined,
            }));
            setAlerts(loadedAlerts);
          }
        }

        // Fetch balance
        const balanceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sms/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          if (balanceData.status === 'success') {
            setBalance(balanceData.data.balance);
          }
        }

        // Fetch projects count
        const projectsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          if (projectsData.status === 'success') {
            const projectsArray = projectsData.data?.projects || [];
            setProjectsCount(projectsArray.length);
          }
        }

        // Fetch total messages from SMS history
        const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sms/history?per_page=1`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.status === 'success') {
            setTotalMessages(historyData.data?.pagination?.total || 0);
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const toggleAlertStatus = async (alertId: string, currentStatus: AlertStatus) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setTogglingAlert(alertId);
    try {
      const newStatus = currentStatus === 'active' ? false : true;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts/${alertId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert =>
          alert.id === alertId
            ? { ...alert, status: newStatus ? 'active' : 'paused' }
            : alert
        ));
      }
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    } finally {
      setTogglingAlert(null);
    }
  };

  const handleWalletTopup = () => {
    if (!user?.wallet_id) return;

    const clientId = process.env.NEXT_PUBLIC_WALLET_CLIENT_ID;
    if (!clientId) {
      console.error('NEXT_PUBLIC_WALLET_CLIENT_ID not configured');
      return;
    }

    const walletUrl = process.env.NEXT_PUBLIC_WALLET_URL || 'http://100.89.150.50:3011';

    const width = 420;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const popup = window.open(
      `${walletUrl}/${locale}/oauth/loading`,
      'wallet_topup',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      console.error('Popup blocked');
      return;
    }

    const topupUrl = `${walletUrl}/${locale}/oauth/topup?client_id=${clientId}`;
    popup.location.href = topupUrl;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'topup_completed') {
        window.removeEventListener('message', handleMessage);
        popup?.close();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else if (event.data?.type === 'topup_cancelled') {
        window.removeEventListener('message', handleMessage);
        popup?.close();
      }
    };
    window.addEventListener('message', handleMessage);
  };

  // Show auth required card if not authenticated
  if (isAuthenticated === false) {
    return (
      <AuthRequiredCard
        title={t('auth.signInToContinue')}
        message={t('dashboard.accessYourAlerts')}
      />
    );
  }

  // Show loading
  if (isAuthenticated === null || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Compact Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('dashboard.welcome', { name: user.name })}
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-gray-900 dark:text-white">
              {balance !== null ? `${Number(balance).toFixed(2)} AZN` : '0.00 AZN'}
            </span>
            {user?.wallet_id && (
              <button
                onClick={handleWalletTopup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('dashboard.topup')}
              </button>
            )}
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts Section (B2C) */}
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.alertsSection.title')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeAlertsCount} {t('dashboard.alertsSection.active')} · {triggeredTodayCount} {t('dashboard.alertsSection.triggeredToday')}
                </p>
              </div>
            </div>

            {alerts.length === 0 ? (
              /* Empty State */
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                  <Bell className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  {t('dashboard.alertsSection.noAlerts')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('dashboard.alertsSection.noAlertsAction')}
                </p>
                <Link
                  href="/alerts/quick-setup"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  {t('dashboard.alertsSection.createAlert')}
                </Link>
              </div>
            ) : (
              <>
                {/* Alert List */}
                <div className="space-y-2 mb-4">
                  {alerts.slice(0, 4).map((alert) => {
                    const ServiceIcon = serviceIcons[alert.service] || Bell;
                    const gradient = serviceGradients[alert.service] || 'from-gray-500 to-gray-600';
                    const isToggling = togglingAlert === alert.id;

                    return (
                      <div
                        key={alert.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <ServiceIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                              {alert.name}
                            </span>
                            <span className={`text-xs ${alert.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                              {alert.status === 'active' ? t('alerts.active') : t('alerts.paused')}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleAlertStatus(alert.id, alert.status)}
                          disabled={isToggling}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            alert.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : alert.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    href="/alerts/quick-setup"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    {t('dashboard.alertsSection.createAlert')}
                  </Link>
                  <Link
                    href="/alerts"
                    className="flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  >
                    {t('dashboard.alertsSection.viewAll')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Messaging Section (B2B) */}
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('dashboard.messagingSection.title')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {projectsCount} {t('dashboard.messagingSection.projects')} · {totalMessages} {t('dashboard.messagingSection.totalMessages')}
                </p>
              </div>
            </div>

            {/* Link List */}
            <div className="space-y-2">
              <Link
                href="/projects"
                className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('dashboard.messagingSection.projectsLink')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {projectsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                      {projectsCount}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link
                href="/dashboard/sms"
                className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('dashboard.messagingSection.smsApi')}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/dashboard/email"
                className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('dashboard.messagingSection.emailApi')}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
