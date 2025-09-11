'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, onSnapshot, DocumentSnapshot } from 'firebase/firestore';
import { getFirebaseServices } from '@/lib/utils/firebase-client';
import { initializeNewUser, updateLastLogin } from '@/lib/auth/server-auth';
import { trackAuth } from '@/lib/analytics';
import { User } from '@/types/user';
import { hasEnoughCredits } from '@/lib/utils/credits';
import { setAuthCookie, clearAuthCookie } from '@/lib/utils/auth-cookie';

/**
 * Client-side Authentication Context
 * Handles only client-side auth state and Firebase auth operations
 * Server-side operations are handled by server actions
 */

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendSignInEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  handleSignInWithEmailLink: () => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;

  // Credit-related methods
  checkCredits: (required: number) => boolean;
  availableCredits: number;
  subscription: User['admin']['subscription'] | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiting for auth operations
const RATE_LIMIT_WINDOW = 1000 * 60 * 15; // 15 minutes
const MAX_SIGNIN_ATTEMPTS = 5;

interface RateLimit {
  attempts: number;
  windowStart: number;
}

const rateLimits = new Map<string, RateLimit>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(identifier);

  if (!limit) {
    rateLimits.set(identifier, { attempts: 1, windowStart: now });
    return true;
  }

  if (now - limit.windowStart > RATE_LIMIT_WINDOW) {
    rateLimits.set(identifier, { attempts: 1, windowStart: now });
    return true;
  }

  if (limit.attempts >= MAX_SIGNIN_ATTEMPTS) {
    return false;
  }

  limit.attempts += 1;
  rateLimits.set(identifier, limit);
  return true;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const firebaseServices = getFirebaseServices();
  const auth = firebaseServices?.auth;
  const db = firebaseServices?.db;

  // Handle auth state changes
  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          // Set HTTP-only cookie with Firebase ID token
          const cookieResult = await setAuthCookie(firebaseUser);
          if (!cookieResult.success) {
            console.error('Failed to set auth cookie:', cookieResult.error);
          }

          // Call server action to initialize/update user
          const initResult = await initializeNewUser(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName || undefined
          );

          if (initResult.success) {
            await updateLastLogin(firebaseUser.uid);
          }

          // Set up real-time listener for user data
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userUnsubscribe = onSnapshot(userRef, (docSnapshot: DocumentSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                ...userData,
              } as User);
            }
          });

          // Cleanup function will be handled by the auth state change
          return () => userUnsubscribe();
        } catch (error) {
          console.error('Error setting up user:', error);
          setUser(null);
        }
      } else {
        // Clear auth cookie on logout
        await clearAuthCookie();
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  // Auth methods
  const sendSignInEmail = useCallback(
    async (email: string): Promise<{ success: boolean; message: string }> => {
      if (!auth) {
        return { success: false, message: 'Firebase auth not initialized' };
      }

      // Check rate limit
      if (!checkRateLimit(email)) {
        return {
          success: false,
          message: 'Too many sign-in attempts. Please try again in 15 minutes.',
        };
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/auth/callback`,
        handleCodeInApp: true,
      };

      try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        return {
          success: true,
          message: 'Magic link sent! Check your email.',
        };
      } catch (error: unknown) {
        console.error('Error sending sign-in email:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Failed to send sign-in email',
        };
      }
    },
    [auth]
  );

  const handleSignInWithEmailLink = useCallback(async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    if (!auth) {
      return { success: false, message: 'Firebase auth not initialized' };
    }

    try {
      const email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        return { success: false, message: 'Email not found. Please try signing in again.' };
      }

      if (isSignInWithEmailLink(auth, window.location.href)) {
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        return { success: true, message: 'Successfully signed in!' };
      } else {
        return { success: false, message: 'Invalid sign-in link.' };
      }
    } catch (error: unknown) {
      console.error('Error signing in with email link:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sign in',
      };
    }
  }, [auth]);

  const logout = useCallback(async (): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }
    try {
      // Clear auth cookie first
      await clearAuthCookie();

      // Sign out from Firebase
      await signOut(auth);
      trackAuth('logout');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [auth]);

  // Credit-related helper methods
  const checkCredits = useCallback(
    (required: number): boolean => {
      if (!user?.admin) return false;
      return hasEnoughCredits(user.admin.availableCredits, required);
    },
    [user]
  );

  const availableCredits = user?.admin?.availableCredits || 0;
  const subscription = user?.admin?.subscription || null;

  const value: AuthContextType = {
    user,
    loading,
    sendSignInEmail,
    handleSignInWithEmailLink,
    logout,
    checkCredits,
    availableCredits,
    subscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
