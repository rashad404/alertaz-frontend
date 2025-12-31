'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function WalletCallbackPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(searchParams.get('error_description') || t('login.walletAuthFailed'));
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage(t('login.noAuthCode'));
        return;
      }

      // Verify state
      const savedState = sessionStorage.getItem('wallet_oauth_state');
      if (state !== savedState) {
        setStatus('error');
        setMessage(t('login.invalidState'));
        return;
      }

      try {
        const codeVerifier = sessionStorage.getItem('wallet_code_verifier');

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';

        // Exchange code for token via our backend
        const response = await fetch(`${API_URL}/auth/wallet/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: `${window.location.origin}/auth/wallet/callback`,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.status === 'error') {
          throw new Error(data.message || t('login.walletAuthFailed'));
        }

        // Clean up session storage
        sessionStorage.removeItem('wallet_oauth_state');
        sessionStorage.removeItem('wallet_code_verifier');

        // Store the token
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
          setStatus('success');
          setMessage(t('login.walletAuthSuccess'));

          // Redirect to dashboard after short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          throw new Error(t('login.noTokenReceived'));
        }
      } catch (err: any) {
        console.error('Wallet OAuth error:', err);
        setStatus('error');
        setMessage(err.message || t('login.walletAuthFailed'));
      }
    };

    handleCallback();
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card-glass rounded-3xl p-8 max-w-md w-full mx-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-indigo-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('login.processingWallet')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('login.pleaseWait')}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('login.walletAuthSuccess')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('login.redirecting')}
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('login.walletAuthFailed')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="btn-primary"
            >
              {t('login.backToLogin')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
