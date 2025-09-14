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
import { useAuth } from '@/components/auth/AuthContext';

export function RecipeAnalyzerDemo() {
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
            <CardDescription>Chat with our AI assistant about your uploaded recipe</CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeAnalyzerChat
              uploadedImage={uploadedImage}
              uploadedFileId={uploadedFileId}
              onFileUploaded={handleFileUploaded}
              userId={user?.uid || 'demo-user'}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
