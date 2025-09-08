'use server';

import { getFirestoreAdmin, FieldValue } from '@/lib/utils/firebase-admin';
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
          remainingCredits: currentCredits
        };
      }

      const newAvailableCredits = currentCredits - creditsToDeduct;
      const newUsedCredits = (userData?.admin?.usedCredits || 0) + creditsToDeduct;

      // Create transaction record
      const transactionRecord: Omit<CreditTransaction, 'id'> = {
        amount: -creditsToDeduct,
        operation,
        timestamp: FieldValue.serverTimestamp() as any,
        metadata
      };

      // Update user admin data
      transaction.update(userRef, {
        'admin.availableCredits': newAvailableCredits,
        'admin.usedCredits': newUsedCredits,
        'admin.creditHistory': FieldValue.arrayUnion(transactionRecord),
        'admin.updatedAt': FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: 'Credits deducted successfully',
        remainingCredits: newAvailableCredits
      };
    });

    return result;
  } catch (error: any) {
    console.error('Error deducting credits:', error);
    return {
      success: false,
      message: error.message || 'Failed to deduct credits'
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
  metadata?: Record<string, any>
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
      const transactionRecord: Omit<CreditTransaction, 'id'> = {
        amount: creditsToAdd,
        operation: reason,
        timestamp: FieldValue.serverTimestamp() as any,
        metadata
      };

      // Update user admin data
      transaction.update(userRef, {
        'admin.availableCredits': newBalance,
        'admin.creditHistory': FieldValue.arrayUnion(transactionRecord),
        'admin.updatedAt': FieldValue.serverTimestamp()
      });

      return {
        success: true,
        message: 'Credits added successfully',
        newBalance
      };
    });

    return result;
  } catch (error: any) {
    console.error('Error adding credits:', error);
    return {
      success: false,
      message: error.message || 'Failed to add credits'
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
): Promise<{ success: boolean; message: string; remainingCredits?: number; creditsDeducted?: number }> {
  const creditsToDeduct = calculateCreditsFromTokens(tokensUsed);
  
  const result = await deductCredits(userId, creditsToDeduct, operation, {
    ...metadata,
    tokensUsed,
    cost: creditsToDeduct
  });

  return {
    ...result,
    creditsDeducted: creditsToDeduct
  };
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
        message: 'User not found'
      };
    }

    const userData = userDoc.data();
    const availableCredits = userData?.admin?.availableCredits || 0;
    
    return {
      hasEnough: availableCredits >= requiredCredits,
      available: availableCredits,
      message: availableCredits >= requiredCredits 
        ? 'Sufficient credits available' 
        : `Insufficient credits. Required: ${requiredCredits}, Available: ${availableCredits}`
    };
  } catch (error: any) {
    console.error('Error checking credits:', error);
    return {
      hasEnough: false,
      available: 0,
      message: 'Failed to check credits'
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
        message: 'User not found'
      };
    }

    const userData = userDoc.data();
    const history = userData?.admin?.creditHistory || [];
    
    return {
      success: true,
      history: history.sort((a: any, b: any) => b.timestamp - a.timestamp) // Sort by newest first
    };
  } catch (error: any) {
    console.error('Error getting credit history:', error);
    return {
      success: false,
      message: 'Failed to get credit history'
    };
  }
}