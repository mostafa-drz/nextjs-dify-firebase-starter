import { Timestamp } from 'firebase/firestore';

export interface DifySession {
  id: string;
  userId: string;
  difyAppToken: string;
  conversationId?: string;
  status: 'active' | 'expired' | 'blocked';
  startedAt: Timestamp;
  lastActivityAt: Timestamp;
  totalInteractions: number;
  totalCreditsUsed: number;
}

export interface DifyChatProps {
  token: string;           // Dify app token
  creditCost?: number;     // Base credits per session (default: 1)
  name?: string;          // Display name
  height?: string;        // Embed height
  className?: string;     // Styling
}

export interface DifyApiResponse {
  conversation_id?: string;
  message_id?: string;
  answer?: string;
  metadata?: {
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
}

export interface DifyStreamChunk {
  event: string;
  data: string;
}