"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import authService, { User } from '@/lib/api/auth';
import AuthModal from '@/components/auth/AuthModal';
import EmailSettings from './components/EmailSettings';
import PhoneSettings from './components/PhoneSettings';
import TelegramSettings from './components/TelegramSettings';
import WhatsAppSettings from './components/WhatsAppSettings';
import SlackSettings from './components/SlackSettings';
import PushSettings from './components/PushSettings';
import {
  Mail,
  Smartphone,
  Send,
  MessageCircle,
  Hash,
  Bell,
  Loader2
} from 'lucide-react';

interface NotificationSettingsClientProps {
  lang: string;
}

const NotificationSettingsClient: React.FC<NotificationSettingsClientProps> = ({ lang }) => {
  const t = useTranslations();
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
        setSuccessMessage(t('settings.notificationSettings.settingsUpdated'));
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
    {
      id: 'email',
      name: t('settings.notificationSettings.channels.email'),
      icon: Mail,
      component: EmailSettings
    },
    {
      id: 'phone',
      name: t('settings.notificationSettings.channels.phone'),
      icon: Smartphone,
      component: PhoneSettings
    },
    {
      id: 'telegram',
      name: t('settings.notificationSettings.channels.telegram'),
      icon: Send,
      component: TelegramSettings
    },
    {
      id: 'whatsapp',
      name: t('settings.notificationSettings.channels.whatsapp'),
      icon: MessageCircle,
      component: WhatsAppSettings
    },
    {
      id: 'slack',
      name: t('settings.notificationSettings.channels.slack'),
      icon: Hash,
      component: SlackSettings
    },
    {
      id: 'push',
      name: t('settings.notificationSettings.channels.push'),
      icon: Bell,
      component: PushSettings
    },
  ];

  const getChannelStatus = (channelId: string): boolean => {
    if (!user) return false;
    return user.available_notification_channels?.includes(channelId) || false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('settings.notificationSettings.signInToManage')}
            </h2>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all"
            >
              {t('settings.notificationSettings.signIn')}
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
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('settings.notificationSettings.title')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('settings.notificationSettings.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/${lang}/alerts`)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
              >
                {t('settings.notificationSettings.backToAlerts')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-green-700 dark:text-green-300">
            {successMessage}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:border-r border-gray-200 dark:border-gray-700 p-4">
              <nav className="space-y-2">
                {channels.map((channel) => {
                  const isActive = channel.id === activeTab;
                  const isConfigured = getChannelStatus(channel.id);
                  const Icon = channel.icon;

                  return (
                    <button
                      key={channel.id}
                      onClick={() => setActiveTab(channel.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all text-left
                        ${isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
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
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('settings.notificationSettings.channelStatus')}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {user.available_notification_channels?.length || 0} {t('settings.notificationSettings.configured')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {6 - (user.available_notification_channels?.length || 0)} {t('settings.notificationSettings.notConfigured')}
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
