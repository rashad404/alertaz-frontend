'use client';

import { useState, useMemo } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Link } from '@/lib/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Send,
  FileText,
  Settings,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  Code2,
} from 'lucide-react';
import { ProjectProvider, useProject } from './ProjectContext';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

function ProjectLayoutContent({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const { serviceTypes } = useProject();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['services']));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const basePath = `/projects/${projectId}`;

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        href: basePath,
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        key: 'customers',
        label: 'Customers',
        href: `${basePath}/customers`,
        icon: <Users className="w-5 h-5" />,
      },
    ];

    if (serviceTypes.length > 0) {
      items.push({
        key: 'services',
        label: 'Services',
        href: '#',
        icon: <Package className="w-5 h-5" />,
        children: serviceTypes.map((st) => ({
          key: `service-${st.key}`,
          label: st.label?.en || st.key,
          href: `${basePath}/services/${st.key}`,
          icon: <Package className="w-4 h-4" />,
        })),
      });
    }

    items.push(
      {
        key: 'campaigns',
        label: 'Campaigns',
        href: `${basePath}/campaigns`,
        icon: <Send className="w-5 h-5" />,
      },
      {
        key: 'messages',
        label: 'Sent Messages',
        href: `${basePath}/messages`,
        icon: <MessageSquare className="w-5 h-5" />,
      },
      {
        key: 'templates',
        label: 'Templates',
        href: `${basePath}/templates`,
        icon: <FileText className="w-5 h-5" />,
      },
      {
        key: 'api',
        label: 'API',
        href: `${basePath}/api`,
        icon: <Code2 className="w-5 h-5" />,
      },
      {
        key: 'settings',
        label: 'Settings',
        href: `${basePath}/settings`,
        icon: <Settings className="w-5 h-5" />,
      }
    );

    return items;
  }, [basePath, serviceTypes]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    if (href === '#') return false;
    if (href === basePath) {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.key);
    const active = isActive(item.href);

    if (hasChildren) {
      return (
        <div key={item.key}>
          <button
            onClick={() => toggleSection(item.key)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
              <span className="text-xs text-gray-500">({item.children!.length})</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.key}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? 'bg-purple-500/20 text-purple-400'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-30 bg-gray-900/95 backdrop-blur-lg border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/projects"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Projects</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 z-40 w-64 bg-gray-900/95 backdrop-blur-lg border-r border-gray-700 transform transition-transform duration-300 lg:translate-x-0 top-28 h-[calc(100%-7rem)] lg:top-14 lg:h-[calc(100%-3.5rem)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700">
            <Link
              href="/projects"
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Projects
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => renderNavItem(item))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">{children}</main>
    </div>
  );
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = Number(params.projectId);

  return (
    <ProjectProvider projectId={projectId}>
      <ProjectLayoutContent>{children}</ProjectLayoutContent>
    </ProjectProvider>
  );
}
