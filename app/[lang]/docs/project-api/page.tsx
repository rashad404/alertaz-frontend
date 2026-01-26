'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import {
  ArrowLeft,
  Copy,
  Check,
  Key,
  Users,
  Code,
  AlertCircle,
  Zap,
  Filter,
  ChevronRight,
  Database,
  Send,
  Package,
  Settings,
} from 'lucide-react';

type CodeTab = 'curl' | 'javascript' | 'php' | 'python';

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  level: 'main' | 'sub';
}

export default function ProjectApiDocsPage() {
  const t = useTranslations();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CodeTab>('curl');
  const [activeSection, setActiveSection] = useState('overview');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.alert.az';

  const copyToClipboard = (code: string, id: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: t('projectApiDocs.overview.title'), icon: Zap, level: 'main' },
    { id: 'authentication', label: t('projectApiDocs.authentication.title'), icon: Key, level: 'main' },
    { id: 'service-types', label: t('projectApiDocs.serviceTypes.title'), icon: Settings, level: 'main' },
    { id: 'customers', label: t('projectApiDocs.customers.title'), icon: Users, level: 'main' },
    { id: 'customer-sync', label: t('projectApiDocs.customers.sync'), level: 'sub' },
    { id: 'services', label: t('projectApiDocs.services.title'), icon: Package, level: 'main' },
    { id: 'service-sync', label: t('projectApiDocs.services.sync'), level: 'sub' },
    { id: 'quick-send', label: t('projectApiDocs.quickSend.title'), icon: Send, level: 'main' },
    { id: 'campaigns', label: t('projectApiDocs.campaigns.title'), icon: Database, level: 'main' },
    { id: 'error-codes', label: t('projectApiDocs.errorCodes.title'), icon: AlertCircle, level: 'main' },
    { id: 'segmentation', label: t('projectApiDocs.segmentation.title'), icon: Filter, level: 'main' },
  ];

  const customerSyncExamples: Record<CodeTab, string> = {
    curl: `curl -X POST "${apiUrl}/api/v1/customers/sync" \\
  -H "Authorization: Bearer YOUR_PROJECT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customers": [
      {
        "phone": "994501234567",
        "email": "elvin@example.com",
        "attributes": {
          "first_name": "Elvin",
          "last_name": "Mammadov",
          "city": "Baku"
        }
      },
      {
        "phone": "994502345678",
        "attributes": {
          "first_name": "Aynur",
          "last_name": "Aliyeva",
          "city": "Ganja"
        }
      }
    ]
  }'`,
    javascript: `const response = await fetch('${apiUrl}/api/v1/customers/sync', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_PROJECT_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customers: [
      {
        phone: '994501234567',
        email: 'elvin@example.com',
        attributes: {
          first_name: 'Elvin',
          last_name: 'Mammadov',
          city: 'Baku'
        }
      }
    ]
  })
});

const data = await response.json();`,
    php: `<?php
$ch = curl_init();

$data = [
    'customers' => [
        [
            'phone' => '994501234567',
            'email' => 'elvin@example.com',
            'attributes' => [
                'first_name' => 'Elvin',
                'last_name' => 'Mammadov',
                'city' => 'Baku'
            ]
        ]
    ]
];

curl_setopt_array($ch, [
    CURLOPT_URL => '${apiUrl}/api/v1/customers/sync',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer YOUR_PROJECT_TOKEN',
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($ch);
$result = json_decode($response, true);`,
    python: `import requests

url = '${apiUrl}/api/v1/customers/sync'
headers = {
    'Authorization': 'Bearer YOUR_PROJECT_TOKEN',
    'Content-Type': 'application/json'
}

data = {
    'customers': [
        {
            'phone': '994501234567',
            'email': 'elvin@example.com',
            'attributes': {
                'first_name': 'Elvin',
                'last_name': 'Mammadov',
                'city': 'Baku'
            }
        }
    ]
}

response = requests.post(url, json=data, headers=headers)
result = response.json()`
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="cursor-pointer absolute top-3 right-3 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
        title={t('common.copy')}
      >
        {copiedCode === id ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
          <div className="p-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('projectApiDocs.title')}
            </h2>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 py-2 rounded-lg text-sm transition-colors ${
                    item.level === 'sub' ? 'pl-9 pr-3' : 'px-3'
                  } ${
                    activeSection === item.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.level === 'sub' && <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />}
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-12 max-w-4xl">
          {/* Mobile Back Button */}
          <Link
            href="/projects"
            className="lg:hidden inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('projectApiDocs.title')}
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('projectApiDocs.subtitle')}
            </p>
          </div>

          {/* Overview Section */}
          <section id="overview" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Zap className="w-6 h-6 text-indigo-500" />
              {t('projectApiDocs.overview.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('projectApiDocs.overview.description')}
              </p>
            </div>
          </section>

          {/* Authentication Section */}
          <section id="authentication" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Key className="w-6 h-6 text-indigo-500" />
              {t('projectApiDocs.authentication.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t('projectApiDocs.authentication.description')}
              </p>
              <CodeBlock
                code={`Authorization: Bearer YOUR_PROJECT_TOKEN`}
                id="auth-header"
              />
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Base URL:</strong> {apiUrl}/api/v1
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <Link href="/projects" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  {t('projectApiDocs.authentication.getToken')}
                </Link>
              </p>
            </div>
          </section>

          {/* Service Types Section */}
          <section id="service-types" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-indigo-500" />
              {t('projectApiDocs.serviceTypes.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t('projectApiDocs.serviceTypes.description')}
              </p>

              {/* List Service Types */}
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    GET
                  </span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/service-types</code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('projectApiDocs.serviceTypes.listDesc')}
                </p>
              </div>

              {/* Create Service Type */}
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    POST
                  </span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/service-types</code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('projectApiDocs.serviceTypes.createDesc')}
                </p>
                <CodeBlock
                  code={`{
  "key": "domain",
  "name": "Domains",
  "icon": "globe",
  "fields": [
    { "key": "domain_name", "type": "string", "label": "Domain Name", "required": true },
    { "key": "expiry_date", "type": "date", "label": "Expiry Date", "required": true },
    { "key": "auto_renew", "type": "boolean", "label": "Auto Renew" }
  ]
}`}
                  id="service-type-create"
                />
              </div>
            </div>
          </section>

          {/* Customers Section */}
          <section id="customers" className="mb-6 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-500" />
                {t('projectApiDocs.customers.title')}
              </h2>
            </div>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('projectApiDocs.customers.description')}
              </p>

              {/* Endpoints list */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">GET</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/customers</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.customers.listDesc')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">POST</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/customers</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.customers.createDesc')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">POST</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/customers/sync</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.customers.syncDesc')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">DELETE</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/customers/{'{id}'}</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.customers.deleteDesc')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Sync - Subsection */}
          <section id="customer-sync" className="mb-12 scroll-mt-6 ml-8 pl-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Code className="w-5 h-5 text-indigo-500" />
              {t('projectApiDocs.customers.sync')}
            </h3>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('projectApiDocs.customers.syncDescription')}
              </p>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                {(['curl', 'javascript', 'php', 'python'] as CodeTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <CodeBlock code={customerSyncExamples[activeTab]} id={`customer-sync-${activeTab}`} />

              {/* Response */}
              <h4 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {t('projectApiDocs.response')}
              </h4>
              <CodeBlock
                code={`{
  "status": "success",
  "data": {
    "total": 2,
    "created": 1,
    "updated": 1,
    "failed": 0
  }
}`}
                id="customer-sync-response"
              />
            </div>
          </section>

          {/* Services Section */}
          <section id="services" className="mb-6 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Package className="w-6 h-6 text-indigo-500" />
              {t('projectApiDocs.services.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('projectApiDocs.services.description')}
              </p>

              {/* Endpoints list */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">GET</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/services/{'{type}'}</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.services.listDesc')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">POST</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/services/{'{type}'}/sync</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.services.syncDesc')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">DELETE</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/services/{'{type}'}/{'{id}'}</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.services.deleteDesc')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Service Sync - Subsection */}
          <section id="service-sync" className="mb-12 scroll-mt-6 ml-8 pl-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Code className="w-5 h-5 text-indigo-500" />
              {t('projectApiDocs.services.sync')}
            </h3>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('projectApiDocs.services.syncDescription')}
              </p>

              <CodeBlock
                code={`curl -X POST "${apiUrl}/api/v1/services/domain/sync" \\
  -H "Authorization: Bearer YOUR_PROJECT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "services": [
      {
        "external_id": "dom-123",
        "customer_id": 1,
        "data": {
          "domain_name": "example.com",
          "expiry_date": "2025-06-15",
          "auto_renew": true
        }
      }
    ]
  }'`}
                id="service-sync-example"
              />

              {/* Response */}
              <h4 className="font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                {t('projectApiDocs.response')}
              </h4>
              <CodeBlock
                code={`{
  "status": "success",
  "data": {
    "total": 1,
    "created": 1,
    "updated": 0,
    "failed": 0
  }
}`}
                id="service-sync-response"
              />
            </div>
          </section>

          {/* Quick Send Section */}
          <section id="quick-send" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Send className="w-6 h-6 text-indigo-500" />
              {t('projectApiDocs.quickSend.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t('projectApiDocs.quickSend.description')}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">POST</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/send/customer/{'{id}'}</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.quickSend.customerDesc')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">POST</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/send/service/{'{type}'}/{'{id}'}</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.quickSend.serviceDesc')}</span>
                </div>
              </div>

              <CodeBlock
                code={`curl -X POST "${apiUrl}/api/v1/send/customer/123" \\
  -H "Authorization: Bearer YOUR_PROJECT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "sms",
    "message": "Your domain {{domain_name}} expires on {{expiry_date}}"
  }'`}
                id="quick-send-example"
              />
            </div>
          </section>

          {/* Campaigns Section */}
          <section id="campaigns" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-indigo-500" />
              {t('projectApiDocs.campaigns.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t('projectApiDocs.campaigns.description')}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">GET</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/campaigns</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.campaigns.listDesc')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">POST</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/campaigns</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.campaigns.createDesc')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">GET</span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/api/v1/templates</code>
                  <span className="text-sm text-gray-500">- {t('projectApiDocs.campaigns.templatesDesc')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Error Codes Section */}
          <section id="error-codes" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-indigo-500" />
              {t('projectApiDocs.errorCodes.title')}
            </h2>
            <div className="rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('projectApiDocs.errorCodes.code')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('projectApiDocs.errorCodes.description')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {['400', '401', '404', '422', '429', '500'].map((code) => (
                    <tr key={code}>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          code.startsWith('4')
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {t(`projectApiDocs.errorCodes.${code}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rate Limits */}
            <div className="mt-4 rounded-2xl p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                {t('projectApiDocs.rateLimits.title')}
              </h3>
              <p className="text-amber-700 dark:text-amber-300">
                {t('projectApiDocs.rateLimits.description')}
              </p>
            </div>
          </section>

          {/* Segmentation Section */}
          <section id="segmentation" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Filter className="w-6 h-6 text-indigo-500" />
              {t('projectApiDocs.segmentation.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('projectApiDocs.segmentation.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  {t('projectApiDocs.segmentation.example1')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  {t('projectApiDocs.segmentation.example2')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  {t('projectApiDocs.segmentation.example3')}
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
