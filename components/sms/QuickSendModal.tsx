'use client';

import { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Mail, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface SendResult {
  sms?: { status: string; error?: string };
  email?: { status: string; error?: string };
}

interface QuickSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'customer' | 'service';
  targetName: string;
  targetInfo?: {
    phone?: string;
    email?: string;
  };
  variables: Record<string, any>;
  onSend: (data: {
    channel: 'sms' | 'email' | 'both';
    message?: string;
    email_subject?: string;
    email_body?: string;
  }) => Promise<SendResult | void>;
}

export default function QuickSendModal({
  isOpen,
  onClose,
  targetType,
  targetName,
  targetInfo,
  variables,
  onSend,
}: QuickSendModalProps) {
  const canSendSms = !!targetInfo?.phone;
  const canSendEmail = !!targetInfo?.email;

  // Auto-select the first available channel
  const getDefaultChannel = (): 'sms' | 'email' | 'both' => {
    if (canSendSms && canSendEmail) return 'both';
    if (canSendSms) return 'sms';
    if (canSendEmail) return 'email';
    return 'sms'; // fallback
  };

  const [channel, setChannel] = useState<'sms' | 'email' | 'both'>(getDefaultChannel());
  const [message, setMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setChannel(getDefaultChannel());
      setMessage('');
      setEmailSubject('');
      setEmailBody('');
      setError(null);
      setSuccess(null);
      setSendResult(null);
    }
  }, [isOpen, canSendSms, canSendEmail]);

  if (!isOpen) return null;

  const insertVariable = (field: 'message' | 'email_subject' | 'email_body', variable: string) => {
    const insertion = `{{${variable}}}`;
    switch (field) {
      case 'message':
        setMessage(prev => prev + insertion);
        break;
      case 'email_subject':
        setEmailSubject(prev => prev + insertion);
        break;
      case 'email_body':
        setEmailBody(prev => prev + insertion);
        break;
    }
  };

  const handleSend = async () => {
    setError(null);
    setSuccess(null);
    setSendResult(null);
    setSending(true);

    try {
      const result = await onSend({
        channel,
        message: channel !== 'email' ? message : undefined,
        email_subject: channel !== 'sms' ? emailSubject : undefined,
        email_body: channel !== 'sms' ? emailBody : undefined,
      });

      // Check result for success/failure
      if (result) {
        setSendResult(result);

        const smsStatus = result.sms?.status;
        const emailStatus = result.email?.status;

        const smsSent = smsStatus === 'sent';
        const emailSent = emailStatus === 'sent';
        const smsSkipped = smsStatus === 'skipped';
        const emailSkipped = emailStatus === 'skipped';
        const smsFailed = smsStatus === 'failed';
        const emailFailed = emailStatus === 'failed';

        if (smsSent || emailSent) {
          const parts = [];
          if (smsSent) parts.push('SMS');
          if (emailSent) parts.push('Email');
          setSuccess(`${parts.join(' and ')} sent successfully!`);
        } else if (smsFailed || emailFailed) {
          const errors = [];
          if (smsFailed && result.sms?.error) errors.push(`SMS: ${result.sms.error}`);
          if (emailFailed && result.email?.error) errors.push(`Email: ${result.email.error}`);
          setError(errors.join('. ') || 'Failed to send message');
        } else if (smsSkipped && emailSkipped) {
          setError('Message was skipped. No valid recipient found.');
        } else if (smsSkipped && channel === 'sms') {
          setError('SMS skipped - no valid phone number');
        } else if (emailSkipped && channel === 'email') {
          setError('Email skipped - no valid email address');
        }
      } else {
        setSuccess('Message sent successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    setSendResult(null);
    onClose();
  };

  const variablesList = Object.keys(variables);

  // Check if current channel selection is valid
  const isChannelValid = () => {
    if (channel === 'sms') return canSendSms;
    if (channel === 'email') return canSendEmail;
    if (channel === 'both') return canSendSms && canSendEmail;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Message</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {targetType === 'service' ? 'Service' : 'Customer'}: <span className="text-gray-900 dark:text-white">{targetName}</span>
            </div>
            <div className="flex gap-4 mt-1 text-sm">
              {targetInfo?.phone ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {targetInfo.phone}
                </span>
              ) : (
                <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  No phone number
                </span>
              )}
              {targetInfo?.email ? (
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {targetInfo.email}
                </span>
              ) : (
                <span className="text-red-500 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  No email
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* No contact info warning */}
          {!canSendSms && !canSendEmail && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm">
                Cannot send message: No phone number or email address available for this {targetType}.
              </span>
            </div>
          )}

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
          {(canSendSms || canSendEmail) && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Channel</label>
              <div className="flex gap-3">
                <button
                  onClick={() => canSendSms && setChannel('sms')}
                  disabled={!canSendSms}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                    channel === 'sms'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${!canSendSms ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  SMS
                  {!canSendSms && <span className="text-xs">(No phone)</span>}
                </button>
                <button
                  onClick={() => canSendEmail && setChannel('email')}
                  disabled={!canSendEmail}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                    channel === 'email'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${!canSendEmail ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                  {!canSendEmail && <span className="text-xs">(No email)</span>}
                </button>
                <button
                  onClick={() => canSendSms && canSendEmail && setChannel('both')}
                  disabled={!canSendSms || !canSendEmail}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-colors ${
                    channel === 'both'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${(!canSendSms || !canSendEmail) ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
                >
                  Both
                </button>
              </div>
            </div>
          )}

          {/* SMS Message */}
          {channel !== 'email' && canSendSms && (
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
          {channel !== 'sms' && canSendEmail && (
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

          {/* Variables */}
          {variablesList.length > 0 && (canSendSms || canSendEmail) && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Available Variables</label>
              <div className="flex flex-wrap gap-2">
                {variablesList.map((variable) => (
                  <button
                    key={variable}
                    onClick={() => insertVariable(channel === 'email' ? 'email_body' : 'message', variable)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                  >
                    {`{{${variable}}}`}
                  </button>
                ))}
              </div>
            </div>
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
                !isChannelValid() ||
                (channel !== 'email' && !message) ||
                (channel !== 'sms' && (!emailSubject || !emailBody))
              }
              className="px-6 py-2 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
