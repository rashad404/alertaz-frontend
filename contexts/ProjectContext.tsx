'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '@/lib/api/projects';
import { setProjectToken } from '@/lib/api/campaigns';

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProjectState] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected project from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProjectId = localStorage.getItem('selectedProjectId');
      const savedProjects = localStorage.getItem('projects');

      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects);
          setProjects(parsedProjects);

          if (savedProjectId) {
            const project = parsedProjects.find((p: Project) => p.id === parseInt(savedProjectId));
            if (project) {
              setSelectedProjectState(project);
              setProjectToken(project.api_token);
            }
          }
        } catch (e) {
          console.error('Failed to parse saved projects:', e);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const setSelectedProject = (project: Project | null) => {
    setSelectedProjectState(project);
    if (typeof window !== 'undefined') {
      if (project) {
        localStorage.setItem('selectedProjectId', project.id.toString());
        setProjectToken(project.api_token);
      } else {
        localStorage.removeItem('selectedProjectId');
        setProjectToken(null);
      }
    }
  };

  const setProjectsAndCache = (newProjects: Project[]) => {
    setProjects(newProjects);
    if (typeof window !== 'undefined') {
      localStorage.setItem('projects', JSON.stringify(newProjects));
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        selectedProject,
        setSelectedProject,
        projects,
        setProjects: setProjectsAndCache,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
