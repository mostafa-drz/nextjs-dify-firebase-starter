import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (server-side)
function initializeFirebaseAdmin() {
  // Check if Firebase Admin is already initialized
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check if required environment variables are present
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing required Firebase Admin environment variables. ' +
      'Please ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.'
    );
  }

  // Initialize with service account credentials
  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
    projectId,
  });

  return app;
}

// Get Firestore Admin instance
export function getFirestoreAdmin() {
  const app = initializeFirebaseAdmin();
  return getFirestore(app);
}

// Get Auth Admin instance
export function getAuthAdmin() {
  const app = initializeFirebaseAdmin();
  return getAuth(app);
}

// Export FieldValue for server actions
export { FieldValue };

// Convenience exports with error handling
let adminDb: ReturnType<typeof getFirestoreAdmin> | null = null;
let adminAuth: ReturnType<typeof getAuthAdmin> | null = null;

try {
  adminDb = getFirestoreAdmin();
  adminAuth = getAuthAdmin();
} catch (error) {
  // Handle build-time or missing environment variable errors
  console.warn('Firebase Admin initialization failed:', error);
}

export { adminDb, adminAuth };