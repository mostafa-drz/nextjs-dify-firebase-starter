'use client';

import {
  initializeFirebaseWithDefaults,
  getFirebaseServices as getSingletonServices,
  isFirebaseInitialized,
  getFirebaseConfig as getSingletonConfig,
} from '@/lib/firebase/singleton';

/**
 * Legacy Firebase Client Utilities
 * Now uses the singleton pattern for better initialization management
 */

// Initialize Firebase with default configuration
let firebaseInitialized = false;

export function initializeFirebase() {
  if (typeof window === 'undefined') return null;

  if (!firebaseInitialized) {
    try {
      initializeFirebaseWithDefaults();
      firebaseInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      return null;
    }
  }

  return getSingletonServices();
}

// Export services for use in components
export function getFirebaseServices() {
  if (!isFirebaseInitialized()) {
    return initializeFirebase();
  }
  return getSingletonServices();
}

// Export analytics instance for use in analytics utilities
export function getFirebaseAnalytics() {
  if (typeof window === 'undefined') return null;

  try {
    const services = getFirebaseServices();
    return services?.analytics || null;
  } catch (error) {
    console.warn('Firebase not initialized:', error);
    return null;
  }
}

// Export configuration for debugging
export function getFirebaseConfig() {
  return getSingletonConfig();
}
