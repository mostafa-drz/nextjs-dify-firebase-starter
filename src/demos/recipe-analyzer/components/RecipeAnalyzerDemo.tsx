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

export function RecipeAnalyzerDemo() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

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
            <ImageUploadArea onImageUpload={setUploadedImage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>Chat with our AI assistant about your uploaded recipe</CardDescription>
          </CardHeader>
          <CardContent>
            <RecipeAnalyzerChat uploadedImage={uploadedImage} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
