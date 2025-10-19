'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console with full details
    console.error('Page Error:', error);
    console.error('Error Stack:', error.stack);
    console.error('Error Digest:', error.digest);
  }, [error]);

  // Check if we're in development/staging (with auth protection)
  const showDebugInfo = process.env.NODE_ENV === 'development' || 
                        process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong!
        </h2>
        
        {showDebugInfo ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
                Debug Mode Enabled (Remove in production)
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Error Message:
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto text-red-600 dark:text-red-400">
                {error.message}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Error Name:
              </h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto text-gray-600 dark:text-gray-400">
                {error.name}
              </pre>
            </div>

            {error.stack && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Stack Trace:
                </h3>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto text-gray-600 dark:text-gray-400 max-h-96 overflow-y-auto">
                  {error.stack}
                </pre>
              </div>
            )}

            {error.digest && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Error ID:
                </h3>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm text-gray-600 dark:text-gray-400">
                  {error.digest}
                </code>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            An error occurred while loading this page. Please try refreshing the page.
          </p>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange-dark transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}