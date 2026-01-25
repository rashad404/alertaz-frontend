'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, Send, Trash2, RefreshCw, Edit2, X, Save, AlertCircle, Eye } from 'lucide-react';
import DataTable, { Column } from '@/components/sms/DataTable';
import QuickSendModal from '@/components/sms/QuickSendModal';
import BulkSendModal from '@/components/sms/BulkSendModal';
import { customersApi, type Customer } from '@/lib/api';

export default function CustomersPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const fetchedRef = useRef(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 25,
  });
  const [search, setSearch] = useState('');
  const [sendModal, setSendModal] = useState<{
    isOpen: boolean;
    customer?: Customer;
  }>({ isOpen: false });
  const [bulkSendModal, setBulkSendModal] = useState(false);

  // Create/Edit form state
  const [isCreating, setIsCreating] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    external_id: '',
  });

  const fetchCustomers = useCallback(async (page = 1, searchQuery = '') => {
    setLoading(true);
    try {
      const response = await customersApi.list(projectId, {
        page,
        per_page: pagination.perPage,
        search: searchQuery || undefined,
      });
      setCustomers(response.data);
      setPagination({
        currentPage: response.meta.current_page,
        totalPages: response.meta.last_page,
        total: response.meta.total,
        perPage: response.meta.per_page,
      });
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, pagination.perPage]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchCustomers(1, search);
  }, [fetchCustomers]);

  const handleSearch = (query: string) => {
    setSearch(query);
    fetchCustomers(1, query);
  };

  const handlePageChange = (page: number) => {
    fetchCustomers(page, search);
  };

  const handleDelete = async (customerId: number) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await customersApi.delete(projectId, customerId);
      fetchCustomers(pagination.currentPage, search);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} customers?`)) return;

    try {
      const ids = Array.from(selectedIds).map(Number);
      await customersApi.bulkDelete(projectId, ids);
      setSelectedIds(new Set());
      fetchCustomers(pagination.currentPage, search);
    } catch (error) {
      console.error('Failed to delete customers:', error);
    }
  };

  const handleSend = async (data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }) => {
    if (!sendModal.customer) return;

    const result = await customersApi.send(projectId, sendModal.customer.id, data);
    return result;
  };

  const handleBulkSend = async (data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }) => {
    const ids = Array.from(selectedIds).map(Number);
    const result = await customersApi.bulkSend(projectId, ids, data);
    setSelectedIds(new Set());
    return result;
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (customer) => (
        <Link
          href={`/${params.lang}/projects/${projectId}/customers/${customer.id}`}
          className="block hover:bg-gray-100 dark:hover:bg-gray-800 -m-2 p-2 rounded-lg transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-medium text-purple-600 dark:text-purple-400 hover:underline">{customer.name || '-'}</div>
          {customer.external_id && (
            <div className="text-xs text-gray-500">ID: {customer.external_id}</div>
          )}
        </Link>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      sortable: true,
      render: (customer) => customer.phone || <span className="text-gray-500">-</span>,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (customer) => customer.email || <span className="text-gray-500">-</span>,
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (customer) => new Date(customer.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{pagination.total} total customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCustomers(pagination.currentPage, search)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
            <span className="text-blue-700 dark:text-blue-400 font-medium">{selectedIds.size} selected</span>
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
          data={customers}
          columns={columns}
          keyField="id"
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          searchable
          searchPlaceholder="Search by name, phone, or email..."
          onSearch={handleSearch}
          loading={loading}
          emptyMessage="No customers found"
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
          }}
          actions={(customer) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/${params.lang}/projects/${projectId}/customers/${customer.id}`}
                className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                title="View customer"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setSendModal({ isOpen: true, customer })}
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(customer.id)}
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
      {sendModal.customer && (
        <QuickSendModal
          isOpen={sendModal.isOpen}
          onClose={() => setSendModal({ isOpen: false })}
          targetType="customer"
          targetName={sendModal.customer.name || sendModal.customer.email || sendModal.customer.phone || 'Customer'}
          targetInfo={{
            phone: sendModal.customer.phone || undefined,
            email: sendModal.customer.email || undefined,
          }}
          variables={{
            name: sendModal.customer.name || '',
            email: sendModal.customer.email || '',
            phone: sendModal.customer.phone || '',
            ...sendModal.customer.data,
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
