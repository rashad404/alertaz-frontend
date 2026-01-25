import apiClient from './client';
import type { ApiResponse, Customer } from '../types/api';

export interface CustomerFilters {
  search?: string;
  has_phone?: boolean;
  has_email?: boolean;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface CustomerWithServices extends Customer {
  services?: Array<{
    id: number;
    name: string;
    service_type?: { key: string; label: any };
    expiry_at?: string;
    status?: string;
  }>;
}

export interface MessagesPaginatedResult {
  data: any[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    sms_count: number;
    email_count: number;
  };
}

export const customersApi = {
  list: async (projectId: number, filters: CustomerFilters = {}): Promise<PaginatedResult<Customer>> => {
    const response = await apiClient.get<{ status: string; data: Customer[]; meta: any }>(`/projects/${projectId}/customers`, {
      params: filters,
    });
    return { data: response.data.data, meta: response.data.meta };
  },

  get: async (projectId: number, customerId: number): Promise<CustomerWithServices> => {
    const response = await apiClient.get<{ status: string; data: CustomerWithServices }>(`/projects/${projectId}/customers/${customerId}`);
    return response.data.data;
  },

  getMessages: async (projectId: number, customerId: number, params: { channel?: string; page?: number; per_page?: number } = {}): Promise<MessagesPaginatedResult> => {
    const response = await apiClient.get<{ status: string; data: any[]; meta: any }>(`/projects/${projectId}/customers/${customerId}/messages`, { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  delete: async (projectId: number, customerId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/customers/${customerId}`);
  },

  bulkDelete: async (projectId: number, ids: number[]): Promise<{ deleted: number }> => {
    const response = await apiClient.post<ApiResponse<{ deleted: number }>>(`/projects/${projectId}/customers/bulk-delete`, { ids });
    return response.data.data;
  },

  send: async (projectId: number, customerId: number, data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
    sender?: string;
    email_sender?: string;
  }): Promise<any> => {
    const response = await apiClient.post(`/projects/${projectId}/customers/${customerId}/send`, data);
    return response.data.data;
  },

  bulkSend: async (projectId: number, customerIds: number[], data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }): Promise<any> => {
    const response = await apiClient.post(`/projects/${projectId}/customers/bulk-send`, {
      customer_ids: customerIds,
      ...data,
    });
    return response.data.data;
  },
};

export default customersApi;
