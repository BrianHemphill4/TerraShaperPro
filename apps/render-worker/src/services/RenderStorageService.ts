import { Buffer } from 'node:buffer';

import type { Storage } from '@google-cloud/storage';
import { ImageProcessor } from '@terrashaper/storage';

/**
 * Service responsible for storing rendered images and creating thumbnails
 */
export class RenderStorageService {
  private storage: Storage;
  private bucketName: string;

  constructor(storage: Storage, bucketName: string) {
    this.storage = storage;
    this.bucketName = bucketName;
  }

  /**
   * Store rendered image and create thumbnail
   */
  async storeRenderResult(
    renderId: string,
    projectId: string,
    imageBuffer: Buffer,
    settings: any,
    promptHash: string
  ): Promise<{ imageUrl: string; thumbnailUrl: string }> {
    const bucket = this.storage.bucket(this.bucketName);
    const fileName = `renders/${projectId}/${renderId}.${settings.format.toLowerCase()}`;
    const thumbnailFileName = `renders/${projectId}/${renderId}_thumb.webp`;

    // Store main image
    const file = bucket.file(fileName);
    await file.save(imageBuffer, {
      metadata: {
        contentType: `image/${settings.format.toLowerCase()}`,
        metadata: {
          renderId,
          projectId,
          promptHash,
        },
      },
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;

    // Create and store thumbnail
    const thumbnailBuffer = await ImageProcessor.createThumbnail(imageBuffer);
    const thumbnailFile = bucket.file(thumbnailFileName);
    await thumbnailFile.save(thumbnailBuffer, {
      metadata: {
        contentType: 'image/webp',
      },
    });

    await thumbnailFile.makePublic();
    const thumbnailUrl = `https://storage.googleapis.com/${this.bucketName}/${thumbnailFileName}`;

    return { imageUrl: publicUrl, thumbnailUrl };
  }

  /**
   * Convert image result to buffer
   */
  async prepareImageBuffer(result: { imageBase64?: string; imageUrl?: string }): Promise<Buffer> {
    if (result.imageBase64) {
      return Buffer.from(result.imageBase64, 'base64');
    } else if (result.imageUrl) {
      const response = await fetch(result.imageUrl);
      return Buffer.from(await response.arrayBuffer());
    } else {
      throw new Error('No image data provided');
    }
  }
}
