'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, Smartphone, Mail, Users, X, Expand } from 'lucide-react';
import { PlannedContact, CampaignChannel } from '@/lib/api/campaigns';

interface PlannedMessagesTableProps {
  contacts: PlannedContact[];
  channel: CampaignChannel;
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  smsTotal?: number;
  emailTotal?: number;
  onPageChange: (page: number) => void;
  nextRunAt?: string | null;
  formatDate?: (date: string) => string;
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
}

export default function PlannedMessagesTable({
  contacts,
  channel,
  isLoading,
  page,
  totalPages,
  total,
  smsTotal,
  emailTotal,
  onPageChange,
  nextRunAt,
  formatDate,
  emailSender,
}: PlannedMessagesTableProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [modalData, setModalData] = useState<MessageModalData | null>(null);

  // Filter contacts based on active tab for "both" channel
  const filteredContacts = useMemo(() => {
    if (channel !== 'both') return contacts;

    if (activeTab === 'sms') {
      return contacts.filter(c => c.can_receive_sms);
    } else {
      return contacts.filter(c => c.can_receive_email);
    }
  }, [contacts, channel, activeTab]);

  // Use backend totals for tab badges (fixes bug where only current page was counted)
  const smsCount = smsTotal ?? total;
  const emailCount = emailTotal ?? total;

  const defaultFormatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const dateFormatter = formatDate || defaultFormatDate;

  // Determine which columns to show based on channel and active tab
  const showSmsColumns = channel === 'sms' || (channel === 'both' && activeTab === 'sms');
  const showEmailColumns = channel === 'email' || (channel === 'both' && activeTab === 'email');

  const openSmsModal = (contact: PlannedContact) => {
    setModalData({
      type: 'sms',
      phone: contact.phone,
      message: contact.message,
      segments: contact.segments,
    });
  };

  const openEmailModal = (contact: PlannedContact) => {
    setModalData({
      type: 'email',
      email: contact.email,
      subject: contact.email_subject,
      body: contact.email_body,
    });
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <>
      <div className="rounded-3xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('smsApi.campaigns.plannedMessages')}
            </h2>
            {nextRunAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t('smsApi.campaigns.nextRunAt')}: {dateFormatter(nextRunAt)}
              </p>
            )}
          </div>
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
            ) : (
              t('smsApi.campaigns.plannedForNextRun', { count: total })
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
        ) : filteredContacts.length > 0 ? (
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('smsApi.campaigns.segments')}
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
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.contact_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      {/* SMS data */}
                      {showSmsColumns && (
                        <>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {contact.phone || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                            <button
                              onClick={() => openSmsModal(contact)}
                              className="flex items-center gap-2 text-left group w-full"
                            >
                              <p className="truncate flex-1">{contact.message || '-'}</p>
                              {contact.message && contact.message.length > 50 && (
                                <Expand className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {contact.segments}
                          </td>
                        </>
                      )}
                      {/* Email data */}
                      {showEmailColumns && (
                        <>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {contact.email || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                            <button
                              onClick={() => openEmailModal(contact)}
                              className="flex items-center gap-2 text-left group w-full"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{contact.email_subject || '-'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                  {contact.email_body?.slice(0, 80)}{contact.email_body && contact.email_body.length > 80 ? '...' : ''}
                                </p>
                              </div>
                              {((contact.email_subject && contact.email_subject.length > 40) || (contact.email_body && contact.email_body.length > 80)) && (
                                <Expand className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
                              )}
                            </button>
                          </td>
                        </>
                      )}
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
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {t('smsApi.campaigns.noPlannedContacts')}
            </p>
          </div>
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
                  {modalData.segments !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('smsApi.campaigns.segments')}:</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">{modalData.segments}</span>
                    </div>
                  )}
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
