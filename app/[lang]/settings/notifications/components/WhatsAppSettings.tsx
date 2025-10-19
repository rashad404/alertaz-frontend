"use client";

import React, { useState } from 'react';
import { User } from '@/lib/api/auth';

interface WhatsAppSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<boolean>;
  lang: string;
}

const WhatsAppSettings: React.FC<WhatsAppSettingsProps> = ({ user, onUpdate }) => {
  const [whatsappNumber, setWhatsappNumber] = useState(user.whatsapp_number || '+994');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    const cleanNumber = whatsappNumber.replace(/\s/g, '');
    if (!cleanNumber.match(/^\+994\d{9}$/)) {
      return;
    }

    setIsSaving(true);
    const success = await onUpdate({ whatsapp_number: cleanNumber });
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleDisconnect = async () => {
    setIsSaving(true);
    const success = await onUpdate({ whatsapp_number: null });
    if (success) {
      setWhatsappNumber('+994');
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const isConnected = !!user.whatsapp_number;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          WhatsApp Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Receive alerts through WhatsApp Business
        </p>
      </div>

      {/* Status Card */}
      <div className={`
        p-4 rounded-lg border-2 mb-6
        ${isConnected
          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
          : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'
        }
      `}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {isConnected ? (
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isConnected ? 'WhatsApp Connected' : 'Not Connected'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isConnected
                  ? `Messages will be sent to ${user.whatsapp_number}`
                  : 'Add your WhatsApp number to receive alerts'
                }
              </p>
            </div>
          </div>
          <span className={`
            px-2 py-1 text-xs rounded-full font-medium
            ${isConnected
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }
          `}>
            {isConnected ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Important Notice */}
      {!isConnected && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
            WhatsApp Business API Required
          </h4>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            WhatsApp notifications require approval from WhatsApp Business API.
            You'll need to verify your number with WhatsApp Business first.
          </p>
        </div>
      )}

      {/* WhatsApp Number Form */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsapp"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(formatPhone(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="+994 XX XXX XX XX"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be registered with WhatsApp Business
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || whatsappNumber.replace(/\s/g, '').length !== 13}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save WhatsApp Number'}
            </button>
            <button
              onClick={() => {
                setWhatsappNumber(user.whatsapp_number || '+994');
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
          {isConnected && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                WhatsApp Number
              </p>
              <p className="text-gray-900 dark:text-white">
                {user.whatsapp_number}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            {!isConnected ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add WhatsApp Number
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Change Number
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isSaving}
                  className="px-4 py-2 border border-red-300 text-red-700 dark:border-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          WhatsApp Notification Features
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">End-to-End Encrypted</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your alerts are delivered securely with WhatsApp encryption
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Rich Media Support</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive alerts with images, documents, and formatted text
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Global Reach</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive alerts anywhere in the world with WhatsApp
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettings;