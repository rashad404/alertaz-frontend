import apiClient from './client';
import type { ApiResponse, SendResult } from '../types/api';

export interface SendMessageData {
  channel: 'sms' | 'email' | 'both';
  message?: string;
  email_subject?: string;
  email_body?: string;
  sender?: string;
  email_sender?: string;
}

export interface BulkSendResult {
  sent: number;
  failed: number;
  skipped?: number;
  errors: Array<{
    customer_id?: number;
    service_id?: number;
    sms_error?: string;
    email_error?: string;
  }>;
}

export interface PreviewResult {
  message?: string;
  email_subject?: string;
  email_body?: string;
  sms_segments: number;
}

export const quickSendApi = {
  preview: async (
    projectId: number,
    data: {
      message?: string;
      email_subject?: string;
      email_body?: string;
      variables: Record<string, any>;
    }
  ): Promise<PreviewResult> => {
    const response = await apiClient.post<ApiResponse<PreviewResult>>(`/projects/${projectId}/send/preview`, data);
    return response.data.data;
  },

  sendToCustomer: async (projectId: number, customerId: number, data: SendMessageData): Promise<SendResult> => {
    const response = await apiClient.post<ApiResponse<SendResult>>(`/projects/${projectId}/customers/${customerId}/send`, data);
    return response.data.data;
  },

  sendToService: async (projectId: number, type: string, serviceId: number, data: SendMessageData): Promise<SendResult> => {
    const response = await apiClient.post<ApiResponse<SendResult>>(`/projects/${projectId}/services/${type}/${serviceId}/send`, data);
    return response.data.data;
  },

  bulkSendToCustomers: async (projectId: number, customerIds: number[], data: SendMessageData): Promise<BulkSendResult> => {
    const response = await apiClient.post<ApiResponse<BulkSendResult>>(`/projects/${projectId}/customers/bulk-send`, {
      customer_ids: customerIds,
      ...data,
    });
    return response.data.data;
  },

  bulkSendToServices: async (projectId: number, type: string, serviceIds: number[], data: SendMessageData): Promise<BulkSendResult> => {
    const response = await apiClient.post<ApiResponse<BulkSendResult>>(`/projects/${projectId}/services/${type}/bulk-send`, {
      service_ids: serviceIds,
      ...data,
    });
    return response.data.data;
  },
};

export default quickSendApi;
