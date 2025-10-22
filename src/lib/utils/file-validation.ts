/**
 * @fileoverview File validation utilities for Dify file uploads
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

/**
 * Validate file before upload
 * @param file - File to validate
 * @returns Validation result
 */
export function validateDifyFile(file: File): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check if file exists
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    errors.push(`File too large. Maximum size: ${formatFileSize(maxSize)}`);
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Check file type
  const supportedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (!supportedTypes.includes(file.type)) {
    errors.push(`Unsupported file type. Supported types: ${supportedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format file size in human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
