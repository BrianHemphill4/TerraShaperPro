/**
 * Web Worker for generating thumbnails efficiently
 * Offloads image processing from the main thread
 */

interface ThumbnailRequest {
  id: string;
  imageData: ImageData | ArrayBuffer;
  targetWidth: number;
  targetHeight: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface ThumbnailResponse {
  id: string;
  success: boolean;
  thumbnail?: Blob;
  dataUrl?: string;
  error?: string;
  timeTaken?: number;
}

// Canvas for processing (created once and reused)
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

// Initialize canvas
function initCanvas(width: number, height: number) {
  if (!canvas || canvas.width !== width || canvas.height !== height) {
    canvas = new OffscreenCanvas(width, height);
    ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    });
    
    if (ctx) {
      // Set high quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
  }
}

// Process thumbnail generation
async function generateThumbnail(request: ThumbnailRequest): Promise<ThumbnailResponse> {
  const startTime = performance.now();
  
  try {
    // Initialize canvas with target dimensions
    initCanvas(request.targetWidth, request.targetHeight);
    
    if (!canvas || !ctx) {
      throw new Error('Failed to initialize canvas');
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Handle different input types
    if (request.imageData instanceof ImageData) {
      // Direct ImageData - need to scale
      const tempCanvas = new OffscreenCanvas(request.imageData.width, request.imageData.height);
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        throw new Error('Failed to create temp canvas');
      }

      tempCtx.putImageData(request.imageData, 0, 0);
      
      // Scale to target size
      ctx.drawImage(
        tempCanvas,
        0, 0, request.imageData.width, request.imageData.height,
        0, 0, request.targetWidth, request.targetHeight
      );
    } else if (request.imageData instanceof ArrayBuffer) {
      // Decode image from ArrayBuffer
      const blob = new Blob([request.imageData]);
      const imageBitmap = await createImageBitmap(blob);
      
      // Calculate scaling to maintain aspect ratio
      const scale = Math.min(
        request.targetWidth / imageBitmap.width,
        request.targetHeight / imageBitmap.height
      );
      
      const scaledWidth = imageBitmap.width * scale;
      const scaledHeight = imageBitmap.height * scale;
      
      // Center the image
      const x = (request.targetWidth - scaledWidth) / 2;
      const y = (request.targetHeight - scaledHeight) / 2;
      
      // Draw scaled image
      ctx.drawImage(
        imageBitmap,
        x, y, scaledWidth, scaledHeight
      );
      
      imageBitmap.close();
    }

    // Convert to blob
    const format = request.format || 'jpeg';
    const quality = request.quality || 0.85;
    
    const blob = await canvas.convertToBlob({
      type: `image/${format}`,
      quality: format === 'png' ? undefined : quality
    });

    // Optionally create data URL
    const dataUrl = await blobToDataUrl(blob);

    const timeTaken = performance.now() - startTime;

    return {
      id: request.id,
      success: true,
      thumbnail: blob,
      dataUrl,
      timeTaken
    };
  } catch (error) {
    return {
      id: request.id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timeTaken: performance.now() - startTime
    };
  }
}

// Convert blob to data URL
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Batch processing for multiple thumbnails
interface BatchRequest {
  requests: ThumbnailRequest[];
  concurrent?: number;
}

async function processBatch(batch: BatchRequest): Promise<ThumbnailResponse[]> {
  const concurrent = batch.concurrent || 3;
  const results: ThumbnailResponse[] = [];
  
  // Process in chunks
  for (let i = 0; i < batch.requests.length; i += concurrent) {
    const chunk = batch.requests.slice(i, i + concurrent);
    const chunkResults = await Promise.all(
      chunk.map(request => generateThumbnail(request))
    );
    results.push(...chunkResults);
  }
  
  return results;
}

// Message handler
self.addEventListener('message', async (event) => {
  const { data } = event;
  
  if (data.type === 'generate') {
    const response = await generateThumbnail(data.request);
    self.postMessage({ type: 'thumbnail', response });
  } else if (data.type === 'batch') {
    const responses = await processBatch(data.batch);
    self.postMessage({ type: 'batchComplete', responses });
  } else if (data.type === 'preload') {
    // Preload canvas for better performance
    initCanvas(data.width || 256, data.height || 256);
    self.postMessage({ type: 'ready' });
  }
});

// Export types for main thread
export type { ThumbnailRequest, ThumbnailResponse };

// Thumbnail cache manager (main thread helper)
export class ThumbnailCache {
  private cache = new Map<string, { blob: Blob; dataUrl: string; timestamp: number }>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize: number = 100, maxAge: number = 3600000) {
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  get(key: string): { blob: Blob; dataUrl: string } | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return { blob: item.blob, dataUrl: item.dataUrl };
  }

  set(key: string, blob: Blob, dataUrl: string): void {
    // Enforce size limit
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, { blob, dataUrl, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((item, key) => {
      if (now - item.timestamp > this.maxAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}