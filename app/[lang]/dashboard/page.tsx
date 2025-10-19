'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Plus, TrendingUp, Activity, Settings, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Mock user data - replace with actual API call
    setUser({ name: 'User', email: 'user@example.com' });
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-indigo-600 dark:text-indigo-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-10]">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your alerts and stay informed
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <Link
            href="/alerts/quick-setup"
            className="inline-flex items-center gap-2 btn-primary group"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Alert</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Active Alerts */}
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
          </div>

          {/* Notifications Sent */}
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Notifications Sent</div>
          </div>

          {/* Quick Setup */}
          <div className="card-glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Ready</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">System Status</div>
          </div>
        </div>

        {/* Recent Alerts - Empty State */}
        <div className="card-glass rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Alerts
          </h2>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px]">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-gray-400" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No alerts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first alert to start monitoring what matters to you
            </p>

            <Link
              href="/alerts/quick-setup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Alert</span>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/settings"
            className="card-glass rounded-3xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/alerts"
            className="card-glass rounded-3xl p-6 hover:scale-105 transition-transform duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  All Alerts
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage all your alerts
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
