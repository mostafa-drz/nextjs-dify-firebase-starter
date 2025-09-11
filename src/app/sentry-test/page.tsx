'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sentry Integration Test Page
          </h1>
          
          <p className="text-gray-600 mb-6">
            Use this page to test different Sentry logging scenarios. 
            Check your Sentry dashboard to verify the events are being captured.
          </p>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-3">Client-Side Tests</h2>
              <div className="space-x-2">
                <button
                  onClick={testClientError}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Test Handled Error
                </button>
                <button
                  onClick={testUnhandledError}
                  className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900"
                >
                  Test Unhandled Error
                </button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-3">API Tests</h2>
              <button
                onClick={testApiError}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Test API Error
              </button>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="font-semibold text-lg mb-3">Logging Tests</h2>
              <div className="space-x-2">
                <button
                  onClick={testLogMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Log Info Message
                </button>
                <button
                  onClick={testWarning}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Log Warning
                </button>
              </div>
            </div>
          </div>

          {testStatus && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-800">{testStatus}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Add your Sentry DSN to .env.local</li>
              <li>Run: npm run dev</li>
              <li>Visit this page and click the test buttons</li>
              <li>Check your Sentry dashboard for the events</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}