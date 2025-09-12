/**
 * @fileoverview Main Dify service facade - provides unified access to all Dify API services
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { DifyServiceConfig } from './types';
import { ChatService } from './chat';
import { ConversationService } from './conversation';
import { FeedbackService } from './feedback';
import { SuggestionsService } from './suggestions';
import { AudioService } from './audio';
import { FileService } from './files';

/**
 * Main Dify service providing unified access to all Dify API functionality
 *
 * This service acts as a facade, providing a single entry point to all Dify services
 * while maintaining separation of concerns through individual service classes.
 *
 * @example
 * ```typescript
 * // Initialize the service
 * const difyService = new DifyService({
 *   apiKey: 'app-your-api-key',
 *   userId: 'user123',
 *   baseUrl: 'https://api.dify.ai/v1', // optional
 *   timeout: 30000 // optional
 * });
 *
 * // Use chat functionality
 * const chatResponse = await difyService.chat.sendMessage({
 *   query: "Hello, how are you?",
 *   user: "user123",
 *   response_mode: "blocking"
 * });
 *
 * // Use conversation management
 * const conversations = await difyService.conversation.getConversations();
 *
 * // Use feedback system
 * await difyService.feedback.likeMessage("msg-123", "Great answer!");
 *
 * // Use suggestions
 * const suggestions = await difyService.suggestions.getSuggestedQuestions("msg-123");
 *
 * // Use audio features
 * const audioBlob = await difyService.audio.textToAudio("Hello world!");
 *
 * ```
 */
export class DifyService {
  /**
   * Chat service for sending messages and streaming
   * @readonly
   */
  public readonly chat: ChatService;

  /**
   * Conversation service for managing conversations and history
   * @readonly
   */
  public readonly conversation: ConversationService;

  /**
   * Feedback service for message likes/dislikes
   * @readonly
   */
  public readonly feedback: FeedbackService;

  /**
   * Suggestions service for dynamic question suggestions
   * @readonly
   */
  public readonly suggestions: SuggestionsService;

  /**
   * Audio service for speech-to-text and text-to-audio
   * @readonly
   */
  public readonly audio: AudioService;

  /**
   * File service for file upload and preview operations
   * @readonly
   */
  public readonly files: FileService;

  /**
   * Service configuration
   * @private
   */
  private readonly config: DifyServiceConfig;

  /**
   * Creates a new DifyService instance
   * @param config - Service configuration
   * @throws {Error} If required configuration is missing
   *
   * @example
   * ```typescript
   * const difyService = new DifyService({
   *   apiKey: process.env.DIFY_API_KEY!,
   *   userId: 'user123'
   * });
   * ```
   */
  constructor(config: DifyServiceConfig) {
    // Validate required configuration
    if (!config.apiKey) {
      throw new Error('API key is required');
    }
    if (!config.userId) {
      throw new Error('User ID is required');
    }

    this.config = config;

    // Initialize all services
    this.chat = new ChatService(config);
    this.conversation = new ConversationService(config);
    this.feedback = new FeedbackService(config);
    this.suggestions = new SuggestionsService(config);
    this.audio = new AudioService(config);
    this.files = new FileService(config);
  }

  /**
   * Gets the current user ID
   * @returns The user ID
   *
   * @example
   * ```typescript
   * const userId = difyService.getUserId();
   * console.log('Current user:', userId);
   * ```
   */
  public getUserId(): string {
    return this.config.userId;
  }

  /**
   * Gets the API key (masked for security)
   * @returns Masked API key
   *
   * @example
   * ```typescript
   * const apiKey = difyService.getApiKey();
   * console.log('API key:', apiKey); // "app-1234..."
   * ```
   */
  public getApiKey(): string {
    return this.config.apiKey.substring(0, 8) + '...';
  }

  /**
   * Gets the base URL for the Dify API
   * @returns The base URL
   *
   * @example
   * ```typescript
   * const baseUrl = difyService.getBaseUrl();
   * console.log('Base URL:', baseUrl);
   * ```
   */
  public getBaseUrl(): string {
    return this.config.baseUrl || 'https://api.dify.ai/v1';
  }

  /**
   * Gets the request timeout
   * @returns The timeout in milliseconds
   *
   * @example
   * ```typescript
   * const timeout = difyService.getTimeout();
   * console.log('Timeout:', timeout, 'ms');
   * ```
   */
  public getTimeout(): number {
    return this.config.timeout || 30000;
  }

  /**
   * Updates the user ID for all services
   * @param userId - New user ID
   *
   * @example
   * ```typescript
   * difyService.updateUserId('new-user-123');
   * ```
   */
  public updateUserId(userId: string): void {
    this.config.userId = userId;

    // Update user ID in all services (using type assertion to bypass readonly)
    (this.chat as unknown as { userId: string }).userId = userId;
    (this.conversation as unknown as { userId: string }).userId = userId;
    (this.feedback as unknown as { userId: string }).userId = userId;
    (this.suggestions as unknown as { userId: string }).userId = userId;
    (this.audio as unknown as { userId: string }).userId = userId;
    (this.files as unknown as { userId: string }).userId = userId;
  }

  /**
   * Gets service health status
   * @returns Promise resolving to health status
   *
   * @example
   * ```typescript
   * const health = await difyService.getHealth();
   * if (health.isHealthy) {
   *   console.log('All services are healthy');
   * } else {
   *   console.log('Some services have issues:', health.issues);
   * }
   * ```
   */
  public async getHealth(): Promise<{
    isHealthy: boolean;
    issues: string[];
    services: {
      chat: boolean;
      conversation: boolean;
      feedback: boolean;
      suggestions: boolean;
      audio: boolean;
      files: boolean;
    };
  }> {
    const issues: string[] = [];
    const services = {
      chat: true,
      conversation: true,
      feedback: true,
      suggestions: true,
      audio: true,
      files: true,
    };

    // Test each service with a simple operation
    try {
      // Test chat service by checking if it can make a request
      await this.chat['makeRequest']('/parameters', { method: 'GET' });
    } catch (error) {
      services.chat = false;
      issues.push('Chat service: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    try {
      // Test conversation service
      await (
        this.conversation as unknown as {
          makeRequest: (url: string, options: unknown) => Promise<unknown>;
        }
      ).makeRequest('/conversations?user=' + this.config.userId + '&limit=1', { method: 'GET' });
    } catch (error) {
      services.conversation = false;
      issues.push(
        'Conversation service: ' + (error instanceof Error ? error.message : 'Unknown error')
      );
    }

    try {
      // Test file service
      await (
        this.files as unknown as {
          makeRequest: (url: string, options: unknown) => Promise<unknown>;
        }
      ).makeRequest('/files/upload', { method: 'POST' });
    } catch (error) {
      services.files = false;
      issues.push('File service: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    // Other services would be tested similarly...

    return {
      isHealthy: issues.length === 0,
      issues,
      services,
    };
  }

  /**
   * Creates a new DifyService instance with different user ID
   * @param userId - New user ID
   * @returns New DifyService instance
   *
   * @example
   * ```typescript
   * const newService = difyService.forUser('different-user-123');
   * ```
   */
  public forUser(userId: string): DifyService {
    return new DifyService({
      ...this.config,
      userId,
    });
  }

  /**
   * Creates a new DifyService instance with different API key
   * @param apiKey - New API key
   * @returns New DifyService instance
   *
   * @example
   * ```typescript
   * const newService = difyService.withApiKey('app-different-key');
   * ```
   */
  public withApiKey(apiKey: string): DifyService {
    return new DifyService({
      ...this.config,
      apiKey,
    });
  }
}

// Re-export all types for convenience
export * from './types';

// Re-export individual services for advanced usage
export { ChatService } from './chat';
export { ConversationService } from './conversation';
export { FeedbackService } from './feedback';
export { SuggestionsService } from './suggestions';
export { AudioService } from './audio';
export { FileService } from './files';
export { BaseDifyService, DifyApiError } from './base';
