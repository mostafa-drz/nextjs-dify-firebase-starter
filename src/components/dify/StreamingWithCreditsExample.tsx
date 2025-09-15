'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, User, Send, AlertTriangle } from 'lucide-react';

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
    isSending,
    error: streamingError,
    sendMessage,
    clearError,
    creditsDeducted,
  } = useStreamingChat({
    userId: user?.uid || '',
  });

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isSending || !user) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = input.trim();
    setInput('');
    clearError();

    try {
      await sendMessage(
        messageContent,
        (response) => {
          const assistantMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant' as const,
            content: response.answer || '',
            creditsDeducted: creditsDeducted,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        },
        (error) => {
          console.error('Chat error:', error);
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [input, isSending, user, sendMessage, clearError, creditsDeducted]);

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
          {isSending && (
            <div className="flex items-start space-x-3">
              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2">
                <div className="text-sm">
                  <span>Sending message...</span>
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
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isSending} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Credit Info */}
        <div className="text-muted-foreground text-xs">
          {isSending && <span className="text-green-600">• Sending message</span>}
          {creditsDeducted && <span className="ml-2">• Credits deducted: {creditsDeducted}</span>}
          <div className="mt-1 text-xs text-blue-600">
            💡 Credits are only deducted on successful completion
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
