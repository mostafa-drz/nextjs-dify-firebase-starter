/**
 * @fileoverview Comprehensive type definitions for Dify API services
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

/**
 * Base response structure for all Dify API calls
 * @template T - The data type returned by the API
 */
export interface DifyApiResponse<T = unknown> {
  /** Indicates if the API call was successful */
  success: boolean;
  /** The actual data returned by the API (only present if success is true) */
  data?: T;
  /** Error information (only present if success is false) */
  error?: {
    /** Error code for programmatic handling */
    code: string;
    /** Human-readable error message */
    message: string;
    /** HTTP status code */
    status: number;
  };
  /** Token usage information for credit tracking */
  usage?: {
    /** Number of tokens in the prompt */
    prompt_tokens: number;
    /** Number of tokens in the completion */
    completion_tokens: number;
    /** Total tokens used */
    total_tokens: number;
    /** Cost per prompt token */
    prompt_unit_price?: string;
    /** Cost per completion token */
    completion_unit_price?: string;
    /** Total cost for this request */
    total_price?: string;
    /** Currency of the pricing */
    currency?: string;
    /** Request latency in seconds */
    latency?: number;
  };
}

/**
 * Configuration for Dify service initialization
 */
export interface DifyServiceConfig {
  /** Dify API key for authentication */
  apiKey: string;
  /** User identifier for conversation isolation */
  userId: string;
  /** Base URL for Dify API (defaults to https://api.dify.ai/v1) */
  baseUrl?: string;
  /** Request timeout in milliseconds (defaults to 30000) */
  timeout?: number;
}

/**
 * Base request parameters for chat messages
 */
export interface BaseChatRequest {
  /** User's input/question content */
  query: string;
  /** User identifier for conversation isolation */
  user: string;
  /** Conversation ID to continue an existing conversation */
  conversation_id?: string;
  /** Response mode: 'streaming' for real-time, 'blocking' for complete response */
  response_mode?: 'streaming' | 'blocking';
  /** Auto-generate conversation title (defaults to true) */
  auto_generate_name?: boolean;
}

/**
 * Extended chat request with additional parameters
 */
export interface ChatRequest extends BaseChatRequest {
  /** Variable values defined by the app */
  inputs?: Record<string, unknown>;
  /** File attachments for vision-capable models */
  files?: Array<{
    /** File type (currently only 'image' supported) */
    type: 'image';
    /** Transfer method: 'remote_url' or 'local_file' */
    transfer_method: 'remote_url' | 'local_file';
    /** Image URL (when transfer_method is 'remote_url') */
    url?: string;
    /** Uploaded file ID (when transfer_method is 'local_file') */
    upload_file_id?: string;
  }>;
}

/**
 * Response structure for blocking mode chat completion
 */
export interface ChatCompletionResponse {
  /** Event type (always 'message' for blocking mode) */
  event: 'message';
  /** Task ID for request tracking and stop functionality */
  task_id: string;
  /** Unique ID of this response/message event */
  id: string;
  /** Unique message ID */
  message_id: string;
  /** Conversation ID */
  conversation_id: string;
  /** App mode (always 'chat') */
  mode: string;
  /** Complete response content from the assistant */
  answer: string;
  /** Metadata including usage and retriever resources */
  metadata: {
    /** Token usage information */
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
      prompt_unit_price?: string;
      completion_unit_price?: string;
      total_price?: string;
      currency?: string;
      latency?: number;
    };
    /** Retrieved resources for citations */
    retriever_resources?: Array<{
      position: number;
      dataset_id: string;
      dataset_name: string;
      document_id: string;
      document_name: string;
      segment_id: string;
      score: number;
      content: string;
    }>;
  };
  /** Message creation timestamp (Unix epoch seconds) */
  created_at: number;
}

/**
 * Streaming event types for real-time chat responses
 */
export type StreamingEventType = 
  | 'message'           // Partial message content
  | 'message_end'       // End of message generation
  | 'agent_thought'      // Agent reasoning (for agent mode)
  | 'agent_message'     // Agent response (for agent mode)
  | 'message_file'      // File attachment (for agent mode)
  | 'error';            // Error occurred

/**
 * Base structure for streaming events
 */
export interface BaseStreamingEvent {
  /** Type of streaming event */
  event: StreamingEventType;
  /** Task ID for request tracking */
  task_id: string;
  /** Message ID */
  message_id: string;
  /** Conversation ID */
  conversation_id: string;
  /** Event creation timestamp */
  created_at: number;
}

/**
 * Message streaming event (partial content)
 */
export interface MessageStreamingEvent extends BaseStreamingEvent {
  event: 'message';
  /** Partial message content */
  answer: string;
}

/**
 * Message end streaming event
 */
export interface MessageEndStreamingEvent extends BaseStreamingEvent {
  event: 'message_end';
  /** Final metadata including usage */
  metadata?: {
    usage?: {
      total_tokens: number;
      latency?: number;
    };
  };
}

/**
 * Agent thought streaming event
 */
export interface AgentThoughtStreamingEvent extends BaseStreamingEvent {
  event: 'agent_thought';
  /** Unique ID for this thought */
  id: string;
  /** Position of this thought */
  position: number;
  /** The agent's reasoning */
  thought: string;
  /** Tool being used */
  tool?: string;
  /** Tool input parameters */
  tool_input?: string;
}

/**
 * Agent message streaming event
 */
export interface AgentMessageStreamingEvent extends BaseStreamingEvent {
  event: 'agent_message';
  /** Agent's response content */
  answer: string;
}

/**
 * Message file streaming event
 */
export interface MessageFileStreamingEvent extends BaseStreamingEvent {
  event: 'message_file';
  /** Unique ID for this file */
  id: string;
  /** File type */
  type: string;
  /** Who the file belongs to */
  belongs_to: 'user' | 'assistant';
  /** File URL */
  url: string;
}

/**
 * Error streaming event
 */
export interface ErrorStreamingEvent extends BaseStreamingEvent {
  event: 'error';
  /** Error message */
  message: string;
}

/**
 * Union type for all streaming events
 */
export type StreamingEvent = 
  | MessageStreamingEvent
  | MessageEndStreamingEvent
  | AgentThoughtStreamingEvent
  | AgentMessageStreamingEvent
  | MessageFileStreamingEvent
  | ErrorStreamingEvent;

/**
 * Conversation list item structure
 */
export interface ConversationListItem {
  /** Unique conversation ID */
  id: string;
  /** Conversation name/title */
  name: string;
  /** Input variables for this conversation */
  inputs: Record<string, unknown>;
  /** Conversation status */
  status: string;
  /** Introduction text */
  introduction: string | null;
  /** Creation timestamp */
  created_at: number;
  /** Last update timestamp */
  updated_at: number;
}

/**
 * Response for conversation list requests
 */
export interface ConversationsListResponse {
  /** Number of items per page */
  limit: number;
  /** Whether there are more items available */
  has_more: boolean;
  /** Array of conversation items */
  data: ConversationListItem[];
}

/**
 * Message item in conversation history
 */
export interface ConversationMessageItem {
  /** Unique message ID */
  id: string;
  /** Conversation ID this message belongs to */
  conversation_id: string;
  /** Input variables for this message */
  inputs: Record<string, unknown>;
  /** User's query */
  query: string;
  /** Assistant's answer */
  answer: string;
  /** File attachments */
  message_files?: Array<{
    id: string;
    type: string;
    url: string;
    belongs_to: 'user' | 'assistant';
  }>;
  /** User feedback on this message */
  feedback?: {
    rating: 'like' | 'dislike';
  } | null;
  /** Retrieved resources for citations */
  retriever_resources?: Array<{
    position: number;
    dataset_id: string;
    dataset_name: string;
    document_id: string;
    document_name: string;
    segment_id: string;
    score: number;
    content: string;
  }>;
  /** Message creation timestamp */
  created_at: number;
}

/**
 * Response for conversation history requests
 */
export interface ConversationHistoryResponse {
  /** Number of items per page */
  limit: number;
  /** Whether there are more items available */
  has_more: boolean;
  /** Array of message items */
  data: ConversationMessageItem[];
}

/**
 * Request parameters for conversation rename
 */
export interface ConversationRenameRequest {
  /** New conversation name (null to auto-generate) */
  name: string | null;
  /** Whether to auto-generate the name */
  auto_generate: boolean;
  /** User identifier */
  user: string;
}

/**
 * Response for conversation rename
 */
export interface ConversationRenameResponse {
  /** Conversation ID */
  id: string;
  /** New conversation name */
  name: string;
  /** Input variables */
  inputs: Record<string, unknown>;
  /** Conversation status */
  status: string;
  /** Introduction text */
  introduction: string | null;
  /** Creation timestamp */
  created_at: number;
  /** Last update timestamp */
  updated_at: number;
}

/**
 * Request parameters for message feedback
 */
export interface MessageFeedbackRequest {
  /** Feedback rating: 'like', 'dislike', or null to revoke */
  rating: 'like' | 'dislike' | null;
  /** User identifier */
  user: string;
  /** Specific feedback content */
  content?: string;
}

/**
 * Response for message feedback
 */
export interface MessageFeedbackResponse {
  /** Result status */
  result: 'success';
}

/**
 * Response for suggested questions
 */
export interface SuggestedQuestionsResponse {
  /** Result status */
  result: 'success';
  /** Array of suggested questions */
  data: string[];
}

/**
 * Request parameters for speech-to-text
 */
export interface SpeechToTextRequest {
  /** Audio file (multipart/form-data) */
  file: File;
  /** User identifier */
  user: string;
}

/**
 * Response for speech-to-text
 */
export interface SpeechToTextResponse {
  /** Transcribed text */
  text: string;
}

/**
 * Request parameters for text-to-audio
 */
export interface TextToAudioRequest {
  /** Message ID to convert to speech (takes priority over text) */
  message_id?: string;
  /** Text content to convert to speech */
  text?: string;
  /** User identifier */
  user: string;
}

/**
 * Response for text-to-audio (returns audio file)
 */
export type TextToAudioResponse = Blob;

/**
 * Request parameters for file upload
 */
export interface FileUploadRequest {
  /** File to upload */
  file: File;
  /** User identifier */
  user: string;
}

/**
 * Response for file upload
 */
export interface FileUploadResponse {
  /** Uploaded file ID */
  id: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** File type */
  type: string;
  /** File URL */
  url: string;
  /** Upload timestamp */
  created_at: number;
}

/**
 * Request parameters for stopping message generation
 */
export interface StopGenerationRequest {
  /** User identifier */
  user: string;
}

/**
 * Response for stopping message generation
 */
export interface StopGenerationResponse {
  /** Result status */
  result: 'success';
}

/**
 * App information response
 */
export interface AppInfoResponse {
  /** Opening statement for the app */
  opening_statement: string;
  /** Suggested questions for the app */
  suggested_questions: string[];
  /** Speech-to-text configuration */
  speech_to_text: {
    enabled: boolean;
  };
  /** Retriever resource configuration */
  retriever_resource: {
    enabled: boolean;
  };
}
