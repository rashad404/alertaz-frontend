'use client';

import { Mail } from 'lucide-react';

interface EmailPreviewCardProps {
  subject: string;
  body: string;
  title?: string;
}

export default function EmailPreviewCard({ subject, body, title }: EmailPreviewCardProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-700/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
          <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {title || 'Email Preview'}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Subject:</span>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{subject}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Body:</span>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words line-clamp-4">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
