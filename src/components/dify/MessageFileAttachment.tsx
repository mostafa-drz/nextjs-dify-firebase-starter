'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Image, File, Download, Eye, Loader2, AlertCircle, X } from 'lucide-react';
import { useFilePreview } from '@/lib/hooks/useFileUpload';
import { previewDifyFile } from '@/lib/actions/dify-files';
import { useUser } from '@/components/auth/UserProvider';

interface MessageFileAttachmentProps {
  file: {
    id: string;
    type: string;
    url: string;
    belongs_to: 'user' | 'assistant';
  };
  onRemove?: () => void;
  showRemove?: boolean;
}

/**
 * Minimal file attachment component for chat messages
 * Shows files inline with messages, similar to ChatGPT
 */
export function MessageFileAttachment({
  file,
  onRemove,
  showRemove = false,
}: MessageFileAttachmentProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { user } = useUser();

  // Use existing file preview hook
  const {
    data: previewResponse,
    isLoading,
    error,
  } = useFilePreview(
    user?.uid || '',
    {
      file_id: file.id,
      as_attachment: false,
    },
    isPreviewOpen // Only fetch when dialog is open
  );

  const handleDownload = async () => {
    try {
      // Debug: Log file information
      console.log('Attempting to download file:', {
        fileId: file.id,
        fileType: file.type,
        belongsTo: file.belongs_to,
        userId: user?.uid,
      });

      // Use existing server action for download
      const response = await previewDifyFile(user?.uid || '', {
        file_id: file.id,
        as_attachment: true,
      });

      if (response.success && response.data) {
        const url = URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = `file-${file.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        console.error('Download failed:', response.error?.message);
        // Show user-friendly error message
        alert(
          `Failed to download file: ${response.error?.message || 'File not found or access denied'}`
        );
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = () => {
    if (file.type.startsWith('image/')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const renderPreviewContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          <span className="text-muted-foreground ml-2">Loading preview...</span>
        </div>
      );
    }

    if (error || !previewResponse?.success) {
      return (
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div className="ml-2">
            <p className="font-medium text-red-600">Preview Error</p>
            <p className="text-sm text-red-500">
              {previewResponse?.error?.message || 'Failed to load preview'}
            </p>
          </div>
        </div>
      );
    }

    if (previewResponse?.data) {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(previewResponse.data);
        return (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="File preview"
              className="max-h-96 max-w-full rounded-lg object-contain"
              onLoad={() => URL.revokeObjectURL(imageUrl)}
            />
          </div>
        );
      } else {
        return (
          <div className="flex items-center justify-center py-8">
            <File className="text-muted-foreground h-16 w-16" />
            <div className="ml-4">
              <p className="font-medium">File Preview</p>
              <p className="text-muted-foreground text-sm">
                Preview not available for this file type
              </p>
            </div>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <>
      {/* Minimal file attachment display */}
      <div className="group bg-muted/50 relative inline-flex items-center gap-2 rounded-lg border p-2 text-sm">
        {getFileIcon()}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`text-xs ${getFileTypeColor()}`}>
            {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {file.belongs_to === 'user' ? 'You' : 'AI'}
          </span>
        </div>

        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleDownload}>
            <Download className="h-3 w-3" />
          </Button>
          {showRemove && onRemove && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getFileIcon()}
              File Preview
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">{renderPreviewContent()}</div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
