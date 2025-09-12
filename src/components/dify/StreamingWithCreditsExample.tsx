'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, User, Send, Square, AlertTriangle } from 'lucide-react';

/**
 * Example component showing streaming chat with proper credit management
 * This demonstrates how credits are handled in streaming mode
 */
export function StreamingWithCreditsExample() {
  const { user, availableCredits } = useUser();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; content: string; creditsDeducted?: number }>
  >([]);

  const {
    isStreaming,
    currentMessage,
    error: streamingError,
    startStreaming,
    stopStreaming,
    clearError,
    creditsDeducted,
  } = useStreamingChat({
    userId: user?.uid || '',
    enableStreaming: true,
  });

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming || !user) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    clearError();

    try {
      const finalEvent = await startStreaming(
        {
          query: userMessage.content,
        },
        (event) => {
          // Handle streaming events
          if (event.event === 'message_end' && event.metadata?.usage) {
            const assistantMessage = {
              id: event.message_id || `assistant-${Date.now()}`,
              role: 'assistant' as const,
              content: currentMessage,
              creditsDeducted: Math.ceil(event.metadata.usage.total_tokens / 1000),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
        }
      );

      if (finalEvent?.event === 'error') {
        console.error('Streaming error:', finalEvent);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [input, isStreaming, user, startStreaming, currentMessage, clearError]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please sign in to use streaming chat.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Streaming Chat with Credit Management</span>
          <div className="text-muted-foreground text-sm">Credits: {availableCredits}</div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {streamingError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{streamingError}</AlertDescription>
          </Alert>
        )}

        {/* Messages */}
        <div className="max-h-96 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
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
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.creditsDeducted && (
                  <div className="mt-1 text-xs opacity-70">
                    Credits used: {message.creditsDeducted}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
                  <User className="text-primary-foreground h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && currentMessage && (
            <div className="flex items-start space-x-3">
              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2">
                <div className="text-sm whitespace-pre-wrap">{currentMessage}</div>
                <div className="mt-1 text-xs opacity-70">
                  <span>Streaming...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything with streaming..."
            disabled={isStreaming}
            className="flex-1"
          />
          {isStreaming ? (
            <Button onClick={stopStreaming} variant="destructive" size="icon">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSendMessage} disabled={!input.trim() || isStreaming} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Credit Info */}
        <div className="text-muted-foreground text-xs">
          {isStreaming && <span className="text-green-600">• Streaming active</span>}
          {creditsDeducted && <span className="ml-2">• Credits deducted: {creditsDeducted}</span>}
          <div className="mt-1 text-xs text-blue-600">
            💡 Credits are only deducted on successful completion
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
