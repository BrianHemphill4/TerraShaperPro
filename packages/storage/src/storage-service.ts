import type { Buffer } from 'node:buffer';

import { lookup } from 'mime-types';

import { getBucket } from './client';
import { getStorageConfig } from './config';
import { ImageProcessor } from './image-processor';
import type {
  ImageOptimizationOptions,
  SignedUrlOptions,
  StorageBucket,
  UploadOptions,
  UploadResult,
} from './types';

export class StorageService {
  private config = getStorageConfig();

  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    const {
      bucket: bucketType,
      fileName,
      buffer,
      contentType,
      metadata = {},
      makePublic = false,
    } = options;

    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);

    // Determine content type
    const finalContentType = contentType || lookup(fileName) || 'application/octet-stream';

    // Upload file
    await file.save(buffer, {
      metadata: {
        contentType: finalContentType,
        metadata,
      },
      resumable: false,
    });

    // Make public if requested
    if (makePublic) {
      await file.makePublic();
    }

    const bucketName =
      bucketType === 'renders' ? this.config.rendersBucket : this.config.assetsBucket;

    const publicUrl = this.getPublicUrl(bucketName, fileName);

    return {
      fileName,
      bucket: bucketName,
      publicUrl,
      size: buffer.length,
      contentType: finalContentType,
    };
  }

  async uploadImage(
    bucketType: StorageBucket,
    fileName: string,
    buffer: Buffer,
    optimizationOptions?: ImageOptimizationOptions
  ): Promise<{ original: UploadResult; thumbnail?: UploadResult }> {
    // Optimize original image if options provided
    let finalBuffer = buffer;
    let contentType = 'image/jpeg';

    if (optimizationOptions) {
      const optimized = await ImageProcessor.optimizeImage(buffer, optimizationOptions);
      finalBuffer = optimized.buffer;
      contentType = optimized.contentType;
    }

    // Upload original/optimized image
    const original = await this.uploadFile({
      bucket: bucketType,
      fileName,
      buffer: finalBuffer,
      contentType,
      makePublic: true,
    });

    // Create and upload thumbnail if not already a thumbnail
    let thumbnail: UploadResult | undefined;
    if (!optimizationOptions?.thumbnail) {
      const thumbnailBuffer = await ImageProcessor.createThumbnail(buffer);
      const thumbnailFileName = this.getThumbnailFileName(fileName);

      thumbnail = await this.uploadFile({
        bucket: bucketType,
        fileName: thumbnailFileName,
        buffer: thumbnailBuffer,
        contentType: 'image/webp',
        makePublic: true,
      });
    }

    return { original, thumbnail };
  }

  async generateSignedUrl(options: SignedUrlOptions): Promise<string> {
    const {
      bucket: bucketType,
      fileName,
      action,
      expires = new Date(Date.now() + 15 * 60 * 1000), // 15 minutes default
      contentType,
    } = options;

    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action,
      expires,
      contentType,
    });

    return url;
  }

  async generateUploadUrl(
    bucketType: StorageBucket,
    fileName: string,
    contentType: string,
    expires?: Date
  ): Promise<string> {
    return this.generateSignedUrl({
      bucket: bucketType,
      fileName,
      action: 'write',
      contentType,
      expires,
    });
  }

  async generateDownloadUrl(
    bucketType: StorageBucket,
    fileName: string,
    expires?: Date
  ): Promise<string> {
    return this.generateSignedUrl({
      bucket: bucketType,
      fileName,
      action: 'read',
      expires,
    });
  }

  async deleteFile(bucketType: StorageBucket, fileName: string): Promise<void> {
    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);

    await file.delete();
  }

  async fileExists(bucketType: StorageBucket, fileName: string): Promise<boolean> {
    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    return exists;
  }

  async getFileMetadata(bucketType: StorageBucket, fileName: string) {
    const bucket = getBucket(bucketType);
    const file = bucket.file(fileName);

    const [metadata] = await file.getMetadata();
    return metadata;
  }

  async copyFile(
    sourceBucket: StorageBucket,
    sourceFileName: string,
    destBucket: StorageBucket,
    destFileName: string
  ): Promise<void> {
    const sourceBucketObj = getBucket(sourceBucket);
    const destBucketObj = getBucket(destBucket);

    const sourceFile = sourceBucketObj.file(sourceFileName);
    const destFile = destBucketObj.file(destFileName);

    await sourceFile.copy(destFile);
  }

  getPublicUrl(bucketName: string, fileName: string): string {
    if (this.config.cdnUrl) {
      return `${this.config.cdnUrl}/${fileName}`;
    }
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
  }

  private getThumbnailFileName(originalFileName: string): string {
    const lastDotIndex = originalFileName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return `${originalFileName}_thumb.webp`;
    }

    const name = originalFileName.substring(0, lastDotIndex);
    return `${name}_thumb.webp`;
  }

  // Utility methods for common file operations
  async uploadRenderResult(
    renderId: string,
    imageBuffer: Buffer,
    metadata?: Record<string, string>
  ): Promise<{ original: UploadResult; thumbnail: UploadResult }> {
    const fileName = `renders/${renderId}.webp`;

    const result = await this.uploadImage('renders', fileName, imageBuffer, {
      format: 'webp',
      quality: 85,
    });

    // Add metadata to both files
    if (metadata && result.thumbnail) {
      const bucket = getBucket('renders');
      const originalFile = bucket.file(fileName);
      const thumbnailFile = bucket.file(this.getThumbnailFileName(fileName));

      await Promise.all([
        originalFile.setMetadata({ metadata }),
        thumbnailFile.setMetadata({ metadata }),
      ]);
    }

    return result as { original: UploadResult; thumbnail: UploadResult };
  }

  async uploadAsset(
    assetId: string,
    imageBuffer: Buffer,
    metadata?: Record<string, string>
  ): Promise<{ original: UploadResult; thumbnail: UploadResult }> {
    const fileName = `assets/${assetId}.webp`;

    const result = await this.uploadImage('assets', fileName, imageBuffer, {
      format: 'webp',
      quality: 90,
    });

    if (metadata && result.thumbnail) {
      const bucket = getBucket('assets');
      const originalFile = bucket.file(fileName);
      const thumbnailFile = bucket.file(this.getThumbnailFileName(fileName));

      await Promise.all([
        originalFile.setMetadata({ metadata }),
        thumbnailFile.setMetadata({ metadata }),
      ]);
    }

    return result as { original: UploadResult; thumbnail: UploadResult };
  }
}
