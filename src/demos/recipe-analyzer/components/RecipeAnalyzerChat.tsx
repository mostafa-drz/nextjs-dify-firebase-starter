'use client';

/**
 * @fileoverview Recipe analyzer chat component
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card as _Card,
  CardContent as _CardContent,
  CardDescription as _CardDescription,
  CardHeader as _CardHeader,
  CardTitle as _CardTitle,
} from '@/components/ui/card';

interface RecipeAnalyzerChatProps {
  uploadedImage: File | null;
}

export function RecipeAnalyzerChat({ uploadedImage }: RecipeAnalyzerChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<
    Array<{ id: string; text: string; sender: 'user' | 'ai' }>
  >([]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: 'This is a demo response. In a real implementation, this would analyze your recipe image and provide nutritional insights.',
        sender: 'ai' as const,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {!uploadedImage && (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          Please upload an image first to start the analysis.
        </div>
      )}

      <div className="h-64 space-y-2 overflow-y-auto rounded-lg border p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">Start a conversation about your recipe...</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-2 ${
                msg.sender === 'user' ? 'ml-8 bg-blue-100' : 'mr-8 bg-gray-100'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about the recipe..."
          disabled={!uploadedImage}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={handleSendMessage} disabled={!uploadedImage || !message.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
