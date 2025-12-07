'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  Key,
  Phone,
  Users,
  Code,
  AlertCircle,
  Zap,
  Filter,
  ChevronRight,
} from 'lucide-react';

type CodeTab = 'curl' | 'javascript' | 'php' | 'python';

export default function SMSApiDocsPage() {
  const t = useTranslations();
  const params = useParams();
  const lang = params.lang as string;

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CodeTab>('curl');
  const [activeSection, setActiveSection] = useState('overview');

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

  const sections = [
    { id: 'overview', label: t('smsApi.docs.overview.title'), icon: Zap },
    { id: 'authentication', label: t('smsApi.docs.authentication.title'), icon: Key },
    { id: 'phone-format', label: t('smsApi.docs.phoneFormat.title'), icon: Phone },
    { id: 'contact-schema', label: t('smsApi.docs.contactSchema.title'), icon: Users },
    { id: 'endpoints', label: t('smsApi.docs.endpoints.title'), icon: Code },
    { id: 'code-examples', label: t('smsApi.docs.codeExamples.title'), icon: Code },
    { id: 'error-codes', label: t('smsApi.docs.errorCodes.title'), icon: AlertCircle },
    { id: 'segmentation', label: t('smsApi.docs.segmentation.title'), icon: Filter },
  ];

  const codeExamples: Record<CodeTab, string> = {
    curl: `curl -X POST "${process.env.NEXT_PUBLIC_API_URL}/contacts/sync/bulk" \\
  -H "Authorization: Bearer YOUR_PROJECT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contacts": [
      {
        "phone": "994501234567",
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
    javascript: `const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/contacts/sync/bulk', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_PROJECT_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contacts: [
      {
        phone: '994501234567',
        attributes: {
          first_name: 'Elvin',
          last_name: 'Mammadov',
          city: 'Baku'
        }
      },
      {
        phone: '994502345678',
        attributes: {
          first_name: 'Aynur',
          last_name: 'Aliyeva',
          city: 'Ganja'
        }
      }
    ]
  })
});

const data = await response.json();
console.log(data);
// { "status": "success", "data": { "total": 2, "created": 2, "updated": 0, "failed": 0 } }`,
    php: `<?php
$ch = curl_init();

$data = [
    'contacts' => [
        [
            'phone' => '994501234567',
            'attributes' => [
                'first_name' => 'Elvin',
                'last_name' => 'Mammadov',
                'city' => 'Baku'
            ]
        ],
        [
            'phone' => '994502345678',
            'attributes' => [
                'first_name' => 'Aynur',
                'last_name' => 'Aliyeva',
                'city' => 'Ganja'
            ]
        ]
    ]
];

curl_setopt_array($ch, [
    CURLOPT_URL => '${process.env.NEXT_PUBLIC_API_URL}/contacts/sync/bulk',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer YOUR_PROJECT_TOKEN',
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($ch);
$result = json_decode($response, true);

print_r($result);
// ['status' => 'success', 'data' => ['total' => 2, 'created' => 2, 'updated' => 0, 'failed' => 0]]`,
    python: `import requests

url = '${process.env.NEXT_PUBLIC_API_URL}/contacts/sync/bulk'
headers = {
    'Authorization': 'Bearer YOUR_PROJECT_TOKEN',
    'Content-Type': 'application/json'
}

data = {
    'contacts': [
        {
            'phone': '994501234567',
            'attributes': {
                'first_name': 'Elvin',
                'last_name': 'Mammadov',
                'city': 'Baku'
            }
        },
        {
            'phone': '994502345678',
            'attributes': {
                'first_name': 'Aynur',
                'last_name': 'Aliyeva',
                'city': 'Ganja'
            }
        }
    ]
}

response = requests.post(url, json=data, headers=headers)
result = response.json()

print(result)
# {'status': 'success', 'data': {'total': 2, 'created': 2, 'updated': 0, 'failed': 0}}`
  };

  const CodeBlock = ({ code, id, language }: { code: string; id: string; language?: string }) => (
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
              href={`/${lang}/settings/sms/projects`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('smsApi.docs.title')}
            </h2>
            <nav className="space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-12 max-w-4xl">
          {/* Mobile Back Button */}
          <Link
            href={`/${lang}/settings/sms/projects`}
            className="lg:hidden inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('smsApi.docs.title')}
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('smsApi.docs.subtitle')}
            </p>
          </div>

          {/* Overview Section */}
          <section id="overview" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Zap className="w-6 h-6 text-indigo-500" />
              {t('smsApi.docs.overview.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('smsApi.docs.overview.description')}
              </p>
            </div>
          </section>

          {/* Authentication Section */}
          <section id="authentication" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Key className="w-6 h-6 text-indigo-500" />
              {t('smsApi.docs.authentication.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t('smsApi.docs.authentication.description')}
              </p>
              <CodeBlock
                code={`Authorization: Bearer YOUR_PROJECT_TOKEN`}
                id="auth-header"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <Link href={`/${lang}/settings/sms/projects`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  {t('smsApi.docs.authentication.getToken')}
                </Link>
              </p>
            </div>
          </section>

          {/* Phone Format Section */}
          <section id="phone-format" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Phone className="w-6 h-6 text-indigo-500" />
              {t('smsApi.docs.phoneFormat.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t('smsApi.docs.phoneFormat.description')}
              </p>
              <CodeBlock
                code={t('smsApi.docs.phoneFormat.example')}
                id="phone-example"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('smsApi.docs.phoneFormat.rules')}
              </p>
            </div>
          </section>

          {/* Contact Schema Section */}
          <section id="contact-schema" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-500" />
              {t('smsApi.docs.contactSchema.title')}
            </h2>
            <div className="space-y-6">
              {/* Simple */}
              <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('smsApi.docs.contactSchema.simpleTitle')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('smsApi.docs.contactSchema.simpleDesc')}
                </p>
                <CodeBlock
                  code={`{
  "contacts": [
    { "phone": "994501234567" },
    { "phone": "994502345678" }
  ]
}`}
                  id="schema-simple"
                />
              </div>

              {/* With Names */}
              <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('smsApi.docs.contactSchema.withNamesTitle')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('smsApi.docs.contactSchema.withNamesDesc')}
                </p>
                <CodeBlock
                  code={`{
  "contacts": [
    {
      "phone": "994501234567",
      "attributes": {
        "first_name": "Elvin",
        "last_name": "Mammadov"
      }
    }
  ]
}`}
                  id="schema-names"
                />
              </div>

              {/* Complex */}
              <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t('smsApi.docs.contactSchema.complexTitle')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('smsApi.docs.contactSchema.complexDesc')}
                </p>
                <CodeBlock
                  code={`{
  "contacts": [
    {
      "phone": "994501234567",
      "attributes": {
        "first_name": "Elvin",
        "last_name": "Mammadov",
        "company": "ABC Company",
        "city": "Baku",
        "balance": 150.00,
        "is_active": true,
        "tags": ["premium", "loyal"],
        "registered_at": "2024-01-15"
      }
    }
  ]
}`}
                  id="schema-complex"
                />
              </div>
            </div>
          </section>

          {/* Endpoints Section */}
          <section id="endpoints" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Code className="w-6 h-6 text-indigo-500" />
              {t('smsApi.docs.endpoints.title')}
            </h2>
            <div className="space-y-4">
              {/* Sync Single */}
              <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    POST
                  </span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/contacts/sync</code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('smsApi.docs.endpoints.syncSingleDesc')}
                </p>
                <CodeBlock
                  code={`{
  "phone": "994501234567",
  "attributes": {
    "first_name": "Elvin",
    "last_name": "Mammadov",
    "city": "Baku"
  }
}`}
                  id="endpoint-sync"
                />
              </div>

              {/* Bulk Sync */}
              <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    POST
                  </span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/contacts/sync/bulk</code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('smsApi.docs.endpoints.syncBulkDesc')}
                </p>
              </div>

              {/* List */}
              <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    GET
                  </span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/contacts?page=1&per_page=20&search=</code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('smsApi.docs.endpoints.listDesc')}
                </p>
              </div>

              {/* Delete */}
              <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    DELETE
                  </span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/contacts/{'{phone}'}</code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('smsApi.docs.endpoints.deleteDesc')}
                </p>
              </div>

              {/* Export */}
              <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    GET
                  </span>
                  <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/contacts/export</code>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('smsApi.docs.endpoints.exportDesc')}
                </p>
              </div>
            </div>
          </section>

          {/* Code Examples Section */}
          <section id="code-examples" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Code className="w-6 h-6 text-indigo-500" />
              {t('smsApi.docs.codeExamples.title')}
            </h2>
            <div className="rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {(['curl', 'javascript', 'php', 'python'] as CodeTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t(`smsApi.docs.codeExamples.${tab}`)}
                  </button>
                ))}
              </div>
              {/* Code */}
              <div className="p-4">
                <CodeBlock code={codeExamples[activeTab]} id={`code-${activeTab}`} />
              </div>
            </div>
          </section>

          {/* Error Codes Section */}
          <section id="error-codes" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-indigo-500" />
              {t('smsApi.docs.errorCodes.title')}
            </h2>
            <div className="rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('smsApi.docs.errorCodes.code')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('smsApi.docs.errorCodes.description')}
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
                        {t(`smsApi.docs.errorCodes.${code}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Rate Limits */}
          <section id="rate-limits" className="mb-12 scroll-mt-6">
            <div className="rounded-2xl p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-700/50">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                {t('smsApi.docs.rateLimits.title')}
              </h3>
              <p className="text-amber-700 dark:text-amber-300">
                {t('smsApi.docs.rateLimits.description')}
              </p>
            </div>
          </section>

          {/* Segmentation Section */}
          <section id="segmentation" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Filter className="w-6 h-6 text-indigo-500" />
              {t('smsApi.docs.segmentation.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('smsApi.docs.segmentation.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  {t('smsApi.docs.segmentation.example1')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  {t('smsApi.docs.segmentation.example2')}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                  {t('smsApi.docs.segmentation.example3')}
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
