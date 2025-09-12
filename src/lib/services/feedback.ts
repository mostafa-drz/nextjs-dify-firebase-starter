/**
 * Feedback service using Sentry user feedback
 */

import * as Sentry from '@sentry/nextjs';
import type { FeedbackData, FeedbackSubmissionResult } from '@/types/feedback';

/**
 * Submit user feedback using Sentry's user feedback feature
 * This will create a user feedback event in Sentry that can be forwarded to Slack
 */
export async function submitFeedback(data: FeedbackData): Promise<FeedbackSubmissionResult> {
  try {
    // Create a user feedback event in Sentry
    const eventId = Sentry.captureUserFeedback({
      event_id: Sentry.captureMessage('User Feedback Submitted', 'info'),
      name: data.name || 'Anonymous User',
      email: data.email || 'no-email@example.com',
      comments: data.message,
    });

    // Add additional context to the current scope
    Sentry.configureScope((scope) => {
      scope.setTag('feedback_category', data.category || 'general');
      scope.setTag('feedback_priority', data.priority || 'medium');
      scope.setContext('feedback_context', {
        page: data.page || 'unknown',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        timestamp: new Date().toISOString(),
        ...data.context,
      });
    });

    // Capture a custom event with the feedback data
    Sentry.captureEvent({
      message: `User Feedback: ${data.category || 'general'}`,
      level: 'info',
      tags: {
        feedback_category: data.category || 'general',
        feedback_priority: data.priority || 'medium',
        page: data.page || 'unknown',
      },
      extra: {
        feedback_message: data.message,
        user_email: data.email,
        user_name: data.name,
        context: data.context,
      },
    });

    return {
      success: true,
      messageId: eventId,
    };
  } catch (error) {
    console.error('Failed to submit feedback:', error);

    // Fallback: try to capture the error in Sentry
    Sentry.captureException(error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get current page context for feedback
 */
export function getPageContext(): string {
  if (typeof window === 'undefined') return 'server';

  return window.location.pathname + window.location.search;
}

/**
 * Get user context for feedback (if available)
 */
export function getUserContext(): Record<string, unknown> {
  const context: Record<string, unknown> = {};

  if (typeof window !== 'undefined') {
    context.userAgent = window.navigator.userAgent;
    context.url = window.location.href;
    context.timestamp = new Date().toISOString();

    // Add screen resolution if available
    if (window.screen) {
      context.screenResolution = `${window.screen.width}x${window.screen.height}`;
    }

    // Add viewport size if available
    if (window.innerWidth && window.innerHeight) {
      context.viewportSize = `${window.innerWidth}x${window.innerHeight}`;
    }
  }

  return context;
}
