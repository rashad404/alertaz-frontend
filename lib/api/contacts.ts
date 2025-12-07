import axios from 'axios';

// Create a separate axios instance for contacts API calls
// This instance uses project API token
const contactsClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Types
export interface Contact {
  id: number;
  client_id: number;
  phone: string;
  attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContactsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ContactsListResponse {
  contacts: Contact[];
  pagination: ContactsPagination;
}

export interface BulkSyncResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
}

// Helper to set project token
let currentProjectToken: string | null = null;

export const setContactsProjectToken = (token: string | null) => {
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

export const contactsApi = {
  // List contacts with optional search
  list: async (page: number = 1, perPage: number = 20, search?: string): Promise<ContactsListResponse> => {
    const params: Record<string, any> = { page, per_page: perPage };
    if (search) params.search = search;

    const response = await contactsClient.get('/contacts', {
      params,
      headers: getHeaders()
    });
    return response.data.data;
  },

  // Create single contact
  create: async (phone: string, attributes: Record<string, any> = {}): Promise<{ contact: Contact }> => {
    const response = await contactsClient.post('/contacts', {
      phone,
      attributes
    }, { headers: getHeaders() });
    return response.data.data;
  },

  // Update contact by phone
  update: async (phone: string, data: { phone?: string; attributes?: Record<string, any> }): Promise<{ contact: Contact }> => {
    const response = await contactsClient.put(`/contacts/${phone}`, data, { headers: getHeaders() });
    return response.data.data;
  },

  // Delete single contact
  delete: async (phone: string): Promise<void> => {
    await contactsClient.delete(`/contacts/${phone}`, { headers: getHeaders() });
  },

  // Bulk delete contacts
  bulkDelete: async (phones: string[]): Promise<{ deleted: number }> => {
    const response = await contactsClient.post('/contacts/bulk-delete', { phones }, { headers: getHeaders() });
    return response.data.data;
  },

  // Sync single contact (create or update)
  sync: async (phone: string, attributes: Record<string, any>): Promise<{
    contact_id: number;
    phone: string;
    created: boolean;
    updated: boolean;
  }> => {
    const response = await contactsClient.post('/contacts/sync', {
      phone,
      attributes
    }, { headers: getHeaders() });
    return response.data.data;
  },

  // Bulk sync contacts
  bulkSync: async (contacts: Array<{ phone: string; attributes: Record<string, any> }>): Promise<BulkSyncResult> => {
    const response = await contactsClient.post('/contacts/sync/bulk', { contacts }, { headers: getHeaders() });
    return response.data.data;
  },

  // Export contacts to CSV (returns blob)
  export: async (): Promise<Blob> => {
    const response = await contactsClient.get('/contacts/export', {
      headers: getHeaders(),
      responseType: 'blob',
    });
    return response.data;
  },

  // Helper to download exported CSV
  downloadExport: async (filename?: string): Promise<void> => {
    const blob = await contactsApi.export();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `contacts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
