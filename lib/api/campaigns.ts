import apiClient from './client';
import type { ApiResponse, Campaign, FilterConfig } from '../types/api';

// Store project token for API calls
let currentProjectToken: string | null = null;

export function setProjectToken(token: string | null) {
  currentProjectToken = token;
}

export function getProjectToken(): string | null {
  return currentProjectToken;
}

export interface CampaignFilters {
  status?: string;
  type?: 'one_time' | 'automated';
  target_type?: 'customer' | 'service';
  service_type_key?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateCampaignData {
  name: string;
  target_type: 'customer' | 'service';
  service_type_key?: string;
  channel: 'sms' | 'email' | 'both';
  message_template?: string;
  email_subject?: string;
  email_body?: string;
  sender?: string;
  email_sender?: string;
  email_display_name?: string;
  segment_filter?: FilterConfig;
  campaign_type: 'one_time' | 'automated';
  scheduled_at?: string;
  check_interval_minutes?: number;
  cooldown_days?: number;
  run_start_hour?: number;
  run_end_hour?: number;
  ends_at?: string;
}

export interface PreviewParams {
  target_type: 'customer' | 'service';
  service_type_key?: string;
  filter: FilterConfig;
}

export interface PreviewResult {
  count: number;
  sample?: Array<{
    id: number;
    name?: string;
    phone?: string;
    email?: string;
    expiry_at?: string;
    status?: string;
    customer?: {
      id: number;
      name?: string;
      phone?: string;
      email?: string;
    };
  }>;
  debug_sql?: string;
  debug_filter?: any;
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

export interface SegmentAttribute {
  key: string;
  label: string;
  type: string;
  options?: string[];
  service_type?: string;
}

export interface SegmentAttributes {
  customer: SegmentAttribute[];
  service: SegmentAttribute[];
  service_types: Array<{
    key: string;
    label: Record<string, string>;
    fields?: any[];
  }>;
}

export interface MessagePreview {
  phone?: string;
  email?: string;
  message?: string;
  subject?: string;
  name?: string;
  segments?: number;
  attributes?: Record<string, any>;
}

export interface PreviewMessagesResult {
  total_count: number;
  sms_total: number;
  email_total: number;
  previews: MessagePreview[];
  campaign: Campaign;
}

export interface PlannedMessagesResult {
  contacts: Array<{
    id: number;
    phone?: string;
    email?: string;
    name?: string;
    attributes?: Record<string, any>;
  }>;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    sms_total?: number;
    email_total?: number;
  };
  next_run_at?: string;
}

export interface CampaignMessage {
  id: number;
  type: 'sms' | 'email';
  recipient: string;
  content?: string;
  subject?: string;
  status: string;
  cost: number;
  is_test: boolean;
  sent_at?: string;
  created_at: string;
  sender?: string;
  segments?: number;
}

export interface CampaignMessagesResult {
  messages: CampaignMessage[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface TestSendResult {
  sent: number;
  failed: number;
  total_cost: number;
  messages: Array<{
    phone?: string;
    email?: string;
    message?: string;
    subject?: string;
    segments?: number;
    cost: number;
    status: string;
    error?: string;
  }>;
  is_test_mode: boolean;
}

export interface TestSendCustomResult {
  sms?: {
    phone: string;
    message: string;
    segments: number;
    cost: number;
    status: string;
    error?: string;
    test_mode: boolean;
  };
  email?: {
    email: string;
    subject: string;
    cost: number;
    status: string;
    error?: string;
    test_mode: boolean;
  };
}

export interface RetryFailedResult {
  queued: number;
  skipped: number;
  skipped_details?: Array<{
    phone: string;
    reason: string;
  }>;
}

export interface PlannedContact {
  id: number;
  phone?: string;
  email?: string;
  name?: string;
  attributes?: Record<string, any>;
  rendered_message?: string;
  rendered_subject?: string;
  message?: string;
  email_subject?: string;
  email_body_html?: string;
}

export interface AttributeSchema {
  key: string;
  label: string;
  type: string;
  options?: string[];
  service_type?: string;
}

export type CampaignChannel = 'sms' | 'email' | 'both';

export interface SegmentFilter {
  logic: 'AND' | 'OR';
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

export interface EmailSender {
  email: string;
  name: string;
  label?: string;
  verified?: boolean;
}

export interface SendersResult {
  senders: string[];
  default: string;
}

export interface EmailSendersResult {
  senders: EmailSender[];
  default?: EmailSender;
}

export const campaignsApi = {
  list: async (projectId: number, filters: CampaignFilters = {}): Promise<PaginatedResult<Campaign>> => {
    const response = await apiClient.get<{ status: string; data: Campaign[]; meta: any }>(`/projects/${projectId}/campaigns`, {
      params: filters,
    });
    return { data: response.data.data, meta: response.data.meta };
  },

  create: async (projectId: number, data: CreateCampaignData): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(`/projects/${projectId}/campaigns`, data);
    return response.data.data;
  },

  update: async (projectId: number, campaignId: number, data: Partial<CreateCampaignData>): Promise<Campaign> => {
    const response = await apiClient.put<ApiResponse<Campaign>>(`/projects/${projectId}/campaigns/${campaignId}`, data);
    return response.data.data;
  },

  delete: async (projectId: number, campaignId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/campaigns/${campaignId}`);
  },

  execute: async (projectId: number, campaignId: number): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(`/projects/${projectId}/campaigns/${campaignId}/execute`);
    return response.data.data;
  },

  activate: async (projectId: number, campaignId: number): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(`/projects/${projectId}/campaigns/${campaignId}/activate`);
    return response.data.data;
  },

  pause: async (projectId: number, campaignId: number): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(`/projects/${projectId}/campaigns/${campaignId}/pause`);
    return response.data.data;
  },

  preview: async (projectId: number, params: PreviewParams): Promise<PreviewResult> => {
    const response = await apiClient.post<ApiResponse<PreviewResult>>(`/projects/${projectId}/campaigns/preview`, params);
    return response.data.data;
  },

  cancel: async (projectId: number, campaignId: number): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(`/projects/${projectId}/campaigns/${campaignId}/cancel`);
    return response.data.data;
  },

  duplicate: async (projectId: number, campaignId: number): Promise<Campaign> => {
    const response = await apiClient.post<ApiResponse<Campaign>>(`/projects/${projectId}/campaigns/${campaignId}/duplicate`);
    return response.data.data;
  },

  get: async (projectId: number, campaignId: number): Promise<Campaign> => {
    const response = await apiClient.get<ApiResponse<Campaign>>(`/projects/${projectId}/campaigns/${campaignId}`);
    return response.data.data;
  },

  getAttributes: async (projectId: number): Promise<SegmentAttributes> => {
    const response = await apiClient.get<ApiResponse<SegmentAttributes>>(`/projects/${projectId}/segment-attributes`);
    return response.data.data;
  },

  previewMessages: async (projectId: number, campaignId: number, limit: number = 5): Promise<PreviewMessagesResult> => {
    const response = await apiClient.get<ApiResponse<PreviewMessagesResult>>(
      `/projects/${projectId}/campaigns/${campaignId}/preview-messages`,
      { params: { limit } }
    );
    return response.data.data;
  },

  getPlannedMessages: async (
    projectId: number,
    campaignId: number,
    page: number = 1,
    perPage: number = 10
  ): Promise<PlannedMessagesResult> => {
    const response = await apiClient.get<ApiResponse<PlannedMessagesResult>>(
      `/projects/${projectId}/campaigns/${campaignId}/planned`,
      { params: { page, per_page: perPage } }
    );
    return response.data.data;
  },

  getCampaignMessages: async (
    projectId: number,
    campaignId: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<CampaignMessagesResult> => {
    const response = await apiClient.get<ApiResponse<CampaignMessagesResult>>(
      `/projects/${projectId}/campaigns/${campaignId}/messages`,
      { params: { page, per_page: perPage } }
    );
    return response.data.data;
  },

  testSend: async (projectId: number, campaignId: number, count: number): Promise<TestSendResult> => {
    const response = await apiClient.post<ApiResponse<TestSendResult>>(
      `/projects/${projectId}/campaigns/${campaignId}/test-send`,
      { count }
    );
    return response.data.data;
  },

  testSendCustom: async (
    projectId: number,
    campaignId: number,
    data: { phone?: string; email?: string; sample_contact_id?: number }
  ): Promise<TestSendCustomResult> => {
    const response = await apiClient.post<ApiResponse<TestSendCustomResult>>(
      `/projects/${projectId}/campaigns/${campaignId}/test-send-custom`,
      data
    );
    return response.data.data;
  },

  retryFailed: async (projectId: number, campaignId: number): Promise<RetryFailedResult> => {
    const response = await apiClient.post<ApiResponse<RetryFailedResult>>(
      `/projects/${projectId}/campaigns/${campaignId}/retry-failed`
    );
    return response.data.data;
  },

  getSenders: async (projectId: number): Promise<SendersResult> => {
    const response = await apiClient.get<ApiResponse<SendersResult>>(`/projects/${projectId}/senders`);
    return response.data.data;
  },

  getEmailSenders: async (projectId: number): Promise<EmailSendersResult> => {
    const response = await apiClient.get<ApiResponse<EmailSendersResult>>(`/projects/${projectId}/email-senders`);
    return response.data.data;
  },
};

export default campaignsApi;
