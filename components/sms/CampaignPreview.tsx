'use client';

import { useTranslations } from 'next-intl';
import { Smartphone, Mail, AlertCircle } from 'lucide-react';

interface SmsPreviewProps {
  /** Pre-rendered message from backend (with variables replaced) */
  renderedMessage: string | null;
}

/**
 * SMS Message Preview - displays backend-rendered message
 * The backend handles all template variable replacement, ensuring
 * preview matches exactly what will be sent.
 */
export function SmsPreview({ renderedMessage }: SmsPreviewProps) {
  const t = useTranslations();

  // Escape HTML and convert newlines for safe display
  const displayHtml = renderedMessage
    ? renderedMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />')
    : null;

  return (
    <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800/30">
      <div className="flex items-center gap-2 mb-2">
        <Smartphone className="w-4 h-4 text-indigo-500" />
        <h4 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          {t('smsApi.campaigns.messagePreview')}
        </h4>
      </div>
      {displayHtml ? (
        <div
          className="text-gray-900 dark:text-white font-mono text-sm p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          dangerouslySetInnerHTML={{ __html: displayHtml }}
        />
      ) : (
        <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {t('smsApi.campaigns.noContactsMatchFilter') || 'No contacts match the current segment filter. Add contacts or adjust filter conditions to see a preview.'}
          </p>
        </div>
      )}
    </div>
  );
}

interface EmailPreviewProps {
  /** Pre-rendered subject from backend (with variables replaced) */
  renderedSubject: string | null;
  /** Pre-rendered full HTML email from backend (with header/footer and variables replaced) */
  renderedBodyHtml: string | null;
}

/**
 * Email Preview - displays backend-rendered HTML email in iframe
 * The backend handles all template variable replacement and HTML generation,
 * ensuring preview matches exactly what will be sent.
 */
export function EmailPreview({ renderedSubject, renderedBodyHtml }: EmailPreviewProps) {
  const t = useTranslations();

  // Check if we have content to display
  const hasContent = renderedSubject || renderedBodyHtml;

  // Escape HTML for subject display
  const displaySubject = renderedSubject
    ? renderedSubject.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : '-';

  return (
    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-4 h-4 text-emerald-500" />
        <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {t('smsApi.campaigns.emailPreview')}
        </h4>
      </div>
      {hasContent ? (
        <div className="space-y-3">
          <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500">{t('smsApi.campaigns.emailSubject')}:</span>
            <div
              className="text-gray-900 dark:text-white font-medium mt-1"
              dangerouslySetInnerHTML={{ __html: displaySubject }}
            />
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <span className="text-xs text-gray-500 block p-3 pb-0">{t('smsApi.campaigns.emailBody')}:</span>
            <iframe
              srcDoc={renderedBodyHtml || ''}
              className="w-full h-[400px] border-0"
              title="Email Preview"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {t('smsApi.campaigns.noContactsMatchFilter') || 'No contacts match the current segment filter. Add contacts or adjust filter conditions to see a preview.'}
          </p>
        </div>
      )}
    </div>
  );
}
