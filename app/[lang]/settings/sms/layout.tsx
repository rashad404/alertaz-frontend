import { ProjectProvider } from '@/contexts/ProjectContext';

export default function SmsLayout({
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
