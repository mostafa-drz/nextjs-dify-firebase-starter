'use server';

import { getFirestoreAdmin, FieldValue } from '@/lib/firebase/admin';
import { calculateCreditsFromTokens } from '@/lib/utils/credits';
import { CreditTransaction } from '@/types/user';

/**
 * Deduct credits from user account with atomic transaction
 */
export async function deductCredits(
  userId: string,
  creditsToDeduct: number,
  operation: string,
  metadata?: {
    difyAppToken?: string;
    sessionId?: string;
    tokensUsed?: number;
    cost?: number;
  }
): Promise<{ success: boolean; message: string; remainingCredits?: number }> {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentCredits = userData?.admin?.availableCredits || 0;

      if (currentCredits < creditsToDeduct) {
        return {
          success: false,
          message: `Insufficient credits. Required: ${creditsToDeduct}, Available: ${currentCredits}`,
          remainingCredits: currentCredits,
        };
      }

      const newAvailableCredits = currentCredits - creditsToDeduct;
      const newUsedCredits = (userData?.admin?.usedCredits || 0) + creditsToDeduct;

      // Create transaction record
      const transactionRecord: Omit<CreditTransaction, 'id' | 'timestamp'> & {
        timestamp: number;
      } = {
        amount: -creditsToDeduct,
        operation,
        timestamp: Date.now(),
        metadata,
      };

      // Update user admin data
      transaction.update(userRef, {
        'admin.availableCredits': newAvailableCredits,
        'admin.usedCredits': newUsedCredits,
        'admin.creditHistory': FieldValue.arrayUnion(transactionRecord),
        'admin.updatedAt': FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: 'Credits deducted successfully',
        remainingCredits: newAvailableCredits,
      };
    });

    return result;
  } catch (error: unknown) {
    console.error('Error deducting credits:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to deduct credits',
    };
  }
}

/**
 * Add credits to user account (for admin use or credit purchases)
 */
export async function addCredits(
  userId: string,
  creditsToAdd: number,
  reason: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentCredits = userData?.admin?.availableCredits || 0;
      const newBalance = currentCredits + creditsToAdd;

      // Create transaction record
      const transactionRecord: Omit<CreditTransaction, 'id' | 'timestamp'> & {
        timestamp: number;
      } = {
        amount: creditsToAdd,
        operation: reason,
        timestamp: Date.now(),
        metadata,
      };

      // Update user admin data
      transaction.update(userRef, {
        'admin.availableCredits': newBalance,
        'admin.creditHistory': FieldValue.arrayUnion(transactionRecord),
        'admin.updatedAt': FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: 'Credits added successfully',
        newBalance,
      };
    });

    return result;
  } catch (error: unknown) {
    console.error('Error adding credits:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add credits',
    };
  }
}

/**
 * Deduct credits based on token usage (main function for Dify integration)
 */
export async function deductCreditsForTokens(
  userId: string,
  tokensUsed: number,
  operation: string,
  metadata?: {
    difyAppToken?: string;
    sessionId?: string;
    conversationId?: string;
  }
): Promise<{
  success: boolean;
  message: string;
  remainingCredits?: number;
  creditsDeducted?: number;
}> {
  const creditsToDeduct = calculateCreditsFromTokens(tokensUsed);

  const result = await deductCredits(userId, creditsToDeduct, operation, {
    ...metadata,
    tokensUsed,
    cost: creditsToDeduct,
  });

  return {
    ...result,
    creditsDeducted: creditsToDeduct,
  };
}

/**
 * Reserve credits for an operation (prevents double-spending)
 */
export async function reserveCredits(
  userId: string,
  creditsToReserve: number,
  operation: string,
  reservationId: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; message: string; remainingCredits?: number }> {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentCredits = userData?.admin?.availableCredits || 0;
      const reservedCredits = userData?.admin?.reservedCredits || 0;

      if (currentCredits < creditsToReserve) {
        return {
          success: false,
          message: `Insufficient credits. Required: ${creditsToReserve}, Available: ${currentCredits}`,
          remainingCredits: currentCredits,
        };
      }

      const newAvailableCredits = currentCredits - creditsToReserve;
      const newReservedCredits = reservedCredits + creditsToReserve;

      // Create reservation record
      const reservationRecord = {
        reservationId,
        amount: creditsToReserve,
        operation,
        timestamp: Date.now(),
        metadata,
      };

      // Update user admin data
      transaction.update(userRef, {
        'admin.availableCredits': newAvailableCredits,
        'admin.reservedCredits': newReservedCredits,
        'admin.creditReservations': FieldValue.arrayUnion(reservationRecord),
        'admin.updatedAt': FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: 'Credits reserved successfully',
        remainingCredits: newAvailableCredits,
      };
    });

    return result;
  } catch (error: unknown) {
    console.error('Error reserving credits:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reserve credits',
    };
  }
}

/**
 * Confirm reserved credits (convert reservation to actual deduction)
 */
export async function confirmReservedCredits(
  userId: string,
  reservationId: string,
  actualTokensUsed: number,
  operation: string,
  metadata?: Record<string, unknown>
): Promise<{
  success: boolean;
  message: string;
  remainingCredits?: number;
  creditsDeducted?: number;
}> {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const reservations = userData?.admin?.creditReservations || [];
      const reservedCredits = userData?.admin?.reservedCredits || 0;

      // Find the reservation
      const reservation = reservations.find((r: any) => r.reservationId === reservationId);
      if (!reservation) {
        return {
          success: false,
          message: 'Reservation not found',
        };
      }

      const reservedAmount = reservation.amount;
      const actualCreditsNeeded = calculateCreditsFromTokens(actualTokensUsed);
      const creditsToRefund = Math.max(0, reservedAmount - actualCreditsNeeded);

      const newReservedCredits = reservedCredits - reservedAmount;
      const newUsedCredits = (userData?.admin?.usedCredits || 0) + actualCreditsNeeded;

      // Create transaction record
      const transactionRecord: Omit<CreditTransaction, 'id' | 'timestamp'> & {
        timestamp: number;
      } = {
        amount: -actualCreditsNeeded,
        operation,
        timestamp: Date.now(),
        metadata: {
          ...metadata,
          reservationId,
          tokensUsed: actualTokensUsed,
          cost: actualCreditsNeeded,
        },
      };

      // Remove reservation and update credits
      const updatedReservations = reservations.filter(
        (r: any) => r.reservationId !== reservationId
      );

      const updates: any = {
        'admin.reservedCredits': newReservedCredits,
        'admin.usedCredits': newUsedCredits,
        'admin.creditHistory': FieldValue.arrayUnion(transactionRecord),
        'admin.creditReservations': updatedReservations,
        'admin.updatedAt': FieldValue.serverTimestamp(),
      };

      // Refund excess credits if any
      if (creditsToRefund > 0) {
        updates['admin.availableCredits'] = FieldValue.increment(creditsToRefund);
      }

      transaction.update(userRef, updates);

      return {
        success: true,
        message: 'Reserved credits confirmed successfully',
        remainingCredits: (userData?.admin?.availableCredits || 0) + creditsToRefund,
        creditsDeducted: actualCreditsNeeded,
      };
    });

    return result;
  } catch (error: unknown) {
    console.error('Error confirming reserved credits:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to confirm reserved credits',
    };
  }
}

/**
 * Release reserved credits (for failed operations)
 */
export async function releaseReservedCredits(
  userId: string,
  reservationId: string,
  _reason: string
): Promise<{ success: boolean; message: string; remainingCredits?: number }> {
  try {
    const db = getFirestoreAdmin();
    const userRef = db.doc(`users/${userId}`);

    const result = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const reservations = userData?.admin?.creditReservations || [];
      const reservedCredits = userData?.admin?.reservedCredits || 0;

      // Find the reservation
      const reservation = reservations.find((r: any) => r.reservationId === reservationId);
      if (!reservation) {
        return {
          success: false,
          message: 'Reservation not found',
        };
      }

      const reservedAmount = reservation.amount;
      const newReservedCredits = reservedCredits - reservedAmount;

      // Remove reservation and restore credits
      const updatedReservations = reservations.filter(
        (r: any) => r.reservationId !== reservationId
      );

      transaction.update(userRef, {
        'admin.availableCredits': FieldValue.increment(reservedAmount),
        'admin.reservedCredits': newReservedCredits,
        'admin.creditReservations': updatedReservations,
        'admin.updatedAt': FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: 'Reserved credits released successfully',
        remainingCredits: (userData?.admin?.availableCredits || 0) + reservedAmount,
      };
    });

    return result;
  } catch (error: unknown) {
    console.error('Error releasing reserved credits:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to release reserved credits',
    };
  }
}

/**
 * Check if user has enough credits for an operation
 */
export async function checkUserCredits(
  userId: string,
  requiredCredits: number
): Promise<{ hasEnough: boolean; available: number; message?: string }> {
  try {
    const db = getFirestoreAdmin();
    const userDoc = await db.doc(`users/${userId}`).get();

    if (!userDoc.exists) {
      return {
        hasEnough: false,
        available: 0,
        message: 'User not found',
      };
    }

    const userData = userDoc.data();
    const availableCredits = userData?.admin?.availableCredits || 0;

    return {
      hasEnough: availableCredits >= requiredCredits,
      available: availableCredits,
      message:
        availableCredits >= requiredCredits
          ? 'Sufficient credits available'
          : `Insufficient credits. Required: ${requiredCredits}, Available: ${availableCredits}`,
    };
  } catch (error: unknown) {
    console.error('Error checking credits:', error);
    return {
      hasEnough: false,
      available: 0,
      message: 'Failed to check credits',
    };
  }
}

/**
 * Get user's credit history
 */
export async function getUserCreditHistory(userId: string): Promise<{
  success: boolean;
  history?: CreditTransaction[];
  message?: string;
}> {
  try {
    const db = getFirestoreAdmin();
    const userDoc = await db.doc(`users/${userId}`).get();

    if (!userDoc.exists) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    const userData = userDoc.data();
    const history = userData?.admin?.creditHistory || [];

    return {
      success: true,
      history: history.sort((a: CreditTransaction, b: CreditTransaction) => {
        // Handle both Timestamp and FieldValue types
        const aTime =
          a.timestamp instanceof Object && 'seconds' in a.timestamp ? a.timestamp.seconds : 0;
        const bTime =
          b.timestamp instanceof Object && 'seconds' in b.timestamp ? b.timestamp.seconds : 0;
        return bTime - aTime;
      }), // Sort by newest first
    };
  } catch (error: unknown) {
    console.error('Error getting credit history:', error);
    return {
      success: false,
      message: 'Failed to get credit history',
    };
  }
}
