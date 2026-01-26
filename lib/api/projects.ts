import apiClient from './client';

export interface Project {
  id: number;
  name: string;
  status: 'active' | 'suspended' | 'deleted';
  api_token: string;
  settings: {
    description?: string;
  };
  created_at: string;
  stats?: {
    customers_count: number;
    service_types_count: number;
    campaigns_count: number;
    active_campaigns: number;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'active' | 'suspended';
}

export const projectsApi = {
  // List user's projects
  list: async (): Promise<{ projects: Project[] }> => {
    const response = await apiClient.get('/projects');
    return response.data.data;
  },

  // Get single project
  get: async (id: number): Promise<{ project: Project }> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.data;
  },

  // Create new project
  create: async (data: CreateProjectData): Promise<{ project: Project }> => {
    const response = await apiClient.post('/projects', data);
    return response.data.data;
  },

  // Update project
  update: async (id: number, data: UpdateProjectData): Promise<{ project: Project }> => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data.data;
  },

  // Delete project
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  // Regenerate API token
  regenerateToken: async (id: number): Promise<{ api_token: string }> => {
    const response = await apiClient.post(`/projects/${id}/regenerate-token`);
    return response.data.data;
  },
};
