"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlertCreationWizard from '@/components/alerts/AlertCreationWizard';
import AuthModal from '@/components/auth/AuthModal';
import authService, { User } from '@/lib/api/auth';
import alertsService, { PersonalAlert } from '@/lib/api/alerts';

interface AlertsPageClientProps {
  lang: string;
}

const AlertsPageClient: React.FC<AlertsPageClientProps> = ({ lang }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [alerts, setAlerts] = useState<PersonalAlert[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user, currentPage]);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (!currentUser) {
        setShowAuthModal(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setShowAuthModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await alertsService.getUserAlerts(currentPage);
      setAlerts(response.data || []);
      setTotalPages(response.last_page || 1);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleCreateAlert = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowWizard(true);
    }
  };

  const handleAlertCreated = (alert: PersonalAlert) => {
    setShowWizard(false);
    loadAlerts();
  };

  const handleToggleAlert = async (alertId: number) => {
    try {
      await alertsService.toggleAlert(alertId);
      loadAlerts();
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId: number) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      await alertsService.deleteAlert(alertId);
      loadAlerts();
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    checkAuth();
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setAlerts([]);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <AlertCreationWizard
          onComplete={handleAlertCreated}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Alerts
              </h1>
              {user && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Welcome back, {user.name}!
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateAlert}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create New Alert
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Sign in to view your alerts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create and manage price alerts for cryptocurrencies, stocks, and more.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔔</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              No alerts yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start monitoring prices and get notified when conditions are met.
            </p>
            <button
              onClick={handleCreateAlert}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Alert
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {alert.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {alert.asset && (
                        <p>
                          <span className="font-medium">Asset:</span> {alert.asset}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Condition:</span>{' '}
                        {alert.conditions.field} {alert.conditions.operator} {alert.conditions.value}
                      </p>
                      <p>
                        <span className="font-medium">Channels:</span>{' '}
                        {alert.notification_channels.map(ch => alertsService.getChannelLabel(ch)).join(', ')}
                      </p>
                      {alert.last_triggered_at && (
                        <p>
                          <span className="font-medium">Last triggered:</span>{' '}
                          {new Date(alert.last_triggered_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => alert.id && handleToggleAlert(alert.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {alert.is_active ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => alert.id && handleDeleteAlert(alert.id)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default AlertsPageClient;