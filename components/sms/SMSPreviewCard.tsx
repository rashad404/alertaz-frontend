'use client';

import { Smartphone } from 'lucide-react';

interface SMSPreviewCardProps {
  message: string;
  title?: string;
  segments?: number;
}

export default function SMSPreviewCard({ message, title, segments }: SMSPreviewCardProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200/50 dark:border-indigo-700/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
          <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          {title || 'SMS Preview'}
        </span>
        {segments !== undefined && segments > 0 && (
          <span className="ml-auto text-xs text-indigo-600 dark:text-indigo-400">
            {segments} {segments === 1 ? 'segment' : 'segments'}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
        {message}
      </p>
    </div>
  );
}
