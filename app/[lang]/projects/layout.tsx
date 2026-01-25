import { ProjectProvider } from '@/contexts/ProjectContext';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      {children}
    </ProjectProvider>
  );
}
