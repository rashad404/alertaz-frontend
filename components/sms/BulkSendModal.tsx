'use client';

import { useState } from 'react';
import { X, Send, MessageSquare, Mail, AlertCircle, CheckCircle, Users } from 'lucide-react';

interface SendResult {
  sent?: number;
  failed?: number;
  skipped?: number;
}

interface BulkSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onSend: (data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }) => Promise<SendResult | void>;
}

export default function BulkSendModal({
  isOpen,
  onClose,
  selectedCount,
  onSend,
}: BulkSendModalProps) {
  const [channel, setChannel] = useState<'sms' | 'email' | 'both'>('sms');
  const [message, setMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    setError(null);
    setSuccess(null);
    setResult(null);
    setSending(true);

    try {
      const res = await onSend({
        channel,
        message: channel !== 'email' ? message : undefined,
        email_subject: channel !== 'sms' ? emailSubject : undefined,
        email_body: channel !== 'sms' ? emailBody : undefined,
      });

      if (res) {
        setResult(res);
        const sent = res.sent || 0;
        const failed = res.failed || 0;
        const skipped = res.skipped || 0;

        if (sent > 0) {
          setSuccess(`Successfully sent to ${sent} recipient${sent > 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}${skipped > 0 ? `, ${skipped} skipped` : ''}`);
        } else if (failed > 0) {
          setError(`Failed to send to ${failed} recipient${failed > 1 ? 's' : ''}`);
        } else if (skipped > 0) {
          setError(`All ${skipped} messages were skipped (no valid contact info)`);
        }
      } else {
        setSuccess('Messages sent successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setResult(null);
    setMessage('');
    setEmailSubject('');
    setEmailBody('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-indigo-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Users className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">Bulk Send Message</h2>
                <p className="text-sm opacity-90">{selectedCount} recipient{selectedCount > 1 ? 's' : ''} selected</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Success message */}
          {success && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-700 dark:text-green-300 text-sm">{success}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Channel</label>
            <div className="flex gap-3">
              <button
                onClick={() => setChannel('sms')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                  channel === 'sms'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                SMS
              </button>
              <button
                onClick={() => setChannel('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                  channel === 'email'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                onClick={() => setChannel('both')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                  channel === 'both'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Both
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Recipients without a valid {channel === 'sms' ? 'phone number' : channel === 'email' ? 'email address' : 'phone/email'} will be skipped
            </p>
          </div>

          {/* SMS Message */}
          {channel !== 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">SMS Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Type your message..."
              />
              <div className="mt-1 text-xs text-gray-500">{message.length} characters</div>
            </div>
          )}

          {/* Email */}
          {channel !== 'sms' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Type your email body..."
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            {success ? 'Close' : 'Cancel'}
          </button>
          {!success && (
            <button
              onClick={handleSend}
              disabled={
                sending ||
                (channel !== 'email' && !message) ||
                (channel !== 'sms' && (!emailSubject || !emailBody))
              }
              className="px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : `Send to ${selectedCount} recipient${selectedCount > 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
