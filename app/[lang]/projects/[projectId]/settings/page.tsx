'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Settings,
  Package,
  Plus,
  Trash2,
  Edit2,
  X,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { serviceTypesApi, type CreateServiceTypeData } from '@/lib/api';
import { projectsApi } from '@/lib/api/projects';
import { useProject } from '../ProjectContext';

interface FieldDefinition {
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  label: string;
  required?: boolean;
  options?: string[];
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);
  const t = useTranslations();
  const { project, serviceTypes, serviceTypesLoading: loading, refreshServiceTypes, refreshProject } = useProject();

  const [error, setError] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<ReturnType<typeof useProject>['serviceTypes'][0] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [generalExpanded, setGeneralExpanded] = useState(true);
  const [serviceTypesExpanded, setServiceTypesExpanded] = useState(true);

  // General settings state
  const [generalFormData, setGeneralFormData] = useState({
    name: '',
    description: '',
  });
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize general form data when project loads
  useEffect(() => {
    if (project) {
      setGeneralFormData({
        name: project.name,
        description: project.settings?.description || '',
      });
    }
  }, [project]);

  const [formData, setFormData] = useState<{
    key: string;
    label: { az: string; en: string; ru: string };
    icon: string;
    fields: Record<string, FieldDefinition>;
  }>({
    key: '',
    label: { az: '', en: '', ru: '' },
    icon: 'package',
    fields: {},
  });

  const [newField, setNewField] = useState({
    name: '',
    type: 'string' as FieldDefinition['type'],
    label: '',
    required: false,
    options: '',
  });

  const resetForm = () => {
    setFormData({
      key: '',
      label: { az: '', en: '', ru: '' },
      icon: 'package',
      fields: {},
    });
    setNewField({
      name: '',
      type: 'string',
      label: '',
      required: false,
      options: '',
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
    setEditingType(null);
  };

  const handleEdit = (st: any) => {
    setFormData({
      key: st.key,
      label: st.label || { az: '', en: '', ru: '' },
      icon: st.icon || 'package',
      fields: st.fields || {},
    });
    setEditingType(st);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingType(null);
    resetForm();
  };

  const handleAddField = () => {
    if (!newField.name || !newField.label) return;

    const field: FieldDefinition = {
      type: newField.type,
      label: newField.label,
      required: newField.required,
    };

    if (newField.type === 'enum' && newField.options) {
      field.options = newField.options.split(',').map((o) => o.trim());
    }

    setFormData({
      ...formData,
      fields: {
        ...formData.fields,
        [newField.name]: field,
      },
    });

    setNewField({
      name: '',
      type: 'string',
      label: '',
      required: false,
      options: '',
    });
  };

  const handleRemoveField = (fieldName: string) => {
    const { [fieldName]: _, ...rest } = formData.fields;
    setFormData({ ...formData, fields: rest });
  };

  const handleSave = async () => {
    try {
      const data: CreateServiceTypeData = {
        key: formData.key,
        label: formData.label,
        icon: formData.icon,
        fields: formData.fields,
      };

      if (editingType) {
        await serviceTypesApi.update(projectId, editingType.key, data);
      } else {
        await serviceTypesApi.create(projectId, data);
      }

      await refreshServiceTypes();
      handleCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to save service type');
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(t('projectSettings.confirmDeleteServiceType'))) return;

    try {
      await serviceTypesApi.delete(projectId, key);
      await refreshServiceTypes();
    } catch (err: any) {
      setError(err.message || 'Failed to delete service type');
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingGeneral(true);
      setError(null);
      await projectsApi.update(projectId, generalFormData);
      await refreshProject();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm(t('smsApi.projects.confirmDelete'))) return;

    try {
      setIsDeleting(true);
      await projectsApi.delete(projectId);
      router.push('/projects');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete project');
      setIsDeleting(false);
    }
  };

  const isFormOpen = isCreating || editingType !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('projectSettings.title')}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{t('projectSettings.subtitle')}</p>
            </div>
          </div>
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

        {/* General Settings Section */}
        <div className="relative rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <button
            onClick={() => setGeneralExpanded(!generalExpanded)}
            className="w-full flex items-center justify-between p-6 cursor-pointer"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('projectSettings.general')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('projectSettings.generalDesc')}</p>
            </div>
            {generalExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {generalExpanded && (
            <div className="px-6 pb-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
              <form onSubmit={handleSaveGeneral} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('smsApi.projects.projectName')} *
                  </label>
                  <input
                    type="text"
                    value={generalFormData.name}
                    onChange={(e) => setGeneralFormData({ ...generalFormData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('smsApi.projects.projectDescription')}
                  </label>
                  <textarea
                    value={generalFormData.description}
                    onChange={(e) => setGeneralFormData({ ...generalFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('projectSettings.deleteProject')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingGeneral}
                    className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingGeneral ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Service Types Section */}
        <div className="relative rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <button
            onClick={() => setServiceTypesExpanded(!serviceTypesExpanded)}
            className="w-full flex items-center justify-between p-6 cursor-pointer"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('projectSettings.serviceTypes')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('projectSettings.serviceTypesDesc')}</p>
            </div>
            <div className="flex items-center gap-3">
              {!isFormOpen && serviceTypesExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreate();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  {t('projectSettings.addType')}
                </button>
              )}
              {serviceTypesExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </div>
          </button>

          {serviceTypesExpanded && (
            <div className="px-6 pb-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
              {/* Create/Edit Form */}
              {isFormOpen && (
                <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {editingType ? `${t('common.edit')}: ${editingType.label?.en || editingType.key}` : t('projectSettings.newServiceType')}
                    </h3>
                    <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('projectSettings.keyLabel')}</label>
                      <input
                        type="text"
                        value={formData.key}
                        onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                        disabled={!!editingType}
                        placeholder="e.g., hosting"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('projectSettings.iconLabel')}</label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="package">Package</option>
                        <option value="server">Server</option>
                        <option value="globe">Globe</option>
                        <option value="cloud">Cloud</option>
                        <option value="database">Database</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Label (AZ)</label>
                      <input
                        type="text"
                        value={formData.label.az}
                        onChange={(e) => setFormData({ ...formData, label: { ...formData.label, az: e.target.value } })}
                        placeholder="Hostinq"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Label (EN)</label>
                      <input
                        type="text"
                        value={formData.label.en}
                        onChange={(e) => setFormData({ ...formData, label: { ...formData.label, en: e.target.value } })}
                        placeholder="Hosting"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Label (RU)</label>
                      <input
                        type="text"
                        value={formData.label.ru}
                        onChange={(e) => setFormData({ ...formData, label: { ...formData.label, ru: e.target.value } })}
                        placeholder="Хостинг"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Fields */}
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">{t('projectSettings.customFields')}</label>
                    <div className="space-y-2 mb-3">
                      {Object.entries(formData.fields).map(([name, field]) => (
                        <div key={name} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-white font-medium">{name}</span>
                          <span className="text-gray-500 text-sm">({field.type})</span>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">{field.label}</span>
                          {field.required && <span className="text-red-500 dark:text-red-400 text-xs">{t('projectSettings.required')}</span>}
                          <button
                            onClick={() => handleRemoveField(name)}
                            className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={newField.name}
                          onChange={(e) => setNewField({ ...newField, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                          placeholder={t('projectSettings.fieldName')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldDefinition['type'] })}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                        <option value="enum">Enum</option>
                      </select>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={newField.label}
                          onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                          placeholder={t('projectSettings.displayLabel')}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                        <input
                          type="checkbox"
                          checked={newField.required}
                          onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        {t('projectSettings.required')}
                      </label>
                      <button
                        onClick={handleAddField}
                        disabled={!newField.name || !newField.label}
                        className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 disabled:opacity-50 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {newField.type === 'enum' && (
                      <input
                        type="text"
                        value={newField.options}
                        onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                        placeholder={t('projectSettings.enumOptions')}
                        className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!formData.key || !formData.label.en}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              )}

              {/* Service Types List */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : serviceTypes.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">{t('projectSettings.noServiceTypes')}</p>
                  <p className="text-gray-500 text-sm">{t('projectSettings.noServiceTypesDesc')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {serviceTypes.map((st) => (
                    <div
                      key={st.key}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{st.label?.en || st.key}</div>
                          <div className="text-sm text-gray-500">
                            Key: {st.key} {Object.keys(st.fields || {}).length > 0 && `| ${Object.keys(st.fields || {}).length} ${t('projectSettings.customFields').toLowerCase()}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(st)}
                          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(st.key)}
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
          )}
        </div>
      </div>
    </div>
  );
}
