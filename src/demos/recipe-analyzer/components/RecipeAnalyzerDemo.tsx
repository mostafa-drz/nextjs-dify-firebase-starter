'use client';

/**
 * @fileoverview Recipe Analyzer Demo Component
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useState } from 'react';
import { Button as _Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUploadArea } from './ImageUploadArea';
import { RecipeAnalyzerChat } from './RecipeAnalyzerChat';
import { ConversationHistory } from './ConversationHistory';
import { useAuth } from '@/components/auth/AuthContext';

interface RecipeAnalyzerDemoProps {
  conversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onCreateNew: () => void;
}

export function RecipeAnalyzerDemo({
  conversationId,
  onConversationSelect,
  onCreateNew,
}: RecipeAnalyzerDemoProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const { user } = useAuth();

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    // Reset file ID when new image is uploaded
    setUploadedFileId(null);
  };

  const handleFileUploaded = (fileId: string) => {
    setUploadedFileId(fileId);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Conversation History Sidebar */}
        <div className="lg:col-span-1">
          <ConversationHistory
            userId={user?.uid || 'demo-user'}
            currentConversationId={conversationId}
            onConversationSelect={onConversationSelect}
            onCreateNew={onCreateNew}
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Recipe Image</CardTitle>
                <CardDescription>
                  Upload an image of a recipe or food item to get AI-powered analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploadArea onImageUpload={handleImageUpload} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  Chat with our AI assistant about your uploaded recipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecipeAnalyzerChat
                  uploadedImage={uploadedImage}
                  uploadedFileId={uploadedFileId}
                  onFileUploaded={handleFileUploaded}
                  userId={user?.uid || 'demo-user'}
                  conversationId={conversationId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
