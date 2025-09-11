'use server';

import { 
  DifyChatRequest, 
  DifyConversationResponse, 
  DifyConversation,
  DifyApiResponse 
} from '@/types/dify';
import { deductCreditsForTokens, checkUserCredits } from '@/lib/actions/credits';

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';

class DifyApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'DifyApiError';
  }
}

async function makeDifyRequest(
  endpoint: string,
  options: RequestInit,
  apiKey: string
): Promise<Response> {
  const url = `${DIFY_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new DifyApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData.code
    );
  }

  return response;
}

export async function sendDifyMessage(
  userId: string,
  apiKey: string,
  request: DifyChatRequest
): Promise<DifyApiResponse<DifyConversationResponse>> {
  // Use environment variable if demo key is provided
  const actualApiKey = apiKey === 'app-demo-key' 
    ? process.env.DIFY_API_KEY || apiKey 
    : apiKey;
  try {
    // First check if user has sufficient credits (estimate 50 tokens minimum)
    const requiredCredits = Math.ceil(50 / 1000); // Minimum estimate
    const creditCheck = await checkUserCredits(userId, requiredCredits);
    
    if (!creditCheck.hasEnough) {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_CREDITS',
          message: `Insufficient credits. Required: ${requiredCredits}, Available: ${creditCheck.available}`,
          status: 402
        }
      };
    }

    const response = await makeDifyRequest('/chat-messages', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        response_mode: 'blocking' // Always use blocking for credit tracking
      }),
    }, actualApiKey);

    const data: DifyConversationResponse = await response.json();

    // Deduct credits based on actual token usage
    if (data.metadata?.usage?.total_tokens) {
      const deductResult = await deductCreditsForTokens(
        userId,
        data.metadata.usage.total_tokens,
        'dify_chat',
        {
          difyAppToken: apiKey.substring(0, 8) + '...',
          conversationId: data.conversation_id,
          sessionId: request.conversation_id
        }
      );

      if (!deductResult.success) {
        console.error('Failed to deduct credits after successful API call:', deductResult.message);
      }
    }

    return {
      success: true,
      data,
      usage: data.metadata?.usage
    };

  } catch (error) {
    console.error('Dify API error:', error);
    
    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.status
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        status: 500
      }
    };
  }
}

export async function getDifyConversations(
  userId: string,
  apiKey: string,
  limit: number = 20,
  firstId?: string
): Promise<DifyApiResponse<{ data: DifyConversation[]; has_more: boolean; first_id: string }>> {
  try {
    const params = new URLSearchParams({
      user: userId,
      limit: limit.toString(),
      ...(firstId && { first_id: firstId })
    });

    const response = await makeDifyRequest(`/conversations?${params}`, {
      method: 'GET',
    }, apiKey);

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Failed to get conversations:', error);
    
    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.status
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to retrieve conversations',
        status: 500
      }
    };
  }
}

export async function getDifyConversationMessages(
  userId: string,
  apiKey: string,
  conversationId: string,
  limit: number = 20,
  firstId?: string
): Promise<DifyApiResponse<{ data: unknown[]; has_more: boolean; first_id: string }>> {
  try {
    const params = new URLSearchParams({
      user: userId,
      limit: limit.toString(),
      ...(firstId && { first_id: firstId })
    });

    const response = await makeDifyRequest(
      `/conversations/${conversationId}/messages?${params}`, 
      { method: 'GET' }, 
      apiKey
    );

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Failed to get conversation messages:', error);
    
    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.status
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to retrieve messages',
        status: 500
      }
    };
  }
}

export async function renameDifyConversation(
  userId: string,
  apiKey: string,
  conversationId: string,
  name: string
): Promise<DifyApiResponse<{ result: string }>> {
  try {
    const response = await makeDifyRequest(`/conversations/${conversationId}/name`, {
      method: 'POST',
      body: JSON.stringify({
        name,
        user: userId
      }),
    }, apiKey);

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Failed to rename conversation:', error);
    
    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.status
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to rename conversation',
        status: 500
      }
    };
  }
}

export async function deleteDifyConversation(
  userId: string,
  apiKey: string,
  conversationId: string
): Promise<DifyApiResponse<{ result: string }>> {
  try {
    const response = await makeDifyRequest(`/conversations/${conversationId}`, {
      method: 'DELETE',
      body: JSON.stringify({
        user: userId
      }),
    }, apiKey);

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Failed to delete conversation:', error);
    
    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.status
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to delete conversation',
        status: 500
      }
    };
  }
}

export async function getDifyAppInfo(
  apiKey: string
): Promise<DifyApiResponse<{
  opening_statement: string;
  suggested_questions: string[];
  speech_to_text: {
    enabled: boolean;
  };
  retriever_resource: {
    enabled: boolean;
  };
}>> {
  // Use environment variable if demo key is provided
  const actualApiKey = apiKey === 'app-demo-key' 
    ? process.env.DIFY_API_KEY || apiKey 
    : apiKey;

  try {
    const response = await makeDifyRequest('/parameters', {
      method: 'GET',
    }, actualApiKey);

    const data = await response.json();

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error('Failed to get app info:', error);
    
    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.status
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Failed to get app information',
        status: 500
      }
    };
  }
}