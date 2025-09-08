'use server';

import { getFirestoreAdmin, FieldValue } from '@/lib/utils/firebase-admin';
import { CREDIT_CONFIG } from '@/lib/config/constants';

/**
 * Initialize a new user with default settings and free credits
 */
export async function initializeNewUser(userId: string, email: string, displayName?: string) {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    // Check if user already exists
    const existingUser = await userRef.get();
    if (existingUser.exists) {
      return { success: true, message: 'User already exists' };
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
        language: 'en'
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
          expiresAt: null
        },
        limits: {
          dailyRequests: 50,
          maxTokensPerRequest: 2000,
          maxConcurrentSessions: 3
        },
        isBlocked: false,
        updatedAt: FieldValue.serverTimestamp()
      }
    };

    await userRef.set(userData);
    
    return { 
      success: true, 
      message: 'User initialized successfully',
      credits: CREDIT_CONFIG.FREE_TIER_CREDITS
    };
  } catch (error) {
    console.error('Error initializing user:', error);
    return { 
      success: false, 
      message: 'Failed to initialize user' 
    };
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string) {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    await userRef.update({
      lastLoginAt: FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating last login:', error);
    return { success: false };
  }
}