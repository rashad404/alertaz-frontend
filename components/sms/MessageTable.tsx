'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Smartphone,
  Mail,
  MessageSquare,
  X,
  ChevronLeft,
  ChevronRight,
  Expand,
  FlaskConical,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { DEFAULT_SMS_RATE, DEFAULT_EMAIL_RATE } from '@/lib/config/defaults';

// Generic message type that works for both planned and sent messages
export interface MessageData {
  id?: number;
  contact_id?: number;
  type?: 'sms' | 'email';
  phone?: string | null;
  email?: string | null;
  recipient?: string | null;
  message?: string | null;
  content?: string | null;
  rendered_message?: string | null;
  subject?: string | null;
  email_subject?: string | null;
  rendered_subject?: string | null;
  email_body?: string | null;
  email_body_html?: string | null;
  body?: string | null;
  segments?: number;
  status?: string;
  cost?: number;
  sent_at?: string | null;
  is_test?: boolean;
  source?: 'customer' | 'service' | 'api' | 'campaign' | string | null;
  sender?: string | null;
  can_receive_sms?: boolean;
  can_receive_email?: boolean;
}

export type ChannelType = 'sms' | 'email' | 'both';

interface MessageTableProps {
  messages: MessageData[];
  channel: ChannelType;
  isLoading: boolean;
  page: number;
  totalPages: number;
  total?: number;
  smsCount?: number;
  emailCount?: number;
  onPageChange: (page: number) => void;
  formatDate: (date: string) => string;
  // Optional props
  title?: string;
  nextRunAt?: string | null;
  emailSender?: string;
  smsSender?: string;
  // Mode: 'planned' hides status/cost/sentAt columns, 'sent' shows all
  mode?: 'planned' | 'sent';
  emptyMessage?: string;
  // Cost per segment for estimating planned message cost
  smsRate?: number;
  emailRate?: number;
}

interface ModalData {
  type: 'sms' | 'email';
  recipient: string;
  content?: string | null;
  subject?: string | null;
  bodyHtml?: string | null;
  segments?: number;
  status?: string;
  cost?: number;
  sentAt?: string | null;
  isTest?: boolean;
  sender?: string | null;
}

const getMessageStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'sent':
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'planned':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400';
  }
};

export default function MessageTable({
  messages,
  channel,
  isLoading,
  page,
  totalPages,
  total,
  smsCount = 0,
  emailCount = 0,
  onPageChange,
  formatDate,
  title,
  nextRunAt,
  emailSender,
  smsSender,
  mode = 'sent',
  emptyMessage,
  smsRate = DEFAULT_SMS_RATE,
  emailRate = DEFAULT_EMAIL_RATE,
}: MessageTableProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [modalData, setModalData] = useState<ModalData | null>(null);

  // Filter messages based on active tab for "both" channel
  const filteredMessages = useMemo(() => {
    if (channel !== 'both') return messages;

    if (activeTab === 'sms') {
      return messages.filter(m => m.type === 'sms' || m.can_receive_sms || (!m.type && m.phone));
    } else {
      return messages.filter(m => m.type === 'email' || m.can_receive_email);
    }
  }, [messages, channel, activeTab]);

  // Determine which columns to show
  const showSmsColumns = channel === 'sms' || (channel === 'both' && activeTab === 'sms');
  const showEmailColumns = channel === 'email' || (channel === 'both' && activeTab === 'email');
  const showSentColumns = mode === 'sent';

  // Calculate SMS segments from content
  const calculateSegments = (content: string | undefined | null): number => {
    if (!content) return 1;
    const hasUnicode = /[^\x00-\x7F]/.test(content);
    const charLimit = hasUnicode ? 70 : 160;
    const multipartLimit = hasUnicode ? 67 : 153;
    if (content.length <= charLimit) return 1;
    return Math.ceil(content.length / multipartLimit);
  };

  const openModal = (msg: MessageData) => {
    const isSms = showSmsColumns;
    const content = isSms
      ? (msg.rendered_message || msg.message || msg.content)
      : (msg.email_body || msg.email_body_html || msg.body || msg.content || msg.message);

    // Calculate segments
    const segments = msg.segments ?? (isSms ? calculateSegments(content) : 1);

    // For planned messages, use campaign sender and calculate estimated cost
    const sender = isSms ? (smsSender || msg.sender) : (emailSender || msg.sender);
    const rate = isSms ? smsRate : emailRate;
    const estimatedCost = mode === 'planned' ? segments * rate : msg.cost;
    const status = mode === 'planned' ? 'planned' : msg.status;

    setModalData({
      type: isSms ? 'sms' : 'email',
      recipient: isSms
        ? (msg.phone || msg.recipient || '-')
        : (msg.email || msg.recipient || '-'),
      content,
      subject: msg.rendered_subject || msg.subject || msg.email_subject,
      bodyHtml: msg.email_body_html || msg.body,
      segments,
      status,
      cost: estimatedCost,
      sentAt: msg.sent_at,
      isTest: msg.is_test,
      sender,
    });
  };

  const closeModal = () => setModalData(null);

  // Default titles
  const tableTitle = title || (mode === 'planned'
    ? t('smsApi.campaigns.plannedMessages')
    : t('smsApi.campaigns.sentMessages'));

  const defaultEmptyMessage = showEmailColumns
    ? t('smsApi.campaigns.noEmailsSent')
    : t('smsApi.noMessages');

  return (
    <>
      <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {channel === 'email' ? (
                  <Mail className="w-5 h-5 text-emerald-500" />
                ) : channel === 'both' ? (
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                ) : (
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                )}
                {tableTitle}
              </h2>
              {nextRunAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t('smsApi.campaigns.nextRunAt')}: {formatDate(nextRunAt)}
                </p>
              )}
            </div>

            {/* Tabs for "both" channel */}
            {channel === 'both' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('sms')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'sms'
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  SMS
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'sms'
                      ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {smsCount}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'email'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === 'email'
                      ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {emailCount}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            {showEmailColumns ? (
              <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            ) : mode === 'planned' ? (
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            ) : (
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            )}
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {emptyMessage || defaultEmptyMessage}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {showSmsColumns && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-indigo-500" />
                            {t('smsApi.phone')}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.message')}
                        </th>
                      </>
                    )}
                    {showEmailColumns && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-emerald-500" />
                            {t('smsApi.contacts.email')}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.campaigns.emailSubject')}
                        </th>
                      </>
                    )}
                    {showSentColumns && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.status')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.source')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.cost')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {t('smsApi.sentAt')}
                          </div>
                        </th>
                      </>
                    )}
                    {!showSentColumns && showSmsColumns && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('smsApi.campaigns.segments')}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredMessages.map((msg, idx) => {
                    const msgContent = msg.rendered_message || msg.message || msg.content || '';
                    const msgPhone = msg.phone || msg.recipient || '-';
                    const msgEmail = msg.email || msg.recipient || '-';
                    const msgSubject = msg.rendered_subject || msg.subject || msg.email_subject || '-';

                    return (
                      <tr
                        key={msg.id || msg.contact_id || idx}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                        onClick={() => openModal(msg)}
                      >
                        {showSmsColumns && (
                          <>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {msgPhone}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                              <div className="flex items-center gap-2">
                                <p className="truncate flex-1">{msgContent || '-'}</p>
                                {msgContent && msgContent.length > 50 && (
                                  <Expand className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        {showEmailColumns && (
                          <>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {msgEmail}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                              <div className="flex items-center gap-2">
                                <p className="truncate flex-1">{msgSubject}</p>
                                {msgSubject && msgSubject.length > 40 && (
                                  <Expand className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                            </td>
                          </>
                        )}
                        {showSentColumns && (
                          <>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMessageStatusColor(msg.status || '')}`}>
                                  {msg.status || '-'}
                                </span>
                                {msg.is_test && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                    <FlaskConical className="w-3 h-3" />
                                    Test
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {msg.source || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {msg.cost ?? 0} AZN
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {msg.sent_at ? formatDate(msg.sent_at) : '-'}
                            </td>
                          </>
                        )}
                        {!showSentColumns && showSmsColumns && (
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {msg.segments ?? '-'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('common.pageOf', { current: page, total: totalPages })}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  {t('common.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Preview Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${
              modalData.type === 'sms'
                ? 'bg-gradient-to-r from-indigo-500 to-blue-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}>
              <div className="flex items-center gap-3 text-white">
                {modalData.type === 'sms' ? (
                  <>
                    <Smartphone className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold">{t('smsApi.campaigns.smsPreview')}</h3>
                      <p className="text-sm opacity-90">{modalData.recipient}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold">{t('smsApi.campaigns.emailPreview')}</h3>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {modalData.type === 'sms' ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {modalData.content || '-'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.sender')}:</span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">{modalData.sender || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.segments')}:</span>
                      <span className="ml-2 font-medium text-indigo-600 dark:text-indigo-400">{modalData.segments ?? 1}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.status')}:</span>
                      <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getMessageStatusColor(modalData.status || 'pending')}`}>
                        {modalData.status || 'pending'}
                      </span>
                      {modalData.isTest && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                          <FlaskConical className="w-3 h-3" />
                          Test
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.cost')}:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {modalData.status === 'planned' ? '~' : ''}{Number(modalData.cost ?? 0).toFixed(4)} AZN
                      </span>
                    </div>
                    {modalData.sentAt && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('smsApi.sentAt')}:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{formatDate(modalData.sentAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.campaigns.emailFrom')}
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">{modalData.sender || 'noreply@alert.az'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.campaigns.emailTo')}
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">{modalData.recipient}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.campaigns.emailSubject')}
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white font-medium">{modalData.subject || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.campaigns.emailBody')}
                    </label>
                    {modalData.bodyHtml && modalData.bodyHtml.includes('<') ? (
                      <div className="mt-2 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <iframe
                          srcDoc={modalData.bodyHtml}
                          className="w-full bg-white"
                          style={{ minHeight: '300px', border: 'none' }}
                          title="Email Preview"
                        />
                      </div>
                    ) : (
                      <div className="mt-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                          {modalData.content || '-'}
                        </p>
                      </div>
                    )}
                  </div>
                  {(modalData.status || modalData.cost !== undefined || modalData.sentAt) && (
                    <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                      {modalData.status && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('smsApi.status')}:</span>
                          <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getMessageStatusColor(modalData.status)}`}>
                            {modalData.status}
                          </span>
                          {modalData.isTest && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                              <FlaskConical className="w-3 h-3" />
                              Test
                            </span>
                          )}
                        </div>
                      )}
                      {modalData.cost !== undefined && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('smsApi.cost')}:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{modalData.cost} AZN</span>
                        </div>
                      )}
                      {modalData.sentAt && (
                        <div className="col-span-2">
                          <span className="text-gray-500 dark:text-gray-400">{t('smsApi.sentAt')}:</span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{formatDate(modalData.sentAt)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
