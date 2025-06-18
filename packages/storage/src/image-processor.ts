import type { Buffer } from 'node:buffer';

import sharp from 'sharp';

import type { ImageOptimizationOptions } from './types';

export class ImageProcessor {
  static async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<{ buffer: Buffer; contentType: string; size: number }> {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
      thumbnail = false,
    } = options;

    let processor = sharp(buffer);

    // Resize if dimensions specified
    if (width || height) {
      processor = processor.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Create thumbnail if requested
    if (thumbnail) {
      processor = processor.resize(300, 300, {
        fit: 'cover',
        position: 'center',
      });
    }

    // Convert format and apply quality
    switch (format) {
      case 'webp':
        processor = processor.webp({ quality });
        break;
      case 'jpeg':
        processor = processor.jpeg({ quality });
        break;
      case 'png':
        processor = processor.png({ quality });
        break;
    }

    const optimizedBuffer = await processor.toBuffer();
    
    return {
      buffer: optimizedBuffer,
      contentType: `image/${format}`,
      size: optimizedBuffer.length,
    };
  }

  static async createThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 70 })
      .toBuffer();
  }

  static async getImageMetadata(buffer: Buffer) {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
    };
  }
}