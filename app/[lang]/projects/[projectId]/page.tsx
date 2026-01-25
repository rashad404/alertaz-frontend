'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  Package,
  Send,
  FileText,
  Settings,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  customersApi,
  campaignsApi,
  servicesApi,
} from '@/lib/api';
import { useProject } from './ProjectContext';

interface DashboardStats {
  totalCustomers: number;
  totalServices: Record<string, number>;
  activeCampaigns: number;
  messagesSent: number;
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const t = useTranslations();
  const { serviceTypes, project } = useProject();
  const fetchedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalServices: {},
    activeCampaigns: 0,
    messagesSent: 0,
  });

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // Fetch customers count
      const customersData = await customersApi.list(projectId, { page: 1, per_page: 1 });
      const totalCustomers = customersData.meta.total;

      // Fetch service counts for each type
      const totalServices: Record<string, number> = {};
      if (serviceTypes.length > 0) {
        const statsPromises = serviceTypes.map(async (type) => {
          try {
            const stats = await servicesApi.stats(projectId, type.key);
            return { key: type.key, count: stats.total || 0 };
          } catch {
            return { key: type.key, count: 0 };
          }
        });
        const results = await Promise.all(statsPromises);
        results.forEach(({ key, count }) => {
          totalServices[key] = count;
        });
      }

      // Fetch campaigns
      let activeCampaigns = 0;
      let messagesSent = 0;
      try {
        const campaignsData = await campaignsApi.list(projectId);
        activeCampaigns = campaignsData.data.filter(
          (c) => c.status === 'active' || c.status === 'sending'
        ).length;

        messagesSent = campaignsData.data.reduce((sum, c) => {
          return sum + (c.stats?.sent || 0);
        }, 0);
      } catch {
        // Campaigns API may not be fully implemented yet
      }

      setStats({
        totalCustomers,
        totalServices,
        activeCampaigns,
        messagesSent,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    if (serviceTypes.length === 0) return; // Wait for service types to load
    fetchedRef.current = true;
    fetchDashboardData();
  }, [projectId, serviceTypes]);

  const basePath = `/projects/${projectId}`;

  const quickActions = [
    {
      title: t('campaigns.dashboard.viewCustomers'),
      description: t('campaigns.dashboard.viewCustomersDesc'),
      href: `${basePath}/customers`,
      icon: Users,
      color: 'blue',
    },
    {
      title: t('campaigns.dashboard.createCampaign'),
      description: t('campaigns.dashboard.createCampaignDesc'),
      href: `${basePath}/campaigns/create`,
      icon: Send,
      color: 'purple',
    },
    {
      title: t('campaigns.dashboard.manageTemplates'),
      description: t('campaigns.dashboard.manageTemplatesDesc'),
      href: `${basePath}/templates`,
      icon: FileText,
      color: 'orange',
    },
    {
      title: t('campaigns.dashboard.settings'),
      description: t('campaigns.dashboard.settingsDesc'),
      href: `${basePath}/settings`,
      icon: Settings,
      color: 'gray',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string; bgLight: string; textLight: string; borderLight: string }> = {
    blue: {
      bg: 'dark:bg-blue-500/20',
      text: 'dark:text-blue-400',
      border: 'dark:border-blue-500/30',
      bgLight: 'bg-blue-100',
      textLight: 'text-blue-600',
      borderLight: 'border-blue-200',
    },
    purple: {
      bg: 'dark:bg-purple-500/20',
      text: 'dark:text-purple-400',
      border: 'dark:border-purple-500/30',
      bgLight: 'bg-purple-100',
      textLight: 'text-purple-600',
      borderLight: 'border-purple-200',
    },
    orange: {
      bg: 'dark:bg-orange-500/20',
      text: 'dark:text-orange-400',
      border: 'dark:border-orange-500/30',
      bgLight: 'bg-orange-100',
      textLight: 'text-orange-600',
      borderLight: 'border-orange-200',
    },
    gray: {
      bg: 'dark:bg-gray-500/20',
      text: 'dark:text-gray-400',
      border: 'dark:border-gray-500/30',
      bgLight: 'bg-gray-100',
      textLight: 'text-gray-600',
      borderLight: 'border-gray-200',
    },
    green: {
      bg: 'dark:bg-green-500/20',
      text: 'dark:text-green-400',
      border: 'dark:border-green-500/30',
      bgLight: 'bg-green-100',
      textLight: 'text-green-600',
      borderLight: 'border-green-200',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0a0e27] dark:to-[#151933] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
              <LayoutDashboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project?.name || 'Project'}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('campaigns.dashboard.projectOverview')}</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">{t('campaigns.dashboard.customers')}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {loading ? '-' : stats.totalCustomers.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">{t('campaigns.dashboard.serviceTypes')}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {loading ? '-' : serviceTypes.length}
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">{t('campaigns.dashboard.activeCampaigns')}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {loading ? '-' : stats.activeCampaigns}
            </div>
          </div>

          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                <Send className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400 text-sm">{t('campaigns.dashboard.messagesSent')}</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {loading ? '-' : stats.messagesSent.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Services by Type */}
        {serviceTypes.length > 0 && (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('campaigns.dashboard.servicesByType')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {serviceTypes.map((type) => (
                <Link
                  key={type.key}
                  href={`${basePath}/services/${type.key}`}
                  className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{type.label?.en || type.key}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {loading ? '-' : (stats.totalServices[type.key] || 0).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('campaigns.dashboard.quickActions')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colors = colorClasses[action.color];
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`p-4 ${colors.bgLight} ${colors.bg} border ${colors.borderLight} ${colors.border} rounded-xl hover:scale-105 transition-all group`}
                >
                  <Icon className={`w-6 h-6 ${colors.textLight} ${colors.text} mb-3`} />
                  <div className="font-medium text-gray-900 dark:text-white">{action.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{action.description}</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Getting Started - Show if no data */}
        {!loading && stats.totalCustomers === 0 && serviceTypes.length === 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('campaigns.dashboard.gettingStarted')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('campaigns.dashboard.gettingStartedDesc')}
                </p>
                <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 text-xs">
                      1
                    </span>
                    <span>
                      {t('campaigns.dashboard.step1')}{' '}
                      <Link href={`${basePath}/settings`} className="text-purple-600 dark:text-purple-400 hover:underline">
                        {t('campaigns.dashboard.settings')}
                      </Link>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 text-xs">
                      2
                    </span>
                    <span>{t('campaigns.dashboard.step2')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-500/30 flex items-center justify-center text-purple-700 dark:text-purple-400 text-xs">
                      3
                    </span>
                    <span>
                      {t('campaigns.dashboard.step3')}{' '}
                      <Link href={`${basePath}/campaigns/create`} className="text-purple-600 dark:text-purple-400 hover:underline">
                        {t('campaigns.dashboard.campaign')}
                      </Link>
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
