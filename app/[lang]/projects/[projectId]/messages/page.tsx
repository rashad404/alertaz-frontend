'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, RefreshCw, MessageSquare } from 'lucide-react';
import messagesApi, { Message, MessageFilters } from '@/lib/api/messages';
import MessageTable from '@/components/sms/MessageTable';

export default function SentMessagesPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const t = useTranslations();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [smsCount, setSmsCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: MessageFilters = {
        page,
        per_page: 20,
      };
      if (search) {
        filters.search = search;
      }
      const result = await messagesApi.list(projectId, filters);
      setMessages(result.data);
      setTotalPages(result.meta.last_page);
      setSmsCount(result.meta.sms_count);
      setEmailCount(result.meta.email_count);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, page, search]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);


  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMessages();
  };

  // Transform messages to match MessageTable expected format
  const transformedMessages = messages.map(msg => ({
    id: msg.id,
    type: msg.channel as 'sms' | 'email',
    phone: msg.recipient,
    email: msg.recipient,
    recipient: msg.recipient,
    message: msg.content,
    content: msg.content,
    subject: msg.subject,
    segments: msg.segments,
    status: msg.status,
    cost: msg.cost,
    sent_at: msg.sent_at,
    is_test: msg.is_test,
    sender: msg.sender,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('smsApi.campaigns.sentMessages')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {t('smsApi.campaigns.viewSentMessages')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('common.search')}
                  className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 w-64"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                {t('common.search')}
              </button>
            </form>
            <button
              onClick={fetchMessages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {/* Messages Table */}
        <MessageTable
          messages={transformedMessages}
          channel="both"
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          smsCount={smsCount}
          emailCount={emailCount}
          onPageChange={setPage}
          formatDate={formatDate}
          mode="sent"
        />
      </div>
    </div>
  );
}
