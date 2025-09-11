'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Global analytics instance
let analytics: Analytics | null = null;

// Initialize Firebase (client-side)
export function initializeFirebase() {
  if (typeof window === 'undefined') return null;
  
  // Check if Firebase App already exists
  const apps = getApps();
  const app = apps.length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  // Initialize Analytics only in production and on client-side
  // This respects privacy by not tracking in development
  if (!analytics && process.env.NODE_ENV === 'production') {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn('Failed to initialize Firebase Analytics:', error);
    }
  }
  
  return { app, auth, db, analytics };
}

// Export services for use in components
export function getFirebaseServices() {
  return initializeFirebase();
}

// Export analytics instance for use in analytics utilities
export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === 'undefined') return null;
  
  // Ensure Firebase is initialized first
  if (!analytics && process.env.NODE_ENV === 'production') {
    const services = initializeFirebase();
    return services?.analytics || null;
  }
  
  return analytics;
}