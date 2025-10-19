"use client";

import React, { useState } from 'react';
import { User } from '@/lib/api/auth';

interface TelegramSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<boolean>;
  lang: string;
}

const TelegramSettings: React.FC<TelegramSettingsProps> = ({ user, onUpdate }) => {
  const [chatId, setChatId] = useState(user.telegram_chat_id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onUpdate({ telegram_chat_id: chatId });
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleDisconnect = async () => {
    setIsSaving(true);
    const success = await onUpdate({ telegram_chat_id: null });
    if (success) {
      setChatId('');
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const isConnected = !!user.telegram_chat_id;
  const botUsername = 'AlertAzBot'; // Replace with your actual bot username

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Telegram Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Receive instant alerts through Telegram messenger
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
                {isConnected ? 'Telegram Connected' : 'Not Connected'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isConnected
                  ? `Connected to @${botUsername}`
                  : 'Connect your Telegram account to receive alerts'
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

      {/* Connection Instructions */}
      {!isConnected && !isEditing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
            How to Connect Telegram
          </h4>
          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex gap-2">
              <span className="font-medium">1.</span>
              <span>Open Telegram and search for <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">@{botUsername}</code></span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">2.</span>
              <span>Start a conversation with the bot by clicking "Start"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">3.</span>
              <span>Send the command <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/connect</code></span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">4.</span>
              <span>The bot will send you your Chat ID</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">5.</span>
              <span>Enter your Chat ID below and save</span>
            </li>
          </ol>
          <div className="mt-4">
            <a
              href={`https://t.me/${botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.02-2.76-.918c-.6-.187-.612-.6.125-.89l10.782-4.156c.5-.18.943.12.78.89z"/>
              </svg>
              Open Telegram Bot
            </a>
          </div>
        </div>
      )}

      {/* Chat ID Form */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="chatId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Telegram Chat ID
            </label>
            <input
              type="text"
              id="chatId"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your Chat ID from the bot"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Get this from @{botUsername} by sending /connect
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !chatId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Chat ID'}
            </button>
            <button
              onClick={() => {
                setChatId(user.telegram_chat_id || '');
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
                Connected Account
              </p>
              <p className="text-gray-900 dark:text-white">
                Chat ID: {user.telegram_chat_id}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            {!isConnected ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Connect Telegram
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Chat ID
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isSaving}
                  className="px-4 py-2 border border-red-300 text-red-700 dark:border-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Disconnect
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Telegram Notification Features
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Lightning Fast</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instant delivery through Telegram's fast infrastructure
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Rich Media</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive alerts with charts, images, and formatted text
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Bot Commands</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage alerts directly from Telegram with bot commands
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramSettings;