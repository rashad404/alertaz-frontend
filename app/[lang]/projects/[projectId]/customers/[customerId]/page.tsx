'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  ArrowLeft,
  Send,
  MessageSquare,
  Smartphone,
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { customersApi, CustomerWithServices } from '@/lib/api/customers';
import QuickSendModal from '@/components/sms/QuickSendModal';

interface Message {
  id: number;
  channel: 'sms' | 'email';
  recipient: string;
  content?: string;
  subject?: string;
  sender?: string;
  status: string;
  cost?: number;
  segments?: number;
  sent_at?: string;
  created_at: string;
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

export default function CustomerViewPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const projectId = Number(params.projectId);
  const customerId = Number(params.customerId);
  const lang = params.lang as string;

  const [customer, setCustomer] = useState<CustomerWithServices | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'sms' | 'email'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [smsCount, setSmsCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [sendModal, setSendModal] = useState(false);

  const fetchCustomer = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customersApi.get(projectId, customerId);
      setCustomer(data);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, customerId]);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const result = await customersApi.getMessages(projectId, customerId, {
        channel: activeTab === 'all' ? undefined : activeTab,
        page,
        per_page: 20,
      });
      setMessages(result.data);
      setTotalPages(result.meta.last_page);
      setSmsCount(result.meta.sms_count);
      setEmailCount(result.meta.email_count);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  }, [projectId, customerId, activeTab, page]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

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

  const handleSend = async (data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }) => {
    if (!customer) return;
    const result = await customersApi.send(projectId, customer.id, data);
    fetchMessages(); // Refresh messages after sending
    return result;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Customer not found</h2>
          <Link
            href={`/${lang}/projects/${projectId}/customers`}
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Back to customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back button */}
        <Link
          href={`/${lang}/projects/${projectId}/customers`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to customers
        </Link>

        {/* Customer Info Card */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-500">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{customer.name || 'Unnamed Customer'}</h1>
                  {customer.external_id && (
                    <p className="text-white/70 text-sm">ID: {customer.external_id}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSendModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {customer.phone || <span className="text-gray-400">Not provided</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {customer.email || <span className="text-gray-400">Not provided</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Services - Grouped by Type */}
          {customer.services && customer.services.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase mb-3">Services</h3>
              <div className="space-y-4">
                {Object.entries(
                  customer.services.reduce((groups, service) => {
                    const typeKey = service.service_type?.key || 'other';
                    const typeLabel = service.service_type?.label?.en || service.service_type?.label?.az || typeKey;
                    if (!groups[typeKey]) {
                      groups[typeKey] = { label: typeLabel, services: [] };
                    }
                    groups[typeKey].services.push(service);
                    return groups;
                  }, {} as Record<string, { label: string; services: typeof customer.services }>)
                ).map(([typeKey, group]) => (
                  <div key={typeKey}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase">
                        {group.label}
                      </span>
                      <span className="text-xs text-gray-400">({group.services.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.services.map((service) => (
                        <Link
                          key={service.id}
                          href={`/${lang}/projects/${projectId}/services/${typeKey}?search=${encodeURIComponent(service.name)}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                          <Package className="w-4 h-4" />
                          {service.name}
                          {service.status && (
                            <span className={`px-1.5 py-0.5 text-xs rounded ${
                              service.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {service.status}
                            </span>
                          )}
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message History */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Message History</h2>
              </div>
              <button
                onClick={fetchMessages}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${messagesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                All ({smsCount + emailCount})
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'sms'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                SMS ({smsCount})
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'email'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email ({emailCount})
              </button>
            </div>
          </div>

          {/* Messages List */}
          {messagesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No messages sent to this customer yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {messages.map((msg) => (
                <div key={msg.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      msg.channel === 'sms'
                        ? 'bg-indigo-100 dark:bg-indigo-900/30'
                        : 'bg-emerald-100 dark:bg-emerald-900/30'
                    }`}>
                      {msg.channel === 'sms' ? (
                        <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getMessageStatusColor(msg.status)}`}>
                          {msg.status}
                        </span>
                        {msg.channel === 'email' && msg.subject && (
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {msg.subject}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {msg.content || '-'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {msg.sent_at ? formatDate(msg.sent_at) : formatDate(msg.created_at)}
                        </span>
                        {msg.cost !== undefined && (
                          <span>{msg.cost} AZN</span>
                        )}
                        {msg.sender && (
                          <span>From: {msg.sender}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Send Modal */}
      {customer && (
        <QuickSendModal
          isOpen={sendModal}
          onClose={() => setSendModal(false)}
          targetType="customer"
          targetName={customer.name || customer.email || customer.phone || 'Customer'}
          targetInfo={{
            phone: customer.phone || undefined,
            email: customer.email || undefined,
          }}
          variables={{
            name: customer.name || '',
            email: customer.email || '',
            phone: customer.phone || '',
          }}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
