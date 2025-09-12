/**
 * @fileoverview Main Recipe Analyzer demo component
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useDify } from '@/lib/hooks/useDify';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { RecipeAnalyzerChat } from './RecipeAnalyzerChat';
import { ImageUploadArea } from './ImageUploadArea';
import { DemoCard } from '@/demos/shared/DemoCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FeedbackButton } from '@/components/feedback';
import {
  ChefHat,
  Camera,
  MessageSquare,
  FileImage,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

/**
 * Main Recipe Analyzer demo component
 *
 * Provides a complete meal planning experience with image analysis and chat functionality
 *
 * @returns JSX element for the recipe analyzer demo
 */
export function RecipeAnalyzerDemo() {
  const { user } = useAuth();
  const { difyService, isLoading: difyLoading, error: difyError } = useDify();
  const { uploadFile, uploadedFile, isUploading, uploadError, clearUpload } = useFileUpload();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  /**
   * Handles file upload and triggers analysis
   */
  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!user || !difyService) return;

      try {
        setIsAnalyzing(true);
        setAnalysisResult(null);

        // Upload file to Dify
        const uploadResult = await uploadFile(file, user.uid);

        if (uploadResult) {
          // Start analysis conversation
          const analysisPrompt = `Please analyze this food image and identify all the ingredients you can see. Provide a detailed list of ingredients, their approximate quantities, and suggest what meals or recipes could be made with these ingredients. Be specific about cooking methods and include nutritional insights.`;

          // This will be handled by the chat component
          setAnalysisResult('Image uploaded successfully! Start chatting to get meal suggestions.');
          setShowChat(true);
        }
      } catch (error) {
        console.error('File upload error:', error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [user, difyService, uploadFile]
  );

  /**
   * Resets the demo to initial state
   */
  const handleReset = useCallback(() => {
    clearUpload();
    setAnalysisResult(null);
    setShowChat(false);
    setIsAnalyzing(false);
  }, [clearUpload]);

  // Show loading state while Dify service initializes
  if (difyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Initializing Recipe Analyzer...</p>
        </div>
      </div>
    );
  }

  // Show error state if Dify service fails
  if (difyError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to initialize Recipe Analyzer. Please check your Dify configuration and try again.
          <br />
          <strong>Error:</strong> {difyError.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Show auth requirement
  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Please sign in to use the Recipe Analyzer demo.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Demo Overview */}
      <DemoCard
        title="How It Works"
        description="Upload a photo of your food, fridge, or pantry to get AI-powered meal planning suggestions"
        badges={['Image Analysis', 'Meal Planning', 'Nutritional Insights']}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4 text-center">
            <Camera className="mx-auto mb-2 h-8 w-8 text-blue-600" />
            <h3 className="mb-1 font-medium">1. Upload Image</h3>
            <p className="text-muted-foreground text-sm">
              Take a photo of your food, fridge, or pantry
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <ChefHat className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <h3 className="mb-1 font-medium">2. AI Analysis</h3>
            <p className="text-muted-foreground text-sm">
              AI identifies ingredients and suggests recipes
            </p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-purple-600" />
            <h3 className="mb-1 font-medium">3. Chat & Plan</h3>
            <p className="text-muted-foreground text-sm">Get meal plans and nutritional insights</p>
          </div>
        </div>
      </DemoCard>

      {/* Image Upload Section */}
      <DemoCard
        title="Upload Your Food Image"
        description="Supported formats: PNG, JPG, JPEG, WEBP, GIF (max 10MB)"
        badges={uploadedFile ? ['Image Ready'] : []}
      >
        {!uploadedFile ? (
          <ImageUploadArea
            onFileSelect={handleFileUpload}
            isUploading={isUploading || isAnalyzing}
            uploadError={uploadError}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Image uploaded successfully!</p>
                <p className="text-sm text-green-600">
                  {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)
                </p>
              </div>
            </div>

            {analysisResult && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{analysisResult}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setShowChat(true)} className="flex-1">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Meal Planning
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Upload New Image
              </Button>
            </div>
          </div>
        )}
      </DemoCard>

      {/* Chat Section */}
      {showChat && (
        <>
          <Separator />
          <RecipeAnalyzerChat uploadedFile={uploadedFile} onReset={handleReset} />
        </>
      )}

      {/* Demo Features */}
      <DemoCard
        title="Demo Features"
        description="This demo showcases the following Dify capabilities"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium">
              <FileImage className="h-4 w-4" />
              File Upload & Analysis
            </h4>
            <p className="text-muted-foreground text-sm">
              Upload food images and get AI-powered ingredient identification
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium">
              <MessageSquare className="h-4 w-4" />
              Conversational Planning
            </h4>
            <p className="text-muted-foreground text-sm">
              Chat with AI to plan meals and get nutritional insights
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium">
              <ChefHat className="h-4 w-4" />
              Recipe Suggestions
            </h4>
            <p className="text-muted-foreground text-sm">
              Get specific recipes based on available ingredients
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4" />
              Production Ready
            </h4>
            <p className="text-muted-foreground text-sm">
              Full error handling, loading states, and user feedback
            </p>
          </div>
        </div>
      </DemoCard>

      {/* Feedback Button */}
      <FeedbackButton
        config={{
          enabled: true,
          position: 'bottom-right',
          buttonText: 'Feedback',
          categories: ['bug', 'feature', 'general', 'improvement'],
          placeholder: 'Share your thoughts about the Recipe Analyzer...',
        }}
      />
    </div>
  );
}
