export type StorageBucket = 'renders' | 'assets';

export type UploadOptions = {
  bucket: StorageBucket;
  fileName: string;
  buffer: import('node:buffer').Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
  makePublic?: boolean;
};

export type SignedUrlOptions = {
  bucket: StorageBucket;
  fileName: string;
  action: 'read' | 'write';
  expires?: Date;
  contentType?: string;
};

export type UploadResult = {
  fileName: string;
  bucket: string;
  publicUrl: string;
  signedUrl?: string;
  size: number;
  contentType: string;
};

export type ImageOptimizationOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  thumbnail?: boolean;
};

export type StorageConfig = {
  projectId: string;
  rendersBucket: string;
  assetsBucket: string;
  keyFilename?: string;
  cdnUrl?: string;
};