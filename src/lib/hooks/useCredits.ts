'use client';

import { useState } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { deductCreditsForTokens, addCredits } from '@/lib/actions/credits';
import { calculateCreditsFromTokens, hasEnoughCredits, shouldWarnLowCredits } from '@/lib/utils/credits';

export function useCredits() {
  const { user, checkCredits, availableCredits } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const deductForTokens = async (
    tokensUsed: number,
    operation: string,
    metadata?: {
      difyAppToken?: string;
      sessionId?: string;
      conversationId?: string;
    }
  ) => {
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    setIsProcessing(true);
    try {
      const result = await deductCreditsForTokens(user.uid, tokensUsed, operation, metadata);
      return result;
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to deduct credits' 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const addCreditsToUser = async (amount: number, reason: string) => {
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }

    setIsProcessing(true);
    try {
      const result = await addCredits(user.uid, amount, reason);
      return result;
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Failed to add credits' 
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // State
    isProcessing,
    availableCredits,
    user,
    
    // Helpers
    checkCredits,
    hasEnoughCredits: (required: number) => hasEnoughCredits(availableCredits, required),
    shouldWarnLowCredits: () => shouldWarnLowCredits(availableCredits),
    calculateCreditsFromTokens,
    
    // Actions
    deductForTokens,
    addCreditsToUser,
    
    // User data
    subscription: user?.admin?.subscription,
    creditHistory: user?.admin?.creditHistory || [],
    usedCredits: user?.admin?.usedCredits || 0,
    isBlocked: user?.admin?.isBlocked || false,
  };
}