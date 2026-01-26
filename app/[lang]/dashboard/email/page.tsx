'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Copy, Check, Code, Filter, X, Search, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { Link } from '@/lib/navigation';
import axios from 'axios';
import { formatDateInTimezone } from '@/lib/utils/date';
import { useTimezone } from '@/providers/timezone-provider';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';
import MessageTable, { MessageData } from '@/components/sms/MessageTable';

interface Filters {
  source: string;
  email: string;
  status: string;
  date_from: string;
  date_to: string;
}

export default function EmailHistoryPage() {
  const t = useTranslations();
  const { timezone } = useTimezone();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [apiToken, setApiToken] = useState<string>('');
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    source: '',
    email: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      setIsAuthenticated(true);

      // Fetch the permanent API token (not session token)
      try {
        const tokenRes = await axios.get(`${API_URL}/projects/default-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApiToken(tokenRes.data.data.api_token);
      } catch (err) {
        console.error('Failed to fetch API token:', err);
        setApiToken(token);
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('per_page', '20');
      params.append('page', currentPage.toString());

      if (filters.source) params.append('source', filters.source);
      if (filters.email) params.append('email', filters.email);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const historyRes = await axios.get(`${API_URL}/email/history?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform API response to MessageData format
      const transformedMessages: MessageData[] = historyRes.data.data.messages.map((msg: any) => ({
        id: msg.id,
        type: 'email' as const,
        email: msg.recipient,
        recipient: msg.recipient,
        subject: msg.subject,
        email_subject: msg.subject,
        content: msg.content,
        body: msg.content,
        email_body_html: msg.content,
        sender: msg.sender,
        status: msg.status,
        cost: msg.cost,
        sent_at: msg.sent_at || msg.created_at,
        is_test: msg.is_test,
        source: msg.source,
      }));

      setMessages(transformedMessages);
      setTotalPages(historyRes.data.data.pagination.last_page);
      setTotal(historyRes.data.data.pagination.total);

      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch Email data:', error);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
      }
      setLoading(false);
    }
  }, [API_URL, currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const copyToken = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(apiToken);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = apiToken;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearFilters = () => {
    setFilters({
      source: '',
      email: '',
      status: '',
      date_from: '',
      date_to: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const formatDate = (dateStr: string) => {
    return formatDateInTimezone(dateStr, timezone, { includeTime: true });
  };

  // Show auth required card if not authenticated
  if (isAuthenticated === false) {
    return (
      <AuthRequiredCard
        title={t('auth.signInToContinue')}
        message={t('dashboard.accessYourAlerts')}
      />
    );
  }

  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('emailApi.messageHistory')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('emailApi.historyDescription')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </button>
            <Link
              href="/docs/email-api"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Code className="w-5 h-5" />
              {t('emailApi.apiDocs')}
            </Link>
          </div>
        </div>

        {/* API Token */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('emailApi.apiToken')}
            </h2>
            <Link
              href="/projects"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('emailApi.manageProjects')}
            </Link>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('emailApi.apiTokenDescription')}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type={showToken ? 'text' : 'password'}
                readOnly
                value={apiToken}
                className="w-full px-4 py-2 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={copyToken}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {tokenCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('common.copied')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t('common.copy')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('emailApi.history')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {total} {t('emailApi.email').toLowerCase()}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                hasActiveFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t('common.filter')}
            </button>
          </div>

          {showFilters && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('emailApi.source')}
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">{t('emailApi.allSources')}</option>
                    <option value="api">{t('emailApi.sourceApi')}</option>
                    <option value="campaign">{t('emailApi.sourceCampaign')}</option>
                    <option value="service">{t('emailApi.sourceService')}</option>
                    <option value="customer">{t('emailApi.sourceCustomer')}</option>
                  </select>
                </div>

                {/* Email Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('emailApi.recipient')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.email}
                      onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                      placeholder="email@..."
                      className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('emailApi.status')}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">{t('emailApi.allStatuses')}</option>
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('emailApi.filterByDate')}
                  </label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    &nbsp;
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages Table with Preview */}
        <MessageTable
          messages={messages}
          channel="email"
          isLoading={loading}
          page={currentPage}
          totalPages={totalPages}
          total={total}
          onPageChange={setCurrentPage}
          formatDate={formatDate}
          mode="sent"
          title={t('emailApi.history')}
        />
      </div>
    </div>
  );
}
