"use client";

import React, { useState } from 'react';
import { User } from '@/lib/api/auth';
import authService from '@/lib/api/auth';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  XCircle,
  Mail,
  Loader2
} from 'lucide-react';

interface EmailSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<boolean>;
  onUserChange?: (user: User) => void;
  lang: string;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ user, onUpdate, onUserChange, lang }) => {
  const t = useTranslations();
  const [email, setEmail] = useState(user.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    const success = await onUpdate({ email });
    if (success) {
      setIsEditing(false);
      if (!user.email_verified_at) {
        // Send verification email after saving
        await handleSendVerification();
      }
    }
    setIsSaving(false);
  };

  const handleSendVerification = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email || email })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setVerificationSent(true);
        setShowVerificationModal(true);
        setMessage({ type: 'success', text: data.message });

        // Log debug info in development
        if (data.data?.debug?.code) {
          console.log('Verification code (DEV MODE):', data.data.debug.code);
        }
      } else {
        setMessage({ type: 'error', text: data.message || t('common.error') });
      }
    } catch (error) {
      console.error('Failed to send verification:', error);
      setMessage({ type: 'error', text: t('settings.profile.connectionError') });
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setVerificationError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          identifier: user.email || email,
          type: 'email'
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setMessage({ type: 'success', text: t('settings.email.codeResent') });
        setVerificationCode('');

        // Log debug info in development
        if (data.data?.debug?.code) {
          console.log('Verification code (DEV MODE):', data.data.debug.code);
        }
      } else {
        setMessage({ type: 'error', text: data.message || t('common.error') });
      }
    } catch (error) {
      console.error('Failed to resend code:', error);
      setMessage({ type: 'error', text: t('settings.profile.connectionError') });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setVerificationError(t('settings.email.enterCode'));
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      // Use authenticated endpoint to verify email for current user
      const response = await authService.verifyEmailForUser({
        email: user.email || email,
        code: verificationCode
      });

      if (response.status === 'success' && response.data?.user) {
        // Update local user state with verified user from response
        if (onUserChange) {
          onUserChange(response.data.user);
        }

        setMessage({ type: 'success', text: t('settings.email.verificationSuccess') });
        setShowVerificationModal(false);
        setVerificationCode('');
        setVerificationError('');
      } else {
        setVerificationError(response.message || t('settings.email.codeInvalid'));
      }
    } catch (error) {
      console.error('Failed to verify code:', error);
      setVerificationError(t('settings.profile.connectionError'));
    } finally {
      setIsVerifying(false);
    }
  };

  const isVerified = !!user.email_verified_at;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('settings.email.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('settings.email.description')}
        </p>
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-2xl ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm ${
            message.type === 'success'
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Status Card */}
      <div className={`
        p-4 rounded-2xl border-2 mb-6
        ${isVerified
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
          : email
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
          : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
        }
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {isVerified ? (
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : email ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isVerified ? t('settings.email.verified') : email ? t('settings.email.verificationPending') : t('settings.email.noEmail')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {email || t('settings.email.addEmailPrompt')}
              </p>
            </div>
          </div>
          <span className={`
            px-2 py-1 text-xs rounded-full font-medium
            ${isVerified
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }
          `}>
            {isVerified ? t('settings.notificationSettings.status.active') : t('settings.notificationSettings.status.inactive')}
          </span>
        </div>
      </div>

      {/* Email Form */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.email.emailAddress')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder={t('settings.email.emailPlaceholder')}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !email}
              className="px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('settings.email.saving')}
                </>
              ) : (
                t('settings.email.saveEmail')
              )}
            </button>
            <button
              onClick={() => {
                setEmail(user.email || '');
                setIsEditing(false);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('settings.email.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.email.currentEmail')}
            </p>
            <p className="text-gray-900 dark:text-white">
              {email || t('settings.email.notConfigured')}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all"
          >
            {email ? t('settings.email.changeEmail') : t('settings.email.addEmail')}
          </button>
        </div>
      )}

      {/* Verification Notice */}
      {email && !isVerified && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            {t('settings.email.verificationRequired')}
          </h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            {verificationSent
              ? t('settings.email.verificationSent')
              : t('settings.email.verificationPrompt')
            }
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSendVerification}
              disabled={isResending}
              className="px-3 py-1 bg-yellow-600 text-white rounded-xl text-sm hover:bg-yellow-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {t('settings.email.resending')}
                </>
              ) : (
                t('settings.email.resendVerification')
              )}
            </button>
            {verificationSent && (
              <button
                onClick={() => setShowVerificationModal(true)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-all"
              >
                {t('settings.email.verifyEmail')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('settings.email.verifyEmail')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {email}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('settings.email.verificationSent')}
            </p>

            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('settings.email.enterCode')}
              </label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setVerificationCode(value);
                  setVerificationError('');
                }}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder={t('settings.email.codePlaceholder')}
                maxLength={6}
                autoFocus
              />
              {verificationError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{verificationError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('settings.email.verifying')}
                  </>
                ) : (
                  t('settings.email.verifyEmail')
                )}
              </button>
              <button
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationCode('');
                  setVerificationError('');
                }}
                className="px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('common.cancel')}
              </button>
            </div>

            <button
              onClick={handleResendCode}
              disabled={isResending}
              className="w-full mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 transition-colors"
            >
              {isResending ? t('settings.email.resending') : t('settings.email.resendVerification')}
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('settings.email.features.title')}
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t('settings.email.features.instantDelivery')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.email.features.instantDeliveryDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t('settings.email.features.richFormatting')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.email.features.richFormattingDesc')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{t('settings.email.features.noSpam')}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('settings.email.features.noSpamDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;
