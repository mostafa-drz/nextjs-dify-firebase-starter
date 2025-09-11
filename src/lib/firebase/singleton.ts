/**
 * Firebase Singleton Pattern Implementation
 * Ensures Firebase is initialized only once and provides consistent access
 */

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

/**
 * Firebase configuration interface
 */
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Firebase services interface
 */
interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  analytics: Analytics | null;
}

/**
 * Firebase Singleton Class
 * Implements the singleton pattern for Firebase initialization
 */
class FirebaseSingleton {
  private static instance: FirebaseSingleton | null = null;
  private services: FirebaseServices | null = null;
  private config: FirebaseConfig | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): FirebaseSingleton {
    if (!FirebaseSingleton.instance) {
      FirebaseSingleton.instance = new FirebaseSingleton();
    }
    return FirebaseSingleton.instance;
  }

  /**
   * Initialize Firebase with configuration
   */
  public initialize(config: FirebaseConfig): FirebaseServices {
    if (this.services) {
      return this.services;
    }

    this.config = config;

    try {
      // Check if Firebase app already exists
      const apps = getApps();
      const app = apps.length > 0 ? getApp() : initializeApp(config);

      const auth = getAuth(app);
      const db = getFirestore(app);

      // Initialize Analytics only in production and on client-side
      let analytics: Analytics | null = null;
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
        try {
          analytics = getAnalytics(app);
        } catch (error) {
          console.warn('Failed to initialize Firebase Analytics:', error);
        }
      }

      this.services = {
        app,
        auth,
        db,
        analytics,
      };

      return this.services;
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
      throw error;
    }
  }

  /**
   * Get Firebase services (must be initialized first)
   */
  public getServices(): FirebaseServices {
    if (!this.services) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.services;
  }

  /**
   * Check if Firebase is initialized
   */
  public isInitialized(): boolean {
    return this.services !== null;
  }

  /**
   * Get Firebase configuration
   */
  public getConfig(): FirebaseConfig | null {
    return this.config;
  }

  /**
   * Reset the singleton (for testing purposes)
   */
  public static reset(): void {
    FirebaseSingleton.instance = null;
  }
}

/**
 * Global Firebase instance
 */
let firebaseInstance: FirebaseSingleton | null = null;

/**
 * Initialize Firebase with configuration
 * This function should be called once at the application startup
 */
export function initializeFirebase(config: FirebaseConfig): FirebaseServices {
  if (!firebaseInstance) {
    firebaseInstance = FirebaseSingleton.getInstance();
  }
  return firebaseInstance.initialize(config);
}

/**
 * Get Firebase services
 * Returns the initialized Firebase services
 */
export function getFirebaseServices(): FirebaseServices {
  if (!firebaseInstance || !firebaseInstance.isInitialized()) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseInstance.getServices();
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return firebaseInstance?.isInitialized() ?? false;
}

/**
 * Get Firebase configuration
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  return firebaseInstance?.getConfig() ?? null;
}

/**
 * Reset Firebase singleton (for testing)
 */
export function resetFirebaseSingleton(): void {
  FirebaseSingleton.reset();
  firebaseInstance = null;
}

/**
 * Default Firebase configuration from environment variables
 */
export function getDefaultFirebaseConfig(): FirebaseConfig {
  const config: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Validate required configuration
  const requiredFields: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required Firebase configuration: ${field}`);
    }
  }

  return config;
}

/**
 * Initialize Firebase with default configuration
 * This is a convenience function that uses environment variables
 */
export function initializeFirebaseWithDefaults(): FirebaseServices {
  const config = getDefaultFirebaseConfig();
  return initializeFirebase(config);
}
