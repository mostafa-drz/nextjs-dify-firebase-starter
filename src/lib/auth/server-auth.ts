'use server';

import { getFirestoreAdmin, FieldValue } from '@/lib/utils/firebase-admin';
import { CREDIT_CONFIG } from '@/lib/config/constants';

/**
 * Server-side Authentication Actions
 * Handles user initialization and authentication logic on the server
 */

export interface ServerAuthResult {
  success: boolean;
  message: string;
  userId?: string;
  credits?: number;
}

/**
 * Initialize a new user with default settings and free credits
 * This is called from the client-side UserProvider when a new user signs in
 */
export async function initializeNewUser(
  userId: string,
  email: string,
  displayName?: string
): Promise<ServerAuthResult> {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    // Check if user already exists
    const existingUser = await userRef.get();
    if (existingUser.exists) {
      return {
        success: true,
        message: 'User already exists',
        userId,
        credits: existingUser.data()?.admin?.availableCredits || 0,
      };
    }

    // Create new user document with admin-protected credits
    const userData = {
      // User-editable fields
      email,
      displayName: displayName || null,
      photoURL: null,
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
      lastLoginAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),

      // Admin-protected fields
      admin: {
        availableCredits: CREDIT_CONFIG.FREE_TIER_CREDITS,
        usedCredits: 0,
        creditHistory: [],
        subscription: {
          plan: 'free',
          creditsPerMonth: CREDIT_CONFIG.FREE_TIER_CREDITS,
          expiresAt: null,
        },
        limits: {
          dailyRequests: 50,
          maxTokensPerRequest: 2000,
          maxConcurrentSessions: 3,
        },
        isBlocked: false,
        updatedAt: FieldValue.serverTimestamp(),
      },
    };

    await userRef.set(userData);

    return {
      success: true,
      message: 'User initialized successfully',
      userId,
      credits: CREDIT_CONFIG.FREE_TIER_CREDITS,
    };
  } catch (error) {
    console.error('Error initializing user:', error);
    return {
      success: false,
      message: 'Failed to initialize user',
    };
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<ServerAuthResult> {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    await userRef.update({
      lastLoginAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Last login updated' };
  } catch (error) {
    console.error('Error updating last login:', error);
    return { success: false, message: 'Failed to update last login' };
  }
}

/**
 * Get user data from server (for server components)
 */
export async function getUserData(userId: string) {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data();
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}
