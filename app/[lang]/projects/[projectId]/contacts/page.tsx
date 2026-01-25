'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { projectsApi, Project } from '@/lib/api/projects';
import { contactsApi, Contact, setContactsProjectToken } from '@/lib/api/contacts';
import { campaignsApi, setProjectToken, AttributeSchema } from '@/lib/api/campaigns';
import { Link } from '@/lib/navigation';
import { useParams } from 'next/navigation';
import { formatDateInTimezone } from '@/lib/utils/date';
import { useTimezone } from '@/providers/timezone-provider';
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ArrowLeft,
  Server,
  Users,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  BookOpen,
  Settings,
  Code,
  Clock,
} from 'lucide-react';

export default function ProjectContactsPage() {
  const t = useTranslations();
  const params = useParams();
  const lang = params.lang as string;
  const projectId = params.projectId as string;
  const { timezone } = useTimezone();

  const [project, setProject] = useState<Project | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [schema, setSchema] = useState<AttributeSchema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hideContactsGuide') !== 'true';
    }
    return true;
  });
  const [showToken, setShowToken] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Schema editor state
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [schemaJson, setSchemaJson] = useState('');
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [isSavingSchema, setIsSavingSchema] = useState(false);
  const [schemaSaved, setSchemaSaved] = useState(false);

  // Form state for add/edit modal
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAttributes, setFormAttributes] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      loadContacts();
    }
  }, [project, currentPage, search]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      const data = await projectsApi.get(parseInt(projectId));
      setProject(data.project);

      // Set tokens for API calls
      setProjectToken(data.project.api_token);
      setContactsProjectToken(data.project.api_token);

      // Load schema
      try {
        const schemaData = await campaignsApi.getAttributes();
        const attributes = schemaData.attributes || [];
        setSchema(attributes);
        // Initialize schema JSON for editor
        if (attributes.length > 0) {
          setSchemaJson(JSON.stringify(attributes, null, 2));
        }
      } catch (err) {
        console.error('Failed to load schema:', err);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load project');
      setIsLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const data = await contactsApi.list(currentPage, 20, search || undefined);
      setContacts(data.contacts);
      setTotalPages(data.pagination.last_page);
      setTotal(data.pagination.total);
      setLastSyncAt(data.last_sync_at || null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadContacts();
  };

  const handleSelectContact = (phone: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.phone || c.email || '')));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return;
    if (!confirm(t('smsApi.contacts.confirmBulkDelete', { count: selectedContacts.size }))) return;

    try {
      await contactsApi.bulkDelete(Array.from(selectedContacts));
      setSelectedContacts(new Set());
      loadContacts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete contacts');
    }
  };

  const handleDelete = async (phone: string) => {
    if (!confirm(t('smsApi.contacts.confirmDelete'))) return;

    try {
      await contactsApi.delete(phone);
      loadContacts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete contact');
    }
  };

  const handleExport = async () => {
    try {
      await contactsApi.downloadExport();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export contacts');
    }
  };

  const openAddModal = () => {
    setEditingContact(null);
    setFormPhone('');
    setFormEmail('');
    setFormAttributes({});
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormPhone(contact.phone || '');
    setFormEmail(contact.email || '');
    setFormAttributes(contact.attributes || {});
    setFormError(null);
    setShowModal(true);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Require at least phone or email
    if (!formPhone && !formEmail) {
      setFormError(t('smsApi.contacts.phoneOrEmailRequired'));
      return;
    }

    // Validate phone format if provided
    if (formPhone && !/^994[0-9]{9}$/.test(formPhone)) {
      setFormError(t('smsApi.contacts.phoneInvalid'));
      return;
    }

    // Validate email format if provided
    if (formEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      setFormError(t('smsApi.contacts.emailInvalid'));
      return;
    }

    setIsSaving(true);
    try {
      const identifier = editingContact?.phone || editingContact?.email || formPhone || formEmail;
      if (editingContact) {
        await contactsApi.update(identifier, {
          phone: formPhone || null,
          email: formEmail || null,
          attributes: formAttributes,
        });
      } else {
        await contactsApi.create(formPhone || null, formAttributes, formEmail || null);
      }
      setShowModal(false);
      loadContacts();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToken = async () => {
    if (!project) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(project.api_token);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = project.api_token;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleGuide = () => {
    const newValue = !showGuide;
    setShowGuide(newValue);
    if (typeof window !== 'undefined') {
      if (newValue) {
        localStorage.removeItem('hideContactsGuide');
      } else {
        localStorage.setItem('hideContactsGuide', 'true');
      }
    }
  };

  const openSchemaEditor = () => {
    // Initialize with current schema or example
    if (schema.length === 0 && !schemaJson) {
      const exampleSchema = [
        { key: 'first_name', type: 'string', label: 'First Name', required: false },
        { key: 'age', type: 'number', label: 'Age', required: false },
        { key: 'is_vip', type: 'boolean', label: 'VIP Status', required: false },
      ];
      setSchemaJson(JSON.stringify(exampleSchema, null, 2));
    }
    setSchemaError(null);
    setSchemaSaved(false);
    setShowSchemaEditor(true);
  };

  const handleSaveSchema = async () => {
    setSchemaError(null);
    setSchemaSaved(false);

    // Validate JSON
    let parsedAttributes: any[];
    try {
      parsedAttributes = JSON.parse(schemaJson);
      if (!Array.isArray(parsedAttributes)) {
        setSchemaError(t('smsApi.schema.invalidJson'));
        return;
      }
    } catch (err) {
      setSchemaError(t('smsApi.schema.invalidJson'));
      return;
    }

    // Validate structure
    for (const attr of parsedAttributes) {
      if (!attr.key || !attr.type || !attr.label) {
        setSchemaError(t('smsApi.schema.invalidJson') + ' (key, type, label required)');
        return;
      }
    }

    setIsSavingSchema(true);
    try {
      const result = await campaignsApi.registerSchema(parsedAttributes);
      setSchema(parsedAttributes as AttributeSchema[]);
      setSchemaSaved(true);

      // Refresh contacts list to show cleared attributes
      await loadContacts();

      // Show warning if contacts were cleared
      if (result?.contacts_cleared > 0) {
        setTimeout(() => {
          setShowSchemaEditor(false);
          setSchemaSaved(false);
          // Show alert about cleared contacts
          window.alert(t('smsApi.schema.contactsCleared'));
        }, 1000);
      } else {
        setTimeout(() => {
          setShowSchemaEditor(false);
          setSchemaSaved(false);
        }, 1500);
      }
    } catch (err: any) {
      setSchemaError(err.response?.data?.message || 'Failed to save schema');
    } finally {
      setIsSavingSchema(false);
    }
  };

  const formatDate = (dateString: string, includeTime: boolean = false) => {
    return formatDateInTimezone(dateString, timezone, { includeTime, locale: lang });
  };

  const renderAttributeValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return `[${value.length}]`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  if (!project && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto text-center py-20">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {t('smsApi.projects.notFound')}
          </h3>
          <Link
            href={`/projects`}
            className="cursor-pointer px-8 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-105 inline-block"
          >
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-6">
          <Link
            href={`/projects/${projectId}/campaigns`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('smsApi.campaigns.title')}
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 ml-4">
            <Server className="w-4 h-4" />
            <span className="font-medium">{project?.name}</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('smsApi.contacts.title')}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('smsApi.contacts.description')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openSchemaEditor}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <Code className="w-4 h-4" />
              {t('smsApi.schema.editSchema')}
            </button>
            <button
              onClick={handleExport}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <Download className="w-4 h-4" />
              {t('smsApi.contacts.exportCsv')}
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <Upload className="w-4 h-4" />
              {t('smsApi.contacts.importCsv')}
            </button>
            <button
              onClick={openAddModal}
              className="cursor-pointer group relative px-6 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 hover:shadow-lg hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t('smsApi.contacts.addContact')}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Start Guide */}
        {showGuide && (
          <div className="mb-6 rounded-3xl p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-800/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('smsApi.contacts.quickStart.title')}
                </h2>
              </div>
              <button
                onClick={toggleGuide}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1: API Token */}
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center">1</span>
                  <span className="font-medium text-gray-900 dark:text-white">{t('smsApi.contacts.quickStart.step1Title')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('smsApi.contacts.quickStart.step1Desc')}</p>
                <div className="flex items-center gap-2">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={project?.api_token || ''}
                    readOnly
                    className="flex-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1.5 font-mono"
                  />
                  <button onClick={() => setShowToken(!showToken)} className="p-1 cursor-pointer text-gray-500">
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={copyToken}
                    className={`p-1 cursor-pointer ${tokenCopied ? 'text-green-500' : 'text-gray-500'}`}
                  >
                    {tokenCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Step 2: Schema */}
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center">2</span>
                  <span className="font-medium text-gray-900 dark:text-white">{t('smsApi.contacts.quickStart.step2Title')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('smsApi.contacts.quickStart.step2Desc')}</p>
                <Link
                  href={`/docs/sms-api`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  {t('smsApi.docs.title')}
                </Link>
              </div>

              {/* Step 3: Sync Contacts */}
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center">3</span>
                  <span className="font-medium text-gray-900 dark:text-white">{t('smsApi.contacts.quickStart.step3Title')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('smsApi.contacts.quickStart.step3Desc')}</p>
                <code className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 block overflow-x-auto">
                  POST /contacts/sync/bulk
                </code>
              </div>

              {/* Step 4: Campaigns */}
              <div className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center">4</span>
                  <span className="font-medium text-gray-900 dark:text-white">{t('smsApi.contacts.quickStart.step4Title')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t('smsApi.contacts.quickStart.step4Desc')}</p>
                <Link
                  href={`/projects/${projectId}/campaigns/create`}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t('smsApi.campaigns.createCampaign')} →
                </Link>
              </div>
            </div>
          </div>
        )}

        {!showGuide && (
          <button
            onClick={toggleGuide}
            className="mb-6 text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" />
            {t('smsApi.contacts.quickStart.showGuide')}
          </button>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/30 dark:border-red-800/30">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Search & Bulk Actions */}
        <div className="flex items-center justify-between mb-6">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('smsApi.contacts.searchPlaceholder')}
                className="pl-10 pr-4 py-2 w-80 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer"
            >
              {t('common.search')}
            </button>
          </form>

          <div className="flex items-center gap-4">
            {selectedContacts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                {t('smsApi.contacts.bulkDelete')} ({selectedContacts.size})
              </button>
            )}
            {lastSyncAt && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {t('smsApi.contacts.lastSync')}: {formatDate(lastSyncAt, true)}
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              {t('smsApi.contacts.total')}: {total}
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="relative inline-flex">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
              </div>
              <p className="mt-6 text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {t('smsApi.contacts.noContacts')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {t('smsApi.contacts.noContactsDesc')}
              </p>
              <button
                onClick={openAddModal}
                className="cursor-pointer px-8 py-3 rounded-2xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                {t('smsApi.contacts.addContact')}
              </button>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedContacts.size === contacts.length && contacts.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.contacts.phone')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.contacts.email')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.contacts.attributes')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.contacts.createdAt')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('smsApi.contacts.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.phone || contact.email || '')}
                          onChange={() => handleSelectContact(contact.phone || contact.email || '')}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{contact.phone || '-'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{contact.email || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {Object.entries(contact.attributes || {}).slice(0, 4).map(([key, value]) => (
                            <span
                              key={key}
                              className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              <span className="font-medium">{key}:</span>
                              <span className="ml-1">{renderAttributeValue(value)}</span>
                            </span>
                          ))}
                          {Object.keys(contact.attributes || {}).length > 4 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                              +{Object.keys(contact.attributes || {}).length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(contact.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(contact)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.phone || contact.email || '')}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('common.previous')}
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('common.pageOf', { current: currentPage, total: totalPages })}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                  >
                    {t('common.next')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add/Edit Contact Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <div className="relative w-full max-w-lg my-8" onClick={(e) => e.stopPropagation()}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-3xl"></div>
              <div className="relative rounded-3xl p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl max-h-[85vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {editingContact ? t('smsApi.contacts.editContact') : t('smsApi.contacts.addContact')}
                  </span>
                </h2>

                {formError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSaveContact} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('smsApi.contacts.phone')}
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="994501234567"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t('smsApi.contacts.phoneFormat')}</p>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('smsApi.contacts.email')}
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t('smsApi.contacts.phoneOrEmailRequired')}</p>
                  </div>

                  {/* Dynamic attribute fields based on schema */}
                  {schema.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('smsApi.contacts.attributes')}
                      </h3>
                      {schema.map((attr) => (
                        <div key={attr.key}>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {attr.label} {attr.required && '*'}
                          </label>
                          {attr.type === 'boolean' ? (
                            <select
                              value={formAttributes[attr.key] === true ? 'true' : formAttributes[attr.key] === false ? 'false' : ''}
                              onChange={(e) => setFormAttributes({
                                ...formAttributes,
                                [attr.key]: e.target.value === '' ? undefined : e.target.value === 'true'
                              })}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50"
                            >
                              <option value="">-</option>
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : attr.type === 'enum' ? (
                            <select
                              value={formAttributes[attr.key] || ''}
                              onChange={(e) => setFormAttributes({ ...formAttributes, [attr.key]: e.target.value || undefined })}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50"
                            >
                              <option value="">-</option>
                              {attr.options?.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : attr.type === 'number' || attr.type === 'integer' ? (
                            <input
                              type="number"
                              value={formAttributes[attr.key] ?? ''}
                              onChange={(e) => setFormAttributes({
                                ...formAttributes,
                                [attr.key]: e.target.value ? Number(e.target.value) : undefined
                              })}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50"
                            />
                          ) : attr.type === 'date' ? (
                            <input
                              type="date"
                              value={formAttributes[attr.key] || ''}
                              onChange={(e) => setFormAttributes({ ...formAttributes, [attr.key]: e.target.value || undefined })}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50"
                            />
                          ) : (
                            <input
                              type="text"
                              value={formAttributes[attr.key] || ''}
                              onChange={(e) => setFormAttributes({ ...formAttributes, [attr.key]: e.target.value || undefined })}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* If no schema, show JSON editor */}
                  {schema.length === 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('smsApi.contacts.attributes')} (JSON)
                      </label>
                      <textarea
                        value={JSON.stringify(formAttributes, null, 2)}
                        onChange={(e) => {
                          try {
                            setFormAttributes(JSON.parse(e.target.value));
                          } catch {}
                        }}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/50 font-mono text-sm"
                        placeholder='{"first_name": "John"}'
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="cursor-pointer flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {isSaving ? t('common.saving') : (editingContact ? t('common.save') : t('common.create'))}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal - Simple placeholder for now */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-3xl"></div>
              <div className="relative rounded-3xl p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {t('smsApi.contacts.import.title')}
                  </span>
                </h2>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{t('smsApi.contacts.import.dropzone')}</p>
                  <p className="text-sm text-gray-500">CSV</p>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="cursor-pointer flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schema Editor Modal */}
        {showSchemaEditor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-20 blur-3xl"></div>
              <div className="relative rounded-3xl p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border border-white/30 dark:border-gray-700/30 shadow-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {t('smsApi.schema.title')}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('smsApi.schema.description')}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSchemaEditor(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {schemaError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    {schemaError}
                  </div>
                )}

                {schemaSaved && (
                  <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {t('smsApi.schema.saved')}
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {t('smsApi.schema.supportedTypes')}
                  </p>
                  <textarea
                    value={schemaJson}
                    onChange={(e) => setSchemaJson(e.target.value)}
                    rows={15}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/50 font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                    placeholder={`[
  { "key": "first_name", "type": "string", "label": "First Name", "required": true },
  { "key": "age", "type": "number", "label": "Age" },
  { "key": "is_vip", "type": "boolean", "label": "VIP Status" }
]`}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSchemaEditor(false)}
                    className="cursor-pointer flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveSchema}
                    disabled={isSavingSchema}
                    className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {isSavingSchema ? t('common.saving') : t('smsApi.schema.saveSchema')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
