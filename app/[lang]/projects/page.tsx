'use client';

import { useEffect, useState } from 'react';
import { projectsApi, Project } from '@/lib/api/projects';
import { useProject } from '@/contexts/ProjectContext';
import { useTranslations } from 'next-intl';
import { Plus, Server, ArrowRight, Users, Package, Send } from 'lucide-react';
import { Link } from '@/lib/navigation';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedProject, selectedProject } = useProject();
  const t = useTranslations();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.list();
      setProjects(data.projects);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await projectsApi.create(formData);
      setSelectedProject(result.project);
      await loadProjects();
      setShowAddModal(false);
      setFormData({ name: '', description: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', description: '' });
    setShowAddModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="relative inline-flex">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">{t('smsApi.projects.loadingProjects')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('smsApi.projects.title')}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('smsApi.projects.description')}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="cursor-pointer group relative px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 hover:shadow-lg hover:scale-105 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('smsApi.projects.addProject')}
            </span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative mb-6 rounded-3xl p-6 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200/30 dark:border-red-800/30">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="relative rounded-3xl p-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 text-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-50"></div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Server className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t('smsApi.projects.noProjects')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {t('smsApi.projects.noProjectsDesc')}
              </p>
              <button
                onClick={openAddModal}
                className="cursor-pointer px-8 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                {t('smsApi.projects.createProject')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group relative block"
              >
                {/* Glass Card */}
                <div className={`relative h-full rounded-3xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border transition-all duration-300 ${
                  selectedProject?.id === project.id
                    ? 'border-indigo-500/50 dark:border-indigo-400/50 shadow-lg shadow-indigo-500/20'
                    : 'border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-400/10 hover:border-indigo-200 dark:hover:border-indigo-800'
                }`}>

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col">
                    {/* Project Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <Server className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {project.name}
                          </h3>
                        </div>
                        {project.settings?.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {project.settings.description}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-xs font-medium ${
                        project.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400'
                      }`}>
                        {project.status === 'active' ? t('smsApi.projects.active') : t('smsApi.projects.suspended')}
                      </span>
                    </div>

                    {/* Stats */}
                    {project.stats && (
                      <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Users className="w-4 h-4 text-indigo-500" />
                            <div className="text-2xl font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {project.stats.customers_count}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{t('smsApi.projects.customers')}</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Package className="w-4 h-4 text-blue-500" />
                            <div className="text-2xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                              {project.stats.service_types_count}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{t('smsApi.projects.serviceTypes')}</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Send className="w-4 h-4 text-emerald-500" />
                            <div className="text-2xl font-bold bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                              {project.stats.campaigns_count}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{t('smsApi.projects.campaigns')}</div>
                        </div>
                      </div>
                    )}

                    {/* Open Project Button */}
                    <div className="mt-auto">
                      <div className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-[1.02]">
                        {t('smsApi.projects.openProject')}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md animate-in zoom-in duration-200">
              {/* Modal Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-3xl"></div>

              {/* Modal Card */}
              <div className="relative rounded-3xl p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {t('smsApi.projects.addProjectTitle')}
                  </span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('smsApi.projects.projectName')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('smsApi.projects.projectNamePlaceholder')}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('smsApi.projects.projectDescription')}
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('smsApi.projects.projectDescriptionPlaceholder')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setFormData({ name: '', description: '' });
                      }}
                      className="cursor-pointer flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {t('common.create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
