'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { logMessage, logError, logApiError, LogLevel, addBreadcrumb } from '@/lib/sentry';

export default function SentryTestPage() {
  const [testStatus, setTestStatus] = useState<string>('');

  const testClientError = () => {
    addBreadcrumb('User clicked test client error button', 'user-action');
    try {
      throw new Error('Test client-side error');
    } catch (error) {
      logError(error, { test: true, location: 'client' });
      setTestStatus('Client error logged to Sentry');
    }
  };

  const testUnhandledError = () => {
    addBreadcrumb('User clicked test unhandled error button', 'user-action');
    // This will be caught by the error boundary
    throw new Error('Test unhandled error - should be caught by error boundary');
  };

  const testApiError = async () => {
    addBreadcrumb('User clicked test API error button', 'user-action');
    try {
      const response = await fetch('/api/sentry-test-error');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
    } catch (error) {
      logApiError('/api/sentry-test-error', error, null, 500);
      setTestStatus('API error logged to Sentry');
    }
  };

  const testLogMessage = () => {
    addBreadcrumb('User clicked test log message button', 'user-action');
    logMessage('Test info message from Sentry test page', LogLevel.INFO);
    setTestStatus('Info message logged to Sentry');
  };

  const testWarning = () => {
    addBreadcrumb('User clicked test warning button', 'user-action');
    logMessage('Test warning message - performance issue detected', LogLevel.WARNING);
    setTestStatus('Warning logged to Sentry');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Sentry Integration Test Page</h1>

            <p className="mb-6 text-gray-600">
              Use this page to test different Sentry logging scenarios. Check your Sentry dashboard
              to verify the events are being captured.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h2 className="mb-3 text-lg font-semibold">Client-Side Tests</h2>
                <div className="space-x-2">
                  <button
                    onClick={testClientError}
                    className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                  >
                    Test Handled Error
                  </button>
                  <button
                    onClick={testUnhandledError}
                    className="rounded bg-red-800 px-4 py-2 text-white hover:bg-red-900"
                  >
                    Test Unhandled Error
                  </button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="mb-3 text-lg font-semibold">API Tests</h2>
                <button
                  onClick={testApiError}
                  className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                >
                  Test API Error
                </button>
              </div>

              <div className="rounded-lg border p-4">
                <h2 className="mb-3 text-lg font-semibold">Logging Tests</h2>
                <div className="space-x-2">
                  <button
                    onClick={testLogMessage}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Log Info Message
                  </button>
                  <button
                    onClick={testWarning}
                    className="rounded bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
                  >
                    Log Warning
                  </button>
                </div>
              </div>
            </div>

            {testStatus && (
              <div className="mt-6 rounded border border-green-200 bg-green-50 p-4">
                <p className="text-green-800">{testStatus}</p>
              </div>
            )}

            <div className="mt-6 rounded border border-blue-200 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">Setup Instructions:</h3>
              <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
                <li>Add your Sentry DSN to .env.local</li>
                <li>Run: npm run dev</li>
                <li>Visit this page and click the test buttons</li>
                <li>Check your Sentry dashboard for the events</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
