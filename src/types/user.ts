import { Timestamp } from 'firebase/firestore';

export interface CreditTransaction {
  id: string;
  amount: number; // Negative for deductions, positive for additions
  operation: string; // 'chat-session', 'tokens-used', 'credit-purchase'
  timestamp: Timestamp;
  metadata?: {
    difyAppToken?: string;
    sessionId?: string;
    tokensUsed?: number;
    cost?: number;
    reservationId?: string;
    conversationId?: string;
    estimatedTokens?: number;
  };
}

export interface UserProfile {
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences?: {
    language: string;
  };
  createdAt: Timestamp;
}

export interface UserAdmin {
  availableCredits: number;
  usedCredits: number;
  creditHistory: CreditTransaction[];
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    creditsPerMonth: number;
    expiresAt: Timestamp | null;
  };
  limits: {
    dailyRequests: number;
    maxTokensPerRequest: number;
    maxConcurrentSessions: number;
  };
  isBlocked: boolean;
  updatedAt: Timestamp;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;

  // User-editable profile data
  preferences?: {
    language: string;
  };
  createdAt: Timestamp;

  // Admin-protected data (user cannot modify)
  admin: UserAdmin;
}
