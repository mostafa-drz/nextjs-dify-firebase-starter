/**
 * @fileoverview Firebase Client SDK mocks for testing
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { vi } from 'vitest';

// Mock Firebase Auth
export const mockSignInWithEmailLink = vi.fn();
export const mockSendSignInLinkToEmail = vi.fn();
export const mockSignOut = vi.fn();
export const mockOnAuthStateChanged = vi.fn();
export const mockIsSignInWithEmailLink = vi.fn();

export const mockAuth = {
  signInWithEmailLink: mockSignInWithEmailLink,
  sendSignInLinkToEmail: mockSendSignInLinkToEmail,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  isSignInWithEmailLink: mockIsSignInWithEmailLink,
  currentUser: null,
};

// Mock Firebase Firestore
export const mockDoc = vi.fn();
export const mockCollection = vi.fn();
export const mockGetDoc = vi.fn();
export const mockSetDoc = vi.fn();
export const mockUpdateDoc = vi.fn();
export const mockDeleteDoc = vi.fn();
export const mockOnSnapshot = vi.fn();

export const mockFirestore = {
  doc: mockDoc,
  collection: mockCollection,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  updateDoc: mockUpdateDoc,
  deleteDoc: mockDeleteDoc,
  onSnapshot: mockOnSnapshot,
};

// Mock Firebase Analytics
export const mockLogEvent = vi.fn();
export const mockSetUserId = vi.fn();
export const mockSetUserProperties = vi.fn();

export const mockAnalytics = {
  logEvent: mockLogEvent,
  setUserId: mockSetUserId,
  setUserProperties: mockSetUserProperties,
};

// Mock Firebase App
export const mockFirebaseApp = {
  auth: () => mockAuth,
  firestore: () => mockFirestore,
  analytics: () => mockAnalytics,
};

// Reset all mocks
export const resetFirebaseClientMocks = () => {
  vi.clearAllMocks();

  // Reset auth mocks
  mockSignInWithEmailLink.mockResolvedValue({
    user: {
      uid: 'test-user-123',
      email: 'test@example.com',
      emailVerified: true,
    },
  });

  mockSendSignInLinkToEmail.mockResolvedValue(undefined);
  mockSignOut.mockResolvedValue(undefined);
  mockIsSignInWithEmailLink.mockReturnValue(true);

  // Reset firestore mocks
  mockGetDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({
      admin: {
        availableCredits: 100,
        usedCredits: 0,
        creditHistory: [],
      },
    }),
  });

  mockSetDoc.mockResolvedValue(undefined);
  mockUpdateDoc.mockResolvedValue(undefined);
  mockDeleteDoc.mockResolvedValue(undefined);

  // Setup default chain for collection queries
  mockCollection.mockReturnValue({
    doc: mockDoc,
  });

  mockDoc.mockReturnValue({
    get: mockGetDoc,
    set: mockSetDoc,
    update: mockUpdateDoc,
    delete: mockDeleteDoc,
  });

  // Reset analytics mocks
  mockLogEvent.mockResolvedValue(undefined);
  mockSetUserId.mockResolvedValue(undefined);
  mockSetUserProperties.mockResolvedValue(undefined);
};

// Initialize mocks with default values
resetFirebaseClientMocks();
