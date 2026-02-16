'use client';

import { CheckCircle, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SMSAPIDocsPage() {
  const t = useTranslations('smsApi');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.alert.az';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Getting Started */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center mb-4">
            <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('gettingStarted')}
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('authDescription')}
          </p>
          <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
            <code className="text-green-400 text-sm">
              Authorization: Bearer YOUR_API_TOKEN
            </code>
          </div>
        </section>

        {/* Base URL */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Base URL</h3>
          <div className="bg-gray-900 rounded-md p-4">
            <code className="text-blue-400">{apiUrl}</code>
          </div>
        </section>

        {/* Endpoints */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('endpoints')}
          </h2>

          {/* Send SMS */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 mr-3">
                POST
              </span>
              <code className="text-lg font-mono text-gray-900 dark:text-white">/sms/send</code>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('sendSMSDescription')}
            </p>

            {/* Request Parameters */}
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              {t('requestParameters')}
            </h4>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {t('parameter')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {t('type')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {t('required')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {t('description')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">phone</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">string</td>
                    <td className="px-4 py-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{t('phoneDescription')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">message</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">string</td>
                    <td className="px-4 py-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {t('messageDescription')}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">sender</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">string</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">Optional</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{t('senderDescription')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* cURL Example */}
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('curl')}</h4>
            <div className="bg-gray-900 rounded-md p-4 mb-4 overflow-x-auto relative group">
              <pre className="text-sm text-gray-300 font-mono">
{`curl -X POST ${apiUrl}/sms/send \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone": "994501234567",
    "message": "Hello from Alert.az!",
    "sender": "Alert.az"
  }'`}
              </pre>
            </div>

            {/* Response Example */}
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              {t('successResponse')}
            </h4>
            <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`{
  "status": "success",
  "message": "SMS sent successfully",
  "data": {
    "id": 123,
    "transaction_id": "987654321",
    "phone": "994501234567",
    "sender": "Alert.az",
    "cost": 0.05,
    "remaining_balance": 9.96
  }
}`}
              </pre>
            </div>
          </div>

          {/* Get Balance */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mr-3">
                GET
              </span>
              <code className="text-lg font-mono text-gray-900 dark:text-white">/sms/balance</code>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('getBalanceDescription')}
            </p>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('curl')}</h4>
            <div className="bg-gray-900 rounded-md p-4 mb-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`curl ${apiUrl}/sms/balance \\
  -H "Authorization: Bearer YOUR_API_TOKEN"`}
              </pre>
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Response</h4>
            <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`{
  "status": "success",
  "data": {
    "sms_credits": 10.00,
    "total_spent": 5.60,
    "cost_per_sms": 0.05
  }
}`}
              </pre>
            </div>
          </div>

          {/* Get History */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 mr-3">
                GET
              </span>
              <code className="text-lg font-mono text-gray-900 dark:text-white">/sms/history</code>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('getSMSHistoryDescription')}
            </p>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{t('curl')}</h4>
            <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono">
{`curl "${apiUrl}/sms/history?per_page=20" \\
  -H "Authorization: Bearer YOUR_API_TOKEN"`}
              </pre>
            </div>
          </div>
        </section>

        {/* Error Codes */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('errorCodes')}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('errorCode')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {t('errorCodeDescription')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">INSUFFICIENT_BALANCE</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {t('insufficientBalance')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">SENDER_NOT_ALLOWED</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {t('senderNotAllowed')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">VALIDATION_FAILED</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {t('validationFailed')}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">SMS_SEND_FAILED</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {t('smsSendFailed')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('pricing')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            {t('pricingDescription')}
          </p>
        </section>

        {/* Rate Limits */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {t('rateLimits')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {t('rateLimitsDescription')}
          </p>
        </section>
      </div>
    </div>
  );
}
