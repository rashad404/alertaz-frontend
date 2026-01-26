'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Code2, Copy, Check, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { useProject } from '../ProjectContext';
import { projectsApi } from '@/lib/api/projects';

export default function ProjectApiPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const t = useTranslations();
  const { project, refreshProject } = useProject();

  const [copiedToken, setCopiedToken] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRegenerateToken = async () => {
    if (!confirm(t('smsApi.projects.confirmRegenerate'))) return;

    try {
      setIsRegenerating(true);
      setError(null);
      await projectsApi.regenerateToken(projectId);
      await refreshProject();
      alert(t('smsApi.projects.tokenRegenerated'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to regenerate token');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('projectApi.title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('projectApi.subtitle')}</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* API Token Section */}
        <div className="relative rounded-3xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('smsApi.apiToken')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('smsApi.apiTokenDescription')}</p>

          <div className="flex gap-2">
            <input
              type="password"
              value={project.api_token}
              readOnly
              className="flex-1 text-sm bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-mono backdrop-blur-sm"
            />
            <button
              onClick={() => copyToClipboard(project.api_token)}
              className={`px-4 py-3 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
                copiedToken
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title={t('smsApi.projects.copyToken')}
            >
              {copiedToken ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span className="hidden sm:inline">{copiedToken ? t('common.copied') : t('common.copy')}</span>
            </button>
            <button
              onClick={handleRegenerateToken}
              disabled={isRegenerating}
              className="px-4 py-3 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              title={t('smsApi.projects.regenerateToken')}
            >
              <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('projectApi.regenerate')}</span>
            </button>
          </div>
        </div>

        {/* API Documentation Links */}
        <div className="relative rounded-3xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('projectApi.documentation')}</h2>

          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/docs/project-api"
              className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-800/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">{t('projectApi.projectApiDocs')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('projectApi.projectApiDocsDesc')}</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Quick Example */}
        <div className="relative rounded-3xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('projectApi.quickExample')}</h2>

          <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-4 overflow-x-auto">
            <pre className="text-sm text-gray-300 font-mono">
              <code>{`curl -X POST https://alert.az/api/v1/customers/sync \\
  -H "Authorization: Bearer ${project.api_token.substring(0, 20)}..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customers": [
      {
        "phone": "994501234567",
        "email": "customer@example.com",
        "attributes": { "name": "John" }
      }
    ]
  }'`}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
