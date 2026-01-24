'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Smartphone, Mail, MessageSquare, X, Expand, FlaskConical } from 'lucide-react';
import { CampaignMessage, CampaignChannel } from '@/lib/api/campaigns';

interface SentMessagesTableProps {
  messages: CampaignMessage[];
  channel: CampaignChannel;
  isLoading: boolean;
  page: number;
  totalPages: number;
  smsCount: number;
  emailCount: number;
  onPageChange: (page: number) => void;
  formatDate: (date: string) => string;
  emailSender?: string;
}

interface MessageModalData {
  type: 'sms' | 'email';
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  subject?: string | null;
  body?: string | null;
  segments?: number;
  status?: string;
  cost?: number;
  sentAt?: string | null;
  isTest?: boolean;
}

const getMessageStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'sent':
    case 'delivered':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400';
  }
};

export default function SentMessagesTable({
  messages,
  channel,
  isLoading,
  page,
  totalPages,
  smsCount,
  emailCount,
  onPageChange,
  formatDate,
  emailSender,
}: SentMessagesTableProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [modalData, setModalData] = useState<MessageModalData | null>(null);

  // Filter messages based on active tab for "both" channel
  const filteredMessages = useMemo(() => {
    if (channel !== 'both') return messages;

    if (activeTab === 'sms') {
      return messages.filter(m => m.type === 'sms' || (!m.type && m.phone));
    } else {
      return messages.filter(m => m.type === 'email');
    }
  }, [messages, channel, activeTab]);

  // Determine which columns to show based on channel and active tab
  const showSmsColumns = channel === 'sms' || (channel === 'both' && activeTab === 'sms');
  const showEmailColumns = channel === 'email' || (channel === 'both' && activeTab === 'email');

  const openSmsModal = (msg: CampaignMessage) => {
    setModalData({
      type: 'sms',
      phone: msg.phone || msg.recipient,
      message: msg.message || msg.content,
      segments: msg.segments,
      status: msg.status,
      cost: msg.cost,
      sentAt: msg.sent_at,
      isTest: msg.is_test,
    });
  };

  const openEmailModal = (msg: CampaignMessage) => {
    setModalData({
      type: 'email',
      email: msg.recipient || msg.email,
      subject: msg.subject,
      body: msg.content || msg.message,
      status: msg.status,
      cost: msg.cost,
      sentAt: msg.sent_at,
      isTest: msg.is_test,
    });
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <>
      <div className="rounded-3xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {channel === 'email' ? (
              <Mail className="w-5 h-5 text-emerald-500" />
            ) : channel === 'both' ? (
              <MessageSquare className="w-5 h-5 text-purple-500" />
            ) : (
              <Smartphone className="w-5 h-5 text-indigo-500" />
            )}
            {t('smsApi.campaigns.sentMessages')}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {channel === 'both' ? (
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-indigo-500" />
                  {smsCount} SMS
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-emerald-500" />
                  {emailCount} Email
                </span>
              </span>
            ) : channel === 'email' ? (
              `${emailCount} ${t('smsApi.campaigns.emailsSent')}`
            ) : (
              `${smsCount} ${t('smsApi.message').toLowerCase()}`
            )}
          </span>
        </div>

        {/* Tabs for "both" channel */}
        {channel === 'both' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sms'
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              {t('smsApi.campaigns.smsTab')}
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'email'
                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              {t('smsApi.campaigns.emailTab')}
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

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            {showEmailColumns ? (
              <Mail className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            ) : (
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            )}
            <p className="text-gray-500 dark:text-gray-400">
              {showEmailColumns
                ? t('smsApi.campaigns.noEmailsSent')
                : t('smsApi.noMessages')
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    {/* SMS columns */}
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
                    {/* Email columns */}
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
                  {filteredMessages.map((msg: any, idx: number) => (
                    <tr key={`${msg.type || 'sms'}-${msg.id || idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {/* SMS data */}
                      {showSmsColumns && (
                        <>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {msg.phone || msg.recipient || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                            <button
                              onClick={() => openSmsModal(msg)}
                              className="flex items-center gap-2 text-left group w-full"
                            >
                              <p className="truncate flex-1">{msg.message || msg.content || '-'}</p>
                              {(msg.message || msg.content) && (msg.message || msg.content).length > 50 && (
                                <Expand className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                              )}
                            </button>
                          </td>
                        </>
                      )}
                      {/* Email data */}
                      {showEmailColumns && (
                        <>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {msg.recipient || msg.email || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                            <button
                              onClick={() => openEmailModal(msg)}
                              className="flex items-center gap-2 text-left group w-full"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{msg.subject || '-'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                  {(msg.content || msg.message)?.slice(0, 80)}{(msg.content || msg.message) && (msg.content || msg.message).length > 80 ? '...' : ''}
                                </p>
                              </div>
                              {((msg.subject && msg.subject.length > 40) || ((msg.content || msg.message) && (msg.content || msg.message).length > 80)) && (
                                <Expand className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
                              )}
                            </button>
                          </td>
                        </>
                      )}
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
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between mt-4">
                <button
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {t('common.previous')}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('common.pageOf', { current: page, total: totalPages })}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Preview Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
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
                      <p className="text-sm opacity-90">{modalData.phone}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <h3 className="font-semibold">{t('smsApi.campaigns.emailPreview')}</h3>
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
                      {modalData.message || '-'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.status')}:</span>
                      <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getMessageStatusColor(modalData.status || '')}`}>
                        {modalData.status}
                      </span>
                      {modalData.isTest && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                          <FlaskConical className="w-3 h-3" />
                          Test
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.cost')}:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{modalData.cost} AZN</span>
                    </div>
                    {modalData.segments !== undefined && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.segments')}:</span>
                        <span className="ml-2 font-medium text-indigo-600 dark:text-indigo-400">{modalData.segments}</span>
                      </div>
                    )}
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
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {emailSender || 'noreply@alert.az'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.campaigns.emailTo')}
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {modalData.email || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.campaigns.emailSubject')}
                    </label>
                    <p className="mt-1 text-gray-900 dark:text-white font-medium">
                      {modalData.subject || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.campaigns.emailBody')}
                    </label>
                    <div className="mt-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {modalData.body || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.status')}:</span>
                      <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${getMessageStatusColor(modalData.status || '')}`}>
                        {modalData.status}
                      </span>
                      {modalData.isTest && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                          <FlaskConical className="w-3 h-3" />
                          Test
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.cost')}:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{modalData.cost} AZN</span>
                    </div>
                    {modalData.sentAt && (
                      <div className="col-span-2">
                        <span className="text-gray-500 dark:text-gray-400">{t('smsApi.sentAt')}:</span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">{formatDate(modalData.sentAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
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
