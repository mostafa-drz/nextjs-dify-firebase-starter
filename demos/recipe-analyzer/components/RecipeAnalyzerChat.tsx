/**
 * @fileoverview Chat component for Recipe Analyzer demo
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDify } from '@/lib/hooks/useDify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  MessageSquare,
  ChefHat,
  Lightbulb,
  AlertCircle,
  Loader2,
  RotateCcw,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RecipeAnalyzerChatProps {
  uploadedFile: File;
  onReset: () => void;
}

/**
 * Chat component for Recipe Analyzer demo
 *
 * Provides conversational meal planning with the uploaded food image context
 *
 * @param props - Component props
 * @returns JSX element for the recipe analyzer chat
 */
export function RecipeAnalyzerChat({ uploadedFile, onReset }: RecipeAnalyzerChatProps) {
  const { difyService, isLoading } = useDify();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Suggested questions for meal planning
  const suggestedQuestions = [
    'What can I make with these ingredients?',
    'Suggest a healthy meal plan for this week',
    "What's missing for a complete meal?",
    'Give me nutritional information about these foods',
    'Suggest budget-friendly alternatives',
  ];

  /**
   * Scrolls to bottom of messages
   */
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, []);

  /**
   * Sends a message to the Dify service
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!difyService || !message.trim() || isSending) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage('');
      setIsSending(true);
      setError(null);

      try {
        // Send message with file context
        const response = await difyService.chat.sendMessage({
          query: message,
          user: 'demo-user', // In production, use actual user ID
          response_mode: 'blocking',
          files: [
            {
              type: 'image',
              transfer_method: 'local_file',
              upload_file_id: uploadedFile.name, // This would be the actual file ID from upload
            },
          ],
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);

        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMessage}`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsSending(false);
      }
    },
    [difyService, uploadedFile, isSending]
  );

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(inputMessage);
    },
    [inputMessage, sendMessage]
  );

  /**
   * Handles suggested question click
   */
  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      sendMessage(question);
    },
    [sendMessage]
  );

  /**
   * Scrolls to bottom when new messages arrive
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Adds initial welcome message
   */
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `I can see you've uploaded an image of ${uploadedFile.name}. I'm ready to help you plan meals and analyze the ingredients! What would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length, uploadedFile.name]);

  return (
    <div className="space-y-4">
      {/* Chat Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Meal Planning Chat
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <ChefHat className="h-3 w-3" />
                Recipe Analyzer
              </Badge>
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="h-96 w-full rounded-lg border p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isSending && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-gray-100 p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Analyzing your request...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="mt-4">
              <h4 className="mb-2 flex items-center gap-1 text-sm font-medium">
                <Lightbulb className="h-4 w-4" />
                Try asking:
              </h4>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about meal planning, recipes, or nutrition..."
              disabled={isSending || isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isSending || isLoading || !inputMessage.trim()}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Demo Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <strong>Demo Features:</strong>
            </p>
            <ul className="ml-4 list-inside list-disc space-y-1">
              <li>AI-powered ingredient identification from uploaded images</li>
              <li>Conversational meal planning and recipe suggestions</li>
              <li>Nutritional insights and dietary recommendations</li>
              <li>Context-aware responses based on your food image</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
