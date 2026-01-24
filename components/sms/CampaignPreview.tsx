'use client';

import { useTranslations } from 'next-intl';
import { Smartphone, Mail } from 'lucide-react';
import { renderTemplateWithStyles, generateEmailHtml } from '@/lib/utils/template-renderer';
import { SegmentFilter } from '@/lib/api/campaigns';

interface SmsPreviewProps {
  message: string;
  attributes?: Record<string, any>;
  segmentFilter?: SegmentFilter;
}

/**
 * SMS Message Preview with variables replaced by sample data
 */
export function SmsPreview({ message, attributes, segmentFilter }: SmsPreviewProps) {
  const t = useTranslations();

  const renderedHtml = attributes
    ? renderTemplateWithStyles(message, attributes, segmentFilter)
    : message || '-';

  return (
    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30">
      <div className="flex items-center gap-2 mb-2">
        <Smartphone className="w-4 h-4 text-indigo-500" />
        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          {t('smsApi.campaigns.messagePreview')}
        </h4>
      </div>
      <div
        className="text-gray-900 dark:text-white font-mono text-sm p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  );
}

interface EmailPreviewProps {
  subject: string;
  body: string;
  displayName: string;
  attributes?: Record<string, any>;
  segmentFilter?: SegmentFilter;
}

/**
 * Email Preview with HTML rendering in iframe, variables replaced by sample data
 */
export function EmailPreview({ subject, body, displayName, attributes, segmentFilter }: EmailPreviewProps) {
  const t = useTranslations();

  const renderedSubject = attributes
    ? renderTemplateWithStyles(subject, attributes, segmentFilter)
    : subject || '-';

  return (
    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-4 h-4 text-emerald-500" />
        <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {t('smsApi.campaigns.emailPreview')}
        </h4>
      </div>
      <div className="space-y-3">
        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500">{t('smsApi.campaigns.emailSubject')}:</span>
          <div
            className="text-gray-900 dark:text-white font-medium mt-1"
            dangerouslySetInnerHTML={{ __html: renderedSubject }}
          />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <span className="text-xs text-gray-500 block p-3 pb-0">{t('smsApi.campaigns.emailBody')}:</span>
          <iframe
            srcDoc={generateEmailHtml(body || '', displayName || 'Alert.az', attributes, segmentFilter)}
            className="w-full h-[400px] border-0"
            title="Email Preview"
          />
        </div>
      </div>
    </div>
  );
}
