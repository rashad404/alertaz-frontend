import apiClient from './client';
import type { ApiResponse, Service, ServiceStats, FilterConfig } from '../types/api';

export interface ServiceFilters {
  search?: string;
  status?: string;
  expiring_within_days?: number;
  expired?: boolean;
  customer_id?: number;
  filter?: FilterConfig;
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

export const servicesApi = {
  list: async (projectId: number, type: string, filters: ServiceFilters = {}): Promise<PaginatedResult<Service>> => {
    const response = await apiClient.get<{ status: string; data: Service[]; meta: any }>(`/projects/${projectId}/services/${type}`, {
      params: filters,
    });
    return { data: response.data.data, meta: response.data.meta };
  },

  stats: async (projectId: number, type: string): Promise<ServiceStats> => {
    const response = await apiClient.get<ApiResponse<ServiceStats>>(`/projects/${projectId}/services/${type}/stats`);
    return response.data.data;
  },

  delete: async (projectId: number, type: string, serviceId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/services/${type}/${serviceId}`);
  },

  bulkDelete: async (projectId: number, type: string, ids: number[]): Promise<{ deleted: number }> => {
    const response = await apiClient.post<ApiResponse<{ deleted: number }>>(`/projects/${projectId}/services/${type}/bulk-delete`, { ids });
    return response.data.data;
  },

  send: async (projectId: number, type: string, serviceId: number, data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
    sender?: string;
    email_sender?: string;
  }): Promise<any> => {
    const response = await apiClient.post(`/projects/${projectId}/services/${type}/${serviceId}/send`, data);
    return response.data.data;
  },

  bulkSend: async (projectId: number, type: string, serviceIds: number[], data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }): Promise<any> => {
    const response = await apiClient.post(`/projects/${projectId}/services/${type}/bulk-send`, {
      service_ids: serviceIds,
      ...data,
    });
    return response.data.data;
  },
};

export default servicesApi;
