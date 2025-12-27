'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { projectsApi, Project } from '@/lib/api/projects';
import { campaignsApi, Campaign, setProjectToken } from '@/lib/api/campaigns';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatDateInTimezone, convertRunHoursToTimezone } from '@/lib/utils/date';
import { useTimezone } from '@/providers/timezone-provider';
import {
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Play,
  Trash2,
  Eye,
  Pencil,
  ArrowLeft,
  Server,
  Users,
  Copy,
} from 'lucide-react';

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="w-4 h-4" />,
  scheduled: <Clock className="w-4 h-4" />,
  sending: <Send className="w-4 h-4 animate-pulse" />,
  completed: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
  failed: <AlertCircle className="w-4 h-4" />,
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function ProjectCampaignsPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const projectId = params.projectId as string;
  const { timezone } = useTimezone();

  const [project, setProject] = useState<Project | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [currentCounts, setCurrentCounts] = useState<Record<number, number | null>>({});
  const [loadingCounts, setLoadingCounts] = useState<Record<number, boolean>>({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.get(parseInt(projectId));
      setProject(data.project);

      // Set the project token for campaign API calls
      setProjectToken(data.project.api_token);

      // Now load campaigns
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
      setIsLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await campaignsApi.list();
      const campaignList = data.campaigns || [];
      setCampaigns(campaignList);
      setError(null);

      // Fetch current counts for draft campaigns
      fetchCurrentCounts(campaignList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentCounts = async (campaignList: Campaign[]) => {
    // Fetch for draft, active, and paused campaigns (ones where fresh count matters)
    const relevantCampaigns = campaignList.filter(c => ['draft', 'active', 'paused'].includes(c.status));

    if (relevantCampaigns.length === 0) return;

    // Set loading state for relevant campaigns
    const loadingState: Record<number, boolean> = {};
    relevantCampaigns.forEach(c => { loadingState[c.id] = true; });
    setLoadingCounts(loadingState);

    // Fetch counts in parallel using previewMessages (considers cooldown)
    const results = await Promise.allSettled(
      relevantCampaigns.map(async (campaign) => {
        try {
          const result = await campaignsApi.previewMessages(campaign.id, 0);
          return { id: campaign.id, count: result.total_count };
        } catch {
          return { id: campaign.id, count: null };
        }
      })
    );

    // Update counts state
    const counts: Record<number, number | null> = {};
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        counts[result.value.id] = result.value.count;
      }
    });
    setCurrentCounts(counts);
    setLoadingCounts({});
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('smsApi.campaigns.confirmDelete'))) return;
    try {
      await campaignsApi.delete(id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete campaign');
    }
    setOpenMenuId(null);
  };

  const handleCancel = async (id: number) => {
    if (!confirm(t('smsApi.campaigns.confirmCancel'))) return;
    try {
      await campaignsApi.cancel(id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel campaign');
    }
    setOpenMenuId(null);
  };

  const handleExecute = async (id: number) => {
    try {
      await campaignsApi.execute(id);
      await loadCampaigns();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to execute campaign');
    }
    setOpenMenuId(null);
  };

  const handleDuplicate = async (id: number) => {
    try {
      const result = await campaignsApi.duplicate(id);
      router.push(`/${lang}/settings/sms/projects/${projectId}/campaigns/${result.campaign.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to duplicate campaign');
    }
    setOpenMenuId(null);
  };

  const formatDate = (dateString: string | null) => {
    return formatDateInTimezone(dateString, timezone, { includeTime: true, locale: lang });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="relative inline-flex">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t('smsApi.projects.notFound') || 'Project not found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {error || 'The project you are looking for does not exist.'}
            </p>
            <Link
              href={`/${lang}/settings/sms/projects`}
              className="cursor-pointer px-8 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-105 inline-block"
            >
              {t('common.back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Project Info */}
        <div className="mb-6">
          <Link
            href={`/${lang}/settings/sms/projects`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>

          {/* Project Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ml-4">
            <Server className="w-4 h-4" />
            <span className="font-medium">{project.name}</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('smsApi.campaigns.title')}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('smsApi.campaigns.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${lang}/settings/sms/projects/${projectId}/contacts`}
              className="cursor-pointer px-6 py-3 rounded-2xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              {t('smsApi.contacts.title')}
            </Link>
            <Link
              href={`/${lang}/settings/sms/projects/${projectId}/campaigns/create`}
              className="cursor-pointer group relative px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 hover:shadow-lg hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t('smsApi.campaigns.createCampaign')}
              </span>
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-3xl p-6 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200/30 dark:border-red-800/30">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Campaigns List */}
        {campaigns.length === 0 ? (
          <div className="relative rounded-3xl p-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 text-center">
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
              href={`/${lang}/settings/sms/projects/${projectId}/campaigns/create`}
              className="cursor-pointer px-8 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-105 inline-block"
            >
              {t('smsApi.campaigns.createCampaign')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => router.push(`/${lang}/settings/sms/projects/${projectId}/campaigns/${campaign.id}`)}
                className={`block relative rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer ${openMenuId === campaign.id ? 'z-50' : 'z-0'}`}
              >
                <div className="flex items-center justify-between">
                  {/* Campaign Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Send className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[campaign.status]}`}>
                          {statusIcons[campaign.status]}
                          {t(`smsApi.campaigns.statuses.${campaign.status}`)}
                        </span>
                        {campaign.type === 'automated' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            <Clock className="w-3 h-3" />
                            {(() => {
                              const converted = convertRunHoursToTimezone(campaign.run_start_hour, campaign.run_end_hour, timezone);
                              return converted ? converted.formatted : '24h';
                            })()}
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(campaign.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {['draft', 'active', 'paused'].includes(campaign.status) ? (
                          loadingCounts[campaign.id] ? (
                            <span className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            currentCounts[campaign.id] ?? campaign.target_count
                          )
                        ) : (
                          campaign.target_count
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('smsApi.campaigns.stats.target')}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {campaign.sent_count}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('smsApi.campaigns.stats.sent')}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {campaign.delivered_count}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('smsApi.campaigns.stats.delivered')}
                      </div>
                    </div>
                    {campaign.failed_count > 0 && (
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-500">
                          {campaign.failed_count}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('smsApi.campaigns.stats.failed')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="relative z-20" onClick={(e) => e.preventDefault()}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === campaign.id ? null : campaign.id);
                      }}
                      className="cursor-pointer p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === campaign.id && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl z-50" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2">
                          {campaign.status === 'draft' && (
                            <>
                              <Link
                                href={`/${lang}/settings/sms/projects/${projectId}/campaigns/${campaign.id}/edit`}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              >
                                <Pencil className="w-4 h-4" />
                                {t('smsApi.campaigns.actions.edit')}
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleExecute(campaign.id);
                                }}
                                className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Play className="w-4 h-4" />
                                {t('smsApi.campaigns.actions.execute')}
                              </button>
                            </>
                          )}
                          {(campaign.status === 'scheduled' || campaign.status === 'sending') && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCancel(campaign.id);
                              }}
                              className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              {t('smsApi.campaigns.actions.cancel')}
                            </button>
                          )}
                          <Link
                            href={`/${lang}/settings/sms/projects/${projectId}/campaigns/${campaign.id}`}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            {t('smsApi.campaigns.actions.preview')}
                          </Link>
                          {/* Duplicate - always available */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDuplicate(campaign.id);
                            }}
                            className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            {t('smsApi.campaigns.actions.duplicate')}
                          </button>
                          {campaign.status === 'draft' && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(campaign.id);
                              }}
                              className="cursor-pointer w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t('smsApi.campaigns.actions.delete')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="md:hidden mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {['draft', 'active', 'paused'].includes(campaign.status) ? (
                          loadingCounts[campaign.id] ? (
                            <span className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            currentCounts[campaign.id] ?? campaign.target_count
                          )
                        ) : (
                          campaign.target_count
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{t('smsApi.campaigns.stats.target')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {campaign.sent_count}
                      </div>
                      <div className="text-xs text-gray-500">{t('smsApi.campaigns.stats.sent')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {campaign.delivered_count}
                      </div>
                      <div className="text-xs text-gray-500">{t('smsApi.campaigns.stats.delivered')}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
