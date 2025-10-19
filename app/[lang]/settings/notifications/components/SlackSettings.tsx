"use client";

import React, { useState } from 'react';
import { User } from '@/lib/api/auth';

interface SlackSettingsProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<boolean>;
  lang: string;
}

const SlackSettings: React.FC<SlackSettingsProps> = ({ user, onUpdate }) => {
  const [webhook, setWebhook] = useState(user.slack_webhook || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    if (!webhook.startsWith('https://hooks.slack.com/')) {
      return;
    }

    setIsSaving(true);
    const success = await onUpdate({ slack_webhook: webhook });
    if (success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleTest = async () => {
    setIsTesting(true);
    // TODO: Send test notification to webhook
    setTimeout(() => {
      setIsTesting(false);
    }, 2000);
  };

  const handleDisconnect = async () => {
    setIsSaving(true);
    const success = await onUpdate({ slack_webhook: null });
    if (success) {
      setWebhook('');
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const isConnected = !!user.slack_webhook;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Slack Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Send alerts to your Slack workspace
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
                {isConnected ? 'Slack Connected' : 'Not Connected'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isConnected
                  ? 'Webhook configured for your workspace'
                  : 'Connect Slack to receive alerts in your channels'
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

      {/* Setup Instructions */}
      {!isConnected && !isEditing && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-3">
            How to Get Your Slack Webhook URL
          </h4>
          <ol className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
            <li className="flex gap-2">
              <span className="font-medium">1.</span>
              <span>Go to your Slack workspace and click on Apps</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">2.</span>
              <span>Search for "Incoming WebHooks" and add it</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">3.</span>
              <span>Choose the channel where alerts will be posted</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">4.</span>
              <span>Copy the Webhook URL provided</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">5.</span>
              <span>Paste it below to connect Alert.az</span>
            </li>
          </ol>
          <div className="mt-4">
            <a
              href="https://slack.com/apps/A0F7XDUAZ-incoming-webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Open Slack App Directory
            </a>
          </div>
        </div>
      )}

      {/* Webhook Form */}
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="webhook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slack Webhook URL
            </label>
            <input
              type="url"
              id="webhook"
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="https://hooks.slack.com/services/..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Get this from your Slack workspace's Incoming Webhooks app
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving || !webhook.startsWith('https://hooks.slack.com/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Webhook'}
            </button>
            <button
              onClick={() => {
                setWebhook(user.slack_webhook || '');
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
            <>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Webhook URL
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                  {user.slack_webhook}
                </p>
              </div>
              <button
                onClick={handleTest}
                disabled={isTesting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isTesting ? 'Sending...' : 'Send Test Notification'}
              </button>
            </>
          )}
          <div className="flex gap-3">
            {!isConnected ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Connect Slack
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Webhook
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
          Slack Notification Features
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Team Collaboration</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share alerts with your entire team in Slack channels
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
                Beautiful alert messages with attachments and buttons
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Thread Discussions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discuss alerts with your team directly in Slack threads
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackSettings;