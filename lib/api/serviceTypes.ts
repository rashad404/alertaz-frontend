import apiClient from './client';
import type { ApiResponse, ServiceType, FieldDefinition } from '../types/api';

export interface CreateServiceTypeData {
  key: string;
  label: Record<string, string>;
  icon?: string;
  user_link_field?: string;
  fields?: Record<string, FieldDefinition>;
  display_order?: number;
}

export const serviceTypesApi = {
  list: async (projectId: number): Promise<ServiceType[]> => {
    const response = await apiClient.get<ApiResponse<ServiceType[]>>(`/projects/${projectId}/service-types`);
    return response.data.data;
  },

  get: async (projectId: number, key: string): Promise<ServiceType> => {
    const response = await apiClient.get<ApiResponse<ServiceType>>(`/projects/${projectId}/service-types/${key}`);
    return response.data.data;
  },

  create: async (projectId: number, data: CreateServiceTypeData): Promise<ServiceType> => {
    const response = await apiClient.post<ApiResponse<ServiceType>>(`/projects/${projectId}/service-types`, data);
    return response.data.data;
  },

  update: async (projectId: number, key: string, data: Partial<CreateServiceTypeData>): Promise<ServiceType> => {
    const response = await apiClient.put<ApiResponse<ServiceType>>(`/projects/${projectId}/service-types/${key}`, data);
    return response.data.data;
  },

  delete: async (projectId: number, key: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/service-types/${key}`);
  },
};

export default serviceTypesApi;
