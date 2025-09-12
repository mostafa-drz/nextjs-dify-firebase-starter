# Dify File Upload Service

This service provides comprehensive file upload and preview functionality for Dify applications, following the official Dify API specifications exactly.

## Features

- **File Upload**: Upload image files (png, jpg, jpeg, webp, gif) to Dify
- **File Preview**: Preview or download previously uploaded files
- **File Validation**: Comprehensive validation before upload
- **Error Handling**: Handles all Dify API error codes
- **React Hooks**: Easy-to-use React hooks for file operations
- **TypeScript Support**: Full type safety and IntelliSense

## API Reference

### FileService

#### `uploadFile(request: FileUploadRequest)`

Uploads a file to Dify.

**Parameters:**

- `request.file`: File object to upload
- `request.user`: User identifier (must be unique within the application)

**Returns:** `Promise<DifyApiResponse<FileUploadResponse>>`

**Example:**

```typescript
const difyService = new DifyService({
  apiKey: 'app-your-api-key',
  userId: 'user123',
});

const result = await difyService.files.uploadFile({
  file: imageFile,
  user: 'user123',
});

if (result.success) {
  console.log('File uploaded:', result.data?.id);
}
```

#### `previewFile(request: FilePreviewRequest)`

Previews or downloads a previously uploaded file.

**Parameters:**

- `request.file_id`: UUID of the file to preview
- `request.as_attachment`: Whether to force download (default: false)

**Returns:** `Promise<DifyApiResponse<Blob>>`

**Example:**

```typescript
const fileBlob = await difyService.files.previewFile({
  file_id: 'file-uuid',
  as_attachment: false,
});

if (fileBlob.success) {
  const url = URL.createObjectURL(fileBlob.data);
  // Use URL for display
}
```

### Utility Methods

#### `getSupportedFileTypes()`

Returns array of supported file extensions: `['png', 'jpg', 'jpeg', 'webp', 'gif']`

#### `isFileTypeSupported(filename: string)`

Checks if a file type is supported.

#### `getMaxFileSize()`

Returns maximum file size in bytes (10MB).

#### `formatFileSize(bytes: number)`

Formats file size for display (e.g., "1.02 MB").

## React Hooks

### `useFileUpload(userId: string)`

Hook for file upload operations.

**Example:**

```typescript
const { uploadFile, isUploading, error } = useFileUpload('user123');

const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadFile.mutateAsync({
      file,
      user: 'user123',
    });

    if (result.success) {
      console.log('File uploaded:', result.data?.id);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### `useFilePreview(userId: string, request: FilePreviewRequest, enabled?: boolean)`

Hook for file preview operations.

**Example:**

```typescript
const {
  data: fileBlob,
  isLoading,
  error,
} = useFilePreview('user123', {
  file_id: 'file-uuid',
  as_attachment: false,
});

if (fileBlob && fileBlob.success) {
  const url = URL.createObjectURL(fileBlob.data);
  // Use URL for display
}
```

### `useFileValidation()`

Hook for file validation utilities.

**Example:**

```typescript
const { validateFile, isFileTypeSupported, getMaxFileSize } = useFileValidation();

const handleFileSelect = (file: File) => {
  const validation = validateFile(file);
  if (!validation.isValid) {
    console.error('Validation failed:', validation.errors);
    return;
  }

  // Proceed with upload
};
```

### `useFileUploadWithProgress(userId: string)`

Hook for file upload with progress tracking (placeholder implementation).

## File Validation

The service automatically validates files before upload:

- **File Type**: Only supports png, jpg, jpeg, webp, gif
- **File Size**: Maximum 10MB
- **File Content**: File must not be empty
- **File ID Format**: Must be valid UUID for preview operations

## Error Handling

The service handles all documented Dify API error codes:

### Upload Errors

- `no_file_uploaded`: No file provided
- `too_many_files`: Only one file accepted
- `file_too_large`: File exceeds size limit
- `unsupported_file_type`: Invalid file format
- `s3_connection_failed`: S3 service issues
- `s3_permission_denied`: Permission issues
- `s3_file_too_large`: S3 size limit exceeded

### Preview Errors

- `invalid_param`: Invalid file ID
- `file_access_denied`: Access denied or file doesn't belong to app
- `file_not_found`: File not found or deleted

## Integration with Chat

Files can be used in chat messages by including them in the `files` array:

```typescript
const chatRequest = {
  query: "What's in this image?",
  user: 'user123',
  files: [
    {
      type: 'image',
      transfer_method: 'local_file',
      upload_file_id: 'file-uuid-from-upload',
    },
  ],
};
```

## Best Practices

1. **Validate Before Upload**: Always validate files on the client side before upload
2. **Handle Errors Gracefully**: Check the `success` field and handle errors appropriately
3. **Clean Up Object URLs**: Always revoke object URLs when done with them
4. **User Feedback**: Provide clear feedback for upload progress and errors
5. **File Size Limits**: Respect the 10MB limit and inform users about it

## Security Considerations

- Files are uploaded for use by the current end-user only
- File access is controlled by the Dify API
- Always validate file types on the client side
- Don't trust file extensions - validate actual file content if needed

## Performance Tips

- Use file preview caching (React Query handles this automatically)
- Implement file size validation before upload
- Consider image compression for large files
- Use appropriate file formats (webp for modern browsers)

## Troubleshooting

### Common Issues

1. **"Unsupported file type"**: Check that the file extension is one of the supported types
2. **"File too large"**: Reduce file size or implement client-side compression
3. **"File access denied"**: Ensure the file belongs to the current application
4. **"File not found"**: The file may have been deleted or the ID is incorrect

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=dify:files
```

This will log detailed information about file operations.
