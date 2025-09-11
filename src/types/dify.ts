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
  inputs?: Record<string, unknown>;
  response_mode?: 'streaming' | 'blocking';
  files?: Array<{
    type: 'image' | 'document';
    transfer_method: 'remote_url' | 'local_file';
    url?: string;
    upload_file_id?: string;
  }>;
}

export interface DifyChatProps {
  apiKey: string;
  name?: string;
  className?: string;
  placeholder?: string;
  welcomeMessage?: string;
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