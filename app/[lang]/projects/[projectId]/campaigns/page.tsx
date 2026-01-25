'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/lib/navigation';
import {
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Eye,
  Copy,
  Smartphone,
  Mail,
  Layers,
  Users,
  Package,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { campaignsApi } from '@/lib/api';
import type { Campaign } from '@/lib/types/api';

const statusConfig: Record<string, { icon: React.ReactNode; colors: string }> = {
  draft: {
    icon: <Clock className="w-4 h-4" />,
    colors: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
  },
  scheduled: {
    icon: <Clock className="w-4 h-4" />,
    colors: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  sending: {
    icon: <Send className="w-4 h-4 animate-pulse" />,
    colors: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  completed: {
    icon: <CheckCircle className="w-4 h-4" />,
    colors: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  cancelled: {
    icon: <XCircle className="w-4 h-4" />,
    colors: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
  },
  failed: {
    icon: <AlertCircle className="w-4 h-4" />,
    colors: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  active: {
    icon: <Play className="w-4 h-4" />,
    colors: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  paused: {
    icon: <Pause className="w-4 h-4" />,
    colors: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

export default function CampaignsListPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);
  const fetchedRef = useRef(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadCampaigns();
  }, [projectId]);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await campaignsApi.list(projectId);
      setCampaigns(data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (id: number) => {
    setActionLoading(id);
    try {
      await campaignsApi.execute(projectId, id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to execute campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (id: number) => {
    if (!confirm(t('smsApi.campaigns.confirmPause'))) return;
    setActionLoading(id);
    try {
      await campaignsApi.pause(projectId, id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to pause campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: number) => {
    if (!confirm(t('smsApi.campaigns.confirmActivate'))) return;
    setActionLoading(id);
    try {
      await campaignsApi.activate(projectId, id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm(t('smsApi.campaigns.confirmCancel'))) return;
    setActionLoading(id);
    try {
      await campaignsApi.cancel(projectId, id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('smsApi.campaigns.confirmDelete'))) return;
    setActionLoading(id);
    try {
      await campaignsApi.delete(projectId, id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (id: number) => {
    setActionLoading(id);
    try {
      const campaign = await campaignsApi.duplicate(projectId, id);
      router.push(`/projects/${projectId}/campaigns/${campaign.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to duplicate campaign');
      setActionLoading(null);
    }
  };

  const basePath = `/projects/${projectId}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('smsApi.campaigns.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t('smsApi.campaigns.description')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadCampaigns}
              disabled={loading}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href={`${basePath}/campaigns/create`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              {t('smsApi.campaigns.createCampaign')}
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="relative rounded-3xl p-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('smsApi.campaigns.noCampaigns')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {t('smsApi.campaigns.noCampaignsDesc')}
            </p>
            <Link
              href={`${basePath}/campaigns/create`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              {t('smsApi.campaigns.createCampaign')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const status = statusConfig[campaign.status] || statusConfig.draft;
              const isLoading = actionLoading === campaign.id;

              return (
                <div
                  key={campaign.id}
                  className="relative rounded-2xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Campaign Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Link
                          href={`${basePath}/campaigns/${campaign.id}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {campaign.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Target Type */}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
                            {campaign.target_type === 'customer' ? (
                              <Users className="w-3 h-3" />
                            ) : (
                              <Package className="w-3 h-3" />
                            )}
                            {campaign.target_type === 'customer' ? 'Customers' : 'Services'}
                          </span>

                          {/* Channel */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            campaign.channel === 'sms'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                              : campaign.channel === 'email'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {campaign.channel === 'sms' && <Smartphone className="w-3 h-3" />}
                            {campaign.channel === 'email' && <Mail className="w-3 h-3" />}
                            {campaign.channel === 'both' && <Layers className="w-3 h-3" />}
                            {campaign.channel.toUpperCase()}
                          </span>

                          {/* Status */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${status.colors}`}>
                            {status.icon}
                            {t(`smsApi.campaigns.statuses.${campaign.status}`)}
                          </span>

                          {/* Campaign Type */}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
                            {campaign.campaign_type === 'automated' ? (
                              <RefreshCw className="w-3 h-3" />
                            ) : (
                              <Zap className="w-3 h-3" />
                            )}
                            {campaign.campaign_type === 'automated' ? 'Automated' : 'One-time'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-6">
                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {campaign.stats?.total || 0}
                          </div>
                          <div className="text-xs text-gray-500">{t('smsApi.campaigns.stats.target')}</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {campaign.stats?.sent || 0}
                          </div>
                          <div className="text-xs text-gray-500">{t('smsApi.campaigns.stats.sent')}</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {campaign.stats?.delivered || 0}
                          </div>
                          <div className="text-xs text-gray-500">{t('smsApi.campaigns.stats.delivered')}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {campaign.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleExecute(campaign.id)}
                              disabled={isLoading}
                              className="p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title={t('smsApi.campaigns.actions.execute')}
                            >
                              <Play className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {campaign.status === 'active' && (
                          <button
                            onClick={() => handlePause(campaign.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                            title={t('smsApi.campaigns.actions.pause')}
                          >
                            <Pause className="w-5 h-5" />
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button
                            onClick={() => handleActivate(campaign.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                            title={t('smsApi.campaigns.actions.activate')}
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                        {['scheduled', 'sending'].includes(campaign.status) && (
                          <button
                            onClick={() => handleCancel(campaign.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            title={t('smsApi.campaigns.actions.cancel')}
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <Link
                          href={`${basePath}/campaigns/${campaign.id}`}
                          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title={t('smsApi.campaigns.actions.preview')}
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(campaign.id)}
                          disabled={isLoading}
                          className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title={t('smsApi.campaigns.actions.duplicate')}
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                        {!['active', 'sending'].includes(campaign.status) && (
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title={t('smsApi.campaigns.actions.delete')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        {isLoading && (
                          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
