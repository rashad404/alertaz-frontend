// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// Service Type
export interface ServiceType {
  id: number;
  key: string;
  label: Record<string, string>;
  icon?: string;
  user_link_field: string;
  fields: Record<string, FieldDefinition>;
  display_order: number;
  services_count?: number;
  created_at: string;
  updated_at: string;
}

export interface FieldDefinition {
  type: 'string' | 'number' | 'date' | 'enum' | 'boolean';
  label?: string;
  required?: boolean;
  options?: string[];
}

// Customer
export interface Customer {
  id: number;
  external_id?: string;
  phone?: string;
  email?: string;
  name?: string;
  data?: Record<string, any>;
  services_count?: number;
  created_at: string;
  updated_at: string;
}

// Service
export interface Service {
  id: number;
  external_id?: string;
  name: string;
  expiry_at?: string;
  days_until_expiry?: number;
  status?: string;
  data?: Record<string, any>;
  customer?: {
    id: number;
    name?: string;
    phone?: string;
    email?: string;
  };
  created_at: string;
  updated_at: string;
}

// Campaign
export interface Campaign {
  id: number;
  name: string;
  target_type?: 'customer' | 'service';
  service_type_id?: number;
  service_type_key?: string;
  service_type?: {
    key: string;
    label: Record<string, string>;
  };
  channel: 'sms' | 'email' | 'both';
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'active' | 'paused' | 'cancelled' | 'failed';
  type?: 'one_time' | 'automated';
  campaign_type?: 'one_time' | 'automated';
  message_template?: string;
  email_subject?: string;
  email_body?: string;
  email_subject_template?: string;
  email_body_template?: string;
  sender?: string;
  email_sender?: string;
  email_display_name?: string;
  filter?: FilterConfig;
  segment_filter?: FilterConfig;
  scheduled_at?: string;
  check_interval_minutes?: number;
  cooldown_days?: number;
  run_start_hour?: number | null;
  run_end_hour?: number | null;
  ends_at?: string;
  next_run_at?: string;
  last_run_at?: string;
  run_count?: number;
  pause_reason?: string;
  is_test?: boolean;
  target_count?: number;
  sent_count?: number;
  delivered_count?: number;
  failed_count?: number;
  email_sent_count?: number;
  email_delivered_count?: number;
  email_failed_count?: number;
  sent_today_count?: number;
  total_cost?: number;
  email_total_cost?: number;
  stats?: {
    target_count: number;
    total_sent: number;
    total_delivered: number;
    total_failed: number;
    total_cost: number;
    sent?: number;
  };
  created_at?: string;
  updated_at?: string;
}

// Filter
export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
}

export interface FilterConfig {
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
}

// Template
export interface Template {
  id: number;
  name: string;
  channel: 'sms' | 'email' | 'both';
  message_template?: string;
  email_subject?: string;
  email_body?: string;
  variables?: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Message
export interface Message {
  id: number;
  campaign_id?: number;
  customer_id?: number;
  service_id?: number;
  channel: 'sms' | 'email';
  recipient: string;
  content: string;
  subject?: string;
  sender?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
  error_message?: string;
  cost: number;
  segments: number;
  sent_at?: string;
  delivered_at?: string;
  created_at: string;
}

// Sync Results
export interface SyncResult {
  created: number;
  updated: number;
  errors: Array<{
    index: number;
    message: string;
  }>;
}

// Send Result
export interface SendResult {
  sms: {
    status: 'sent' | 'failed' | 'skipped';
    message_id?: number;
    error?: string;
  };
  email: {
    status: 'sent' | 'failed' | 'skipped';
    message_id?: number;
    error?: string;
  };
}

// Stats
export interface ServiceStats {
  total: number;
  active: number;
  suspended: number;
  expired: number;
  expiring_7_days: number;
  expiring_30_days: number;
}

export interface CampaignStats {
  target_count: number;
  sms: {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  };
  email: {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  };
  total_cost: number;
  run_count: number;
  last_run_at?: string;
  next_run_at?: string;
}
