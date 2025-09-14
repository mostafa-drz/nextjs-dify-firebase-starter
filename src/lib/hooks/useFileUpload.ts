/**
 * @fileoverview React hooks for Dify file upload operations
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadDifyFile, previewDifyFile } from '@/lib/actions/dify-files';
import { validateDifyFile } from '@/lib/utils/file-validation';
import { FileUploadRequest, FilePreviewRequest } from '@/lib/actions/dify-files';

/**
 * Hook for file upload operations
 * @param userId - User ID for the upload
 * @returns File upload mutation
 *
 * @example
 * ```typescript
 * const { uploadFile, isUploading, error } = useFileUpload('user123');
 *
 * const handleFileUpload = async (file: File) => {
 *   try {
 *     const result = await uploadFile.mutateAsync({
 *       file,
 *       user: 'user123'
 *     });
 *
 *     if (result.success) {
 *       console.log('File uploaded:', result.data?.id);
 *     }
 *   } catch (error) {
 *     console.error('Upload failed:', error);
 *   }
 * };
 * ```
 */
export function useFileUpload(userId: string) {
  const queryClient = useQueryClient();

  const uploadFile = useMutation({
    mutationFn: async (request: FileUploadRequest) => {
      return await uploadDifyFile(userId, request);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate file-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['dify', 'files', userId] });
      }
    },
  });

  return {
    uploadFile,
    isUploading: uploadFile.isPending,
    error: uploadFile.error,
    data: uploadFile.data,
  };
}

/**
 * Hook for file preview operations
 * @param userId - User ID for the preview
 * @returns File preview query
 *
 * @example
 * ```typescript
 * const { data: fileBlob, isLoading, error } = useFilePreview('user123', {
 *   file_id: 'file-uuid',
 *   as_attachment: false
 * });
 *
 * if (fileBlob && fileBlob.success) {
 *   const url = URL.createObjectURL(fileBlob.data);
 *   // Use URL for display
 * }
 * ```
 */
export function useFilePreview(
  userId: string,
  request: FilePreviewRequest,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['dify', 'files', 'preview', userId, request.file_id],
    queryFn: async () => {
      return await previewDifyFile(userId, request);
    },
    enabled: enabled && !!request.file_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for file validation
 * @returns File validation utilities
 *
 * @example
 * ```typescript
 * const { validateFile, isFileTypeSupported, getMaxFileSize } = useFileValidation();
 *
 * const handleFileSelect = (file: File) => {
 *   const validation = validateFile(file);
 *   if (!validation.isValid) {
 *     console.error('Validation failed:', validation.errors);
 *     return;
 *   }
 *
 *   // Proceed with upload
 * };
 * ```
 */
export function useFileValidation() {
  const validateFile = (file: File) => {
    return validateDifyFile(file);
  };

  return {
    validateFile,
  };
}

/**
 * Hook for file upload with progress tracking
 * @param userId - User ID for the upload
 * @returns File upload mutation with progress
 *
 * @example
 * ```typescript
 * const { uploadFileWithProgress, isUploading, progress, error } = useFileUploadWithProgress('user123');
 *
 * const handleFileUpload = async (file: File) => {
 *   try {
 *     const result = await uploadFileWithProgress.mutateAsync({
 *       file,
 *       user: 'user123'
 *     });
 *
 *     console.log('Upload progress:', progress);
 *   } catch (error) {
 *     console.error('Upload failed:', error);
 *   }
 * };
 * ```
 */
export function useFileUploadWithProgress(userId: string) {
  const queryClient = useQueryClient();

  const uploadFileWithProgress = useMutation({
    mutationFn: async (request: FileUploadRequest) => {
      return await uploadDifyFile(userId, request);
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['dify', 'files', userId] });
      }
    },
  });

  return {
    uploadFileWithProgress,
    isUploading: uploadFileWithProgress.isPending,
    progress: 0, // Placeholder - would need custom implementation
    error: uploadFileWithProgress.error,
    data: uploadFileWithProgress.data,
  };
}
