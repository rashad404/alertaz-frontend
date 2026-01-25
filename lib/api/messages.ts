import apiClient from './client';

export interface Message {
  id: number;
  client_id: number;
  campaign_id?: number;
  customer_id?: number;
  service_id?: number;
  channel: 'sms' | 'email';
  recipient: string;
  content?: string;
  subject?: string;
  sender?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  cost?: number;
  segments?: number;
  provider_message_id?: string;
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
  is_test?: boolean;
}

export interface MessageFilters {
  channel?: 'sms' | 'email';
  status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  per_page?: number;
}

export interface MessagesPaginatedResult {
  data: Message[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    sms_count: number;
    email_count: number;
  };
}

export const messagesApi = {
  list: async (projectId: number, filters: MessageFilters = {}): Promise<MessagesPaginatedResult> => {
    const response = await apiClient.get<{ status: string; data: Message[]; meta: any }>(`/projects/${projectId}/messages`, {
      params: filters,
    });
    return { data: response.data.data, meta: response.data.meta };
  },
};

export default messagesApi;
