/**
 * @fileoverview Recipe analyzer chat component
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatMessages } from '@/lib/hooks/useChatMessages';
import { useAuth } from '@/components/auth/AuthContext';
import {
  Card as _Card,
  CardContent as _CardContent,
  CardDescription as _CardDescription,
  CardHeader as _CardHeader,
  CardTitle as _CardTitle,
} from '@/components/ui/card';

interface RecipeAnalyzerChatProps {
  uploadedImage: File | null;
  uploadedFileId?: string;
}

export function RecipeAnalyzerChat({ uploadedImage, uploadedFileId }: RecipeAnalyzerChatProps) {
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const userId = user?.uid || 'demo-user';

  const { messages, sendMessage, messagesLoading, messagesError } = useChatMessages({
    conversationId: undefined, // Start new conversation for each demo session
    userId,
    welcomeMessage: uploadedImage
      ? 'Great! I can see your ingredients. Ask me what you can cook with them!'
      : 'Upload a photo of your ingredients first, then I can suggest recipes you can make.',
  });

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || messagesLoading) return;

    try {
      // For now, use a simple message string since the mock implementation expects a string
      await sendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [message, messagesLoading, sendMessage]);

  return (
    <div className="space-y-4">
      {!uploadedImage && (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          📸 Snap a photo of your ingredients first to get recipe suggestions!
        </div>
      )}

      {messagesError && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          Error:{' '}
          {messagesError instanceof Error ? messagesError.message : 'An unexpected error occurred'}
        </div>
      )}

      <div className="h-64 space-y-2 overflow-y-auto rounded-lg border p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            {uploadedImage
              ? 'Perfect! I can see your ingredients. Ask me "What can I cook?" or "Suggest a recipe"'
              : 'Upload a photo of your ingredients first, then I can suggest recipes you can make.'}
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-2 ${
                msg.role === 'user' ? 'ml-8 bg-blue-100' : 'mr-8 bg-gray-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              {msg.creditsDeducted && (
                <p className="mt-1 text-xs text-gray-500">Credits used: {msg.creditsDeducted}</p>
              )}
            </div>
          ))
        )}
        {messagesLoading && (
          <div className="mr-8 rounded-lg bg-gray-100 p-2">
            <p className="text-sm text-gray-600">AI is thinking...</p>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            uploadedImage
              ? 'What can I cook with these ingredients?'
              : 'Upload ingredients first...'
          }
          disabled={!uploadedImage || messagesLoading}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!uploadedImage || !message.trim() || messagesLoading}
        >
          {messagesLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
