import axios from 'axios';

// Create a separate axios instance for campaign API calls
// This instance uses project API token instead of user JWT token
const campaignClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Types
export type CampaignChannel = 'sms' | 'email' | 'both';

export interface Campaign {
  id: number;
  client_id: number;
  name: string;
  sender: string;
  email_sender: string | null;
  email_display_name: string | null;
  message_template: string;
  channel: CampaignChannel;
  email_subject_template: string | null;
  email_body_template: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled' | 'failed' | 'active' | 'paused';
  segment_filter: SegmentFilter;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  target_count: number;
  sent_count: number;
  sent_today_count: number;
  delivered_count: number;
  failed_count: number;
  total_cost: string;
  // Email stats
  email_sent_count: number;
  email_delivered_count: number;
  email_failed_count: number;
  email_total_cost: string;
  created_by: number;
  is_test: boolean;
  created_at: string;
  updated_at: string;
  // Automated campaign fields
  type: 'one_time' | 'automated';
  check_interval_minutes: number | null;
  cooldown_days: number | null;
  ends_at: string | null;
  run_start_hour: number | null;
  run_end_hour: number | null;
  last_run_at: string | null;
  next_run_at: string | null;
}

export interface SegmentFilter {
  logic: 'AND' | 'OR';
  conditions: Condition[];
}

export interface Condition {
  key: string;
  operator: string;
  value?: any;
}

export interface AttributeSchema {
  key: string;
  label: string;
  type: 'string' | 'number' | 'integer' | 'date' | 'boolean' | 'enum' | 'array';
  conditions: string[];
  options?: any[];
  item_type?: string;
  required: boolean;
}

export interface MessagePreview {
  phone: string | null;
  email: string | null;
  message: string | null;
  email_subject: string | null;
  email_body: string | null;
  segments: number;
  attributes: Record<string, any>;
}

export interface CampaignStats {
  target_count: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  total_cost: number;
  delivery_rate: number;
  success_rate: number;
  // Email stats
  email_sent_count: number;
  email_delivered_count: number;
  email_failed_count: number;
  email_total_cost: number;
  email_delivery_rate: number;
  email_success_rate: number;
  // Combined stats
  combined_sent_count: number;
  combined_delivered_count: number;
  combined_failed_count: number;
  combined_total_cost: number;
}

export interface CampaignMessage {
  id: number;
  phone?: string | null;
  message?: string | null;
  sender?: string;
  cost: number;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  is_test: boolean;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
  // Additional fields for unified SMS/Email handling
  type?: 'sms' | 'email';
  recipient?: string | null;
  content?: string | null;
  email?: string | null;
  subject?: string | null;
  body?: string | null;
  segments?: number;
  contact?: {
    id: number;
    phone: string | null;
    email: string | null;
    attributes: Record<string, any>;
  };
}

export interface CampaignEmailMessage {
  id: number;
  email: string;
  subject: string;
  body: string;
  cost: number;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  is_test: boolean;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
  contact?: {
    id: number;
    phone: string | null;
    email: string | null;
    attributes: Record<string, any>;
  };
}

export interface PlannedContact {
  contact_id: number;
  phone: string | null;
  email: string | null;
  can_receive_sms: boolean;
  can_receive_email: boolean;
  message: string | null;
  email_subject: string | null;
  email_body: string | null;
  segments: number;
  attributes: Record<string, any>;
}

// Helper to set project token
let currentProjectToken: string | null = null;

export const setProjectToken = (token: string | null) => {
  currentProjectToken = token;
};

const getHeaders = () => {
  if (currentProjectToken) {
    return {
      'Authorization': `Bearer ${currentProjectToken}`,
    };
  }
  return {};
};

export interface EmailSender {
  email: string;
  name: string;
  label: string;
}

export const campaignsApi = {
  // Get available SMS senders for the user
  getSenders: async (): Promise<{ senders: string[]; default: string }> => {
    const response = await campaignClient.get('/senders', { headers: getHeaders() });
    return response.data.data;
  },

  // Get available email senders for the user
  getEmailSenders: async (): Promise<{ senders: EmailSender[]; default: EmailSender }> => {
    const response = await campaignClient.get('/email-senders', { headers: getHeaders() });
    return response.data.data;
  },

  // Segment attributes
  getAttributes: async (): Promise<{ attributes: AttributeSchema[] }> => {
    const response = await campaignClient.get('/segments/attributes', { headers: getHeaders() });
    return response.data.data;
  },

  // Preview segment
  previewSegment: async (filter: SegmentFilter, previewLimit: number = 10) => {
    const response = await campaignClient.post('/segments/preview', {
      filter,
      preview_limit: previewLimit,
    }, { headers: getHeaders() });
    return response.data.data;
  },

  // Preview segment with rendered messages
  previewSegmentMessages: async (params: {
    filter: SegmentFilter;
    channel: CampaignChannel;
    message_template?: string;
    email_subject_template?: string;
    email_body_template?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    contacts: PlannedContact[];
    total: number;
    sms_total: number;
    email_total: number;
    page: number;
    per_page: number;
    total_pages: number;
  }> => {
    const response = await campaignClient.post('/segments/preview-messages', params, { headers: getHeaders() });
    return response.data.data;
  },

  // Validate segment
  validateSegment: async (filter: SegmentFilter) => {
    const response = await campaignClient.post('/segments/validate', { filter }, { headers: getHeaders() });
    return response.data;
  },

  // List campaigns
  list: async (status?: string, perPage: number = 20) => {
    const params: any = { per_page: perPage };
    if (status) params.status = status;
    const response = await campaignClient.get('/campaigns', { params, headers: getHeaders() });
    return response.data.data;
  },

  // Get campaign
  get: async (id: number): Promise<{ campaign: Campaign }> => {
    const response = await campaignClient.get(`/campaigns/${id}`, { headers: getHeaders() });
    return response.data.data;
  },

  // Create campaign
  create: async (data: {
    name: string;
    channel: CampaignChannel;
    sender?: string;
    email_sender?: string;
    email_display_name?: string;
    message_template?: string;
    email_subject_template?: string;
    email_body_template?: string;
    segment_filter: SegmentFilter;
    scheduled_at?: string;
    is_test?: boolean;
  }): Promise<{ campaign: Campaign }> => {
    const response = await campaignClient.post('/campaigns', data, { headers: getHeaders() });
    return response.data.data;
  },

  // Update campaign
  update: async (id: number, data: Partial<Campaign>) => {
    const response = await campaignClient.put(`/campaigns/${id}`, data, { headers: getHeaders() });
    return response.data.data;
  },

  // Delete campaign
  delete: async (id: number) => {
    await campaignClient.delete(`/campaigns/${id}`, { headers: getHeaders() });
  },

  // Cancel campaign
  cancel: async (id: number) => {
    const response = await campaignClient.post(`/campaigns/${id}/cancel`, {}, { headers: getHeaders() });
    return response.data.data;
  },

  // Activate automated campaign
  activate: async (id: number, confirm: boolean = false) => {
    const response = await campaignClient.post(`/campaigns/${id}/activate`, { confirm }, { headers: getHeaders() });
    return response.data;
  },

  // Pause automated campaign
  pause: async (id: number) => {
    const response = await campaignClient.post(`/campaigns/${id}/pause`, {}, { headers: getHeaders() });
    return response.data.data;
  },

  // Test send to X customers
  testSend: async (id: number, count: number): Promise<{
    sent: number;
    messages: Array<{ phone: string; message: string; status: string; transaction_id?: string; error?: string }>;
  }> => {
    const response = await campaignClient.post(`/campaigns/${id}/test-send`, { count }, { headers: getHeaders() });
    return response.data.data;
  },

  // Test send to custom phone/email
  testSendCustom: async (id: number, params: { phone?: string; email?: string; sampleContactId?: number }): Promise<{
    sms?: {
      phone: string;
      message: string;
      segments?: number;
      cost: number;
      status: string;
      error?: string;
      test_mode?: boolean;
    };
    email?: {
      email: string;
      subject: string;
      cost: number;
      status: string;
      error?: string;
      test_mode?: boolean;
    };
    sample_contact_id: number;
  }> => {
    const response = await campaignClient.post(`/campaigns/${id}/test-send-custom`, {
      phone: params.phone,
      email: params.email,
      sample_contact_id: params.sampleContactId,
    }, { headers: getHeaders() });
    return response.data.data;
  },

  // Retry failed messages
  retryFailed: async (id: number): Promise<{
    retried: number;
    skipped: number;
    messages: Array<{ phone: string; status: string; error?: string }>;
  }> => {
    const response = await campaignClient.post(`/campaigns/${id}/retry-failed`, {}, { headers: getHeaders() });
    return response.data.data;
  },

  // Get campaign stats
  getStats: async (id: number): Promise<{ campaign: Campaign; stats: CampaignStats }> => {
    const response = await campaignClient.get(`/campaigns/${id}/stats`, { headers: getHeaders() });
    return response.data.data;
  },

  // Preview campaign messages (considers cooldown)
  previewMessages: async (id: number, limit: number = 5): Promise<{ previews: MessagePreview[]; campaign: Campaign; total_count: number; sms_total: number; email_total: number }> => {
    const response = await campaignClient.get(`/campaigns/${id}/preview`, {
      params: { limit },
      headers: getHeaders(),
    });
    return response.data.data;
  },

  // Validate campaign
  validateCampaign: async (id: number) => {
    const response = await campaignClient.post(`/campaigns/${id}/validate`, {}, { headers: getHeaders() });
    return response.data;
  },

  // Execute campaign
  execute: async (id: number) => {
    const response = await campaignClient.post(`/campaigns/${id}/execute`, {}, { headers: getHeaders() });
    return response.data;
  },

  // Execute test campaign
  executeTest: async (id: number) => {
    const response = await campaignClient.post(`/campaigns/${id}/execute-test`, {}, { headers: getHeaders() });
    return response.data;
  },

  // Duplicate campaign
  duplicate: async (id: number): Promise<{ campaign: Campaign }> => {
    const response = await campaignClient.post(`/campaigns/${id}/duplicate`, {}, { headers: getHeaders() });
    return response.data.data;
  },

  // Contacts
  listContacts: async (perPage: number = 50) => {
    const response = await campaignClient.get('/contacts', {
      params: { per_page: perPage },
      headers: getHeaders(),
    });
    return response.data.data;
  },

  // Schema
  getSchema: async () => {
    const response = await campaignClient.get('/clients/schema', { headers: getHeaders() });
    return response.data.data;
  },

  registerSchema: async (attributes: any[]) => {
    const response = await campaignClient.post('/clients/schema', { attributes }, { headers: getHeaders() });
    return response.data.data;
  },

  // Saved Segments
  listSavedSegments: async (perPage: number = 20) => {
    const response = await campaignClient.get('/saved-segments', {
      params: { per_page: perPage },
      headers: getHeaders(),
    });
    return response.data.data;
  },

  createSavedSegment: async (data: { name: string; description?: string; filter_config: SegmentFilter }) => {
    const response = await campaignClient.post('/saved-segments', data, { headers: getHeaders() });
    return response.data.data;
  },

  getSavedSegment: async (id: number) => {
    const response = await campaignClient.get(`/saved-segments/${id}`, { headers: getHeaders() });
    return response.data.data;
  },

  updateSavedSegment: async (id: number, data: any) => {
    const response = await campaignClient.put(`/saved-segments/${id}`, data, { headers: getHeaders() });
    return response.data.data;
  },

  deleteSavedSegment: async (id: number) => {
    await campaignClient.delete(`/saved-segments/${id}`, { headers: getHeaders() });
  },

  // Get campaign message history
  getCampaignMessages: async (id: number, page: number = 1, perPage: number = 20): Promise<{
    messages: CampaignMessage[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> => {
    const response = await campaignClient.get(`/campaigns/${id}/messages`, {
      params: { page, per_page: perPage },
      headers: getHeaders(),
    });
    return response.data.data;
  },

  // Get planned messages (contacts that will receive SMS on next run)
  getPlannedMessages: async (id: number, page: number = 1, perPage: number = 10): Promise<{
    contacts: PlannedContact[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      sms_total: number;
      email_total: number;
    };
    next_run_at: string | null;
  }> => {
    const response = await campaignClient.get(`/campaigns/${id}/planned`, {
      params: { page, per_page: perPage },
      headers: getHeaders(),
    });
    return response.data.data;
  },
};
