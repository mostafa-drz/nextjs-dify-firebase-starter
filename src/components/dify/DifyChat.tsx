'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { InsufficientCredits } from '@/components/credits/InsufficientCredits';
import { DifyChatProps } from '@/types/dify';
import { formatCredits } from '@/lib/utils/credits';
import { 
  MessageSkeleton
} from '@/components/ui/skeletons';
import { EmptyMessages } from '@/components/ui/empty-states';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertTriangle, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { MessageFeedback } from './MessageFeedback';
import { SuggestedQuestions } from './SuggestedQuestions';
import { trackChat } from '@/lib/analytics';
import { useDifyMessages, useDifyAppInfo, useDifyMutations } from '@/lib/hooks/useDify';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
  creditsDeducted?: number;
}

export function DifyChat({ 
  name = 'Dify Assistant',
  className = '',
  placeholder = 'Type your message...',
  welcomeMessage,
  conversationId: initialConversationId
}: DifyChatProps & { conversationId?: string }) {
  const { user, availableCredits, checkCredits } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversation messages if conversationId is provided
  const {
    data: conversationData,
    isLoading: messagesLoading,
    error: messagesError,
    addMessage,
  } = useDifyMessages(
    conversationId,
    user?.uid || ''
  );

  // React Query hooks for app info and mutations
  const { 
    suggestedQuestions, 
    openingStatement
  } = useDifyAppInfo();

  const { sendMessage } = useDifyMutations(user?.uid || '');

  // Add welcome message when app info loads
  useEffect(() => {
    if (openingStatement && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: openingStatement,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [openingStatement, messages.length]);

  // Custom welcome message override
  useEffect(() => {
    if (welcomeMessage && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [welcomeMessage, messages.length]);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationData?.data && conversationData.data.length > 0) {
      const loadedMessages: ChatMessage[] = conversationData.data.map((msg: unknown) => {
        const message = msg as {
          id: string;
          role: string;
          content: string;
          created_at: number;
          metadata?: {
            usage?: {
              total_tokens: number;
              credits_deducted?: number;
            };
          };
        };
        
        return {
          id: message.id,
          role: message.role === 'user' ? 'user' : 'assistant',
          content: message.content,
          timestamp: new Date(message.created_at * 1000),
          tokensUsed: message.metadata?.usage?.total_tokens,
          creditsDeducted: message.metadata?.usage?.credits_deducted,
        };
      });
      
      setMessages(loadedMessages);
    } else if (conversationId && !messagesLoading && !messagesError) {
      // Clear messages if we're switching to a conversation with no messages
      setMessages([]);
    }
  }, [conversationData, conversationId, messagesLoading, messagesError]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Check if user is authenticated
  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please sign in to start chatting.</p>
        </CardContent>
      </Card>
    );
  }

  // Estimate credit requirement (minimum 1 credit for safety)
  const estimatedCredits = Math.max(1, Math.ceil(input.length / 1000));
  const canAffordMessage = checkCredits(estimatedCredits);

  const handleSendMessage = async () => {
    if (!input.trim() || sendMessage.isLoading || !canAffordMessage) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Add user message optimistically
    setMessages(prev => [...prev, userMessage]);
    addMessage(userMessage);
    
    // Track chat interaction
    trackChat('message_sent', userMessage.content.length);
    
    setInput('');
    setError(null);

    try {
      const result = await sendMessage.mutateAsync({
        query: userMessage.content,
        conversation_id: conversationId,
        response_mode: 'blocking'
      });

      const assistantMessage: ChatMessage = {
        id: result.data!.message_id,
        role: 'assistant',
        content: result.data!.answer,
        timestamp: new Date(),
        tokensUsed: result.usage?.total_tokens,
        creditsDeducted: result.usage?.total_tokens ? Math.ceil(result.usage.total_tokens / 1000) : undefined
      };

      // Add assistant message optimistically
      setMessages(prev => [...prev, assistantMessage]);
      addMessage(assistantMessage);
      
      // Track new conversation start
      if (!conversationId && result.data!.conversation_id) {
        trackChat('conversation_started');
      }
      
      setConversationId(result.data!.conversation_id);

    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      // Remove the user message since the request failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show insufficient credits UI if user can't afford the message
  if (!canAffordMessage && input.trim()) {
    return (
      <div className={className}>
        <InsufficientCredits
          required={estimatedCredits}
          operation="sending this message"
          variant="card"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Credits: {formatCredits(availableCredits)}
            </p>
          </div>
        </div>
        {conversationId && (
          <div className="text-xs text-muted-foreground">
            Session: {conversationId.substring(0, 8)}...
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Messages Area */}
        <ScrollArea className="h-96 w-full rounded-md border p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {/* Loading state for conversation messages */}
            {messagesLoading && conversationId && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <MessageSkeleton key={i} />
                ))}
              </div>
            )}
            
            {/* Error state for conversation messages */}
            {messagesError && conversationId && (
              <div className="text-center py-8 text-red-600">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">Failed to load conversation messages</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {messagesError instanceof Error ? messagesError.message : 'Unknown error'}
                </p>
              </div>
            )}
            
            {/* Empty state for messages */}
            {!messagesLoading && !messagesError && messages.length === 0 && (
              <EmptyMessages />
            )}
            
            {messages.map((message, index) => (
              <div key={message.id}>
                <div className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 group ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      <div className="flex items-center gap-2">
                        {message.role === 'assistant' && message.tokensUsed && (
                          <span>
                            {message.tokensUsed} tokens • {message.creditsDeducted} credits
                          </span>
                        )}
                        {message.role === 'assistant' && user && (
                          <MessageFeedback
                            messageId={message.id}
                            userId={user.uid}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                {index < messages.length - 1 && <Separator className="my-2" />}
              </div>
            ))}

            {/* Loading indicator */}
            {sendMessage.isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={sendMessage.isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || sendMessage.isLoading || !canAffordMessage}
            size="icon"
          >
            {sendMessage.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Credit warning for long messages */}
        {input.length > 500 && (
          <div className="text-xs text-muted-foreground">
            Estimated cost: {estimatedCredits} credits
            {!canAffordMessage && (
              <span className="text-red-500 ml-2">• Insufficient credits</span>
            )}
          </div>
        )}

        {/* Suggested questions */}
        {messages.length <= 1 && suggestedQuestions && suggestedQuestions.length > 0 && (
          <SuggestedQuestions
            questions={suggestedQuestions}
            onQuestionSelect={(question) => {
              setInput(question);
              handleSendMessage();
            }}
            loading={sendMessage.isLoading}
          />
        )}
      </CardContent>
    </Card>
    </ErrorBoundary>
  );
}