'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { projectsApi, Project } from '@/lib/api/projects';
import { campaignsApi, Campaign, CampaignMessage, AttributeSchema, setProjectToken } from '@/lib/api/campaigns';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Pencil,
  Server,
  Users,
  MessageSquare,
  Calendar,
  RefreshCw,
  FlaskConical,
  Copy,
  Repeat,
  Filter,
} from 'lucide-react';

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Clock className="w-5 h-5" />,
  scheduled: <Clock className="w-5 h-5" />,
  sending: <Send className="w-5 h-5 animate-pulse" />,
  completed: <CheckCircle className="w-5 h-5" />,
  cancelled: <XCircle className="w-5 h-5" />,
  failed: <AlertCircle className="w-5 h-5" />,
  active: <Play className="w-5 h-5" />,
  paused: <Clock className="w-5 h-5" />,
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  paused: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

interface MessagePreview {
  phone: string;
  message: string;
  segments: number;
  attributes: Record<string, any>;
}

export default function CampaignDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const lang = params.lang as string;
  const projectId = params.projectId as string;
  const campaignId = params.campaignId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [previews, setPreviews] = useState<MessagePreview[]>([]);
  const [currentCount, setCurrentCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Message history state
  const [messages, setMessages] = useState<CampaignMessage[]>([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesTotalPages, setMessagesTotalPages] = useState(1);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Attributes for displaying condition labels
  const [attributes, setAttributes] = useState<AttributeSchema[]>([]);

  useEffect(() => {
    loadData();
  }, [projectId, campaignId]);

  // Load message history when campaign has sent messages
  useEffect(() => {
    if (campaign && ['completed', 'failed', 'sending', 'active', 'paused'].includes(campaign.status)) {
      loadMessages();
    }
  }, [campaign?.status, messagesPage]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load project first
      const projectData = await projectsApi.get(parseInt(projectId));
      setProject(projectData.project);
      setProjectToken(projectData.project.api_token);

      // Load campaign and attributes in parallel
      const [campaignData, attributesData] = await Promise.all([
        campaignsApi.get(parseInt(campaignId)),
        campaignsApi.getAttributes().catch(() => ({ attributes: [] })),
      ]);
      setCampaign(campaignData.campaign);
      setAttributes(attributesData.attributes || []);

      // Load message previews
      try {
        const previewData = await campaignsApi.previewMessages(parseInt(campaignId), 5);
        setPreviews(previewData.previews || []);
      } catch (err) {
        console.error('Failed to load previews:', err);
      }

      // Get current matching count
      await refreshCount(campaignData.campaign);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCount = async (campaignData?: Campaign) => {
    const c = campaignData || campaign;
    if (!c) return;

    try {
      setIsRefreshing(true);
      const data = await campaignsApi.previewSegment(c.segment_filter, 1);
      setCurrentCount(data.total_count);
    } catch (err) {
      console.error('Failed to refresh count:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMessages = async () => {
    if (!campaign) return;

    try {
      setMessagesLoading(true);
      const data = await campaignsApi.getCampaignMessages(campaign.id, messagesPage, 10);
      setMessages(data.messages);
      setMessagesTotalPages(data.pagination.last_page);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'sent':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'failed':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const translateError = (errorMessage: string): string => {
    // Parse "Insufficient balance. Required: X, Available: Y" pattern
    const balanceMatch = errorMessage.match(/Insufficient balance\. Required: ([\d.]+), Available: ([\d.]+)/);
    if (balanceMatch) {
      return t('smsApi.campaigns.errors.insufficientBalance', {
        required: balanceMatch[1],
        available: balanceMatch[2]
      });
    }

    // Map other common backend errors to translation keys
    const errorMappings: Record<string, string> = {
      'Only draft campaigns can be executed': 'smsApi.campaigns.errors.campaignNotDraft',
      'No contacts match the segment filter': 'smsApi.campaigns.errors.noContacts',
      'Campaign validation failed': 'smsApi.campaigns.errors.validationFailed',
      'Campaign execution failed': 'smsApi.campaigns.errors.executionFailed',
    };

    for (const [pattern, key] of Object.entries(errorMappings)) {
      if (errorMessage.includes(pattern)) {
        return t(key);
      }
    }

    // Return original message if no translation found
    return errorMessage;
  };

  const handleExecute = async () => {
    if (!campaign) return;
    if (!confirm(t('smsApi.campaigns.confirmExecute'))) return;

    setError(null);
    setSuccessMessage(null);

    try {
      const result = await campaignsApi.execute(campaign.id);

      // Show appropriate success message based on test mode
      if (result.data?.global_test_mode) {
        setSuccessMessage(t('smsApi.campaigns.executionSuccess.globalTestMode'));
      } else if (result.data?.mock_mode) {
        setSuccessMessage(t('smsApi.campaigns.executionSuccess.testMode'));
      } else {
        setSuccessMessage(t('smsApi.campaigns.executionSuccess.real'));
      }

      await loadData();
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = errorData?.message || 'Failed to execute campaign';

      // If there are specific errors in the array, use the first one
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0];
      }

      setError(translateError(errorMessage));
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    if (!confirm(t('smsApi.campaigns.confirmDelete'))) return;

    try {
      await campaignsApi.delete(campaign.id);
      window.location.href = `/${lang}/settings/sms/projects/${projectId}/campaigns`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete campaign');
    }
  };

  const handleCancel = async () => {
    if (!campaign) return;
    if (!confirm(t('smsApi.campaigns.confirmCancel'))) return;

    try {
      await campaignsApi.cancel(campaign.id);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel campaign');
    }
  };

  const handleDuplicate = async () => {
    if (!campaign) return;

    try {
      const result = await campaignsApi.duplicate(campaign.id);
      // Redirect to the new campaign
      window.location.href = `/${lang}/settings/sms/projects/${projectId}/campaigns/${result.campaign.id}`;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to duplicate campaign');
    }
  };

  const handleActivate = async () => {
    if (!campaign) return;
    if (!confirm(t('smsApi.campaigns.confirmActivate'))) return;

    setError(null);
    setSuccessMessage(null);

    try {
      await campaignsApi.activate(campaign.id);
      setSuccessMessage(t('smsApi.campaigns.activateSuccess'));
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate campaign');
    }
  };

  const handlePause = async () => {
    if (!campaign) return;
    if (!confirm(t('smsApi.campaigns.confirmPause'))) return;

    setError(null);
    setSuccessMessage(null);

    try {
      await campaignsApi.pause(campaign.id);
      setSuccessMessage(t('smsApi.campaigns.pauseSuccess'));
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to pause campaign');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);

    const monthNames: Record<string, string[]> = {
      az: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'],
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ru: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
    };

    const months = monthNames[lang] || monthNames.en;
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto">
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

  if (!campaign || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('smsApi.campaigns.notFound') || 'Campaign not found'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{error}</p>
          <Link
            href={`/${lang}/settings/sms/projects/${projectId}/campaigns`}
            className="cursor-pointer px-8 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-105 inline-block"
          >
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${lang}/settings/sms/projects/${projectId}/campaigns`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ml-4">
            <Server className="w-4 h-4" />
            <span className="font-medium">{project.name}</span>
          </div>
        </div>

        {/* Campaign Header */}
        <div className="rounded-3xl p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {campaign.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${statusColors[campaign.status]}`}>
                  {statusIcons[campaign.status]}
                  {t(`smsApi.campaigns.statuses.${campaign.status}`)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(campaign.created_at)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Edit button - for draft and paused campaigns */}
              {(campaign.status === 'draft' || campaign.status === 'paused') && (
                <Link
                  href={`/${lang}/settings/sms/projects/${projectId}/campaigns/${campaignId}/edit`}
                  className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  <Pencil className="w-5 h-5" />
                  {t('smsApi.campaigns.actions.edit')}
                </Link>
              )}
              {/* Draft campaign actions */}
              {campaign.status === 'draft' && (
                <>
                  {campaign.type === 'automated' ? (
                    <button
                      onClick={handleActivate}
                      className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transition-all"
                    >
                      <Play className="w-5 h-5" />
                      {t('smsApi.campaigns.actions.activate')}
                    </button>
                  ) : (
                    <button
                      onClick={handleExecute}
                      className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transition-all"
                    >
                      <Play className="w-5 h-5" />
                      {t('smsApi.campaigns.actions.execute')}
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="cursor-pointer p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              {/* Active automated campaign - show Pause */}
              {campaign.status === 'active' && campaign.type === 'automated' && (
                <button
                  onClick={handlePause}
                  className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
                >
                  <Pause className="w-5 h-5" />
                  {t('smsApi.campaigns.actions.pause')}
                </button>
              )}
              {/* Paused automated campaign - show Activate */}
              {campaign.status === 'paused' && campaign.type === 'automated' && (
                <button
                  onClick={handleActivate}
                  className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transition-all"
                >
                  <Play className="w-5 h-5" />
                  {t('smsApi.campaigns.actions.activate')}
                </button>
              )}
              {(campaign.status === 'scheduled' || campaign.status === 'sending') && (
                <button
                  onClick={handleCancel}
                  className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                  {t('smsApi.campaigns.actions.cancel')}
                </button>
              )}
              {/* Duplicate button - always visible */}
              <button
                onClick={handleDuplicate}
                className="cursor-pointer flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                <Copy className="w-5 h-5" />
                {t('smsApi.campaigns.actions.duplicate')}
              </button>
            </div>
          </div>
        </div>

        {/* Test Mode Warning */}
        {campaign.is_test && (
          <div className="mb-6 rounded-2xl p-4 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-800/30">
            <div className="flex items-center gap-3">
              <FlaskConical className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {t('smsApi.campaigns.testModeEnabled')}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('smsApi.campaigns.testModeWarning')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-2xl p-4 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/30 dark:border-emerald-800/30">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-emerald-800 dark:text-emerald-200">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/30 dark:border-red-800/30">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.stats.target')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{campaign.target_count}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.stats.sent')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{campaign.sent_count}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.stats.delivered')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{campaign.delivered_count}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.stats.failed')}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{campaign.failed_count}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Count Warning (for drafts) */}
        {campaign.status === 'draft' && currentCount !== null && currentCount !== campaign.target_count && (
          <div className="mb-6 rounded-2xl p-4 bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-800/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('smsApi.campaigns.countChanged')}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {t('smsApi.campaigns.countChangedDesc', {
                    original: campaign.target_count,
                    current: currentCount
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Details */}
        <div className="rounded-3xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {t('smsApi.campaigns.details')}
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.sender')}</p>
                <p className="text-gray-900 dark:text-white font-medium">{campaign.sender}</p>
              </div>
              {campaign.scheduled_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.scheduledAt')}</p>
                  <p className="text-gray-900 dark:text-white font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(campaign.scheduled_at)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('smsApi.campaigns.messageTemplate')}</p>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 font-mono text-sm whitespace-pre-wrap">
                {campaign.message_template}
              </div>
            </div>

            {/* Segment Filter Conditions */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {t('smsApi.campaigns.segmentConditions')}
              </p>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                {campaign.segment_filter?.conditions?.length > 0 ? (
                  <div className="space-y-2">
                    {campaign.segment_filter.conditions.map((condition: any, index: number) => {
                      const attr = attributes.find(a => a.key === condition.key);
                      const label = attr?.label || condition.key;
                      return (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {index > 0 && (
                            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                              {campaign.segment_filter.logic}
                            </span>
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                          <span className="text-gray-500 dark:text-gray-400">{t(`smsApi.segments.operators.${condition.operator}`)}</span>
                          {condition.value !== undefined && condition.value !== null && condition.value !== '' && (
                            <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              {typeof condition.value === 'object' ? JSON.stringify(condition.value) : String(condition.value)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.noConditions')}</p>
                )}
              </div>
            </div>

            {/* Current Target Count with Refresh */}
            {campaign.status === 'draft' && (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/30 dark:border-indigo-800/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">{t('smsApi.campaigns.currentTargetCount')}</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {currentCount !== null ? currentCount : campaign.target_count}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => refreshCount()}
                    disabled={isRefreshing}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {t('smsApi.campaigns.refreshCount')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Automated Campaign Info */}
        {campaign.type === 'automated' && (
          <div className="rounded-3xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Repeat className="w-5 h-5" />
              {t('smsApi.campaigns.automatedSettings')}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.checkInterval')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {campaign.check_interval_minutes} {t('smsApi.campaigns.minutes')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.cooldownDays')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {campaign.cooldown_days || 30} {t('smsApi.campaigns.days')}
                </p>
              </div>

              {campaign.next_run_at && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.nextRun')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(campaign.next_run_at)}
                  </p>
                </div>
              )}

              {campaign.last_run_at && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.lastRun')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(campaign.last_run_at)}
                  </p>
                </div>
              )}

              {campaign.ends_at && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.endsAt')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(campaign.ends_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Previews (for drafts) */}
        {campaign.status === 'draft' && previews.length > 0 && (
          <div className="rounded-3xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('smsApi.campaigns.messagePreview')}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('smsApi.campaigns.showingSamples', {
                  count: previews.length,
                  total: currentCount ?? campaign.target_count
                })}
              </span>
            </div>

            <div className="space-y-3">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {preview.phone}
                    </span>
                    <span className="text-xs text-gray-500">
                      {preview.segments} {t('smsApi.campaigns.segments')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {preview.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Message History (for executed campaigns) */}
        {['completed', 'failed', 'sending', 'active', 'paused'].includes(campaign.status) && (
          <div className="rounded-3xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('smsApi.campaignMessages')}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {campaign.sent_count} {t('smsApi.message').toLowerCase()}
              </span>
            </div>

            {messagesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('smsApi.noMessages')}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.phone')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.message')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.status')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.cost')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.sentAt')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {messages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {msg.phone}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                            {msg.message}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMessageStatusColor(msg.status)}`}>
                                {msg.status}
                              </span>
                              {msg.is_test && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                  <FlaskConical className="w-3 h-3" />
                                  {t('smsApi.testMode')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {msg.cost} AZN
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {msg.sent_at ? formatDate(msg.sent_at) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {messagesTotalPages > 1 && (
                  <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between mt-4">
                    <button
                      onClick={() => setMessagesPage(p => Math.max(1, p - 1))}
                      disabled={messagesPage === 1}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {t('common.previous')}
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('common.pageOf', { current: messagesPage, total: messagesTotalPages })}
                    </span>
                    <button
                      onClick={() => setMessagesPage(p => Math.min(messagesTotalPages, p + 1))}
                      disabled={messagesPage === messagesTotalPages}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
