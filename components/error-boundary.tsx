'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details to console in development/staging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You could also send this to an error tracking service
    if (typeof window !== 'undefined') {
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            reset={() => this.setState({ hasError: false, error: null })}
          />
        );
      }

      // Default error UI with detailed information
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Application Error (Debug Mode)
            </h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Error Message:
                </h2>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto text-red-600 dark:text-red-400">
                  {this.state.error.message}
                </pre>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Error Stack:
                </h2>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto text-gray-600 dark:text-gray-400 max-h-64 overflow-y-auto">
                  {this.state.error.stack}
                </pre>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Component Info:
                </h2>
                <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto text-gray-600 dark:text-gray-400">
                  {this.state.error.toString()}
                </pre>
              </div>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="mt-4 px-4 py-2 bg-brand-orange text-white rounded hover:bg-brand-orange-dark transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}