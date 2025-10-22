/**
 * @fileoverview Conversation service for Dify API - handles conversation management
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { BaseDifyService } from '../base';
import {
  ConversationsListResponse,
  ConversationHistoryResponse,
  ConversationRenameRequest,
  ConversationRenameResponse,
  DifyApiResponse,
} from '../types';

/**
 * Service for handling conversation operations with Dify API
 * Provides CRUD operations for conversations and message history
 */
export class ConversationService extends BaseDifyService {
  /**
   * Retrieves the list of conversations for the current user
   * @param options - Query options for pagination and sorting
   * @returns Promise resolving to conversations list response
   * @example
   * ```typescript
   * const conversations = await conversationService.getConversations({
   *   limit: 20,
   *   sort_by: '-updated_at'
   * });
   *
   * if (conversations.success) {
   *   console.log(`Found ${conversations.data?.data.length} conversations`);
   * }
   * ```
   */
  async getConversations(
    options: {
      /** Number of items per page (default 20, max 100) */
      limit?: number;
      /** ID of the last record for pagination */
      last_id?: string;
      /** Sorting field (e.g., '-updated_at' for newest first) */
      sort_by?: 'created_at' | '-created_at' | 'updated_at' | '-updated_at';
    } = {}
  ): Promise<DifyApiResponse<ConversationsListResponse>> {
    try {
      // Validate that userId is provided
      if (!this.userId) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'User ID is required',
            status: 400,
          },
        };
      }

      const params = new URLSearchParams({
        user: this.userId,
        ...(options.limit && { limit: options.limit.toString() }),
        ...(options.last_id && { last_id: options.last_id }),
        ...(options.sort_by && { sort_by: options.sort_by }),
      });

      const response = await this.makeRequest(`/conversations?${params}`, {
        method: 'GET',
      });

      const data: ConversationsListResponse = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Retrieves the message history for a specific conversation
   * @param conversationId - ID of the conversation
   * @param options - Query options for pagination
   * @returns Promise resolving to conversation history response
   * @example
   * ```typescript
   * const history = await conversationService.getConversationHistory(
   *   "conv-123",
   *   { limit: 50 }
   * );
   *
   * if (history.success) {
   *   history.data?.data.forEach(message => {
   *     console.log(`User: ${message.query}`);
   *     console.log(`Assistant: ${message.answer}`);
   *   });
   * }
   * ```
   */
  async getConversationHistory(
    conversationId: string,
    options: {
      /** Number of items per page (default 20) */
      limit?: number;
      /** ID of the first chat record on the current page */
      first_id?: string;
    } = {}
  ): Promise<DifyApiResponse<ConversationHistoryResponse>> {
    try {
      // Validate that userId is provided
      if (!this.userId) {
        return {
          success: false,
          error: {
            code: 'INVALID_USER_ID',
            message: 'User ID is required',
            status: 400,
          },
        };
      }

      this.validateRequired({ conversationId }, ['conversationId']);

      const params = new URLSearchParams({
        conversation_id: conversationId,
        user: this.userId,
        ...(options.limit && { limit: options.limit.toString() }),
        ...(options.first_id && { first_id: options.first_id }),
      });

      const response = await this.makeRequest(`/messages?${params}`, {
        method: 'GET',
      });

      const data: ConversationHistoryResponse = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Renames a conversation
   * @param conversationId - ID of the conversation to rename
   * @param name - New name for the conversation (null to auto-generate)
   * @param autoGenerate - Whether to auto-generate the name
   * @returns Promise resolving to conversation rename response
   * @example
   * ```typescript
   * const result = await conversationService.renameConversation(
   *   "conv-123",
   *   "My Important Chat",
   *   false
   * );
   *
   * if (result.success) {
   *   console.log(`Conversation renamed to: ${result.data?.name}`);
   * }
   * ```
   */
  async renameConversation(
    conversationId: string,
    name: string | null,
    autoGenerate: boolean = false
  ): Promise<DifyApiResponse<ConversationRenameResponse>> {
    try {
      this.validateRequired({ conversationId }, ['conversationId']);

      const request: ConversationRenameRequest = {
        name,
        auto_generate: autoGenerate,
        user: this.userId,
      };

      const response = await this.makeRequest(`/conversations/${conversationId}/name`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      const data: ConversationRenameResponse = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Deletes a conversation
   * @param conversationId - ID of the conversation to delete
   * @returns Promise resolving to deletion result
   * @example
   * ```typescript
   * const result = await conversationService.deleteConversation("conv-123");
   *
   * if (result.success) {
   *   console.log("Conversation deleted successfully");
   * }
   * ```
   */
  async deleteConversation(
    conversationId: string
  ): Promise<DifyApiResponse<{ result: 'success' }>> {
    try {
      this.validateRequired({ conversationId }, ['conversationId']);

      await this.makeRequest(`/conversations/${conversationId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          user: this.userId,
        }),
      });

      // DELETE returns 204 No Content, so we create our own success response
      return {
        success: true,
        data: { result: 'success' },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Gets conversation details by ID
   * @param conversationId - ID of the conversation
   * @returns Promise resolving to conversation details
   * @example
   * ```typescript
   * const conversation = await conversationService.getConversationDetails("conv-123");
   *
   * if (conversation.success) {
   *   console.log(`Conversation: ${conversation.data?.name}`);
   *   console.log(`Status: ${conversation.data?.status}`);
   * }
   * ```
   */
  async getConversationDetails(
    conversationId: string
  ): Promise<DifyApiResponse<ConversationRenameResponse>> {
    try {
      this.validateRequired({ conversationId }, ['conversationId']);

      // We can get conversation details by fetching the list and filtering
      const conversations = await this.getConversations({ limit: 100 });

      if (!conversations.success || !conversations.data) {
        return {
          success: false,
          error: {
            code: 'CONVERSATION_NOT_FOUND',
            message: 'Conversation not found',
            status: 404,
          },
        };
      }

      const conversation = conversations.data.data.find((conv) => conv.id === conversationId);

      if (!conversation) {
        return {
          success: false,
          error: {
            code: 'CONVERSATION_NOT_FOUND',
            message: 'Conversation not found',
            status: 404,
          },
        };
      }

      return {
        success: true,
        data: conversation,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Gets all conversations with pagination support
   * @param options - Pagination options
   * @returns Promise resolving to all conversations
   * @example
   * ```typescript
   * const allConversations = await conversationService.getAllConversations({
   *   batchSize: 50
   * });
   *
   * console.log(`Total conversations: ${allConversations.length}`);
   * ```
   */
  async getAllConversations(
    options: {
      /** Number of conversations to fetch per batch */
      batchSize?: number;
    } = {}
  ): Promise<ConversationRenameResponse[]> {
    const batchSize = options.batchSize || 20;
    const allConversations: ConversationRenameResponse[] = [];
    let lastId: string | undefined;
    let hasMore = true;

    try {
      while (hasMore) {
        const response = await this.getConversations({
          limit: batchSize,
          last_id: lastId,
          sort_by: '-updated_at',
        });

        if (!response.success || !response.data) {
          break;
        }

        allConversations.push(...response.data.data);
        hasMore = response.data.has_more;

        if (hasMore && response.data.data.length > 0) {
          lastId = response.data.data[response.data.data.length - 1].id;
        }
      }

      return allConversations;
    } catch (error) {
      console.error('Error fetching all conversations:', error);
      return allConversations; // Return what we have so far
    }
  }
}
