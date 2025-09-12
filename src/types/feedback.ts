/**
 * Types for the feedback service
 */

export interface FeedbackData {
  /** User's feedback message */
  message: string;
  /** User's email (optional) */
  email?: string;
  /** User's name (optional) */
  name?: string;
  /** Current page/route where feedback was submitted */
  page?: string;
  /** Additional context about the user's session */
  context?: Record<string, unknown>;
  /** Feedback category */
  category?: 'bug' | 'feature' | 'general' | 'improvement';
  /** Priority level */
  priority?: 'low' | 'medium' | 'high';
}

export interface FeedbackConfig {
  /** Whether to show the feedback button */
  enabled: boolean;
  /** Position of the feedback button */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Custom button text */
  buttonText?: string;
  /** Whether to require email */
  requireEmail?: boolean;
  /** Whether to require name */
  requireName?: boolean;
  /** Available feedback categories */
  categories?: Array<'bug' | 'feature' | 'general' | 'improvement'>;
  /** Custom placeholder text for the feedback input */
  placeholder?: string;
}

export interface FeedbackSubmissionResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
