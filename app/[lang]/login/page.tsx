'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/lib/navigation';
import { Bell, Mail, Lock, ArrowRight, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

// PKCE helpers
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateUUID(): string {
  // Use native if available (HTTPS)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for HTTP
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Check if crypto.subtle is available (requires HTTPS)
function isSecureContext(): boolean {
  return typeof crypto !== 'undefined' && crypto.subtle !== undefined;
}

async function generateCodeChallenge(verifier: string): Promise<{ challenge: string; method: 'S256' | 'plain' }> {
  // Use S256 method if crypto.subtle is available (HTTPS)
  if (isSecureContext()) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return { challenge, method: 'S256' };
  }

  // Fallback to plain method for HTTP (less secure, for development only)
  return { challenge: verifier, method: 'plain' };
}

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://100.89.150.50:8007/api';

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Login failed');
      }

      // Store the real authentication token
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        console.log('[Login] Successfully logged in with token:', data.data.token.substring(0, 20) + '...');
        router.push('/dashboard');
      } else {
        throw new Error('No token received from server');
      }
    } catch (err: any) {
      console.error('[Login] Error:', err);
      setError(err.message || t('login.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setIsWalletLoading(true);
    setError('');

    try {
      const codeVerifier = generateCodeVerifier();
      const { challenge: codeChallenge, method: codeChallengeMethod } = await generateCodeChallenge(codeVerifier);
      const state = generateUUID();

      // Store for callback verification
      sessionStorage.setItem('wallet_code_verifier', codeVerifier);
      sessionStorage.setItem('wallet_oauth_state', state);

      const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_URL || 'http://100.89.150.50:3011';
      const CLIENT_ID = process.env.NEXT_PUBLIC_WALLET_CLIENT_ID || '';
      const REDIRECT_URI = `${window.location.origin}/auth/wallet/callback`;

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'profile:read verification:read',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod,
        response_type: 'code',
      });

      // Redirect to Wallet.az frontend authorization page
      window.location.href = `${WALLET_URL}/oauth/authorize?${params}`;
    } catch (err: any) {
      console.error('[Wallet Login] Error:', err);
      setError(err.message || t('login.walletAuthFailed'));
      setIsWalletLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-10]">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
      </div>

      <div className="w-full max-w-md px-6 py-12">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="relative">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="relative">
                  <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} fill="none" />
                  <div className="absolute inset-0 w-6 h-6">
                    <Bell className="w-6 h-6 text-purple-500 opacity-50" strokeWidth={2} fill="none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span className="gradient-text text-2xl font-bold">Alert.az</span>
        </Link>

        {/* Welcome Text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('login.welcomeBack')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('login.signInToManage')}
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card-glass rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder={t('login.passwordPlaceholder')}
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                {t('login.forgotPassword')}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary group flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>{t('login.signingIn')}</span>
              ) : (
                <>
                  <span>{t('login.signIn')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/50 dark:bg-gray-900/50 text-gray-500">
                {t('login.orContinueWith')}
              </span>
            </div>
          </div>

          {/* Wallet Login */}
          <button
            type="button"
            onClick={handleWalletLogin}
            disabled={isWalletLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium transition-all disabled:opacity-50"
          >
            <Wallet className="w-5 h-5" />
            <span>
              {isWalletLoading ? t('login.connecting') : t('login.loginWithWallet')}
            </span>
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('login.noAccount')}{' '}
          <Link href="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            {t('login.signUp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
