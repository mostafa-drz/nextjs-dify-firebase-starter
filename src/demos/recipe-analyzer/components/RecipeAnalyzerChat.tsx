'use client';

/**
 * @fileoverview Recipe analyzer chat component with Dify integration
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { sendDifyMessage } from '@/lib/actions/dify';
import { DifyChatRequest } from '@/types/dify';
import { buildCommonInputs } from '@/lib/utils/input-builder';

interface RecipeAnalyzerChatProps {
  uploadedImage: File | null;
  uploadedFileId: string | null;
  onFileUploaded: (fileId: string) => void;
  userId: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export function RecipeAnalyzerChat({
  uploadedImage,
  uploadedFileId,
  onFileUploaded,
  userId,
}: RecipeAnalyzerChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { uploadFile } = useFileUpload(userId);

  const handleFileUpload = useCallback(async () => {
    if (!uploadedImage || uploadedFileId) return; // Already uploaded or no image

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadFile.mutateAsync({
        file: uploadedImage,
        user: userId,
      });

      if (result.success && result.data?.id) {
        onFileUploaded(result.data.id);
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: `welcome-${Date.now()}`,
          text: `Great! I can see your recipe image "${uploadedImage.name}". Ask me anything about it - I can help analyze ingredients, suggest modifications, estimate nutritional values, or answer cooking questions!`,
          sender: 'ai',
          timestamp: Date.now(),
        };
        setMessages([welcomeMessage]);
      } else {
        setError(result.error?.message || 'Failed to upload image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImage, uploadedFileId, userId, uploadFile, onFileUploaded]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !uploadedFileId || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: message.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setIsSending(true);
    setError(null);

    try {
      // Build inputs for the Dify request
      const inputs = buildCommonInputs(
        { id: userId }, // User object
        'en' // Locale
      );

      const chatRequest: DifyChatRequest = {
        query: message.trim(),
        user: userId,
        inputs,
        files: [
          {
            type: 'image',
            transfer_method: 'local_file',
            upload_file_id: uploadedFileId,
          },
        ],
        response_mode: 'blocking',
      };

      const result = await sendDifyMessage(userId, chatRequest);

      if (result.success && result.data?.answer) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          text: result.data.answer,
          sender: 'ai',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setError(result.error?.message || 'Failed to get AI response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [message, uploadedFileId, userId, isSending]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-upload when image is available
  if (uploadedImage && !uploadedFileId && !isUploading) {
    handleFileUpload();
  }

  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          Please upload an image first to start the analysis.
        </div>
      ) : isUploading ? (
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          📤 Uploading image to Dify AI...
        </div>
      ) : uploadedFileId ? (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
          ✅ Image uploaded: {uploadedImage.name} ({(uploadedImage.size / 1024 / 1024).toFixed(2)}{' '}
          MB)
        </div>
      ) : (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          ❌ Failed to upload image
        </div>
      )}

      {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">Error: {error}</div>}

      <div className="h-64 space-y-2 overflow-y-auto rounded-lg border p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            {uploadedFileId
              ? 'Start a conversation about your recipe...'
              : 'Upload an image to begin...'}
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-3 ${
                msg.sender === 'user'
                  ? 'ml-8 bg-blue-100 text-blue-900'
                  : 'mr-8 bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm font-medium">
                {msg.sender === 'user' ? 'You' : 'AI Recipe Analyzer'}
              </div>
              <div className="mt-1 whitespace-pre-wrap">{msg.text}</div>
            </div>
          ))
        )}
      </div>

      <div className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about your recipe..."
          disabled={!uploadedFileId || isSending}
          onKeyPress={handleKeyPress}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || !uploadedFileId || isSending}
        >
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
