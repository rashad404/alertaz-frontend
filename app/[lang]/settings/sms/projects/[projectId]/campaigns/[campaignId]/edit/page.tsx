'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { projectsApi, Project } from '@/lib/api/projects';
import { campaignsApi, Campaign, SegmentFilter, AttributeSchema, setProjectToken } from '@/lib/api/campaigns';
import SegmentBuilder from '@/components/sms/SegmentBuilder';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Users,
  MessageSquare,
  Eye,
  Server,
  AlertCircle,
  Save,
  Zap,
  RefreshCw,
} from 'lucide-react';

const STEPS = ['details', 'audience', 'message', 'review'];

// Helper to check if string contains Unicode characters (non-GSM-7)
const hasUnicode = (str: string): boolean => {
  // Check if byte length differs from character length
  return new Blob([str]).size !== str.length;
};

export default function EditCampaignPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const projectId = params.projectId as string;
  const campaignId = params.campaignId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attributes, setAttributes] = useState<AttributeSchema[]>([]);
  const [availableSenders, setAvailableSenders] = useState<string[]>([]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sender: '',
    message_template: '',
    segment_filter: {
      logic: 'AND' as const,
      conditions: [],
    } as SegmentFilter,
    scheduled_at: '',
    schedule_type: 'now' as 'now' | 'later',
    is_test: true,
    type: 'one_time' as 'one_time' | 'automated',
    check_interval_minutes: 1440,
    cooldown_days: 30,
    ends_at: '',
  });

  useEffect(() => {
    loadData();
  }, [projectId, campaignId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load project first
      const projectData = await projectsApi.get(parseInt(projectId));
      setProject(projectData.project);

      // Set the project token for campaign API calls
      setProjectToken(projectData.project.api_token);

      // Load campaign, senders, and attributes in parallel
      const [campaignData, sendersData, attributesData] = await Promise.all([
        campaignsApi.get(parseInt(campaignId)),
        campaignsApi.getSenders(),
        campaignsApi.getAttributes(),
      ]);

      setCampaign(campaignData.campaign);
      setAvailableSenders(sendersData.senders);
      setAttributes(attributesData.attributes);

      // Populate form with campaign data
      const c = campaignData.campaign;
      setFormData({
        name: c.name,
        sender: c.sender,
        message_template: c.message_template,
        segment_filter: c.segment_filter,
        scheduled_at: c.scheduled_at || '',
        schedule_type: c.scheduled_at ? 'later' : 'now',
        is_test: c.is_test ?? true,
        type: c.type || 'one_time',
        check_interval_minutes: c.check_interval_minutes || 1440,
        cooldown_days: c.cooldown_days || 30,
        ends_at: c.ends_at || '',
      });

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load campaign');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!project) return;

    const loadPreview = async () => {
      if (formData.segment_filter.conditions.length === 0) {
        setPreviewCount(null);
        return;
      }
      try {
        const data = await campaignsApi.previewSegment(formData.segment_filter, 1);
        setPreviewCount(data.total_count);
      } catch (err) {
        setPreviewCount(null);
      }
    };

    const timer = setTimeout(loadPreview, 500);
    return () => clearTimeout(timer);
  }, [formData.segment_filter, project]);

  const handleSubmit = async () => {
    if (!project || !campaign) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name: formData.name,
        sender: formData.sender,
        message_template: formData.message_template,
        segment_filter: formData.segment_filter,
        is_test: formData.is_test,
        type: formData.type,
      };

      if (formData.type === 'one_time') {
        if (formData.schedule_type === 'later' && formData.scheduled_at) {
          payload.scheduled_at = formData.scheduled_at;
        } else {
          payload.scheduled_at = null;
        }
      } else {
        // Automated campaign
        payload.check_interval_minutes = formData.check_interval_minutes;
        payload.cooldown_days = formData.cooldown_days;
        payload.ends_at = formData.ends_at || null;
      }

      await campaignsApi.update(campaign.id, payload);
      router.push(`/${lang}/settings/sms/projects/${projectId}/campaigns/${campaignId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== '' && formData.sender.trim() !== '';
      case 1:
        return formData.segment_filter.conditions.length > 0;
      case 2:
        return formData.message_template.trim() !== '' && !hasUnicode(formData.message_template);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepIcons = [FileText, Users, MessageSquare, Eye];

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

  if (!project || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('smsApi.campaigns.notFound')}
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

  // Only allow editing draft or paused campaigns
  if (!['draft', 'paused'].includes(campaign.status)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('smsApi.campaigns.cannotEditNonDraft')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('smsApi.campaigns.cannotEditNonDraftDesc')}
          </p>
          <Link
            href={`/${lang}/settings/sms/projects/${projectId}/campaigns/${campaignId}`}
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
            href={`/${lang}/settings/sms/projects/${projectId}/campaigns/${campaignId}`}
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

          <h1 className="text-4xl font-bold mt-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('smsApi.campaigns.editCampaign')}
            </span>
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = stepIcons[index];
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              return (
                <div key={step} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center w-full">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {t(`smsApi.campaigns.steps.${step}`)}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        index < currentStep
                          ? 'bg-emerald-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/30 dark:border-red-800/30">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="rounded-3xl p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
          {/* Step 1: Campaign Details */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('smsApi.campaigns.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('smsApi.campaigns.namePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('smsApi.campaigns.sender')} *
                </label>
                <select
                  value={formData.sender}
                  onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer"
                >
                  {availableSenders.map((sender) => (
                    <option key={sender} value={sender}>
                      {sender}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {t('smsApi.campaigns.senderNote')}
                </p>
              </div>

              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('smsApi.campaigns.campaignType')} *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'one_time' })}
                    className={`cursor-pointer p-4 rounded-xl text-left transition-all border-2 ${
                      formData.type === 'one_time'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.type === 'one_time'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <span className={`font-medium ${
                        formData.type === 'one_time'
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {t('smsApi.campaigns.typeOneTime')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('smsApi.campaigns.typeOneTimeDesc')}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'automated' })}
                    className={`cursor-pointer p-4 rounded-xl text-left transition-all border-2 ${
                      formData.type === 'automated'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.type === 'automated'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <span className={`font-medium ${
                        formData.type === 'automated'
                          ? 'text-purple-700 dark:text-purple-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {t('smsApi.campaigns.typeAutomated')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('smsApi.campaigns.typeAutomatedDesc')}
                    </p>
                  </button>
                </div>
              </div>

              {/* One-time campaign scheduling */}
              {formData.type === 'one_time' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('smsApi.campaigns.schedule')}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, schedule_type: 'now', scheduled_at: '' })}
                      className={`cursor-pointer flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.schedule_type === 'now'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {t('smsApi.campaigns.scheduleNow')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, schedule_type: 'later' })}
                      className={`cursor-pointer flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.schedule_type === 'later'
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {t('smsApi.campaigns.scheduleLater')}
                    </button>
                  </div>
                  {formData.schedule_type === 'later' && (
                    <input
                      type="datetime-local"
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                      className="mt-3 w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  )}
                </div>
              )}

              {/* Automated campaign settings */}
              {formData.type === 'automated' && (
                <div className="space-y-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('smsApi.campaigns.checkInterval')} *
                    </label>
                    <select
                      value={formData.check_interval_minutes}
                      onChange={(e) => setFormData({ ...formData, check_interval_minutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value={1}>{t('smsApi.campaigns.interval.1min')}</option>
                      <option value={5}>{t('smsApi.campaigns.interval.5min')}</option>
                      <option value={15}>{t('smsApi.campaigns.interval.15min')}</option>
                      <option value={30}>{t('smsApi.campaigns.interval.30min')}</option>
                      <option value={60}>{t('smsApi.campaigns.interval.1hour')}</option>
                      <option value={360}>{t('smsApi.campaigns.interval.6hours')}</option>
                      <option value={720}>{t('smsApi.campaigns.interval.12hours')}</option>
                      <option value={1440}>{t('smsApi.campaigns.interval.daily')}</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('smsApi.campaigns.checkIntervalDesc')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('smsApi.campaigns.cooldownDays')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={formData.cooldown_days}
                      onChange={(e) => setFormData({ ...formData, cooldown_days: parseInt(e.target.value) || 30 })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('smsApi.campaigns.cooldownDaysDesc')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('smsApi.campaigns.endsAt')}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {t('smsApi.campaigns.endsAtDesc')}
                    </p>
                  </div>
                </div>
              )}

              {/* Test Mode Toggle */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      {t('smsApi.campaigns.testMode')}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      {t('smsApi.campaigns.testModeDesc')}
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.is_test}
                      onChange={(e) => setFormData({ ...formData, is_test: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-14 h-8 rounded-full transition-colors ${formData.is_test ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${formData.is_test ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {currentStep === 1 && (
            <SegmentBuilder
              value={formData.segment_filter}
              onChange={(filter) => setFormData({ ...formData, segment_filter: filter })}
              showPreview={true}
            />
          )}

          {/* Step 3: Message */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('smsApi.campaigns.messageTemplate')} *
                </label>
                <textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  placeholder={t('smsApi.campaigns.messagePlaceholder')}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${
                    hasUnicode(formData.message_template)
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                />
                <div className="mt-1 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {formData.message_template.length} / 500
                  </p>
                  {hasUnicode(formData.message_template) && (
                    <p className="text-xs text-red-500">
                      {t('smsApi.campaigns.errors.unicodeNotAllowed')}
                    </p>
                  )}
                </div>
              </div>

              {attributes.length > 0 && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('smsApi.campaigns.variables')}
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">{t('smsApi.campaigns.variablesDesc')}</p>
                  <div className="flex flex-wrap gap-2">
                    {attributes.map((attr) => (
                      <button
                        key={attr.key}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            message_template: formData.message_template + `{{${attr.key}}}`,
                          });
                        }}
                        className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                      >
                        {`{{${attr.key}}}`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          message_template: formData.message_template + '{{phone}}',
                        });
                      }}
                      className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                      {'{{phone}}'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('smsApi.campaigns.name')}
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.name}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('smsApi.campaigns.sender')}
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formData.sender}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('smsApi.campaigns.targetAudience')}
                    </h4>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {previewCount !== null ? `${previewCount} ${t('smsApi.segments.matchingContacts')}` : '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('smsApi.campaigns.messagePreview')}
                </h4>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap font-mono text-sm p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  {formData.message_template || '-'}
                </p>
              </div>

              {formData.schedule_type === 'later' && formData.scheduled_at && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {t('smsApi.campaigns.scheduledAt')}
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(formData.scheduled_at).toLocaleString(lang)}
                  </p>
                </div>
              )}

              {/* Draft Note */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {t('smsApi.campaigns.draftNote')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            {t('common.back')}
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                canProceed()
                  ? 'cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t('common.next')}
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="cursor-pointer flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {t('smsApi.campaigns.saveChanges')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
