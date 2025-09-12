/**
 * @fileoverview Firebase Admin SDK mocks for testing
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { vi } from 'vitest';

// Mock Firebase Admin Auth
export const mockVerifyIdToken = vi.fn();
export const mockDeleteUser = vi.fn();

export const mockAuth = {
  verifyIdToken: mockVerifyIdToken,
  deleteUser: mockDeleteUser,
};

// Mock Firebase Admin Firestore
export const mockDoc = vi.fn();
export const mockCollection = vi.fn();
export const mockGet = vi.fn();
export const mockSet = vi.fn();
export const mockUpdate = vi.fn();
export const mockDelete = vi.fn();
export const mockAdd = vi.fn();
export const mockWhere = vi.fn();
export const mockOrderBy = vi.fn();
export const mockLimit = vi.fn();
export const mockRunTransaction = vi.fn();
export const mockBatch = vi.fn();

export const mockFirestoreAdmin = {
  collection: mockCollection,
  doc: mockDoc,
  runTransaction: mockRunTransaction,
  batch: mockBatch,
};

// Mock FieldValue
export const mockFieldValue = {
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  arrayUnion: vi.fn((...elements) => elements),
  arrayRemove: vi.fn((...elements) => elements),
  increment: vi.fn((value) => value),
};

// Mock Firebase Admin module
export const mockFirebaseAdmin = {
  auth: () => mockAuth,
  firestore: () => mockFirestoreAdmin,
  FieldValue: mockFieldValue,
};

// Reset all mocks
export const resetFirebaseMocks = () => {
  vi.clearAllMocks();

  // Reset auth mocks
  mockVerifyIdToken.mockResolvedValue({
    uid: 'test-user-123',
    email: 'test@example.com',
    email_verified: true,
  });

  mockDeleteUser.mockResolvedValue(undefined);

  // Reset firestore mocks
  mockGet.mockResolvedValue({
    exists: true,
    data: () => ({
      admin: {
        availableCredits: 100,
        usedCredits: 0,
        creditHistory: [],
      },
    }),
  });

  mockSet.mockResolvedValue(undefined);
  mockUpdate.mockResolvedValue(undefined);
  mockDelete.mockResolvedValue(undefined);
  mockAdd.mockResolvedValue({ id: 'mock-doc-id' });

  mockRunTransaction.mockImplementation(async (callback) => {
    const mockTransaction = {
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
    };
    return callback(mockTransaction);
  });

  mockBatch.mockReturnValue({
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
    commit: vi.fn().mockResolvedValue(undefined),
  });

  // Setup default chain for collection queries
  mockCollection.mockReturnValue({
    doc: mockDoc,
    add: mockAdd,
    where: mockWhere.mockReturnThis(),
    orderBy: mockOrderBy.mockReturnThis(),
    limit: mockLimit.mockReturnThis(),
    get: mockGet,
  });

  mockDoc.mockReturnValue({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
    delete: mockDelete,
  });

  mockWhere.mockReturnThis();
  mockOrderBy.mockReturnThis();
  mockLimit.mockReturnThis();
};

// Initialize mocks with default values
resetFirebaseMocks();
