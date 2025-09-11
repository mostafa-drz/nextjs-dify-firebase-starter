/**
 * @fileoverview Suggestions service for Dify API - handles suggested questions
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { BaseDifyService } from '../base';
import { SuggestedQuestionsResponse, DifyApiResponse } from '../types';

/**
 * Service for handling suggested questions operations with Dify API
 * Provides dynamic question suggestions based on conversation context
 */
export class SuggestionsService extends BaseDifyService {
  /**
   * Gets suggested questions for a specific message
   * @param messageId - ID of the message to get suggestions for
   * @returns Promise resolving to suggested questions response
   * @example
   * ```typescript
   * const suggestions = await suggestionsService.getSuggestedQuestions("msg-123");
   *
   * if (suggestions.success && suggestions.data) {
   *   suggestions.data.data.forEach(question => {
   *     console.log(`Suggested: ${question}`);
   *   });
   * }
   * ```
   */
  async getSuggestedQuestions(
    messageId: string
  ): Promise<DifyApiResponse<SuggestedQuestionsResponse>> {
    try {
      this.validateRequired({ messageId }, ['messageId']);

      const params = new URLSearchParams({
        user: this.userId,
      });

      const response = await this.makeRequest(`/messages/${messageId}/suggested?${params}`, {
        method: 'GET',
      });

      const data: SuggestedQuestionsResponse = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Gets suggested questions for multiple messages
   * @param messageIds - Array of message IDs to get suggestions for
   * @returns Promise resolving to array of suggested questions responses
   * @example
   * ```typescript
   * const results = await suggestionsService.getBatchSuggestedQuestions([
   *   "msg-1", "msg-2", "msg-3"
   * ]);
   *
   * results.forEach((result, index) => {
   *   if (result.success && result.data) {
   *     console.log(`Message ${index + 1} suggestions:`, result.data.data);
   *   }
   * });
   * ```
   */
  async getBatchSuggestedQuestions(
    messageIds: string[]
  ): Promise<DifyApiResponse<SuggestedQuestionsResponse>[]> {
    const promises = messageIds.map((messageId) => this.getSuggestedQuestions(messageId));

    try {
      const results = await Promise.allSettled(promises);

      return results.map((result) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            error: {
              code: 'BATCH_SUGGESTIONS_ERROR',
              message: result.reason instanceof Error ? result.reason.message : 'Unknown error',
              status: 500,
            },
          };
        }
      });
    } catch (error) {
      return messageIds.map(() => this.handleError(error));
    }
  }

  /**
   * Gets suggested questions with error handling and fallback
   * @param messageId - ID of the message to get suggestions for
   * @param fallbackQuestions - Fallback questions if API fails
   * @returns Promise resolving to suggested questions (from API or fallback)
   * @example
   * ```typescript
   * const questions = await suggestionsService.getSuggestedQuestionsWithFallback(
   *   "msg-123",
   *   ["What else can you help with?", "Tell me more about this topic"]
   * );
   *
   * console.log("Available questions:", questions);
   * ```
   */
  async getSuggestedQuestionsWithFallback(
    messageId: string,
    fallbackQuestions: string[] = []
  ): Promise<string[]> {
    try {
      const response = await this.getSuggestedQuestions(messageId);

      if (response.success && response.data) {
        return response.data.data;
      }

      console.warn('Failed to get suggested questions, using fallback');
      return fallbackQuestions;
    } catch (error) {
      console.error('Error getting suggested questions:', error);
      return fallbackQuestions;
    }
  }

  /**
   * Gets suggested questions for the latest message in a conversation
   * @param conversationId - ID of the conversation
   * @param fallbackQuestions - Fallback questions if no suggestions available
   * @returns Promise resolving to suggested questions
   * @example
   * ```typescript
   * const questions = await suggestionsService.getLatestMessageSuggestions(
   *   "conv-123",
   *   ["Continue the conversation", "Ask a follow-up question"]
   * );
   * ```
   */
  async getLatestMessageSuggestions(
    conversationId: string,
    fallbackQuestions: string[] = []
  ): Promise<string[]> {
    try {
      // First get the conversation history to find the latest message
      const historyResponse = await this.makeRequest(
        `/messages?conversation_id=${conversationId}&user=${this.userId}&limit=1`,
        {
          method: 'GET',
        }
      );

      const historyData = await historyResponse.json();

      if (!historyData.data || historyData.data.length === 0) {
        return fallbackQuestions;
      }

      const latestMessage = historyData.data[0];
      return this.getSuggestedQuestionsWithFallback(latestMessage.id, fallbackQuestions);
    } catch (error) {
      console.error('Error getting latest message suggestions:', error);
      return fallbackQuestions;
    }
  }

  /**
   * Formats suggested questions for display
   * @param questions - Array of suggested questions
   * @param maxLength - Maximum length for each question (default 100)
   * @returns Array of formatted questions
   * @example
   * ```typescript
   * const formatted = suggestionsService.formatQuestions(
   *   ["This is a very long question that might need to be truncated"],
   *   50
   * );
   * ```
   */
  formatQuestions(questions: string[], maxLength: number = 100): string[] {
    return questions.map((question) => {
      if (question.length <= maxLength) {
        return question;
      }

      // Truncate and add ellipsis
      return question.substring(0, maxLength - 3) + '...';
    });
  }

  /**
   * Filters suggested questions based on criteria
   * @param questions - Array of suggested questions
   * @param filters - Filtering criteria
   * @returns Array of filtered questions
   * @example
   * ```typescript
   * const filtered = suggestionsService.filterQuestions(
   *   ["What is AI?", "How does it work?", "Tell me more"],
   *   { minLength: 10, maxLength: 50, excludeWords: ["more"] }
   * );
   * ```
   */
  filterQuestions(
    questions: string[],
    filters: {
      minLength?: number;
      maxLength?: number;
      excludeWords?: string[];
      includeWords?: string[];
    } = {}
  ): string[] {
    return questions.filter((question) => {
      const length = question.length;

      // Length filters
      if (filters.minLength && length < filters.minLength) return false;
      if (filters.maxLength && length > filters.maxLength) return false;

      // Word filters
      if (filters.excludeWords) {
        const hasExcludedWord = filters.excludeWords.some((word) =>
          question.toLowerCase().includes(word.toLowerCase())
        );
        if (hasExcludedWord) return false;
      }

      if (filters.includeWords) {
        const hasIncludedWord = filters.includeWords.some((word) =>
          question.toLowerCase().includes(word.toLowerCase())
        );
        if (!hasIncludedWord) return false;
      }

      return true;
    });
  }
}
