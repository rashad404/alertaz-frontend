import apiClient from './client';

export interface AlertType {
  id: number;
  slug: string;
  name: any; // Translatable
  description?: any; // Translatable
  icon?: string;
  assets?: Record<string, string>;
  operators?: Record<string, { label: string; symbol: string }>;
  condition_fields: Record<string, string>;
  check_interval: number;
  is_active: boolean;
}

export interface AlertCondition {
  field: string;
  operator: 'equals' | 'greater' | 'greater_equal' | 'less' | 'less_equal' | 'not_equals';
  value: number | string;
}

export interface PersonalAlert {
  id?: number;
  user_id?: number;
  alert_type_id: number;
  name: string;
  asset?: string;
  conditions: AlertCondition;
  notification_channels: string[];
  check_frequency?: number;
  is_active?: boolean;
  is_recurring?: boolean;
  last_triggered_at?: string;
  last_checked_at?: string;
  trigger_count?: number;
  alertType?: AlertType;
  created_at?: string;
  updated_at?: string;
}

export interface ChannelValidation {
  [channel: string]: {
    available: boolean;
    status: 'ready' | 'missing';
    message: string;
  };
}

export interface ChannelValidationResponse {
  channels: ChannelValidation;
  available_channels: string[];
  all_channels_ready: boolean;
}

export interface AlertHistory {
  id: number;
  personal_alert_id: number;
  triggered_conditions: AlertCondition;
  current_values: any;
  notification_channels: string[];
  delivery_status: Record<string, string>;
  message?: string;
  triggered_at: string;
}

class AlertsService {
  // Get all available alert types
  async getAlertTypes(): Promise<AlertType[]> {
    const response = await apiClient.get('/alert-types');
    return response.data.data;
  }

  // Validate notification channels
  async validateChannels(channels: string[]): Promise<ChannelValidationResponse> {
    const response = await apiClient.post('/alerts/validate-channels', { channels });
    return response.data.data;
  }

  // Get user's alerts
  async getUserAlerts(page = 1): Promise<any> {
    const response = await apiClient.get('/alerts', { params: { page } });
    return response.data.data;
  }

  // Get single alert with history
  async getAlert(id: number): Promise<PersonalAlert> {
    const response = await apiClient.get(`/alerts/${id}`);
    return response.data.data;
  }

  // Create new alert
  async createAlert(alert: PersonalAlert): Promise<PersonalAlert> {
    const response = await apiClient.post('/alerts', alert);
    return response.data.data;
  }

  // Update alert
  async updateAlert(id: number, alert: Partial<PersonalAlert>): Promise<PersonalAlert> {
    const response = await apiClient.put(`/alerts/${id}`, alert);
    return response.data.data;
  }

  // Toggle alert active status
  async toggleAlert(id: number): Promise<PersonalAlert> {
    const response = await apiClient.post(`/alerts/${id}/toggle`);
    return response.data.data;
  }

  // Delete alert
  async deleteAlert(id: number): Promise<void> {
    await apiClient.delete(`/alerts/${id}`);
  }

  // Helper function to get notification channel icon
  getChannelIcon(channel: string): string {
    const icons: Record<string, string> = {
      email: '✉️',
      sms: '📱',
      telegram: '✈️',
      whatsapp: '💬',
      slack: '#️⃣',
      push: '🔔',
    };
    return icons[channel] || '📬';
  }

  // Helper function to get notification channel label
  getChannelLabel(channel: string): string {
    const labels: Record<string, string> = {
      email: 'Email',
      sms: 'SMS',
      telegram: 'Telegram',
      whatsapp: 'WhatsApp',
      slack: 'Slack',
      push: 'Push Notification',
    };
    return labels[channel] || channel;
  }
}

export default new AlertsService();