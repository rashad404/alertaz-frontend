"use client";

import React, { useState } from 'react';
import { User } from '@/lib/api/auth';

interface EmailSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<boolean>;
  lang: string;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ user, onUpdate }) => {
  const [email, setEmail] = useState(user.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onUpdate({ email });
    if (success) {
      setIsEditing(false);
      if (!user.email_verified_at) {
        setVerificationSent(true);
      }
    }
    setIsSaving(false);
  };

  const isVerified = !!user.email_verified_at;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Email Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Receive alert notifications via email
        </p>
      </div>

      {/* Status Card */}
      <div className={`
        p-4 rounded-lg border-2 mb-6
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
                {isVerified ? 'Email Verified' : email ? 'Verification Pending' : 'No Email Address'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {email || 'Add your email address to receive notifications'}
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

      {/* Email Form */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !email}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Email'}
            </button>
            <button
              onClick={() => {
                setEmail(user.email || '');
                setIsEditing(false);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Email
            </p>
            <p className="text-gray-900 dark:text-white">
              {email || 'Not configured'}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {email ? 'Change Email' : 'Add Email'}
          </button>
        </div>
      )}

      {/* Verification Notice */}
      {email && !isVerified && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            Email Verification Required
          </h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
            {verificationSent
              ? 'A verification email has been sent to your address. Please check your inbox and click the verification link.'
              : 'Please verify your email address to receive notifications.'
            }
          </p>
          <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
            Resend Verification Email
          </button>
        </div>
      )}

      {/* Features */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Email Notification Features
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Instant Delivery</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive alerts immediately when conditions are met
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Rich Formatting</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed alerts with charts and formatted data
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">No Spam</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Only receive alerts you've explicitly configured
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;