'use client';

import { useTranslations } from 'next-intl';
import { Users, Smartphone, Mail, Layers, RefreshCw, Zap } from 'lucide-react';
import { CampaignChannel } from '@/lib/api/campaigns';

interface CampaignReviewStepProps {
  formData: {
    name: string;
    channel: CampaignChannel;
    sender: string;
    message_template: string;
    email_subject_template: string;
    email_body_template: string;
    type: 'one_time' | 'automated';
  };
  previewCount: number | null;
  lang?: string;
}

export default function CampaignReviewStep({ formData, previewCount }: CampaignReviewStepProps) {
  const t = useTranslations();

  return (
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
            {t('smsApi.campaigns.channel')}
          </h4>
          <div className="flex items-center gap-2">
            {formData.channel === 'sms' && <Smartphone className="w-5 h-5 text-indigo-500" />}
            {formData.channel === 'email' && <Mail className="w-5 h-5 text-emerald-500" />}
            {formData.channel === 'both' && <Layers className="w-5 h-5 text-purple-500" />}
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formData.channel === 'sms' && t('smsApi.campaigns.channelSms')}
              {formData.channel === 'email' && t('smsApi.campaigns.channelEmail')}
              {formData.channel === 'both' && t('smsApi.campaigns.channelBoth')}
            </p>
          </div>
        </div>
      </div>

      {/* Sender - only for SMS/Both */}
      {(formData.channel === 'sms' || formData.channel === 'both') && (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
            {t('smsApi.campaigns.sender')}
          </h4>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formData.sender}
          </p>
        </div>
      )}

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

      {/* SMS Message Preview - only for SMS/Both */}
      {(formData.channel === 'sms' || formData.channel === 'both') && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {t('smsApi.campaigns.messagePreview')}
            </h4>
          </div>
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap font-mono text-sm p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            {formData.message_template || '-'}
          </p>
        </div>
      )}

      {/* Email Preview - only for Email/Both */}
      {(formData.channel === 'email' || formData.channel === 'both') && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {t('smsApi.campaigns.channelEmail')}
            </h4>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">{t('smsApi.campaigns.emailSubject')}:</span>
              <p className="text-gray-900 dark:text-white font-medium">
                {formData.email_subject_template || '-'}
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">{t('smsApi.campaigns.emailBody')}:</span>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap text-sm mt-1">
                {formData.email_body_template || '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Type Badge */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {t('smsApi.campaigns.campaignType')}
        </h4>
        <div className="flex items-center gap-2">
          {formData.type === 'automated' ? (
            <>
              <RefreshCw className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-purple-700 dark:text-purple-300">
                {t('smsApi.campaigns.typeAutomated')}
              </span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-indigo-700 dark:text-indigo-300">
                {t('smsApi.campaigns.typeOneTime')}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
