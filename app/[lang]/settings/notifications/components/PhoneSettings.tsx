"use client";

import React, { useState } from 'react';
import { User } from '@/lib/api/auth';
import authService from '@/lib/api/auth';

interface PhoneSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<boolean>;
  lang: string;
}

const PhoneSettings: React.FC<PhoneSettingsProps> = ({ user, onUpdate }) => {
  const [phone, setPhone] = useState(user.phone || '+994');
  const [isEditing, setIsEditing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+994')) {
      return '+994';
    }
    const match = cleaned.match(/^(\+994)(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (match) {
      const parts = [match[1]];
      if (match[2]) parts.push(match[2]);
      if (match[3]) parts.push(match[3]);
      if (match[4]) parts.push(match[4]);
      if (match[5]) parts.push(match[5]);
      return parts.join(' ');
    }
    return cleaned.slice(0, 13);
  };

  const handleSendOTP = async () => {
    setError('');
    const cleanPhone = phone.replace(/\s/g, '');

    if (!cleanPhone.match(/^\+994\d{9}$/)) {
      setError('Please enter a valid Azerbaijan phone number');
      return;
    }

    setIsSending(true);
    try {
      await authService.sendOTP({ phone: cleanPhone, purpose: 'verify' });
      setIsVerifying(true);
      setCountdown(60);
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    const cleanPhone = phone.replace(/\s/g, '');

    try {
      const response = await authService.verifyOTP({
        phone: cleanPhone,
        code: otpCode,
      });

      if (response.status === 'success') {
        await onUpdate({ phone: cleanPhone });
        setIsEditing(false);
        setIsVerifying(false);
        setOtpCode('');
      }
    } catch (err) {
      setError('Invalid verification code');
    }
  };

  const isVerified = !!user.phone_verified_at;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          SMS Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Receive alert notifications via SMS text messages
        </p>
      </div>

      {/* Status Card */}
      <div className={`
        p-4 rounded-lg border-2 mb-6
        ${isVerified
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
          : user.phone
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
              ) : user.phone ? (
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isVerified ? 'Phone Verified' : user.phone ? 'Verification Required' : 'No Phone Number'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {user.phone || 'Add your phone number to receive SMS alerts'}
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
            {isVerified ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Phone Form */}
      {isEditing ? (
        <div className="space-y-4">
          {!isVerifying ? (
            <>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+994 XX XXX XX XX"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Azerbaijan mobile numbers only
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSendOTP}
                  disabled={isSending || phone.replace(/\s/g, '').length !== 13}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send Verification Code'}
                </button>
                <button
                  onClick={() => {
                    setPhone(user.phone || '+994');
                    setIsEditing(false);
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We've sent a verification code to
                </p>
                <p className="font-medium text-gray-900 dark:text-white">{phone}</p>
              </div>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2 text-center text-lg tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={otpCode.length !== 6}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Verify
                </button>
                <button
                  onClick={() => {
                    setIsVerifying(false);
                    setOtpCode('');
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
              </div>
              {countdown > 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Resend code in {countdown} seconds
                </p>
              ) : (
                <button
                  onClick={handleSendOTP}
                  className="w-full text-sm text-blue-600 hover:text-blue-500"
                >
                  Resend verification code
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Phone Number
            </p>
            <p className="text-gray-900 dark:text-white">
              {user.phone || 'Not configured'}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {user.phone ? 'Change Phone Number' : 'Add Phone Number'}
          </button>
        </div>
      )}

      {/* Features */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          SMS Notification Features
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Instant Delivery</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get SMS alerts directly to your phone instantly
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Works Offline</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive alerts even when you don't have internet
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Priority Alerts</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Critical alerts are delivered with high priority
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneSettings;