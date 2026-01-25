import apiClient from './client';
import type { ApiResponse, Template } from '../types/api';

export interface CreateTemplateData {
  name: string;
  channel: 'sms' | 'email' | 'both';
  message_template?: string;
  email_subject?: string;
  email_body?: string;
  is_default?: boolean;
}

export const templatesApi = {
  list: async (projectId: number, channel?: 'sms' | 'email', search?: string): Promise<Template[]> => {
    const response = await apiClient.get<ApiResponse<Template[]>>(`/projects/${projectId}/templates`, {
      params: { channel, search },
    });
    return response.data.data;
  },

  create: async (projectId: number, data: CreateTemplateData): Promise<Template> => {
    const response = await apiClient.post<ApiResponse<Template>>(`/projects/${projectId}/templates`, data);
    return response.data.data;
  },

  update: async (projectId: number, templateId: number, data: Partial<CreateTemplateData>): Promise<Template> => {
    const response = await apiClient.put<ApiResponse<Template>>(`/projects/${projectId}/templates/${templateId}`, data);
    return response.data.data;
  },

  delete: async (projectId: number, templateId: number): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/templates/${templateId}`);
  },
};

export default templatesApi;
