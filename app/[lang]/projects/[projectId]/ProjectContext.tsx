'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { serviceTypesApi, type ServiceType } from '@/lib/api';
import { projectsApi, type Project } from '@/lib/api/projects';

interface ProjectContextValue {
  projectId: number;
  project: Project | null;
  projectLoading: boolean;
  serviceTypes: ServiceType[];
  serviceTypesLoading: boolean;
  refreshServiceTypes: () => Promise<void>;
  refreshProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

interface ProjectProviderProps {
  projectId: number;
  children: ReactNode;
}

export function ProjectProvider({ projectId, children }: ProjectProviderProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(true);
  const fetchedRef = useRef(false);

  const refreshServiceTypes = useCallback(async () => {
    setServiceTypesLoading(true);
    try {
      const types = await serviceTypesApi.list(projectId);
      setServiceTypes(types);
    } catch (error) {
      console.error('Failed to fetch service types:', error);
    } finally {
      setServiceTypesLoading(false);
    }
  }, [projectId]);

  const fetchProject = useCallback(async () => {
    setProjectLoading(true);
    try {
      const response = await projectsApi.get(projectId);
      setProject(response.project);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setProjectLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    // Prevent double fetch in StrictMode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchProject();
    refreshServiceTypes();
  }, [fetchProject, refreshServiceTypes]);

  return (
    <ProjectContext.Provider value={{ projectId, project, projectLoading, serviceTypes, serviceTypesLoading, refreshServiceTypes, refreshProject: fetchProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
