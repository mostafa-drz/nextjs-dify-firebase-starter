/**
 * @fileoverview Dify API response fixtures for testing
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { DifyConversationResponse, DifyConversation } from '@/types/dify';

export const mockDifyChatResponse: DifyConversationResponse = {
  answer: 'This is a test response from Dify AI assistant.',
  conversation_id: 'conv-123',
  message_id: 'msg-456',
  mode: 'chat',
  created_at: '2024-01-01T00:00:00Z',
  metadata: {
    usage: {
      prompt_tokens: 15,
      completion_tokens: 25,
      total_tokens: 40,
    },
  },
};

export const mockDifyChatResponseWithFiles: DifyConversationResponse = {
  ...mockDifyChatResponse,
  answer: 'Here is the analysis of your uploaded image: [Image analysis content]',
};

export const mockDifyConversations: DifyConversation[] = [
  {
    id: 'conv-1',
    name: 'Recipe Analysis',
    inputs: {},
    status: 'active',
    introduction: 'Analysis of pasta recipe with nutritional information',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'conv-2',
    name: 'Another Recipe Analysis',
    inputs: {
      user_preference: 'detailed_explanations',
    },
    status: 'active',
    introduction: 'Discussion about cooking techniques for chicken',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

export const mockDifyFileUploadResponse = {
  id: 'file-123',
  name: 'test-file.jpg',
  size: 1024,
  type: 'image/jpeg',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockDifyErrorResponse = {
  code: 'INVALID_API_KEY',
  message: 'Invalid API key provided',
  status: 401,
};
