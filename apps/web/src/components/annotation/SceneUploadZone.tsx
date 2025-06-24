'use client';

import { useCallback, useState, useRef } from 'react';
// import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useSceneStore, type Scene } from '@/stores/useSceneStore';

export interface SceneUploadZoneProps {
  projectId: string;
  onSceneUploaded?: (scene: Scene) => void;
  onUploadProgress?: (progress: number) => void;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
}

export function SceneUploadZone({
  projectId,
  onSceneUploaded,
  onUploadProgress,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/webp']
}: SceneUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { scenes, addScene, getScenesByProject } = useSceneStore();
  const projectScenes = getScenesByProject(projectId);

  const simulateUpload = useCallback(async (file: File): Promise<string> => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(progress);
      onUploadProgress?.(progress);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // In a real app, this would upload to your storage service
    // For now, create a local object URL
    return URL.createObjectURL(file);
  }, [onUploadProgress]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File too large. Max size: ${Math.round(maxFileSize / 1024 / 1024)}MB`;
    }
    if (!acceptedFileTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or WebP images.';
    }
    return null;
  };

  const handleFileUpload = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const imageUrl = await simulateUpload(file);
      
      const newScene: Scene = {
        id: `scene-${Date.now()}`,
        projectId,
        imageUrl,
        order: projectScenes.length + 1,
        isDefault: projectScenes.length === 0, // First scene is default
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addScene(newScene);
      onSceneUploaded?.(newScene);
      
      // Clear preview after successful upload
      setTimeout(() => {
        setPreview(null);
        setUploadProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [projectId, projectScenes.length, addScene, onSceneUploaded, simulateUpload, maxFileSize, acceptedFileTypes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        
        {preview ? (
          <div className="relative">
            <div className="relative w-32 h-24 mx-auto mb-4 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Upload preview"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            
            {isUploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {isDragOver ? 'Drop your photo here' : 'Upload a scene photo'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP up to {Math.round(maxFileSize / 1024 / 1024)}MB
              </p>
            </div>
          </>
        )}
      </div>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {projectScenes.length > 0 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            {projectScenes.length} scene{projectScenes.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
      )}
    </div>
  );
}