'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/lib/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Package,
  FileText,
  MessageSquare,
  Eye,
  Check,
  Send,
  Smartphone,
  Mail,
  Layers,
  Zap,
  RefreshCw,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  campaignsApi,
  type FilterConfig,
  type CreateCampaignData,
  type PreviewResult,
} from '@/lib/api';
import { Copy, Check as CheckIcon } from 'lucide-react';
import { useProject } from '../../ProjectContext';

const STEPS = ['target', 'details', 'filters', 'message', 'review'];

type TargetType = 'customer' | 'service';
type Channel = 'sms' | 'email' | 'both';
type CampaignType = 'one_time' | 'automated';

interface FormData {
  target_type: TargetType;
  service_type_key: string;
  name: string;
  channel: Channel;
  message_template: string;
  email_subject: string;
  email_body: string;
  filter: FilterConfig;
  campaign_type: CampaignType;
  scheduled_at: string;
  check_interval_minutes: number;
  cooldown_days: number;
  run_start_hour: number;
  run_end_hour: number;
  ends_at: string;
}

export default function CreateCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);
  const lang = params.lang as string;
  const { serviceTypes } = useProject();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Refs for textareas to enable focus after variable insertion
  const smsTextareaRef = useRef<HTMLTextAreaElement>(null);
  const emailSubjectRef = useRef<HTMLInputElement>(null);
  const emailBodyRef = useRef<HTMLTextAreaElement>(null);

  // Track which field is currently active for variable insertion
  const [activeField, setActiveField] = useState<'sms' | 'email_subject' | 'email_body'>('sms');

  // Update activeField default when channel changes
  useEffect(() => {
    if (formData.channel === 'email') {
      setActiveField('email_subject');
    } else {
      setActiveField('sms');
    }
  }, [formData.channel]);

  // Insert variable into the active field and focus at the end
  const insertVariable = (variable: string) => {
    const varText = `{{${variable}}}`;

    if (activeField === 'sms') {
      setFormData({ ...formData, message_template: formData.message_template + varText });
      setTimeout(() => {
        if (smsTextareaRef.current) {
          smsTextareaRef.current.focus();
          const len = (formData.message_template + varText).length;
          smsTextareaRef.current.setSelectionRange(len, len);
        }
      }, 0);
    } else if (activeField === 'email_subject') {
      setFormData({ ...formData, email_subject: formData.email_subject + varText });
      setTimeout(() => {
        if (emailSubjectRef.current) {
          emailSubjectRef.current.focus();
          const len = (formData.email_subject + varText).length;
          emailSubjectRef.current.setSelectionRange(len, len);
        }
      }, 0);
    } else {
      setFormData({ ...formData, email_body: formData.email_body + varText });
      setTimeout(() => {
        if (emailBodyRef.current) {
          emailBodyRef.current.focus();
          const len = (formData.email_body + varText).length;
          emailBodyRef.current.setSelectionRange(len, len);
        }
      }, 0);
    }
  };


  const copyToClipboard = (text: string, type: 'sql' | 'json') => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      if (type === 'sql') {
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2000);
      } else {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    document.body.removeChild(textArea);
  };

  const [formData, setFormData] = useState<FormData>({
    target_type: 'customer',
    service_type_key: '',
    name: '',
    channel: 'sms',
    message_template: '',
    email_subject: '',
    email_body: '',
    filter: { logic: 'AND', conditions: [] },
    campaign_type: 'one_time',
    scheduled_at: '',
    check_interval_minutes: 1440,
    cooldown_days: 30,
    run_start_hour: 9,
    run_end_hour: 18,
    ends_at: '',
  });

  // Set default service type key when service types load
  useEffect(() => {
    if (serviceTypes.length > 0 && !formData.service_type_key) {
      setFormData((prev) => ({ ...prev, service_type_key: serviceTypes[0].key }));
    }
  }, [serviceTypes, formData.service_type_key]);

  const fetchPreview = useCallback(async () => {
    if (formData.filter.conditions.length === 0) {
      setPreview(null);
      return;
    }

    // Check if any condition is incomplete
    const hasIncompleteConditions = formData.filter.conditions.some(
      (c) => !c.field || !c.operator
    );
    if (hasIncompleteConditions) {
      return;
    }

    try {
      setPreviewLoading(true);
      const result = await campaignsApi.preview(projectId, {
        target_type: formData.target_type,
        service_type_key: formData.target_type === 'service' ? formData.service_type_key : undefined,
        filter: formData.filter,
      });
      setPreview(result);
    } catch (err) {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [formData.target_type, formData.service_type_key, formData.filter, projectId]);

  useEffect(() => {
    const timer = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timer);
  }, [fetchPreview]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload: CreateCampaignData = {
        name: formData.name,
        target_type: formData.target_type,
        channel: formData.channel,
        segment_filter: formData.filter,
        campaign_type: formData.campaign_type,
      };

      if (formData.target_type === 'service') {
        payload.service_type_key = formData.service_type_key;
      }

      if (formData.channel === 'sms' || formData.channel === 'both') {
        payload.message_template = formData.message_template;
      }

      if (formData.channel === 'email' || formData.channel === 'both') {
        payload.email_subject = formData.email_subject;
        payload.email_body = formData.email_body;
      }

      if (formData.campaign_type === 'automated') {
        payload.check_interval_minutes = formData.check_interval_minutes;
        payload.cooldown_days = formData.cooldown_days;
        payload.run_start_hour = formData.run_start_hour;
        payload.run_end_hour = formData.run_end_hour;
        if (formData.ends_at) {
          payload.ends_at = formData.ends_at;
        }
      } else if (formData.scheduled_at) {
        payload.scheduled_at = formData.scheduled_at;
      }

      const campaign = await campaignsApi.create(projectId, payload);
      router.push(`/projects/${projectId}/campaigns/${campaign.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Target
        if (formData.target_type === 'service' && !formData.service_type_key) return false;
        return true;
      case 1: // Details
        return formData.name.trim() !== '';
      case 2: // Filters
        return formData.filter.conditions.length > 0;
      case 3: // Message
        if (formData.channel === 'sms' || formData.channel === 'both') {
          if (!formData.message_template.trim()) return false;
        }
        if (formData.channel === 'email' || formData.channel === 'both') {
          if (!formData.email_subject.trim() || !formData.email_body.trim()) return false;
        }
        return true;
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const stepIcons = [Users, FileText, MessageSquare, MessageSquare, Eye];

  const selectedServiceType = serviceTypes.find((st) => st.key === formData.service_type_key);

  // Available fields for filtering based on target type
  const getAvailableFields = () => {
    if (formData.target_type === 'customer') {
      return [
        { key: 'name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'created_at', label: 'Created At' },
      ];
    } else {
      const serviceTypeName = selectedServiceType?.label?.en || selectedServiceType?.label?.az || 'Service';
      const baseFields = [
        { key: 'name', label: `${serviceTypeName} Name` },
        { key: 'status', label: 'Status' },
        { key: 'expiry_at', label: 'Expiry Date' },
        { key: 'days_until_expiry', label: 'Days Until Expiry' },
        { key: 'customer.name', label: 'Customer Name' },
        { key: 'customer.phone', label: 'Customer Phone' },
        { key: 'customer.email', label: 'Customer Email' },
      ];
      // Add custom fields from service type
      if (selectedServiceType?.fields) {
        Object.entries(selectedServiceType.fields).forEach(([key, config]: [string, any]) => {
          baseFields.push({ key: `data.${key}`, label: config.label || key });
        });
      }
      return baseFields;
    }
  };

  const availableFields = getAvailableFields();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/projects/${projectId}/campaigns`}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Campaign</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Set up a new messaging campaign</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between rounded-2xl p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
          {STEPS.map((step, index) => {
            const Icon = stepIcons[index];
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const stepLabels = ['Target', 'Details', 'Filters', 'Message', 'Review'];

            return (
              <div key={step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center w-full">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                        : isCompleted
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? 'text-indigo-600 dark:text-purple-400' : 'text-gray-500'
                    }`}
                  >
                    {stepLabels[index]}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded ${
                      index < currentStep ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="relative rounded-3xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
          {/* Step 0: Target Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">What do you want to message?</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose whether to target customers directly or specific services</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, target_type: 'customer' })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    formData.target_type === 'customer'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.target_type === 'customer' ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Users className={`w-6 h-6 ${formData.target_type === 'customer' ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Customers</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Message customers directly based on their attributes
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Birthday greetings</li>
                    <li>• General announcements</li>
                    <li>• Account updates</li>
                  </ul>
                  <div className="mt-4 text-xs text-purple-600 dark:text-purple-400 font-medium">
                    1 message per customer
                  </div>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, target_type: 'service' })}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${
                    formData.target_type === 'service'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.target_type === 'service' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Package className={`w-6 h-6 ${formData.target_type === 'service' ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Services</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Message about specific services like expiring items
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Expiry reminders</li>
                    <li>• Renewal notices</li>
                    <li>• Status changes</li>
                  </ul>
                  <div className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    1 message per service
                  </div>
                </button>
              </div>

              {/* Service Type Selection */}
              {formData.target_type === 'service' && serviceTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Select service type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {serviceTypes.map((st) => (
                      <button
                        key={st.key}
                        onClick={() => setFormData({ ...formData, service_type_key: st.key })}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.service_type_key === st.key
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{st.label?.en || st.key}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.target_type === 'service' && serviceTypes.length === 0 && (
                <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30">
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    No service types defined. Please create service types first in Settings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Campaign Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Campaign Details</h2>
                <p className="text-gray-600 dark:text-gray-400">Configure your campaign settings</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Hosting Expiry Reminder"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Channel Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Channel *</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['sms', 'email', 'both'] as Channel[]).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setFormData({ ...formData, channel: ch })}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        formData.channel === ch
                          ? ch === 'sms'
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : ch === 'email'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {ch === 'sms' && <Smartphone className="w-6 h-6 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />}
                      {ch === 'email' && <Mail className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />}
                      {ch === 'both' && <Layers className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />}
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{ch === 'both' ? 'Both' : ch.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Campaign Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, campaign_type: 'one_time' })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.campaign_type === 'one_time'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className={`w-5 h-5 ${formData.campaign_type === 'one_time' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span className="font-medium text-gray-900 dark:text-white">One-Time</span>
                    </div>
                    <p className="text-xs text-gray-500">Send once immediately or scheduled</p>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, campaign_type: 'automated' })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.campaign_type === 'automated'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <RefreshCw className={`w-5 h-5 ${formData.campaign_type === 'automated' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span className="font-medium text-gray-900 dark:text-white">Automated</span>
                    </div>
                    <p className="text-xs text-gray-500">Runs continuously on a schedule</p>
                  </button>
                </div>
              </div>

              {/* One-time scheduling */}
              {formData.campaign_type === 'one_time' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Schedule (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately when executed</p>
                </div>
              )}

              {/* Automated settings */}
              {formData.campaign_type === 'automated' && (
                <div className="space-y-4 p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800/30">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Check Interval
                    </label>
                    <select
                      value={formData.check_interval_minutes}
                      onChange={(e) => setFormData({ ...formData, check_interval_minutes: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={60}>Every hour</option>
                      <option value={360}>Every 6 hours</option>
                      <option value={720}>Every 12 hours</option>
                      <option value={1440}>Daily</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Cooldown (days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={formData.cooldown_days}
                      onChange={(e) => setFormData({ ...formData, cooldown_days: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Prevent re-messaging the same target within this period
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Run Start Hour
                      </label>
                      <select
                        value={formData.run_start_hour}
                        onChange={(e) => setFormData({ ...formData, run_start_hour: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {String(i).padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Run End Hour
                      </label>
                      <select
                        value={formData.run_end_hour}
                        onChange={(e) => setFormData({ ...formData, run_end_hour: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {String(i).padStart(2, '0')}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      End Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Filters */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Filter Conditions</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Define which {formData.target_type === 'customer' ? 'customers' : 'services'} should receive this campaign
                </p>
              </div>

              {/* Simple filter builder - can be expanded later */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Logic:</label>
                  <select
                    value={formData.filter.logic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        filter: { ...formData.filter, logic: e.target.value as 'AND' | 'OR' },
                      })
                    }
                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="AND">Match ALL conditions</option>
                    <option value="OR">Match ANY condition</option>
                  </select>
                </div>

                {/* Conditions */}
                <div className="space-y-3">
                  {formData.filter.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <select
                        value={condition.field}
                        onChange={(e) => {
                          const newConditions = [...formData.filter.conditions];
                          newConditions[index] = { ...condition, field: e.target.value };
                          setFormData({
                            ...formData,
                            filter: { ...formData.filter, conditions: newConditions },
                          });
                        }}
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Select field...</option>
                        {availableFields.map((field) => (
                          <option key={field.key} value={field.key}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={condition.operator}
                        onChange={(e) => {
                          const newConditions = [...formData.filter.conditions];
                          newConditions[index] = { ...condition, operator: e.target.value };
                          setFormData({
                            ...formData,
                            filter: { ...formData.filter, conditions: newConditions },
                          });
                        }}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not equals</option>
                        <option value="contains">contains</option>
                        <option value="in_days">expires in X days</option>
                        <option value="greater_than">greater than</option>
                        <option value="less_than">less than</option>
                      </select>
                      <input
                        type="text"
                        value={String(condition.value)}
                        onChange={(e) => {
                          const newConditions = [...formData.filter.conditions];
                          newConditions[index] = { ...condition, value: e.target.value };
                          setFormData({
                            ...formData,
                            filter: { ...formData.filter, conditions: newConditions },
                          });
                        }}
                        placeholder="Value"
                        className="w-32 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => {
                          const newConditions = formData.filter.conditions.filter((_, i) => i !== index);
                          setFormData({
                            ...formData,
                            filter: { ...formData.filter, conditions: newConditions },
                          });
                        }}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      filter: {
                        ...formData.filter,
                        conditions: [
                          ...formData.filter.conditions,
                          { field: '', operator: 'equals', value: '' },
                        ],
                      },
                    });
                  }}
                  className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  + Add Condition
                </button>
              </div>

              {/* Preview Results */}
              {formData.filter.conditions.length > 0 && (
                <div className="space-y-4">
                  {/* Count */}
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    {previewLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                        <span className="text-purple-700 dark:text-purple-300">Loading...</span>
                      </div>
                    ) : preview ? (
                      <span className="text-purple-700 dark:text-purple-300 font-semibold">
                        {preview.count} {formData.target_type === 'customer' ? 'customers' : (selectedServiceType?.label?.en || selectedServiceType?.label?.az || formData.service_type_key)} match
                      </span>
                    ) : (
                      <span className="text-gray-500">Complete all filter conditions to see preview</span>
                    )}
                  </div>

                  {/* Matched Items List */}
                  {preview?.sample && preview.sample.length > 0 && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sample Matches (showing {preview.sample.length} of {preview.count})
                        </h4>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto">
                        {preview.sample.map((item) => (
                          <div key={item.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {item.name || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-3">
                                  {formData.target_type === 'service' && item.customer && (
                                    <span>Customer: {item.customer.name || item.customer.phone || item.customer.email}</span>
                                  )}
                                  {formData.target_type === 'customer' && (
                                    <>
                                      {item.phone && <span>{item.phone}</span>}
                                      {item.email && <span>{item.email}</span>}
                                    </>
                                  )}
                                </div>
                              </div>
                              {formData.target_type === 'service' && (
                                <div className="text-right">
                                  {item.expiry_at && (
                                    <div className="text-sm text-gray-500">{item.expiry_at}</div>
                                  )}
                                  {item.status && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      item.status === 'active'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                      {item.status}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Debug SQL & JSON (for admin) */}
                  {preview?.debug_sql && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-gray-900 overflow-x-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">SQL Query:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(preview.debug_sql!, 'sql')}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                          >
                            {copiedSql ? <CheckIcon className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            {copiedSql ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                          {preview.debug_sql}
                        </pre>
                      </div>
                      {preview.debug_filter && (
                        <div className="p-3 rounded-lg bg-gray-900 overflow-x-auto">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-400">Filter JSON:</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(JSON.stringify(preview.debug_filter, null, 2), 'json')}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                            >
                              {copiedJson ? <CheckIcon className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              {copiedJson ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <pre className="text-xs text-yellow-400 font-mono whitespace-pre-wrap break-all">
                            {JSON.stringify(preview.debug_filter, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Message */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Message Content</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Write your message template. Use {'{{variable}}'} syntax for personalization.
                </p>
              </div>

              {/* Available Variables */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Available Variables (click to insert):</div>
                <div className="flex flex-wrap gap-2">
                  {formData.target_type === 'customer' ? (
                    <>
                      {['name', 'phone', 'email'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 cursor-pointer transition-colors"
                        >
                          {`{{${v}}}`}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {['name', 'expiry_at', 'status', 'customer_name', 'customer_phone', 'customer_email'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => insertVariable(v)}
                          className="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 cursor-pointer transition-colors"
                        >
                          {`{{${v}}}`}
                        </button>
                      ))}
                      {selectedServiceType?.fields &&
                        Object.keys(selectedServiceType.fields).map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => insertVariable(f)}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded text-xs text-blue-700 dark:text-blue-300 cursor-pointer transition-colors"
                          >
                            {`{{${f}}}`}
                          </button>
                        ))}
                    </>
                  )}
                </div>
              </div>

              {/* SMS Template */}
              {(formData.channel === 'sms' || formData.channel === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    SMS Message *
                  </label>
                  <textarea
                    ref={smsTextareaRef}
                    value={formData.message_template}
                    onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                    onFocus={() => setActiveField('sms')}
                    rows={4}
                    placeholder="Dear {{name}}, your service {{name}} expires on {{expiry_at}}..."
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.message_template.length} characters
                  </div>
                </div>
              )}

              {/* Email Template */}
              {(formData.channel === 'email' || formData.channel === 'both') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Email Subject *
                    </label>
                    <input
                      ref={emailSubjectRef}
                      type="text"
                      value={formData.email_subject}
                      onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
                      onFocus={() => setActiveField('email_subject')}
                      placeholder="Your service expires soon"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Email Body *
                    </label>
                    <textarea
                      ref={emailBodyRef}
                      value={formData.email_body}
                      onChange={(e) => setFormData({ ...formData, email_body: e.target.value })}
                      onFocus={() => setActiveField('email_body')}
                      rows={8}
                      placeholder="Dear {{name}},\n\nYour service will expire soon..."
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Review Campaign</h2>
                <p className="text-gray-600 dark:text-gray-400">Review your campaign settings before creating</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Name</div>
                  <div className="text-gray-900 dark:text-white font-medium">{formData.name}</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Target</div>
                  <div className="text-gray-900 dark:text-white font-medium capitalize">
                    {formData.target_type}
                    {formData.target_type === 'service' && ` (${selectedServiceType?.label?.en || formData.service_type_key})`}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Channel</div>
                  <div className="flex items-center gap-2">
                    {formData.channel === 'sms' && <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                    {formData.channel === 'email' && <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    {formData.channel === 'both' && <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                    <span className="text-gray-900 dark:text-white font-medium capitalize">{formData.channel}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Type</div>
                  <div className="flex items-center gap-2">
                    {formData.campaign_type === 'one_time' ? (
                      <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    )}
                    <span className="text-gray-900 dark:text-white font-medium capitalize">{formData.campaign_type.replace('_', '-')}</span>
                  </div>
                </div>
              </div>

              {/* Target Count */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{preview?.count ?? '-'}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.target_type === 'customer' ? 'customers' : (selectedServiceType?.label?.en || selectedServiceType?.label?.az || formData.service_type_key)} will receive this campaign
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Preview */}
              {(formData.channel === 'sms' || formData.channel === 'both') && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-2">SMS Message Preview</div>
                  <div className="text-gray-900 dark:text-white whitespace-pre-wrap">{formData.message_template}</div>
                </div>
              )}

              {(formData.channel === 'email' || formData.channel === 'both') && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-2">Email Preview</div>
                  <div className="mb-2">
                    <span className="text-xs text-gray-400">Subject:</span>
                    <div className="text-gray-900 dark:text-white font-medium">{formData.email_subject}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Body:</span>
                    <div className="text-gray-900 dark:text-white whitespace-pre-wrap">{formData.email_body}</div>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Campaign will be created as a draft. You can review and execute it from the campaigns list.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              currentStep === 0
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Create Campaign
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
