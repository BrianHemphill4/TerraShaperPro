import { StorageService } from './storage-service';
import type { StorageBucket } from './types';

export class UploadUtils {
  private static storageService = new StorageService();

  /**
   * Generate a direct upload URL for client-side uploads
   */
  static async generateDirectUploadUrl(
    bucketType: StorageBucket,
    fileName: string,
    contentType: string,
    expiresInMinutes = 15
  ): Promise<{
    uploadUrl: string;
    fileName: string;
    publicUrl: string;
    expiresAt: Date;
  }> {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    const uploadUrl = await this.storageService.generateUploadUrl(
      bucketType,
      fileName,
      contentType,
      expiresAt
    );

    const bucketName = bucketType === 'renders' 
      ? process.env.GCS_RENDERS_BUCKET!
      : process.env.GCS_ASSETS_BUCKET!;

    const publicUrl = this.storageService.getPublicUrl(bucketName, fileName);

    return {
      uploadUrl,
      fileName,
      publicUrl,
      expiresAt,
    };
  }

  /**
   * Generate unique file name with timestamp and random suffix
   */
  static generateFileName(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}/${timestamp}-${random}.${extension}`;
  }

  /**
   * Generate file name for render result
   */
  static generateRenderFileName(renderId: string, format = 'webp'): string {
    return `renders/${renderId}.${format}`;
  }

  /**
   * Generate file name for asset
   */
  static generateAssetFileName(assetId: string, format = 'webp'): string {
    return `assets/${assetId}.${format}`;
  }

  /**
   * Generate file name for user upload
   */
  static generateUserUploadFileName(
    userId: string,
    originalFileName: string
  ): string {
    const extension = originalFileName.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `uploads/${userId}/${timestamp}-${random}.${extension}`;
  }

  /**
   * Validate file type for uploads
   */
  static validateImageFile(contentType: string, _maxSizeMB = 10): {
    valid: boolean;
    error?: string;
  } {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(contentType.toLowerCase())) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
      };
    }

    return { valid: true };
  }

  /**
   * Get CORS configuration for direct uploads
   */
  static getCorsConfig() {
    return {
      origin: [
        process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'https://terrashaper.pro',
        'https://*.terrashaper.pro',
      ],
      methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Content-Length',
        'x-goog-content-length-range',
        'x-goog-resumable',
      ],
      maxAgeSeconds: 3600,
    };
  }

  /**
   * Create presigned POST policy for direct browser uploads
   */
  static async generatePresignedPost(
    bucketType: StorageBucket,
    fileName: string,
    contentType: string,
    _maxSizeBytes = 10 * 1024 * 1024 // 10MB default
  ): Promise<{
    url: string;
    fields: Record<string, string>;
  }> {
    // For Google Cloud Storage, we'll use signed URLs instead of presigned POST
    // This is a simplified version - you might want to implement proper presigned POST
    const uploadUrl = await this.storageService.generateUploadUrl(
      bucketType,
      fileName,
      contentType
    );

    return {
      url: uploadUrl,
      fields: {
        'Content-Type': contentType,
      },
    };
  }
}