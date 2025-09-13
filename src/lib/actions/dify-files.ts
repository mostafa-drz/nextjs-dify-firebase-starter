'use server';

import { validateServerEnv } from '@/lib/config/env-validation';
import { ExternalApiError, ValidationError } from '@/lib/errors/server-errors';
import { checkUserRateLimitByAction } from '@/lib/utils/simple-rate-limit';

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

/**
 * Enhanced Dify API error with better error handling
 */
class DifyApiError extends ExternalApiError {
  constructor(message: string, status: number, code?: string, originalError?: Error) {
    super(message, 'Dify API', originalError, { status, code });
    this.name = 'DifyApiError';
  }
}

async function makeDifyRequest(
  endpoint: string,
  options: RequestInit,
  apiKey: string
): Promise<Response> {
  try {
    // Validate API key
    if (!apiKey) {
      throw new ValidationError('Dify API key is required');
    }

    const url = `${DIFY_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, use default error
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }

      throw new DifyApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return response;
  } catch (error) {
    if (error instanceof DifyApiError) {
      throw error;
    }

    // Handle network errors, timeouts, etc.
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new DifyApiError('Request timeout', 408, 'TIMEOUT', error);
      }
      if (error.message.includes('fetch')) {
        throw new DifyApiError('Network error', 503, 'NETWORK_ERROR', error);
      }
    }

    throw new DifyApiError('Unknown error occurred', 500, 'UNKNOWN_ERROR', error as Error);
  }
}

export interface FileUploadRequest {
  file: File;
  user: string;
}

export interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  type: string;
  created_at: number;
}

export interface FilePreviewRequest {
  file_id: string;
  as_attachment?: boolean;
}

export interface DifyApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    status: number;
  };
}

/**
 * Upload a file to Dify
 * @param userId - User ID for the upload
 * @param request - File upload request
 * @returns Promise resolving to file upload response
 */
export async function uploadDifyFile(
  userId: string,
  request: FileUploadRequest
): Promise<DifyApiResponse<FileUploadResponse>> {
  try {
    validateServerEnv();

    // Check rate limit before proceeding
    try {
      const rateLimitResult = await checkUserRateLimitByAction(userId, 'file_upload');
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: rateLimitResult.error || 'Rate limit exceeded. Please wait a moment.',
            status: 429,
          },
        };
      }
    } catch (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
      // Continue with the request if rate limiting fails
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('user', request.user);

    const response = await fetch(`${DIFY_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      body: formData,
      signal: AbortSignal.timeout(60000), // 60 second timeout for file uploads
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }

      return {
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: errorData.message || 'File upload failed',
          status: response.status,
        },
      };
    }

    const data: FileUploadResponse = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('File upload error:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during file upload',
        status: 500,
      },
    };
  }
}

/**
 * Preview a file from Dify
 * @param userId - User ID for the preview
 * @param request - File preview request
 * @returns Promise resolving to file blob
 */
export async function previewDifyFile(
  userId: string,
  request: FilePreviewRequest
): Promise<DifyApiResponse<Blob>> {
  try {
    validateServerEnv();

    const response = await fetch(`${DIFY_BASE_URL}/files/${request.file_id}/preview`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }

      return {
        success: false,
        error: {
          code: 'PREVIEW_FAILED',
          message: errorData.message || 'File preview failed',
          status: response.status,
        },
      };
    }

    const blob = await response.blob();

    return {
      success: true,
      data: blob,
    };
  } catch (error) {
    console.error('File preview error:', error);

    if (error instanceof DifyApiError) {
      return {
        success: false,
        error: {
          code: error.code || 'DIFY_API_ERROR',
          message: error.message,
          status: error.statusCode,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred during file preview',
        status: 500,
      },
    };
  }
}

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
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
