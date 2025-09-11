/**
 * @fileoverview Feedback service for Dify API - handles message feedback
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { BaseDifyService } from '../base';
import {
  MessageFeedbackRequest,
  MessageFeedbackResponse,
  DifyApiResponse
} from '../types';

/**
 * Service for handling message feedback operations with Dify API
 * Allows users to provide likes/dislikes and content feedback on messages
 */
export class FeedbackService extends BaseDifyService {
  /**
   * Sends feedback for a specific message
   * @param messageId - ID of the message to provide feedback for
   * @param rating - Feedback rating: 'like', 'dislike', or null to revoke
   * @param content - Optional specific feedback content
   * @returns Promise resolving to feedback response
   * @example
   * ```typescript
   * // Like a message
   * const result = await feedbackService.sendFeedback(
   *   "msg-123",
   *   "like",
   *   "This was very helpful!"
   * );
   * 
   * if (result.success) {
   *   console.log("Feedback sent successfully");
   * }
   * ```
   */
  async sendFeedback(
    messageId: string,
    rating: 'like' | 'dislike' | null,
    content?: string
  ): Promise<DifyApiResponse<MessageFeedbackResponse>> {
    try {
      this.validateRequired({ messageId }, ['messageId']);

      const request: MessageFeedbackRequest = {
        rating,
        user: this.userId,
        ...(content && { content })
      };

      const response = await this.makeRequest(`/messages/${messageId}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      const data: MessageFeedbackResponse = await response.json();

      return {
        success: true,
        data
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Likes a message (convenience method)
   * @param messageId - ID of the message to like
   * @param content - Optional feedback content
   * @returns Promise resolving to feedback response
   * @example
   * ```typescript
   * const result = await feedbackService.likeMessage(
   *   "msg-123",
   *   "Great answer!"
   * );
   * ```
   */
  async likeMessage(
    messageId: string,
    content?: string
  ): Promise<DifyApiResponse<MessageFeedbackResponse>> {
    return this.sendFeedback(messageId, 'like', content);
  }

  /**
   * Dislikes a message (convenience method)
   * @param messageId - ID of the message to dislike
   * @param content - Optional feedback content explaining the dislike
   * @returns Promise resolving to feedback response
   * @example
   * ```typescript
   * const result = await feedbackService.dislikeMessage(
   *   "msg-123",
   *   "This answer was not accurate"
   * );
   * ```
   */
  async dislikeMessage(
    messageId: string,
    content?: string
  ): Promise<DifyApiResponse<MessageFeedbackResponse>> {
    return this.sendFeedback(messageId, 'dislike', content);
  }

  /**
   * Revokes feedback for a message (convenience method)
   * @param messageId - ID of the message to revoke feedback for
   * @returns Promise resolving to feedback response
   * @example
   * ```typescript
   * const result = await feedbackService.revokeFeedback("msg-123");
   * ```
   */
  async revokeFeedback(messageId: string): Promise<DifyApiResponse<MessageFeedbackResponse>> {
    return this.sendFeedback(messageId, null);
  }

  /**
   * Toggles feedback for a message (like ↔ dislike ↔ no feedback)
   * @param messageId - ID of the message
   * @param currentRating - Current rating of the message
   * @param content - Optional feedback content
   * @returns Promise resolving to feedback response
   * @example
   * ```typescript
   * // If message is currently liked, this will dislike it
   * const result = await feedbackService.toggleFeedback(
   *   "msg-123",
   *   "like",
   *   "Actually, this wasn't helpful"
   * );
   * ```
   */
  async toggleFeedback(
    messageId: string,
    currentRating: 'like' | 'dislike' | null,
    content?: string
  ): Promise<DifyApiResponse<MessageFeedbackResponse>> {
    let newRating: 'like' | 'dislike' | null;

    switch (currentRating) {
      case 'like':
        newRating = 'dislike';
        break;
      case 'dislike':
        newRating = null; // Revoke feedback
        break;
      case null:
      default:
        newRating = 'like';
        break;
    }

    return this.sendFeedback(messageId, newRating, content);
  }

  /**
   * Sends feedback for multiple messages in batch
   * @param feedbacks - Array of feedback objects
   * @returns Promise resolving to array of feedback responses
   * @example
   * ```typescript
   * const results = await feedbackService.sendBatchFeedback([
   *   { messageId: "msg-1", rating: "like", content: "Good!" },
   *   { messageId: "msg-2", rating: "dislike", content: "Not helpful" }
   * ]);
   * 
   * results.forEach((result, index) => {
   *   if (result.success) {
   *     console.log(`Feedback ${index + 1} sent successfully`);
   *   }
   * });
   * ```
   */
  async sendBatchFeedback(
    feedbacks: Array<{
      messageId: string;
      rating: 'like' | 'dislike' | null;
      content?: string;
    }>
  ): Promise<DifyApiResponse<MessageFeedbackResponse>[]> {
    const promises = feedbacks.map(feedback =>
      this.sendFeedback(feedback.messageId, feedback.rating, feedback.content)
    );

    try {
      const results = await Promise.allSettled(promises);
      
      return results.map(result => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            success: false,
            error: {
              code: 'BATCH_FEEDBACK_ERROR',
              message: result.reason instanceof Error ? result.reason.message : 'Unknown error',
              status: 500
            }
          };
        }
      });
    } catch (error) {
      return feedbacks.map(() => this.handleError(error));
    }
  }
}
