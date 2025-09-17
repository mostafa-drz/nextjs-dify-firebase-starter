'use client';

/**
 * @fileoverview Recipe analyzer chat component with Dify integration
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useDifyMessages } from '@/lib/hooks/useDify';
import { sendDifyMessage } from '@/lib/actions/dify';
import { DifyChatRequest, DifyMessage } from '@/types/dify';
import { buildCommonInputs } from '@/lib/utils/input-builder';

interface RecipeAnalyzerChatProps {
  uploadedImage: File | null;
  uploadedFileId: string | null;
  onFileUploaded: (fileId: string) => void;
  userId: string;
  conversationId?: string;
  onCreateNew?: () => void;
}

// Using DifyMessage directly - no need for custom ChatMessage interface

export function RecipeAnalyzerChat({
  uploadedImage,
  uploadedFileId,
  onFileUploaded,
  userId,
  conversationId,
  onCreateNew,
}: RecipeAnalyzerChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<DifyMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { uploadFile } = useFileUpload(userId);

  // Use React Query hook for conversation messages
  const {
    data: conversationMessages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useDifyMessages(userId, conversationId);

  // Load conversation messages when conversationId changes
  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    } else if (conversationId && !isLoadingMessages) {
      // Clear messages if we're switching to a conversation with no messages
      setMessages([]);
    }
  }, [conversationMessages, conversationId, isLoadingMessages]);

  // Set error from messages loading
  useEffect(() => {
    if (messagesError) {
      console.error('Messages loading error:', messagesError);
      setError('Failed to load conversation history. This conversation may not exist.');
      // Clear messages when there's an error loading
      setMessages([]);
    } else {
      // Clear error when messages load successfully
      setError(null);
    }
  }, [messagesError]);

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
        const welcomeMessage: DifyMessage = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: `Great! I can see your recipe image "${uploadedImage.name}". Ask me anything about it - I can help analyze ingredients, suggest modifications, estimate nutritional values, or answer cooking questions!`,
          created_at: new Date().toISOString(),
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

    const userMessage: DifyMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      created_at: new Date().toISOString(),
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
        ...(conversationId && { conversation_id: conversationId }),
      };

      const result = await sendDifyMessage(userId, chatRequest);

      if (result.success && result.data?.answer) {
        const aiMessage: DifyMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.data.answer,
          created_at: new Date().toISOString(),
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
  }, [message, uploadedFileId, userId, isSending, conversationId]);

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
      {conversationId && (
        <div
          className={`rounded-lg p-4 text-sm ${
            messagesError
              ? 'bg-red-50 text-red-800'
              : isLoadingMessages
                ? 'bg-blue-50 text-blue-800'
                : 'bg-green-50 text-green-800'
          }`}
        >
          {messagesError ? (
            <>❌ Failed to load conversation: {conversationId}</>
          ) : isLoadingMessages ? (
            <>⏳ Loading conversation messages...</>
          ) : (
            <>💬 Loaded conversation: {conversationId}</>
          )}
        </div>
      )}

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
        {messagesError ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="mb-2 text-sm text-red-600">❌ Failed to load conversation</div>
              <div className="mb-4 text-xs text-gray-500">
                This conversation may have been deleted or doesn't exist.
              </div>
              {onCreateNew && (
                <Button variant="outline" size="sm" onClick={onCreateNew} className="text-xs">
                  Start New Conversation
                </Button>
              )}
            </div>
          </div>
        ) : isLoadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading conversation messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500">
            {conversationId
              ? 'No messages in this conversation yet.'
              : uploadedFileId
                ? 'Start a conversation about your recipe...'
                : 'Upload an image to begin...'}
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'ml-8 bg-blue-100 text-blue-900'
                  : 'mr-8 bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm font-medium">
                {msg.role === 'user' ? 'You' : 'AI Recipe Analyzer'}
              </div>
              <div className="mt-1 whitespace-pre-wrap">{msg.content}</div>
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
