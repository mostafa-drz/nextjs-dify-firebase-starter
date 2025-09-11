'use client';

import { useEffect, useState } from 'react';
import { initializeFirebaseWithDefaults, isFirebaseInitialized } from '@/lib/firebase/singleton';

/**
 * Firebase Provider Component
 * Handles Firebase initialization and provides loading state
 */
interface FirebaseProviderProps {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Check if already initialized
        if (isFirebaseInitialized()) {
          setIsInitialized(true);
          return;
        }

        // Initialize Firebase
        initializeFirebaseWithDefaults();
        setIsInitialized(true);
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Firebase');
      }
    };

    initializeFirebase();
  }, []);

  // Show loading state while Firebase initializes
  if (!isInitialized && !error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground text-sm">Initializing Firebase...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mb-4 text-red-600">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-red-900">
            Firebase Initialization Failed
          </h2>
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Firebase is initialized, render children
  return <>{children}</>;
}
