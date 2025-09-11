'use server';

import {
  DifyChatRequest,
  DifyConversationResponse,
  DifyConversation,
  DifyApiResponse,
} from '@/types/dify';
import {
  reserveCredits,
  confirmReservedCredits,
  releaseReservedCredits,
} from '@/lib/actions/credits';
import { calculateCreditsFromTokens } from '@/lib/utils/credits';
import { validateServerEnv } from '@/lib/config/env-validation';
import { ExternalApiError, ValidationError } from '@/lib/errors/server-errors';

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

/**
 * Enhanced Dify API error with better error handling
 */
class DifyApiError extends ExternalApiError {
  constructor(message: string, status: number, code?: string, originalError?: Error) {
    super(message, 'Dify API', originalError, { status, code });
    this.name = 'DifyApiError';
  }
}

async function makeDifyRequest(
  endpoint: string,
  options: RequestInit,
  apiKey: string
): Promise<Response> {
  try {
    // Validate API key
    if (!apiKey) {
      throw new ValidationError('Dify API key is required');
    }

    const url = `${DIFY_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, use default error
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }

      throw new DifyApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return response;
  } catch (error) {
    if (error instanceof DifyApiError) {
      throw error;
    }

    // Handle network errors, timeouts, etc.
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new DifyApiError('Request timeout', 408, 'TIMEOUT', error);
      }
      if (error.message.includes('fetch')) {
        throw new DifyApiError('Network error', 503, 'NETWORK_ERROR', error);
      }
    }

    throw new DifyApiError('Unknown error occurred', 500, 'UNKNOWN_ERROR', error as Error);
  }
}

export async function sendDifyMessage(
  userId: string,
  request: DifyChatRequest
): Promise<DifyApiResponse<DifyConversationResponse>> {
  // Validate environment variables
  validateServerEnv();

  // Generate unique reservation ID
  const reservationId = `dify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Reserve credits before API call (estimate 50 tokens minimum)
    const estimatedCredits = calculateCreditsFromTokens(50);
    const reserveResult = await reserveCredits(
      userId,
      estimatedCredits,
      'dify_chat_reservation',
      reservationId,
      {
        difyAppToken: DIFY_API_KEY?.substring(0, 8) + '...',
        sessionId: request.conversation_id,
        estimatedTokens: 50,
      }
    );

    if (!reserveResult.success) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: reserveResult.message,
          status: 402,
        },
      };
    }

    let apiResponse: Response;
    let data: DifyConversationResponse;

    try {
      // Make API call
      apiResponse = await makeDifyRequest(
        '/chat-messages',
        {
          method: 'POST',
          body: JSON.stringify({
            ...request,
            response_mode: 'blocking', // Always use blocking for credit tracking
          }),
        },
        DIFY_API_KEY || ''
      );

      data = await apiResponse.json();
    } catch (apiError) {
      // API call failed - release reserved credits
      await releaseReservedCredits(userId, reservationId, 'API call failed');
      throw apiError;
    }

    // Confirm reserved credits based on actual token usage
    if (data.metadata?.usage?.total_tokens) {
      const confirmResult = await confirmReservedCredits(
        userId,
        reservationId,
        data.metadata.usage.total_tokens,
        'dify_chat',
        {
          difyAppToken: DIFY_API_KEY?.substring(0, 8) + '...',
          conversationId: data.conversation_id,
          sessionId: request.conversation_id,
        }
      );

      if (!confirmResult.success) {
        // This is a critical error - API succeeded but credit confirmation failed
        console.error(
          'CRITICAL: Failed to confirm credits after successful API call:',
          confirmResult.message
        );

        // Try to release the reservation as fallback
        await releaseReservedCredits(userId, reservationId, 'Credit confirmation failed');

        return {
          success: false,
          error: {
            code: 'CREDIT_CONFIRMATION_FAILED',
            message: 'API call succeeded but credit processing failed. Please contact support.',
            status: 500,
          },
        };
      }
    } else {
      // No token usage data - release reserved credits
      await releaseReservedCredits(userId, reservationId, 'No token usage data received');
    }

    return {
      success: true,
      data,
      usage: data.metadata?.usage,
    };
  } catch (error) {
    console.error('Dify API error:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        status: 500,
      },
    };
  }
}

export async function getDifyConversations(
  userId: string,
  limit: number = 20,
  firstId?: string
): Promise<DifyApiResponse<{ data: DifyConversation[]; has_more: boolean; first_id: string }>> {
  try {
    const params = new URLSearchParams({
      user: userId,
      limit: limit.toString(),
      ...(firstId && { first_id: firstId }),
    });

    const response = await makeDifyRequest(
      `/conversations?${params}`,
      {
        method: 'GET',
      },
      DIFY_API_KEY || ''
    );

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to get conversations:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to retrieve conversations',
        status: 500,
      },
    };
  }
}

export async function getDifyConversationMessages(
  userId: string,
  conversationId: string,
  limit: number = 20,
  firstId?: string
): Promise<DifyApiResponse<{ data: unknown[]; has_more: boolean; first_id: string }>> {
  try {
    const params = new URLSearchParams({
      user: userId,
      limit: limit.toString(),
      ...(firstId && { first_id: firstId }),
    });

    const response = await makeDifyRequest(
      `/conversations/${conversationId}/messages?${params}`,
      { method: 'GET' },
      DIFY_API_KEY || ''
    );

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to get conversation messages:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to retrieve messages',
        status: 500,
      },
    };
  }
}

export async function renameDifyConversation(
  userId: string,
  conversationId: string,
  name: string
): Promise<DifyApiResponse<{ result: string }>> {
  try {
    const response = await makeDifyRequest(
      `/conversations/${conversationId}/name`,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          user: userId,
        }),
      },
      DIFY_API_KEY || ''
    );

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to rename conversation:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to rename conversation',
        status: 500,
      },
    };
  }
}

export async function deleteDifyConversation(
  userId: string,
  conversationId: string
): Promise<DifyApiResponse<{ result: string }>> {
  try {
    const response = await makeDifyRequest(
      `/conversations/${conversationId}`,
      {
        method: 'DELETE',
        body: JSON.stringify({
          user: userId,
        }),
      },
      DIFY_API_KEY || ''
    );

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to delete conversation:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to delete conversation',
        status: 500,
      },
    };
  }
}

export async function getDifyAppInfo(): Promise<
  DifyApiResponse<{
    opening_statement: string;
    suggested_questions: string[];
    speech_to_text: {
      enabled: boolean;
    };
    retriever_resource: {
      enabled: boolean;
    };
  }>
> {
  try {
    const response = await makeDifyRequest(
      '/parameters',
      {
        method: 'GET',
      },
      DIFY_API_KEY || ''
    );

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to get app info:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to get app information',
        status: 500,
      },
    };
  }
}
