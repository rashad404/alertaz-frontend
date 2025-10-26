'use client';

import { useState, useEffect } from 'react';
import { Bell, X, BellRing } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushNotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    permission,
    subscribe,
  } = usePushNotifications();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    setIsAuthenticated(true);

    // Check if user has already dismissed or subscribed
    const dismissed = localStorage.getItem('push_prompt_dismissed');

    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after 3 seconds if conditions are met
    const timer = setTimeout(() => {
      if (
        isSupported &&
        !isSubscribed &&
        permission === 'default' &&
        !isDismissed
      ) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission, isDismissed]);

  const handleSubscribe = async () => {
    await subscribe();
    // Prompt will auto-hide when isSubscribed becomes true
  };

  // Auto-hide prompt when subscription succeeds
  useEffect(() => {
    if (isSubscribed && isVisible) {
      setIsVisible(false);
    }
  }, [isSubscribed, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('push_prompt_dismissed', 'true');
  };

  if (!isAuthenticated || !isVisible || !isSupported || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <BellRing className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Enable Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get instant alerts when your monitored conditions are met. Never miss an important update.
            </p>
            
            {error && (
              <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enabling...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4" />
                    Enable
                  </span>
                )}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
