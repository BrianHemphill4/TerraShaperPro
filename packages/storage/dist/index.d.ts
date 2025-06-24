import * as _google_cloud_storage from '@google-cloud/storage';
import { Storage } from '@google-cloud/storage';
import * as node_buffer from 'node:buffer';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

declare function getStorageClient(): Storage;
declare function getBucket(bucketType: 'renders' | 'assets'): _google_cloud_storage.Bucket;

type StorageBucket = 'renders' | 'assets';
type UploadOptions = {
  bucket: StorageBucket;
  fileName: string;
  buffer: node_buffer.Buffer;
  contentType?: string;
  metadata?: Record<string, string>;
  makePublic?: boolean;
};
type SignedUrlOptions = {
  bucket: StorageBucket;
  fileName: string;
  action: 'read' | 'write';
  expires?: Date;
  contentType?: string;
};
type UploadResult = {
  fileName: string;
  bucket: string;
  publicUrl: string;
  signedUrl?: string;
  size: number;
  contentType: string;
};
type ImageOptimizationOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  thumbnail?: boolean;
};
type StorageConfig = {
  projectId: string;
  rendersBucket: string;
  assetsBucket: string;
  keyFilename?: string;
  cdnUrl?: string;
};

declare function getStorageConfig(): StorageConfig;

declare class ImageProcessor {
  static optimizeImage(
    buffer: Buffer,
    options?: ImageOptimizationOptions
  ): Promise<{
    buffer: Buffer;
    contentType: string;
    size: number;
  }>;
  static createThumbnail(buffer: Buffer): Promise<Buffer>;
  static getImageMetadata(buffer: Buffer): Promise<{
    width: number | undefined;
    height: number | undefined;
    format: keyof sharp.FormatEnum | undefined;
    size: number | undefined;
    hasAlpha: boolean | undefined;
  }>;
}

declare class StorageService {
  private config;
  uploadFile(options: UploadOptions): Promise<UploadResult>;
  uploadImage(
    bucketType: StorageBucket,
    fileName: string,
    buffer: Buffer,
    optimizationOptions?: ImageOptimizationOptions
  ): Promise<{
    original: UploadResult;
    thumbnail?: UploadResult;
  }>;
  generateSignedUrl(options: SignedUrlOptions): Promise<string>;
  generateUploadUrl(
    bucketType: StorageBucket,
    fileName: string,
    contentType: string,
    expires?: Date
  ): Promise<string>;
  generateDownloadUrl(bucketType: StorageBucket, fileName: string, expires?: Date): Promise<string>;
  deleteFile(bucketType: StorageBucket, fileName: string): Promise<void>;
  fileExists(bucketType: StorageBucket, fileName: string): Promise<boolean>;
  getFileMetadata(
    bucketType: StorageBucket,
    fileName: string
  ): Promise<_google_cloud_storage.FileMetadata>;
  copyFile(
    sourceBucket: StorageBucket,
    sourceFileName: string,
    destBucket: StorageBucket,
    destFileName: string
  ): Promise<void>;
  getPublicUrl(bucketName: string, fileName: string): string;
  private getThumbnailFileName;
  uploadRenderResult(
    renderId: string,
    imageBuffer: Buffer,
    metadata?: Record<string, string>
  ): Promise<{
    original: UploadResult;
    thumbnail: UploadResult;
  }>;
  uploadAsset(
    assetId: string,
    imageBuffer: Buffer,
    metadata?: Record<string, string>
  ): Promise<{
    original: UploadResult;
    thumbnail: UploadResult;
  }>;
}

declare class RenderStorageService extends StorageService {
  /**
   * Store a completed render result with optimized images and thumbnails
   */
  storeRenderResult(
    renderId: string,
    imageBuffer: Buffer,
    metadata: {
      userId: string;
      projectId: string;
      sceneId: string;
      provider: string;
      prompt: string;
      settings: Record<string, any>;
      processingTime?: number;
      originalSize?: number;
    }
  ): Promise<{
    original: UploadResult;
    thumbnail: UploadResult;
    webp: UploadResult;
    metadata: any;
  }>;
  /**
   * Get render result URLs
   */
  getRenderUrls(renderId: string): Promise<{
    original?: string;
    webp?: string;
    thumbnail?: string;
    metadata?: any;
  } | null>;
  /**
   * Delete all files associated with a render
   */
  deleteRender(renderId: string): Promise<void>;
  /**
   * Check for original file with unknown extension
   */
  private checkOriginalFile;
  /**
   * Generate download URLs for render results
   */
  generateRenderDownloadUrls(
    renderId: string,
    expiresInHours?: number
  ): Promise<{
    original?: string;
    webp?: string;
    thumbnail?: string;
  }>;
}

declare class UploadUtils {
  private static storageService;
  /**
   * Generate a direct upload URL for client-side uploads
   */
  static generateDirectUploadUrl(
    bucketType: StorageBucket,
    fileName: string,
    contentType: string,
    expiresInMinutes?: number
  ): Promise<{
    uploadUrl: string;
    fileName: string;
    publicUrl: string;
    expiresAt: Date;
  }>;
  /**
   * Generate unique file name with timestamp and random suffix
   */
  static generateFileName(prefix: string, extension: string): string;
  /**
   * Generate file name for render result
   */
  static generateRenderFileName(renderId: string, format?: string): string;
  /**
   * Generate file name for asset
   */
  static generateAssetFileName(assetId: string, format?: string): string;
  /**
   * Generate file name for user upload
   */
  static generateUserUploadFileName(userId: string, originalFileName: string): string;
  /**
   * Validate file type for uploads
   */
  static validateImageFile(
    contentType: string,
    _maxSizeMB?: number
  ): {
    valid: boolean;
    error?: string;
  };
  /**
   * Get CORS configuration for direct uploads
   */
  static getCorsConfig(): {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
    maxAgeSeconds: number;
  };
  /**
   * Create presigned POST policy for direct browser uploads
   */
  static generatePresignedPost(
    bucketType: StorageBucket,
    fileName: string,
    contentType: string,
    _maxSizeBytes?: number
  ): Promise<{
    url: string;
    fields: Record<string, string>;
  }>;
}

export {
  type ImageOptimizationOptions,
  ImageProcessor,
  RenderStorageService,
  type SignedUrlOptions,
  type StorageBucket,
  type StorageConfig,
  StorageService,
  type UploadOptions,
  type UploadResult,
  UploadUtils,
  StorageService as default,
  getBucket,
  getStorageClient,
  getStorageConfig,
};
