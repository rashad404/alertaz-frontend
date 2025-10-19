"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService, { User } from '@/lib/api/auth';
import AuthModal from '@/components/auth/AuthModal';
import EmailSettings from './components/EmailSettings';
import PhoneSettings from './components/PhoneSettings';
import TelegramSettings from './components/TelegramSettings';
import WhatsAppSettings from './components/WhatsAppSettings';
import SlackSettings from './components/SlackSettings';
import PushSettings from './components/PushSettings';

interface NotificationSettingsClientProps {
  lang: string;
}

const NotificationSettingsClient: React.FC<NotificationSettingsClientProps> = ({ lang }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setShowAuthModal(true);
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setShowAuthModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const response = await authService.updateProfile(updates);
      if (response.status === 'success') {
        setUser(response.data as User);
        setSuccessMessage('Settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        return true;
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
    return false;
  };

  const channels = [
    { id: 'email', name: 'Email', icon: '✉️', component: EmailSettings },
    { id: 'phone', name: 'Phone/SMS', icon: '📱', component: PhoneSettings },
    { id: 'telegram', name: 'Telegram', icon: '✈️', component: TelegramSettings },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬', component: WhatsAppSettings },
    { id: 'slack', name: 'Slack', icon: '#️⃣', component: SlackSettings },
    { id: 'push', name: 'Push Notifications', icon: '🔔', component: PushSettings },
  ];

  const getChannelStatus = (channelId: string): boolean => {
    if (!user) return false;
    return user.available_notification_channels?.includes(channelId) || false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Sign in to manage notification settings
            </h2>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => router.push('/')}
          onSuccess={() => {
            setShowAuthModal(false);
            loadUser();
          }}
        />
      </>
    );
  }

  const ActiveComponent = channels.find(ch => ch.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notification Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure how you receive alerts
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/${lang}/alerts`)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Back to Alerts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            {successMessage}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:border-r border-gray-200 dark:border-gray-700 p-4">
              <nav className="space-y-2">
                {channels.map((channel) => {
                  const isActive = channel.id === activeTab;
                  const isConfigured = getChannelStatus(channel.id);

                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveTab(channel.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-left
                        ${isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{channel.icon}</span>
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      <div className={`
                        w-2 h-2 rounded-full
                        ${isConfigured ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `} />
                    </button>
                  );
                })}
              </nav>

              {/* Status Summary */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Channel Status
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {user.available_notification_channels?.length || 0} configured
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {6 - (user.available_notification_channels?.length || 0)} not configured
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 p-6">
              {ActiveComponent && (
                <ActiveComponent
                  user={user}
                  onUpdate={handleUpdateUser}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsClient;