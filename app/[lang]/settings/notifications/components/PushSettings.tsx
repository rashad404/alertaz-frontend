"use client";

import React, { useState, useEffect } from 'react';
import { User } from '@/lib/api/auth';

interface PushSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<boolean>;
  lang: string;
}

const PushSettings: React.FC<PushSettingsProps> = ({ user, onUpdate }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabling, setIsEnabling] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnable = async () => {
    if (!isSupported) return;

    setIsEnabling(true);

    try {
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY', // Replace with actual key
        });

        // Save push token to user profile
        const pushToken = JSON.stringify(subscription);
        const success = await onUpdate({ push_token: pushToken });

        if (success) {
          // Show test notification
          new Notification('Alert.az', {
            body: 'Push notifications enabled successfully!',
            icon: '/icon-192.png',
          });
        }
      }
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDisable = async () => {
    setIsEnabling(true);

    try {
      // Unsubscribe from push notifications
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove push token from user profile
      await onUpdate({ push_token: null });
    } catch (error) {
      console.error('Failed to disable push notifications:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  const isEnabled = !!user.push_token && permission === 'granted';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Push Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Receive alerts directly in your browser, even when the site is closed
        </p>
      </div>

      {/* Status Card */}
      <div className={`
        p-4 rounded-lg border-2 mb-6
        ${isEnabled
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
          : permission === 'denied'
          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
          : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
        }
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {isEnabled ? (
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : permission === 'denied' ? (
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isEnabled
                  ? 'Push Notifications Enabled'
                  : permission === 'denied'
                  ? 'Notifications Blocked'
                  : 'Push Notifications Disabled'
                }
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isEnabled
                  ? 'You will receive browser notifications for your alerts'
                  : permission === 'denied'
                  ? 'Browser notifications are blocked. Please check your browser settings.'
                  : 'Enable push notifications to receive instant alerts'
                }
              </p>
            </div>
          </div>
          <span className={`
            px-2 py-1 text-xs rounded-full font-medium
            ${isEnabled
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : permission === 'denied'
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }
          `}>
            {isEnabled ? 'Active' : permission === 'denied' ? 'Blocked' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Browser Support Check */}
      {!isSupported && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            Browser Not Supported
          </h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      )}

      {/* Permission Denied Notice */}
      {permission === 'denied' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
            Notifications Blocked
          </h4>
          <p className="text-sm text-red-800 dark:text-red-200 mb-3">
            You have blocked notifications for this site. To enable them:
          </p>
          <ol className="space-y-1 text-sm text-red-800 dark:text-red-200">
            <li>1. Click the lock icon in your browser's address bar</li>
            <li>2. Find "Notifications" in the permissions</li>
            <li>3. Change it to "Allow"</li>
            <li>4. Refresh this page</li>
          </ol>
        </div>
      )}

      {/* Enable/Disable Button */}
      {isSupported && permission !== 'denied' && (
        <div className="space-y-4">
          {!isEnabled ? (
            <button
              onClick={handleEnable}
              disabled={isEnabling}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isEnabling ? 'Enabling...' : 'Enable Push Notifications'}
            </button>
          ) : (
            <button
              onClick={handleDisable}
              disabled={isEnabling}
              className="px-4 py-2 border border-red-300 text-red-700 dark:border-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {isEnabling ? 'Disabling...' : 'Disable Push Notifications'}
            </button>
          )}
        </div>
      )}

      {/* Features */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Push Notification Features
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Works in Background</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive alerts even when Alert.az is not open
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Native Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Uses your system's native notification center
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Click Actions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click notifications to view alert details instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Browser Compatibility */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Supported Browsers
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div>✓ Chrome 50+</div>
          <div>✓ Firefox 44+</div>
          <div>✓ Safari 16+</div>
          <div>✓ Edge 17+</div>
        </div>
      </div>
    </div>
  );
};

export default PushSettings;