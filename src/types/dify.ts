export interface DifyApp {
  id: string;
  name: string;
  mode: 'chat' | 'completion' | 'agent' | 'workflow';
  icon?: string;
  description?: string;
  apiKey: string;
  baseUrl?: string;
}

export interface DifyMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  files?: Array<{
    id: string;
    type: string;
    url: string;
    belongs_to: 'user' | 'assistant';
  }>;
}

export interface DifyConversationResponse {
  conversation_id: string;
  message_id: string;
  mode: string;
  answer: string;
  created_at: string;
  metadata: {
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    retriever_resources?: Record<string, unknown>[];
  };
}

export interface DifyStreamResponse {
  event: 'message' | 'message_end' | 'error' | 'agent_thought';
  conversation_id: string;
  message_id: string;
  answer?: string;
  created_at: string;
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export interface DifyConversation {
  id: string;
  name: string;
  inputs: Record<string, unknown>;
  status: string;
  introduction: string;
  created_at: string;
  updated_at: string;
}

export interface DifyChatRequest {
  query: string;
  conversation_id?: string;
  user: string;
  inputs?: Record<string, unknown>; // Official Dify inputs parameter - flexible for any use case
  response_mode?: 'streaming' | 'blocking';
  files?: Array<{
    type: 'image' | 'document';
    transfer_method: 'remote_url' | 'local_file';
    url?: string;
    upload_file_id?: string;
  }>;
}

export interface DifyFileUploadRequest {
  file: File;
  user: string;
}

export interface DifyFileUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
}

export interface DifyFilePreviewRequest {
  file_id: string;
  as_attachment?: boolean;
}

export interface DifyChatProps {
  name?: string;
  className?: string;
  placeholder?: string;
  welcomeMessage?: string;
  enableStreaming?: boolean;
  streamingMode?: 'auto' | 'manual';
}

export interface DifyApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    status: number;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
