'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { ChatErrorBoundary } from '@/components/error-boundaries/ChatErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { InsufficientCredits } from '@/components/credits/InsufficientCredits';
import { DifyChatProps } from '@/types/dify';
import { formatCredits } from '@/lib/utils/credits';
import { MessageSkeleton } from '@/components/ui/skeletons';
import { EmptyMessages } from '@/components/ui/empty-states';
import { Send, Bot, User, Loader2, AlertTriangle, MessageSquare, Sparkles } from 'lucide-react';
import { MessageFeedback } from './MessageFeedback';
import { SuggestedQuestions } from './SuggestedQuestions';
import { trackChat } from '@/lib/analytics';
import { useChatMessages } from '@/lib/hooks/useChatMessages';
import { buildCommonInputs } from '@/lib/utils/input-builder';
import { useLocale } from 'next-intl';
// Rate limiting is handled server-side in the API actions

export function DifyChat({
  name = 'Dify Assistant',
  className = '',
  placeholder = 'Type your message...',
  welcomeMessage,
  conversationId: initialConversationId,
}: DifyChatProps & { conversationId?: string }) {
  const { user, availableCredits, checkCredits } = useUser();
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  // Use the consolidated chat messages hook
  const {
    messages,
    scrollAreaRef,
    suggestedQuestions,
    sendMessage,
    addUserMessage,
    addAssistantMessage,
    removeMessage,
    messagesLoading,
    messagesError,
  } = useChatMessages({
    conversationId,
    userId: user?.uid || '',
    welcomeMessage,
  });

  // All useEffect logic is now handled by the useChatMessages hook

  // Estimate credit requirement (minimum 1 credit for safety)
  const estimatedCredits = Math.max(1, Math.ceil(input.length / 1000));
  const canAffordMessage = checkCredits(estimatedCredits);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || sendMessage.isLoading || !canAffordMessage) return;

    // Rate limiting is handled server-side in the API actions

    const userMessage = addUserMessage(input.trim());

    // Track chat interaction
    trackChat('message_sent', userMessage.content.length);

    setInput('');
    setError(null);

    try {
      // Build inputs using flexible input builder
      // Developers can customize this based on their specific needs
      const inputs = buildCommonInputs(
        user ? { ...user } : {}, // User object (handle null case)
        locale, // User's locale
        {
          // Add any additional inputs for your specific use case
          // Example: session_id, feature_flags, etc.
        }
      );

      const result = await sendMessage.mutateAsync({
        query: userMessage.content,
        conversation_id: conversationId,
        response_mode: 'blocking',
        inputs,
      });

      if (result.data?.message_id && result.data?.answer) {
        addAssistantMessage({
          id: result.data.message_id,
          content: result.data.answer,
          tokensUsed: result.usage?.total_tokens,
          creditsDeducted: result.usage?.total_tokens
            ? Math.ceil(result.usage.total_tokens / 1000)
            : undefined,
        });
      }

      // Track new conversation start
      if (!conversationId && result.data?.conversation_id) {
        trackChat('conversation_started');
      }

      if (result.data?.conversation_id) {
        setConversationId(result.data.conversation_id);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');

      // Remove the user message since the request failed
      removeMessage(userMessage.id);
    }
  }, [
    input,
    sendMessage,
    canAffordMessage,
    addUserMessage,
    addAssistantMessage,
    removeMessage,
    conversationId,
    locale,
    user,
  ]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Check if user is authenticated
  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-medium">Authentication Required</h3>
          <p className="text-muted-foreground">Please sign in to start chatting.</p>
        </CardContent>
      </Card>
    );
  }

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
    <ChatErrorBoundary>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
              <Sparkles className="text-primary-foreground h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <p className="text-muted-foreground text-sm">
                Credits: {formatCredits(availableCredits)}
              </p>
            </div>
          </div>
          {conversationId && (
            <div className="text-muted-foreground text-xs">
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
                <div className="py-8 text-center text-red-600">
                  <AlertTriangle className="mx-auto mb-2 h-6 w-6" />
                  <p className="text-sm">Failed to load conversation messages</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {messagesError instanceof Error ? messagesError.message : 'Unknown error'}
                  </p>
                </div>
              )}

              {/* Empty state for messages */}
              {!messagesLoading && !messagesError && messages.length === 0 && <EmptyMessages />}

              {messages.map((message, index) => (
                <div key={message.id}>
                  <div
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`group max-w-[80%] rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="mt-1 flex items-center justify-between text-xs opacity-70">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        <div className="flex items-center gap-2">
                          {message.role === 'assistant' && message.tokensUsed && (
                            <span>
                              {message.tokensUsed} tokens • {message.creditsDeducted} credits
                            </span>
                          )}
                          {message.role === 'assistant' && user && (
                            <MessageFeedback messageId={message.id} userId={user.uid} />
                          )}
                        </div>
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                        <User className="text-primary-foreground h-4 w-4" />
                      </div>
                    )}
                  </div>

                  {index < messages.length - 1 && <Separator className="my-2" />}
                </div>
              ))}

              {/* Loading indicator */}
              {sendMessage.isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground text-sm">Thinking...</span>
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
            <div className="text-muted-foreground text-xs">
              Estimated cost: {estimatedCredits} credits
              {!canAffordMessage && (
                <span className="ml-2 text-red-500">• Insufficient credits</span>
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
    </ChatErrorBoundary>
  );
}
