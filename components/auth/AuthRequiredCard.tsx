'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bell, Wallet, Loader2, ArrowLeft } from 'lucide-react';
import { openWalletLogin, getLocaleFromPathname } from '@/lib/utils/walletAuth';

interface AuthRequiredCardProps {
  title?: string;
  message?: string;
  onSuccess?: () => void;
}

export default function AuthRequiredCard({
  title,
  message,
  onSuccess
}: AuthRequiredCardProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const locale = getLocaleFromPathname(pathname);

  const handleWalletLogin = () => {
    setIsLoading(true);
    setError('');

    openWalletLogin({
      locale,
      onSuccess: () => {
        setIsLoading(false);
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      },
      onError: (err) => {
        setIsLoading(false);
        if (err === 'popup_blocked') {
          setError(t('auth.popupBlocked'));
        } else {
          setError(t('auth.loginFailed'));
        }
      }
    });
  };

  const handleGoBack = () => {
    const homePath = locale === 'az' ? '/' : `/${locale}`;
    router.push(homePath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-800">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
                <Bell className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title || t('auth.signInToContinue')}
            </h1>
            {message && (
              <p className="text-gray-600 dark:text-gray-400">
                {message}
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Wallet Login Button */}
          <button
            type="button"
            onClick={handleWalletLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('auth.connecting')}</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>{t('auth.loginWithWallet')}</span>
              </>
            )}
          </button>

          {/* Back to home link */}
          <button
            onClick={handleGoBack}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('auth.backToHome')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
