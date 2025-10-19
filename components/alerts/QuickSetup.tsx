'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export default function QuickSetup() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[rgb(81,91,195)] to-indigo-400 rounded-2xl mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Alert
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set up monitoring in just 2 simple steps
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Alert setup functionality is being updated. Please check back soon.
          </p>
        </div>
      </div>
    </div>
  );
}