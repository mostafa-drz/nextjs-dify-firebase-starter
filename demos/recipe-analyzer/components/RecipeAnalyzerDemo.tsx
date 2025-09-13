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

export function RecipeAnalyzerDemo() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | undefined>();

  const handleImageUpload = (file: File, fileId?: string) => {
    setUploadedImage(file);
    setUploadedFileId(fileId);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>📸 Snap Your Ingredients</CardTitle>
            <CardDescription>Take a photo of ingredients you have at home</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploadArea
              onImageUpload={handleImageUpload}
              uploadedFile={uploadedImage}
              uploadedFileId={uploadedFileId}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🍳 Get Recipe Suggestions</CardTitle>
            <CardDescription>Ask what you can cook with your ingredients</CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeAnalyzerChat uploadedImage={uploadedImage} uploadedFileId={uploadedFileId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
