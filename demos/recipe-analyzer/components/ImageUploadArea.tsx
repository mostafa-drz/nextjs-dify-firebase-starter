/**
 * @fileoverview Image upload area component for Recipe Analyzer demo
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

'use client';

import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, AlertCircle, Loader2 } from 'lucide-react';

interface ImageUploadAreaProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadError: Error | null;
}

/**
 * Image upload area component for Recipe Analyzer demo
 *
 * Provides drag-and-drop and click-to-upload functionality for food images
 *
 * @param props - Component props
 * @returns JSX element for the image upload area
 */
export function ImageUploadArea({ onFileSelect, isUploading, uploadError }: ImageUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handles file selection from input
   */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  /**
   * Handles drag and drop events
   */
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  /**
   * Prevents default drag behavior
   */
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  /**
   * Opens file picker
   */
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Validates file type and size
   */
  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (PNG, JPG, JPEG, WEBP, or GIF)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  }, []);

  /**
   * Handles file selection with validation
   */
  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        // You could show this error in a toast or alert
        console.error('File validation error:', error);
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect, validateFile]
  );

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isUploading
            ? 'border-blue-300 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        } ${uploadError ? 'border-red-300 bg-red-50' : ''} `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-blue-800">Uploading Image...</h3>
              <p className="text-sm text-blue-600">Please wait while we process your image</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Camera className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Upload a food image</h3>
              <p className="text-sm text-gray-500">
                Drag and drop your image here, or click to browse
              </p>
            </div>
            <Button onClick={handleClick} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Choose Image
            </Button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to upload image: {uploadError.message}</AlertDescription>
        </Alert>
      )}

      {/* Upload Guidelines */}
      <div className="space-y-1 text-sm text-gray-500">
        <p>
          <strong>Supported formats:</strong> PNG, JPG, JPEG, WEBP, GIF
        </p>
        <p>
          <strong>Maximum size:</strong> 10MB
        </p>
        <p>
          <strong>Best results:</strong> Clear, well-lit photos of food ingredients
        </p>
      </div>
    </div>
  );
}
