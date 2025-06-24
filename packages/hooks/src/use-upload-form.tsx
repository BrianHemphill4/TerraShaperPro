import { useCallback, useRef, useState } from 'react';

import { useToast } from './use-toast';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type UploadProgress = {
  loaded: number;
  total: number;
  percentage: number;
};

export type FileValidation = {
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // MIME types
  maxFiles?: number;
};

export type UseUploadFormOptions = {
  validation?: FileValidation;
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (progress: UploadProgress) => void;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadError?: (error: Error) => void;
  uploadFunction?: (
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ) => Promise<UploadResult>;
  autoUpload?: boolean;
  multiple?: boolean;
};

export type UploadResult = {
  file: File;
  url?: string;
  id?: string;
  error?: string;
};

export type UseUploadFormState = {
  status: UploadStatus;
  progress: UploadProgress;
  error: string | null;
  files: File[];
  results: UploadResult[];
  isUploading: boolean;
};

export type UseUploadFormActions = {
  selectFiles: (files: FileList | File[]) => void;
  removeFile: (index: number) => void;
  clearFiles: () => void;
  startUpload: () => Promise<void>;
  cancelUpload: () => void;
  resetUpload: () => void;
};

export type UseUploadFormResult = {
  actions: UseUploadFormActions;
  inputRef: React.RefObject<HTMLInputElement>;
} & UseUploadFormState;

export function useUploadForm(options: UseUploadFormOptions = {}): UseUploadFormResult {
  const {
    validation = {},
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    uploadFunction,
    autoUpload = false,
    multiple = false,
  } = options;

  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 });
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<UploadResult[]>([]);

  const validateFiles = useCallback(
    (fileList: File[]): { valid: File[]; errors: string[] } => {
      const { maxSize, allowedTypes, maxFiles } = validation;
      const valid: File[] = [];
      const errors: string[] = [];

      if (maxFiles && fileList.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return { valid, errors };
      }

      for (const file of fileList) {
        if (maxSize && file.size > maxSize) {
          errors.push(`${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
          continue;
        }

        if (allowedTypes && !allowedTypes.includes(file.type)) {
          errors.push(`${file.name} has unsupported file type`);
          continue;
        }

        valid.push(file);
      }

      return { valid, errors };
    },
    [validation]
  );

  const selectFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const fileArray = Array.from(fileList);
      const { valid, errors } = validateFiles(fileArray);

      if (errors.length > 0) {
        setError(errors.join(', '));
        toast({
          title: 'File Validation Error',
          description: errors.join(', '),
          variant: 'destructive',
        });
        return;
      }

      setFiles(multiple ? [...files, ...valid] : valid);
      setError(null);

      if (autoUpload && valid.length > 0) {
        await startUpload();
      }
    },
    [files, multiple, autoUpload, validateFiles, toast]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setResults([]);
    setError(null);
    setStatus('idle');
    setProgress({ loaded: 0, total: 0, percentage: 0 });
  }, []);

  const startUpload = useCallback(async () => {
    if (!uploadFunction || files.length === 0) {
      setError('No upload function provided or no files selected');
      return;
    }

    setStatus('uploading');
    setError(null);
    setResults([]);
    abortControllerRef.current = new AbortController();

    try {
      onUploadStart?.(files);

      const uploadPromises = files.map(async (file, index) => {
        const onFileProgress = (fileProgress: UploadProgress) => {
          const totalProgress: UploadProgress = {
            loaded: index * 100 + fileProgress.percentage,
            total: files.length * 100,
            percentage: Math.round((index * 100 + fileProgress.percentage) / files.length),
          };
          setProgress(totalProgress);
          onUploadProgress?.(totalProgress);
        };

        try {
          const result = await uploadFunction(file, onFileProgress);
          return { ...result, file };
        } catch (err) {
          return {
            file,
            error: err instanceof Error ? err.message : 'Upload failed',
          };
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      setResults(uploadResults);

      const hasErrors = uploadResults.some((result) => result.error);
      setStatus(hasErrors ? 'error' : 'success');

      if (hasErrors) {
        const errorMessages = uploadResults
          .filter((result) => result.error)
          .map((result) => `${result.file.name}: ${result.error}`)
          .join(', ');
        setError(errorMessages);
        onUploadError?.(new Error(errorMessages));
      } else {
        onUploadComplete?.(uploadResults);
        toast({
          title: 'Upload Complete',
          description: `Successfully uploaded ${uploadResults.length} file${uploadResults.length > 1 ? 's' : ''}`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setStatus('error');
      onUploadError?.(err instanceof Error ? err : new Error(errorMessage));

      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [
    files,
    uploadFunction,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onUploadError,
    toast,
  ]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setProgress({ loaded: 0, total: 0, percentage: 0 });
    setError(null);
  }, []);

  const resetUpload = useCallback(() => {
    cancelUpload();
    clearFiles();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [cancelUpload, clearFiles]);

  return {
    status,
    progress,
    error,
    files,
    results,
    isUploading: status === 'uploading',
    actions: {
      selectFiles,
      removeFile,
      clearFiles,
      startUpload,
      cancelUpload,
      resetUpload,
    },
    inputRef,
  };
}
