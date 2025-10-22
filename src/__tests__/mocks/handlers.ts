/**
 * @fileoverview MSW handlers for API mocking
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock Dify API responses
export const handlers = [
  // Dify chat messages endpoint
  http.post('https://api.dify.ai/v1/chat-messages', () => {
    return HttpResponse.json({
      answer: 'This is a test response from Dify',
      conversation_id: 'test-conversation-123',
      message_id: 'test-message-456',
      mode: 'chat',
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      },
    });
  }),

  // Dify conversations endpoint
  http.get('https://api.dify.ai/v1/conversations', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'conv-1',
          name: 'Test Conversation 1',
          inputs: {},
          status: 'normal',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ],
      has_more: false,
      limit: 20,
      total: 1,
    });
  }),

  // Dify conversation messages endpoint (corrected)
  http.get('https://api.dify.ai/v1/messages', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          query: 'Hello, how are you?',
          answer: 'I am doing well, thank you! How can I help you today?',
          created_at: 1640995200,
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-1',
          query: 'What can you do?',
          answer:
            'I can help you with various tasks including analysis, answering questions, and more!',
          created_at: 1640995260,
        },
      ],
      has_more: false,
      limit: 20,
    });
  }),

  // Dify file upload endpoint
  http.post('https://api.dify.ai/v1/files/upload', () => {
    return HttpResponse.json({
      id: 'file-123',
      name: 'test-file.jpg',
      size: 1024,
      type: 'image/jpeg',
      created_at: '2024-01-01T00:00:00Z',
    });
  }),

  // Dify conversation rename endpoint
  http.post('https://api.dify.ai/v1/conversations/:conversationId/name', () => {
    return HttpResponse.json({
      result: 'success',
    });
  }),

  // Dify conversation delete endpoint
  http.delete('https://api.dify.ai/v1/conversations/:conversationId', () => {
    return HttpResponse.json({
      result: 'success',
    });
  }),

  // Mock Firebase Auth endpoints
  http.post('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode', () => {
    return HttpResponse.json({
      email: 'test@example.com',
    });
  }),

  http.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink', () => {
    return HttpResponse.json({
      idToken: 'mock-id-token',
      email: 'test@example.com',
      refreshToken: 'mock-refresh-token',
      expiresIn: '3600',
      localId: 'test-user-123',
    });
  }),
];

export const server = setupServer(...handlers);
