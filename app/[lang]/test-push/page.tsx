'use client';

import { useState } from 'react';
import { Bell, Send, CheckCircle, XCircle, BellRing } from 'lucide-react';
import axios from 'axios';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';

export default function TestPushPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const {
    isSupported,
    isSubscribed,
    isLoading: subLoading,
    error: subError,
    permission,
    subscribe,
  } = usePushNotifications();

  const sendTestNotification = async () => {
    setIsLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in first!');
        setMessageType('error');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/notifications/test`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        setMessage('✅ Test notification sent successfully! Check your browser for the notification.');
        setMessageType('success');

        // Trigger notification center to refresh unread count
        window.dispatchEvent(new Event('refreshNotifications'));
      } else {
        setMessage('❌ Failed to send notification: ' + (response.data.message || 'Unknown error'));
        setMessageType('error');
      }
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      setMessage('❌ Error: ' + (error.response?.data?.message || error.message));
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Test Push Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Send yourself a test notification to verify everything is working
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Before testing:
            </h2>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">1.</span>
                <span>Make sure you're logged in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">2.</span>
                <span>Enable push notifications when prompted (or check the bell icon in header)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">3.</span>
                <span>Allow notification permissions in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">4.</span>
                <span>Click the button below to send a test notification</span>
              </li>
            </ul>
          </div>

          {/* Subscription Status */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Push Notification Status
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Browser Support:</span>
                <span className={`font-medium ${isSupported ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {isSupported ? '✅ Supported' : '❌ Not Supported'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Permission Status:</span>
                <span className={`font-medium ${
                  permission === 'granted'
                    ? 'text-green-600 dark:text-green-400'
                    : permission === 'denied'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {permission === 'granted' ? '✅ Granted' : permission === 'denied' ? '❌ Denied' : '⚠️ Not Asked'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subscription Status:</span>
                <span className={`font-medium ${isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {isSubscribed ? '✅ Subscribed' : '➖ Not Subscribed'}
                </span>
              </div>
            </div>

            {/* Subscription Error */}
            {subError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400">
                  <strong>Error:</strong> {subError}
                </p>
              </div>
            )}

            {/* Manual Subscribe Button */}
            {!isSubscribed && isSupported && (
              <button
                onClick={async () => {
                  console.log('[TestPush] Manual subscribe button clicked');
                  await subscribe();
                }}
                disabled={subLoading}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {subLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <BellRing className="w-4 h-4" />
                    <span>Enable Push Notifications</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={sendTestNotification}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-4 px-6 rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Test Notification</span>
              </>
            )}
          </button>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-2xl flex items-start gap-3 ${
                messageType === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-sm ${
                  messageType === 'success'
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}
              >
                {message}
              </p>
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Troubleshooting:
            </h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li>• Check browser console (F12) for any errors</li>
              <li>• Ensure browser notifications are not blocked</li>
              <li>• Some browsers require HTTPS for push notifications (except localhost)</li>
              <li>• Check the notification center bell icon in the header for unread notifications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
