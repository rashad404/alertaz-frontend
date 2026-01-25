'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  AlertCircle,
  Smartphone,
  Mail,
} from 'lucide-react';
import { templatesApi, type Template, type CreateTemplateData } from '@/lib/api';

export default function TemplatesPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const fetchedRef = useRef(false);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    channel: 'sms' | 'email' | 'both';
    message_template: string;
    email_subject: string;
    email_body: string;
  }>({
    name: '',
    channel: 'sms',
    message_template: '',
    email_subject: '',
    email_body: '',
  });

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchTemplates();
  }, [projectId]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templatesApi.list(projectId);
      setTemplates(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      channel: 'sms',
      message_template: '',
      email_subject: '',
      email_body: '',
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    setEditingTemplate(null);
  };

  const handleEdit = (template: Template) => {
    setFormData({
      name: template.name,
      channel: template.channel,
      message_template: template.message_template || '',
      email_subject: template.email_subject || '',
      email_body: template.email_body || '',
    });
    setEditingTemplate(template);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    resetForm();
  };

  const handleSave = async () => {
    try {
      const data: CreateTemplateData = {
        name: formData.name,
        channel: formData.channel,
      };

      if (formData.channel === 'sms' || formData.channel === 'both') {
        data.message_template = formData.message_template;
      }

      if (formData.channel === 'email' || formData.channel === 'both') {
        data.email_subject = formData.email_subject;
        data.email_body = formData.email_body;
      }

      if (editingTemplate) {
        await templatesApi.update(projectId, editingTemplate.id, data);
      } else {
        await templatesApi.create(projectId, data);
      }

      await fetchTemplates();
      handleCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      await templatesApi.delete(projectId, id);
      await fetchTemplates();
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    }
  };

  const isFormOpen = isCreating || editingTemplate !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Reusable message templates for quick sending</p>
            </div>
          </div>
          {!isFormOpen && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Create/Edit Form */}
        {isFormOpen && (
          <div className="relative rounded-3xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTemplate ? `Edit: ${editingTemplate.name}` : 'New Template'}
              </h2>
              <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hosting Expiry Reminder"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Channel</label>
              <div className="flex gap-3">
                {(['sms', 'email', 'both'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setFormData({ ...formData, channel: ch })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      formData.channel === ch
                        ? ch === 'sms'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : ch === 'email'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                          : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {ch === 'sms' && <Smartphone className="w-4 h-4" />}
                    {ch === 'email' && <Mail className="w-4 h-4" />}
                    {ch === 'both' && (
                      <>
                        <Smartphone className="w-4 h-4" />
                        <Mail className="w-4 h-4" />
                      </>
                    )}
                    <span className="capitalize">{ch}</span>
                  </button>
                ))}
              </div>
            </div>

            {(formData.channel === 'sms' || formData.channel === 'both') && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">SMS Message</label>
                <textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  rows={4}
                  placeholder="Dear {{name}}, your service expires on {{expiry_at}}..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">{formData.message_template.length} characters</div>
              </div>
            )}

            {(formData.channel === 'email' || formData.channel === 'both') && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={formData.email_subject}
                    onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                    placeholder="Your service expires soon"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email Body</label>
                  <textarea
                    value={formData.email_body}
                    onChange={(e) => setFormData({ ...formData, email_body: e.target.value })}
                    rows={6}
                    placeholder="Dear {{name}},\n\nYour service will expire soon..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className="relative rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No templates yet</p>
              <p className="text-gray-500 text-sm">Create a template to speed up your messaging</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {templates.map((template) => (
                <div key={template.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        template.channel === 'sms'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30'
                          : template.channel === 'email'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30'
                          : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}
                    >
                      {template.channel === 'sms' && <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                      {template.channel === 'email' && <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                      {template.channel === 'both' && <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{template.name}</div>
                      <div className="text-sm text-gray-500">
                        {template.channel === 'sms' && template.message_template?.slice(0, 50)}
                        {template.channel === 'email' && template.email_subject}
                        {template.channel === 'both' && `SMS + Email`}
                        {((template.channel === 'sms' && (template.message_template?.length || 0) > 50) ||
                          (template.channel !== 'sms')) &&
                          '...'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        template.channel === 'sms'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : template.channel === 'email'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}
                    >
                      {template.channel.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
