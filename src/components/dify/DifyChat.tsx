'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { InsufficientCredits } from '@/components/credits/InsufficientCredits';
import { sendDifyMessage, getDifyAppInfo } from '@/lib/actions/dify';
import { DifyChatProps } from '@/types/dify';
import { formatCredits } from '@/lib/utils/credits';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertTriangle, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
  creditsDeducted?: number;
}

export function DifyChat({ 
  apiKey, 
  name = 'Dify Assistant',
  className = '',
  placeholder = 'Type your message...',
  welcomeMessage 
}: DifyChatProps) {
  const { user, availableCredits, hasEnoughCredits } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [appInfo, setAppInfo] = useState<{
    opening_statement?: string;
    suggested_questions?: string[];
  } | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load app info on mount
  useEffect(() => {
    const loadAppInfo = async () => {
      try {
        const result = await getDifyAppInfo(apiKey);
        if (result.success) {
          setAppInfo(result.data);
          
          // Add welcome message if available and no messages yet
          if (result.data?.opening_statement && messages.length === 0) {
            const welcomeMsg: ChatMessage = {
              id: 'welcome',
              role: 'assistant',
              content: result.data.opening_statement,
              timestamp: new Date()
            };
            setMessages([welcomeMsg]);
          }
        }
      } catch (error) {
        console.error('Failed to load app info:', error);
      }
    };

    if (apiKey) {
      loadAppInfo();
    }
  }, [apiKey, messages.length]);

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
  const canAffordMessage = hasEnoughCredits(estimatedCredits);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !canAffordMessage) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendDifyMessage(user.uid, apiKey, {
        query: userMessage.content,
        conversation_id: conversationId,
        user: user.uid,
        response_mode: 'blocking'
      });

      if (!result.success) {
        if (result.error?.code === 'INSUFFICIENT_CREDITS') {
          setError('Insufficient credits for this message');
          return;
        }
        throw new Error(result.error?.message || 'Failed to send message');
      }

      const assistantMessage: ChatMessage = {
        id: result.data!.message_id,
        role: 'assistant',
        content: result.data!.answer,
        timestamp: new Date(),
        tokensUsed: result.usage?.total_tokens,
        creditsDeducted: result.usage?.total_tokens ? Math.ceil(result.usage.total_tokens / 1000) : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(result.data!.conversation_id);

    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      // Remove the user message since the request failed
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
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
                  
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.role === 'assistant' && message.tokensUsed && (
                        <span className="ml-2">
                          {message.tokensUsed} tokens • {message.creditsDeducted} credits
                        </span>
                      )}
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
            {isLoading && (
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
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isLoading || !canAffordMessage}
            size="icon"
          >
            {isLoading ? (
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
        {messages.length <= 1 && appInfo?.suggested_questions?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {appInfo.suggested_questions.slice(0, 3).map((question: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInput(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}