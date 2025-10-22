/**
 * @fileoverview File service for Dify file upload and preview operations
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { BaseDifyService } from '../base';
import {
  DifyServiceConfig,
  DifyApiResponse,
  FileUploadRequest,
  FileUploadResponse,
  FilePreviewRequest,
  FilePreviewResponse,
  SupportedFileType,
} from '../types';

/**
 * File service for handling file upload and preview operations
 *
 * This service provides methods for uploading files to Dify and previewing
 * previously uploaded files. It follows Dify's exact API specifications.
 *
 * @example
 * ```typescript
 * const fileService = new FileService({
 *   apiKey: 'app-your-api-key',
 *   userId: 'user123'
 * });
 *
 * // Upload a file
 * const uploadResult = await fileService.uploadFile({
 *   file: imageFile,
 *   user: 'user123'
 * });
 *
 * // Preview a file
 * const fileBlob = await fileService.previewFile({
 *   file_id: 'file-uuid',
 *   as_attachment: false
 * });
 * ```
 */
export class FileService extends BaseDifyService {
  /**
   * Creates a new FileService instance
   * @param config - Service configuration
   */
  constructor(config: DifyServiceConfig) {
    super(config);
  }

  /**
   * Uploads a file to Dify
   *
   * Supports image files: png, jpg, jpeg, webp, gif
   * Files are uploaded for use by the current end-user only.
   *
   * @param request - File upload request parameters
   * @returns Promise resolving to upload response
   * @throws {DifyApiError} If upload fails
   *
   * @example
   * ```typescript
   * const result = await fileService.uploadFile({
   *   file: imageFile,
   *   user: 'user123'
   * });
   *
   * if (result.success) {
   *   console.log('File uploaded:', result.data?.id);
   * }
   * ```
   */
  async uploadFile(request: FileUploadRequest): Promise<DifyApiResponse<FileUploadResponse>> {
    try {
      // Validate file before upload
      this.validateFile(request.file);

      // Create form data for multipart upload
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('user', request.user);

      // Make upload request
      const response = await this.makeRequest('/files/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      return {
        success: true,
        data: response as unknown as FileUploadResponse,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Previews or downloads a previously uploaded file
   *
   * @param request - File preview request parameters
   * @returns Promise resolving to file blob
   * @throws {DifyApiError} If preview fails
   *
   * @example
   * ```typescript
   * const fileBlob = await fileService.previewFile({
   *   file_id: 'file-uuid',
   *   as_attachment: false // Preview in browser
   * });
   *
   * // Create object URL for display
   * const url = URL.createObjectURL(fileBlob);
   * ```
   */
  async previewFile(request: FilePreviewRequest): Promise<DifyApiResponse<FilePreviewResponse>> {
    try {
      // Validate file ID format (should be UUID)
      this.validateFileId(request.file_id);

      // Build query parameters
      const params = new URLSearchParams();
      if (request.as_attachment !== undefined) {
        params.append('as_attachment', request.as_attachment.toString());
      }

      const url = `/files/${request.file_id}/preview${params.toString() ? `?${params.toString()}` : ''}`;

      // Make preview request
      const response = await this.makeRequest(url, {
        method: 'GET',
        // Expect binary response
      });

      return {
        success: true,
        data: response as unknown as Blob,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validates file before upload
   * @param file - File to validate
   * @throws {Error} If file is invalid
   * @private
   */
  private validateFile(file: File): void {
    if (!file) {
      throw new Error('File is required');
    }

    // Check file type
    const fileExtension = this.getFileExtension(file.name);
    const supportedTypes: SupportedFileType[] = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

    if (!fileExtension || !supportedTypes.includes(fileExtension as SupportedFileType)) {
      throw new Error(`Unsupported file type. Supported types: ${supportedTypes.join(', ')}`);
    }

    // Check file size (Dify doesn't specify limits, but we'll add a reasonable default)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new Error('File is empty');
    }
  }

  /**
   * Validates file ID format
   * @param fileId - File ID to validate
   * @throws {Error} If file ID is invalid
   * @private
   */
  private validateFileId(fileId: string): void {
    if (!fileId) {
      throw new Error('File ID is required');
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
      throw new Error('Invalid file ID format. Expected UUID format.');
    }
  }

  /**
   * Extracts file extension from filename
   * @param filename - File name
   * @returns File extension in lowercase
   * @private
   */
  private getFileExtension(filename: string): string | null {
    const parts = filename.split('.');
    if (parts.length < 2) {
      return null;
    }
    return parts[parts.length - 1].toLowerCase();
  }

  /**
   * Gets supported file types
   * @returns Array of supported file extensions
   *
   * @example
   * ```typescript
   * const supportedTypes = fileService.getSupportedFileTypes();
   * console.log('Supported types:', supportedTypes); // ['png', 'jpg', 'jpeg', 'webp', 'gif']
   * ```
   */
  getSupportedFileTypes(): SupportedFileType[] {
    return ['png', 'jpg', 'jpeg', 'webp', 'gif'];
  }

  /**
   * Checks if a file type is supported
   * @param filename - File name to check
   * @returns True if file type is supported
   *
   * @example
   * ```typescript
   * const isSupported = fileService.isFileTypeSupported('image.png');
   * console.log('Is supported:', isSupported); // true
   * ```
   */
  isFileTypeSupported(filename: string): boolean {
    const extension = this.getFileExtension(filename);
    return (
      extension !== null && this.getSupportedFileTypes().includes(extension as SupportedFileType)
    );
  }

  /**
   * Gets file size limit in bytes
   * @returns Maximum file size in bytes
   *
   * @example
   * ```typescript
   * const maxSize = fileService.getMaxFileSize();
   * console.log('Max size:', maxSize, 'bytes'); // 10485760 bytes (10MB)
   * ```
   */
  getMaxFileSize(): number {
    return 10 * 1024 * 1024; // 10MB
  }

  /**
   * Formats file size for display
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   *
   * @example
   * ```typescript
   * const formatted = fileService.formatFileSize(1024000);
   * console.log('Size:', formatted); // "1.02 MB"
   * ```
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
