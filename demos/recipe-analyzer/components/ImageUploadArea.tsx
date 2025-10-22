/**
 * @fileoverview Image upload area component for recipe analyzer demo
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { useAuth } from '@/components/auth/AuthContext';

interface ImageUploadAreaProps {
  onImageUpload: (file: File, fileId?: string) => void;
  uploadedFile?: File | null;
  uploadedFileId?: string;
}

export function ImageUploadArea({
  onImageUpload,
  uploadedFile,
  uploadedFileId,
}: ImageUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { uploadFile, isUploading, error } = useFileUpload(user?.uid || 'demo-user');

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      try {
        const result = await uploadFile.mutateAsync({
          file,
          user: user?.uid || 'demo-user',
        });

        if (result.success && result.data?.id) {
          onImageUpload(file, result.data.id);
        }
      } catch (error) {
        console.error('File upload failed:', error);
      }
    },
    [onImageUpload, uploadFile, user?.uid]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Show uploaded image preview
  if (uploadedFile) {
    return (
      <Card className="border-2 border-green-300 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(uploadedFile)}
              alt="Uploaded recipe"
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-800">Ingredients Ready! 🍳</h3>
              <p className="text-xs text-green-600">{uploadedFile.name}</p>
              {uploadedFileId && (
                <p className="font-mono text-xs text-gray-500">ID: {uploadedFileId}</p>
              )}
              <p className="text-xs text-green-600">Now ask what you can cook!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${isUploading ? 'border-yellow-500 bg-yellow-50' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-4xl">📸</div>
        <h3 className="mb-2 text-lg font-semibold">
          {isUploading ? 'Uploading...' : 'Snap Your Ingredients'}
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          {isUploading
            ? 'Please wait while your image is being uploaded...'
            : 'Take a photo of ingredients you have at home'}
        </p>
        {error && (
          <p className="mb-4 text-sm text-red-600">
            Upload failed: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        )}
        <Button variant="outline" size="sm" onClick={handleButtonClick} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Choose File'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
