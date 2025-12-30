'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/navigation';
import {
  ArrowLeft,
  Copy,
  Check,
  Key,
  Code,
  AlertCircle,
  Zap,
  ChevronRight,
  Mail,
  Send,
} from 'lucide-react';

type CodeTab = 'curl' | 'javascript' | 'php' | 'python';

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  level: 'main' | 'sub';
}

export default function EmailApiDocsPage() {
  const t = useTranslations();

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

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: t('emailApi.docs.overview.title'), icon: Zap, level: 'main' },
    { id: 'authentication', label: t('emailApi.docs.authentication.title'), icon: Key, level: 'main' },
    { id: 'send-email', label: t('emailApi.docs.sendEmail.title'), icon: Send, level: 'main' },
    { id: 'send-params', label: t('emailApi.docs.sendEmail.parameters'), level: 'sub' },
    { id: 'send-response', label: t('emailApi.docs.sendEmail.response'), level: 'sub' },
    { id: 'code-examples', label: t('emailApi.docs.codeExamples.title'), icon: Code, level: 'main' },
    { id: 'balance', label: t('emailApi.docs.balance.title'), icon: Mail, level: 'main' },
    { id: 'error-codes', label: t('emailApi.docs.errorCodes.title'), icon: AlertCircle, level: 'main' },
  ];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';

  const codeExamples: Record<CodeTab, string> = {
    curl: `curl -X POST "${API_URL}/email/send" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "user@example.com",
    "to_name": "John Doe",
    "subject": "Welcome to Our Service",
    "body_html": "<h1>Hello!</h1><p>Welcome to our platform.</p>",
    "body_text": "Hello! Welcome to our platform.",
    "from": "noreply@yourapp.az",
    "from_name": "Your App"
  }'`,
    javascript: `const response = await fetch('${API_URL}/email/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'user@example.com',
    to_name: 'John Doe',
    subject: 'Welcome to Our Service',
    body_html: '<h1>Hello!</h1><p>Welcome to our platform.</p>',
    body_text: 'Hello! Welcome to our platform.',
    from: 'noreply@yourapp.az',
    from_name: 'Your App'
  })
});

const data = await response.json();
console.log(data);
// { "status": "success", "data": { "message_id": "...", "cost": "0.01" } }`,
    php: `<?php
$ch = curl_init();

$data = [
    'to' => 'user@example.com',
    'to_name' => 'John Doe',
    'subject' => 'Welcome to Our Service',
    'body_html' => '<h1>Hello!</h1><p>Welcome to our platform.</p>',
    'body_text' => 'Hello! Welcome to our platform.',
    'from' => 'noreply@yourapp.az',
    'from_name' => 'Your App'
];

curl_setopt_array($ch, [
    CURLOPT_URL => '${API_URL}/email/send',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer YOUR_API_TOKEN',
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($data)
]);

$response = curl_exec($ch);
$result = json_decode($response, true);

print_r($result);
// ['status' => 'success', 'data' => ['message_id' => '...', 'cost' => '0.01']]`,
    python: `import requests

url = '${API_URL}/email/send'
headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}

data = {
    'to': 'user@example.com',
    'to_name': 'John Doe',
    'subject': 'Welcome to Our Service',
    'body_html': '<h1>Hello!</h1><p>Welcome to our platform.</p>',
    'body_text': 'Hello! Welcome to our platform.',
    'from': 'noreply@yourapp.az',
    'from_name': 'Your App'
}

response = requests.post(url, json=data, headers=headers)
result = response.json()

print(result)
# {'status': 'success', 'data': {'message_id': '...', 'cost': '0.01'}}`
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
              href="/dashboard/email"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('emailApi.docs.title')}
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
            href="/dashboard/email"
            className="lg:hidden inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('emailApi.docs.title')}
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t('emailApi.docs.subtitle')}
            </p>
          </div>

          {/* Overview Section */}
          <section id="overview" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Zap className="w-6 h-6 text-indigo-500" />
              {t('emailApi.docs.overview.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('emailApi.docs.overview.description')}
              </p>
            </div>
          </section>

          {/* Authentication Section */}
          <section id="authentication" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Key className="w-6 h-6 text-indigo-500" />
              {t('emailApi.docs.authentication.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t('emailApi.docs.authentication.description')}
              </p>
              <CodeBlock
                code={`Authorization: Bearer YOUR_API_TOKEN`}
                id="auth-header"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <Link href="/settings/sms/projects" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  {t('emailApi.docs.authentication.getToken')}
                </Link>
              </p>
            </div>
          </section>

          {/* Send Email Section */}
          <section id="send-email" className="mb-6 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Send className="w-6 h-6 text-indigo-500" />
              {t('emailApi.docs.sendEmail.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  POST
                </span>
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/email/send</code>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('emailApi.docs.sendEmail.description')}
              </p>
            </div>
          </section>

          {/* Parameters */}
          <section id="send-params" className="mb-8 scroll-mt-6 ml-8 pl-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('emailApi.docs.sendEmail.parameters')}
            </h3>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        {t('emailApi.docs.sendEmail.param')}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        {t('emailApi.docs.sendEmail.type')}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        {t('emailApi.docs.sendEmail.required')}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        {t('emailApi.docs.sendEmail.descriptionCol')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-3"><code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">to</code></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">string</td>
                      <td className="px-4 py-3"><span className="text-emerald-600">{t('common.yes')}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('emailApi.docs.sendEmail.toDesc')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">to_name</code></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">string</td>
                      <td className="px-4 py-3"><span className="text-gray-400">{t('common.no')}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('emailApi.docs.sendEmail.toNameDesc')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">subject</code></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">string</td>
                      <td className="px-4 py-3"><span className="text-emerald-600">{t('common.yes')}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('emailApi.docs.sendEmail.subjectDesc')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">body_html</code></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">string</td>
                      <td className="px-4 py-3"><span className="text-amber-600">*</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('emailApi.docs.sendEmail.bodyHtmlDesc')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">body_text</code></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">string</td>
                      <td className="px-4 py-3"><span className="text-amber-600">*</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('emailApi.docs.sendEmail.bodyTextDesc')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">from</code></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">string</td>
                      <td className="px-4 py-3"><span className="text-gray-400">{t('common.no')}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('emailApi.docs.sendEmail.fromDesc')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm">from_name</code></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">string</td>
                      <td className="px-4 py-3"><span className="text-gray-400">{t('common.no')}</span></td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{t('emailApi.docs.sendEmail.fromNameDesc')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-4">
                * {t('emailApi.docs.sendEmail.bodyNote')}
              </p>
            </div>
          </section>

          {/* Response */}
          <section id="send-response" className="mb-12 scroll-mt-6 ml-8 pl-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('emailApi.docs.sendEmail.response')}
            </h3>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50">
              <CodeBlock
                code={`{
  "status": "success",
  "message": "Email sent successfully",
  "data": {
    "message_id": "abc123xyz",
    "to": "user@example.com",
    "subject": "Welcome to Our Service",
    "cost": "0.01",
    "remaining_balance": "99.99",
    "is_test": false
  }
}`}
                id="response-example"
              />
            </div>
          </section>

          {/* Code Examples */}
          <section id="code-examples" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Code className="w-6 h-6 text-indigo-500" />
              {t('emailApi.docs.codeExamples.title')}
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
                    {t(`emailApi.docs.codeExamples.${tab}`)}
                  </button>
                ))}
              </div>
              {/* Code */}
              <div className="p-4">
                <CodeBlock code={codeExamples[activeTab]} id={`code-${activeTab}`} />
              </div>
            </div>
          </section>

          {/* Balance Section */}
          <section id="balance" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-indigo-500" />
              {t('emailApi.docs.balance.title')}
            </h2>
            <div className="rounded-2xl p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  GET
                </span>
                <code className="text-sm font-mono text-gray-700 dark:text-gray-300">/email/balance</code>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('emailApi.docs.balance.description')}
              </p>
              <CodeBlock
                code={`{
  "status": "success",
  "data": {
    "balance": "100.00",
    "total_spent": "5.00",
    "cost_per_email": "0.01"
  }
}`}
                id="balance-response"
              />
            </div>
          </section>

          {/* Error Codes Section */}
          <section id="error-codes" className="mb-12 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-indigo-500" />
              {t('emailApi.docs.errorCodes.title')}
            </h2>
            <div className="rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('emailApi.docs.errorCodes.code')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      {t('emailApi.docs.errorCodes.description')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {['400', '401', '402', '422', '429', '500'].map((code) => (
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
                        {t(`emailApi.docs.errorCodes.${code}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
