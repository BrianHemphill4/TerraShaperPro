'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { AlertModal } from '@/components/ui/modal';
import { Progress } from '@/components/ui/progress';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type ImageUploadProps = {
  onUploadComplete?: (url: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  bucketType?: 'renders' | 'assets';
  maxSizeMB?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
};

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  bucketType = 'assets',
  maxSizeMB = 10,
  accept = 'image/*',
  disabled = false,
  className = '',
}: ImageUploadProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      try {
        setStatus('uploading');
        setProgress(0);
        setError(null);

        // Validate file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          throw new Error(`File size must be less than ${maxSizeMB}MB`);
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

        // Get signed upload URL from your API
        const uploadResponse = await fetch('/api/trpc/storage.generateUploadUrl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName,
            contentType: file.type,
            bucketType,
          }),
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, publicUrl } = await uploadResponse.json();

        // Upload directly to Google Cloud Storage
        const uploadRequest = new XMLHttpRequest();

        uploadRequest.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressPercent = Math.round((event.loaded / event.total) * 100);
            setProgress(progressPercent);
          }
        });

        uploadRequest.addEventListener('load', () => {
          if (uploadRequest.status === 200) {
            setStatus('success');
            setUploadedUrl(publicUrl);
            onUploadComplete?.(publicUrl, fileName);
          } else {
            throw new Error(`Upload failed with status ${uploadRequest.status}`);
          }
        });

        uploadRequest.addEventListener('error', () => {
          throw new Error('Upload failed');
        });

        uploadRequest.open('PUT', uploadUrl);
        uploadRequest.setRequestHeader('Content-Type', file.type);
        uploadRequest.send(file);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        setStatus('error');
        onUploadError?.(errorMessage);
      }
    },
    [bucketType, maxSizeMB, onUploadComplete, onUploadError]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const resetUpload = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    setUploadedUrl(null);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${status === 'uploading' ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
      >
        {status === 'idle' && (
          <>
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={disabled}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer" aria-label="Upload image file">
              <div className="space-y-2">
                <div className="text-gray-600">Drag and drop an image here, or click to select</div>
                <div className="text-sm text-gray-400">Max size: {maxSizeMB}MB</div>
              </div>
            </label>
          </>
        )}

        {status === 'uploading' && (
          <div className="space-y-2">
            <div className="text-blue-600">Uploading...</div>
            <Progress value={progress} className="w-full" />
            <div className="text-sm text-gray-500">{progress}%</div>
          </div>
        )}

        {status === 'success' && uploadedUrl && (
          <div className="space-y-2">
            <div className="text-green-600">✓ Upload successful!</div>
            <img src={uploadedUrl} alt="Uploaded" className="mx-auto max-h-32 max-w-full rounded" />
            <Button type="button" onClick={resetUpload} variant="outline" size="sm">
              Upload Another
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <div className="text-red-600">✗ Upload failed</div>
            <Button type="button" onClick={resetUpload} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Error Modal */}
      {error && (
        <AlertModal
          isOpen={!!error}
          onClose={() => setError(null)}
          title="Upload Error"
          message={error}
        />
      )}
    </div>
  );
}
