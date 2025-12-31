'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Link } from '@/lib/navigation';
import {
  User,
  Bell,
  Shield,
  ChevronRight,
  Mail,
  Phone,
  Edit2,
  Loader2,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.lang as string) || 'az';

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Check if returning from Wallet.az profile edit
  const walletUpdated = searchParams.get('wallet_updated');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push(`/login`);
      return;
    }

    const fetchUser = async () => {
      try {
        // If returning from Wallet.az, sync profile first
        if (walletUpdated === '1') {
          setSyncing(true);
          try {
            const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/sync-from-wallet`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const syncData = await syncResponse.json();
            if (syncData.status === 'success') {
              setUser(syncData.data);
              // Remove the query parameter from URL
              window.history.replaceState({}, '', window.location.pathname);
              setLoading(false);
              setSyncing(false);
              return;
            }
          } catch (err) {
            console.error('Failed to sync from Wallet.az:', err);
          }
          setSyncing(false);
          // Remove the query parameter even if sync failed
          window.history.replaceState({}, '', window.location.pathname);
        }

        // Normal user fetch
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.status === 'success') {
          setUser(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, locale, walletUpdated]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        {syncing && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('settings.syncingFromWallet')}
          </p>
        )}
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const settingsMenu = [
    {
      id: 'profile',
      title: t('settings.profile.title'),
      description: t('settings.profile.description'),
      icon: User,
      href: `/settings/profile`,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
    },
    {
      id: 'notifications',
      title: t('settings.notifications'),
      description: t('settings.notificationsDescription'),
      icon: Bell,
      href: `/settings/notifications`,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      id: 'security',
      title: t('settings.security.title'),
      description: t('settings.security.description'),
      icon: Shield,
      href: `/settings/security`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t('settings.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('settings.manageAccount')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 sticky top-8">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
                {/* Wallet.az Connected Badge */}
                {user.wallet_id && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                    <Wallet className="w-3.5 h-3.5" />
                    {t('settings.connectedViaWallet')}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6">
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Edit Profile Button */}
              {user.wallet_id ? (
                <a
                  href={`${process.env.NEXT_PUBLIC_WALLET_URL || 'https://wallet.az'}/settings/profile?return_url=${encodeURIComponent(window.location.origin + '/settings?wallet_updated=1')}`}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-center font-medium text-sm flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t('settings.editOnWallet')}
                </a>
              ) : (
                <Link
                  href={`/settings/profile`}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-center font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {t('settings.profile.editProfile')}
                </Link>
              )}
            </div>
          </div>

          {/* Settings Menu */}
          <div className="lg:col-span-2 space-y-4">
            {settingsMenu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-3xl p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
