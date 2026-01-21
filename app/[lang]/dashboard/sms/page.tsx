'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { MessageSquare, Copy, Check, Code, Filter, X, Search, Eye, EyeOff, FlaskConical, Loader2 } from 'lucide-react';
import { Link } from '@/lib/navigation';
import axios from 'axios';
import { formatDateInTimezone } from '@/lib/utils/date';
import { useTimezone } from '@/providers/timezone-provider';
import AuthRequiredCard from '@/components/auth/AuthRequiredCard';

interface Campaign {
  id: number;
  name: string;
}

interface SMSMessage {
  id: number;
  source: 'api' | 'campaign';
  phone: string;
  message: string;
  sender: string;
  cost: number;
  status: string;
  is_test: boolean;
  created_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  campaign?: Campaign | null;
}

interface Filters {
  source: string;
  phone: string;
  status: string;
  date_from: string;
  date_to: string;
}

export default function SMSHistoryPage() {
  const t = useTranslations();
  const router = useRouter();
  const { timezone } = useTimezone();
  const [messages, setMessages] = useState<SMSMessage[]>([]);
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
    phone: '',
    status: '',
    date_from: '',
    date_to: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [currentPage, filters]);

  const fetchData = async () => {
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
        // Fallback to session token if fetch fails
        setApiToken(token);
      }

      // Build query params
      const params = new URLSearchParams();
      params.append('per_page', '10');
      params.append('page', currentPage.toString());

      if (filters.source) params.append('source', filters.source);
      if (filters.phone) params.append('phone', filters.phone);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const historyRes = await axios.get(`${API_URL}/sms/history?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(historyRes.data.data.messages);
      setTotalPages(historyRes.data.data.pagination.last_page);
      setTotal(historyRes.data.data.pagination.total);

      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch SMS data:', error);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
      }
      setLoading(false);
    }
  };

  const copyToken = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(apiToken);
      } else {
        // Fallback for non-secure contexts
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

  const getStatusColor = (status: string) => {
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

  const getSourceBadge = (source: string) => {
    if (source === 'campaign') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20">
          {t('smsApi.sourceCampaign')}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20">
        {t('smsApi.sourceApi')}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      source: '',
      phone: '',
      status: '',
      date_from: '',
      date_to: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

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
              {t('smsApi.messageHistory')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('smsApi.historyDescription')}
            </p>
          </div>
          <Link
            href="/sms-api"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Code className="w-5 h-5" />
            {t('smsApi.apiDocs')}
          </Link>
        </div>

        {/* API Token */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('smsApi.apiToken')}
            </h2>
            <Link
              href="/settings/campaigns/projects"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('smsApi.manageProjects')}
            </Link>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('smsApi.apiTokenDescription')}
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

        {/* SMS History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('smsApi.history')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {total} {t('smsApi.message').toLowerCase()}
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

          {/* Filters */}
          {showFilters && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Source Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('smsApi.source')}
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">{t('smsApi.allSources')}</option>
                    <option value="api">{t('smsApi.sourceApi')}</option>
                    <option value="campaign">{t('smsApi.sourceCampaign')}</option>
                  </select>
                </div>

                {/* Phone Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('smsApi.phone')}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.phone}
                      onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                      placeholder="994..."
                      className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('smsApi.status')}
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  >
                    <option value="">{t('smsApi.allStatuses')}</option>
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('smsApi.filterByDate')}
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

          {messages.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">{t('smsApi.noMessages')}</p>
              <Link href="/sms-api" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                {t('smsApi.viewDocsToStart')}
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('smsApi.source')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('smsApi.phone')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('smsApi.message')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('smsApi.sender')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('smsApi.status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('smsApi.cost')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('smsApi.date')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {messages.map((msg) => (
                      <tr key={msg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {getSourceBadge(msg.source)}
                            {msg.campaign && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {msg.campaign.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {msg.phone}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                          {msg.message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {msg.sender}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(msg.status)}`}>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {msg.cost} AZN
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDateInTimezone(msg.created_at, timezone, { includeTime: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('common.pageOf', { current: currentPage, total: totalPages })}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('common.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
