'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Package, Send, Trash2, RefreshCw, AlertTriangle, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import DataTable, { Column } from '@/components/sms/DataTable';
import QuickSendModal from '@/components/sms/QuickSendModal';
import BulkSendModal from '@/components/sms/BulkSendModal';
import { servicesApi, type Service, type ServiceStats } from '@/lib/api';
import { useProject } from '../../ProjectContext';

export default function ServicesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = Number(params.projectId);
  const type = params.type as string;
  const { serviceTypes } = useProject();
  const fetchedRef = useRef(false);

  // Get initial search from URL params
  const initialSearch = searchParams.get('search') || '';

  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 25,
  });
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expiryFilter, setExpiryFilter] = useState<number | null>(null);
  const [sendModal, setSendModal] = useState<{
    isOpen: boolean;
    service?: Service;
  }>({ isOpen: false });
  const [bulkSendModal, setBulkSendModal] = useState(false);

  // Get service type from context
  const serviceType = useMemo(() => {
    return serviceTypes.find(t => t.key === type) || null;
  }, [serviceTypes, type]);

  const fetchStats = useCallback(async () => {
    try {
      const s = await servicesApi.stats(projectId, type);
      setStats(s);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [projectId, type]);

  const fetchServices = useCallback(async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const response = await servicesApi.list(projectId, type, {
        page,
        per_page: pagination.perPage,
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        expiring_within_days: expiryFilter || undefined,
      });
      setServices(response.data);
      setPagination({
        currentPage: response.meta.current_page,
        totalPages: response.meta.last_page,
        total: response.meta.total,
        perPage: response.meta.per_page,
      });
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, type, pagination.perPage, statusFilter, expiryFilter]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchStats();
    fetchServices(1, search);
  }, [fetchStats]);

  useEffect(() => {
    fetchServices(1, search);
  }, [statusFilter, expiryFilter]);

  const handleSearch = (query: string) => {
    setSearch(query);
    fetchServices(1, query);
  };

  const handlePageChange = (page: number) => {
    fetchServices(page, search);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await servicesApi.delete(projectId, type, id);
      fetchServices(pagination.currentPage, search);
      fetchStats();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} services?`)) return;

    try {
      const ids = Array.from(selectedIds).map(Number);
      await servicesApi.bulkDelete(projectId, type, ids);
      setSelectedIds(new Set());
      fetchServices(pagination.currentPage, search);
      fetchStats();
    } catch (error) {
      console.error('Failed to delete services:', error);
    }
  };

  const handleSend = async (data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }) => {
    if (!sendModal.service) return;

    const result = await servicesApi.send(projectId, type, sendModal.service.id, data);
    return result;
  };

  const handleBulkSend = async (data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }) => {
    const ids = Array.from(selectedIds).map(Number);
    const result = await servicesApi.bulkSend(projectId, type, ids, data);
    setSelectedIds(new Set());
    return result;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            Inactive
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            Expired
          </span>
        );
      default:
        return <span className="text-gray-500">-</span>;
    }
  };

  const getExpiryBadge = (daysUntilExpiry?: number) => {
    if (daysUntilExpiry === undefined || daysUntilExpiry === null) return null;
    if (daysUntilExpiry < 0) {
      return <span className="text-red-600 dark:text-red-400 text-xs">Expired</span>;
    }
    if (daysUntilExpiry <= 7) {
      return <span className="text-orange-600 dark:text-orange-400 text-xs">{daysUntilExpiry}d left</span>;
    }
    if (daysUntilExpiry <= 30) {
      return <span className="text-yellow-600 dark:text-yellow-400 text-xs">{daysUntilExpiry}d left</span>;
    }
    return <span className="text-gray-500 text-xs">{daysUntilExpiry}d left</span>;
  };

  const columns: Column<Service>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (service) => (
        <div>
          <div className="font-medium">{service.name}</div>
          {service.external_id && (
            <div className="text-xs text-gray-500">ID: {service.external_id}</div>
          )}
        </div>
      ),
    },
    {
      key: 'expiry_at',
      header: 'Expiry',
      sortable: true,
      render: (service) => (
        <div className="flex flex-col">
          <span>{service.expiry_at || '-'}</span>
          {getExpiryBadge(service.days_until_expiry)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (service) => getStatusBadge(service.status),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (service) => service.customer ? (
        <Link
          href={`/${params.lang}/projects/${projectId}/customers/${service.customer.id}`}
          className="block hover:bg-gray-100 dark:hover:bg-gray-800 -m-2 p-2 rounded-lg transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-medium text-purple-600 dark:text-purple-400 hover:underline">{service.customer.name || 'No name'}</div>
          <div className="text-xs text-gray-500">
            {service.customer.phone || service.customer.email || '-'}
          </div>
        </Link>
      ) : <span className="text-gray-500">No customer</span>,
    },
  ];

  const typeLabel = serviceType?.label?.en || type;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{typeLabel}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{pagination.total} total services</p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchServices(pagination.currentPage, search);
              fetchStats();
            }}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <button
              onClick={() => { setStatusFilter(''); setExpiryFilter(null); }}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 ${
                statusFilter === '' && expiryFilter === null
                  ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500'
                  : 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
              } backdrop-blur-xl`}
            >
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
            </button>
            <button
              onClick={() => { setStatusFilter('active'); setExpiryFilter(null); }}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 ${
                statusFilter === 'active' && expiryFilter === null
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-400 dark:border-green-500'
                  : 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300 dark:hover:border-green-600'
              } backdrop-blur-xl`}
            >
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </button>
            <button
              onClick={() => { setStatusFilter('inactive'); setExpiryFilter(null); }}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 ${
                statusFilter === 'inactive' && expiryFilter === null
                  ? 'bg-gray-200 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-500'
                  : 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600'
              } backdrop-blur-xl`}
            >
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.inactive || stats.suspended || 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Inactive</div>
            </button>
            <button
              onClick={() => { setStatusFilter('expired'); setExpiryFilter(null); }}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 ${
                statusFilter === 'expired' && expiryFilter === null
                  ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-500'
                  : 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:border-red-300 dark:hover:border-red-600'
              } backdrop-blur-xl`}
            >
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expired</div>
            </button>
            <button
              onClick={() => { setStatusFilter(''); setExpiryFilter(7); }}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 ${
                expiryFilter === 7
                  ? 'bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-400 dark:border-orange-500'
                  : 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:border-orange-300 dark:hover:border-orange-600'
              } backdrop-blur-xl`}
            >
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.expiring_7_days}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expiring 7d</div>
            </button>
            <button
              onClick={() => { setStatusFilter(''); setExpiryFilter(30); }}
              className={`relative rounded-2xl p-4 text-left transition-all duration-200 ${
                expiryFilter === 30
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-500'
                  : 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600'
              } backdrop-blur-xl`}
            >
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.expiring_30_days}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expiring 30d</div>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={expiryFilter ?? ''}
            onChange={(e) => setExpiryFilter(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Expiry</option>
            <option value="3">Expiring in 3 days</option>
            <option value="7">Expiring in 7 days</option>
            <option value="30">Expiring in 30 days</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30">
            <span className="text-purple-700 dark:text-purple-400 font-medium">{selectedIds.size} selected</span>
            <div className="flex-1" />
            <button
              onClick={() => setBulkSendModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-lg transition-all duration-300"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-lg transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          data={services}
          columns={columns}
          keyField="id"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchable
          searchPlaceholder="Search by name..."
          initialSearch={initialSearch}
          onSearch={handleSearch}
          loading={loading}
          emptyMessage="No services found"
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
          }}
          actions={(service) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSendModal({ isOpen: true, service })}
                disabled={!service.customer}
                className="p-2 text-gray-400 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      {/* Quick Send Modal */}
      {sendModal.service && sendModal.service.customer && (
        <QuickSendModal
          isOpen={sendModal.isOpen}
          onClose={() => setSendModal({ isOpen: false })}
          targetType="service"
          targetName={sendModal.service.name}
          targetInfo={{
            phone: sendModal.service.customer.phone || undefined,
            email: sendModal.service.customer.email || undefined,
          }}
          variables={{
            name: sendModal.service.name,
            expiry_at: sendModal.service.expiry_at || '',
            status: sendModal.service.status || '',
            days_until_expiry: sendModal.service.days_until_expiry?.toString() || '',
            customer_name: sendModal.service.customer.name || '',
            customer_email: sendModal.service.customer.email || '',
            customer_phone: sendModal.service.customer.phone || '',
            ...sendModal.service.data,
          }}
          onSend={handleSend}
        />
      )}

      {/* Bulk Send Modal */}
      <BulkSendModal
        isOpen={bulkSendModal}
        onClose={() => setBulkSendModal(false)}
        selectedCount={selectedIds.size}
        onSend={handleBulkSend}
      />
    </div>
  );
}
