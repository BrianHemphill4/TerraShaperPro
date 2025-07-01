import { performanceMonitor } from '../performance/performanceMonitor';

interface ImageCacheEntry {
  image: HTMLImageElement | ImageBitmap;
  resolution: number;
  format: string;
  size: number;
  lastAccessed: number;
  accessCount: number;
}

interface LoadingTask {
  url: string;
  priority: number;
  resolution: number;
  callback: (image: HTMLImageElement | ImageBitmap | null) => void;
}

export interface ImageOptimizationConfig {
  enableWebP: boolean;
  enableAVIF: boolean;
  enableProgressive: boolean;
  maxCacheSize: number;
  preloadRadius: number;
  resolutionLevels: number[];
  compressionQuality: number;
}

export class ImageOptimizer {
  private cache = new Map<string, ImageCacheEntry>();
  private loadingQueue: LoadingTask[] = [];
  private activeLoads = new Map<string, Promise<HTMLImageElement | ImageBitmap | null>>();
  private config: ImageOptimizationConfig;
  private cacheSize = 0;
  private supported = {
    webp: false,
    avif: false,
    imageBitmap: typeof ImageBitmap !== 'undefined'
  };
  private observer?: IntersectionObserver;

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = {
      enableWebP: true,
      enableAVIF: true,
      enableProgressive: true,
      maxCacheSize: 100 * 1024 * 1024, // 100MB
      preloadRadius: 200,
      resolutionLevels: [0.25, 0.5, 1, 2],
      compressionQuality: 0.85,
      ...config
    };

    this.detectFormatSupport();
    this.setupIntersectionObserver();
  }

  private async detectFormatSupport(): Promise<void> {
    // Check WebP support
    if (this.config.enableWebP) {
      this.supported.webp = await this.checkFormatSupport(
        'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
      );
    }

    // Check AVIF support
    if (this.config.enableAVIF) {
      this.supported.avif = await this.checkFormatSupport(
        'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogIaDQgMgkQAAAAB8dSLfI='
      );
    }
  }

  private async checkFormatSupport(dataUrl: string): Promise<boolean> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = dataUrl;
    });
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const originalSrc = img.dataset.src;
            if (originalSrc && !img.src) {
              this.loadImage(originalSrc, this.getOptimalResolution(img));
            }
          }
        });
      },
      {
        rootMargin: `${this.config.preloadRadius}px`
      }
    );
  }

  async loadImage(
    url: string,
    resolution = 1,
    priority = 0
  ): Promise<HTMLImageElement | ImageBitmap | null> {
    const cacheKey = this.getCacheKey(url, resolution);
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.lastAccessed = performance.now();
      cached.accessCount++;
      performanceMonitor.updateCacheHitRate(1);
      return cached.image;
    }

    // Check if already loading
    const loading = this.activeLoads.get(cacheKey);
    if (loading) {
      return loading;
    }

    // Add to queue
    const loadPromise = new Promise<HTMLImageElement | ImageBitmap | null>(resolve => {
      this.loadingQueue.push({
        url,
        priority,
        resolution,
        callback: resolve
      });
    });

    this.activeLoads.set(cacheKey, loadPromise);
    this.processQueue();

    return loadPromise;
  }

  private async processQueue(): Promise<void> {
    if (this.loadingQueue.length === 0) return;

    // Sort by priority
    this.loadingQueue.sort((a, b) => b.priority - a.priority);

    // Process top items
    const concurrentLoads = 4;
    const toProcess = this.loadingQueue.splice(0, concurrentLoads);

    await Promise.all(
      toProcess.map(async task => {
        const result = await this.loadImageInternal(task.url, task.resolution);
        task.callback(result);
        
        const cacheKey = this.getCacheKey(task.url, task.resolution);
        this.activeLoads.delete(cacheKey);
      })
    );

    // Continue processing
    if (this.loadingQueue.length > 0) {
      this.processQueue();
    }
  }

  private async loadImageInternal(
    url: string,
    resolution: number
  ): Promise<HTMLImageElement | ImageBitmap | null> {
    try {
      const optimizedUrl = this.getOptimizedUrl(url, resolution);
      const startTime = performance.now();

      const image = await this.fetchImage(optimizedUrl);
      
      if (!image) {
        performanceMonitor.updateCacheHitRate(0);
        return null;
      }

      const loadTime = performance.now() - startTime;
      performanceMonitor.recordMetric({
        name: 'image-load',
        value: loadTime,
        unit: 'ms',
        timestamp: new Date(),
        tags: {
          resolution: resolution.toString(),
          format: this.getImageFormat(optimizedUrl)
        }
      });

      // Estimate size
      const size = this.estimateImageSize(image);

      // Add to cache
      this.addToCache(this.getCacheKey(url, resolution), {
        image,
        resolution,
        format: this.getImageFormat(optimizedUrl),
        size,
        lastAccessed: performance.now(),
        accessCount: 1
      });

      return image;
    } catch (error) {
      console.error('Failed to load image:', error);
      return null;
    }
  }

  private async fetchImage(url: string): Promise<HTMLImageElement | ImageBitmap | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        if (this.supported.imageBitmap) {
          try {
            const bitmap = await createImageBitmap(img, {
              premultiplyAlpha: 'none',
              colorSpaceConversion: 'none'
            });
            resolve(bitmap);
          } catch {
            resolve(img);
          }
        } else {
          resolve(img);
        }
      };

      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  private getOptimizedUrl(url: string, resolution: number): string {
    // Check for CDN URL transformation support
    if (url.includes('cloudinary.com') || url.includes('imgix.net')) {
      return this.transformCDNUrl(url, resolution);
    }

    // Check for format support
    const format = this.getBestFormat();
    if (format !== 'original') {
      const urlObj = new URL(url);
      urlObj.searchParams.set('format', format);
      urlObj.searchParams.set('quality', (this.config.compressionQuality * 100).toString());
      if (resolution !== 1) {
        urlObj.searchParams.set('w', Math.round(resolution * 1000).toString());
      }
      return urlObj.toString();
    }

    return url;
  }

  private transformCDNUrl(url: string, resolution: number): string {
    // Example transformations for common CDNs
    const format = this.getBestFormat();
    const quality = Math.round(this.config.compressionQuality * 100);

    if (url.includes('cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        const transforms = [
          `f_${format === 'original' ? 'auto' : format}`,
          `q_${quality}`,
          resolution !== 1 ? `w_${Math.round(resolution * 1000)}` : null
        ].filter(Boolean).join(',');
        
        return `${parts[0]}/upload/${transforms}/${parts[1]}`;
      }
    }

    return url;
  }

  private getBestFormat(): string {
    if (this.supported.avif && this.config.enableAVIF) return 'avif';
    if (this.supported.webp && this.config.enableWebP) return 'webp';
    return 'original';
  }

  private getImageFormat(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(extension)) {
      return extension;
    }
    return 'unknown';
  }

  private getOptimalResolution(element: HTMLElement): number {
    const rect = element.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const screenWidth = rect.width * dpr;

    // Find the best resolution level
    for (const level of this.config.resolutionLevels) {
      if (screenWidth <= level * 1000) {
        return level;
      }
    }

    return this.config.resolutionLevels[this.config.resolutionLevels.length - 1];
  }

  private estimateImageSize(image: HTMLImageElement | ImageBitmap): number {
    const width = 'naturalWidth' in image ? image.naturalWidth : image.width;
    const height = 'naturalHeight' in image ? image.naturalHeight : image.height;
    // Rough estimate: 4 bytes per pixel (RGBA)
    return width * height * 4;
  }

  private getCacheKey(url: string, resolution: number): string {
    return `${url}@${resolution}x`;
  }

  private addToCache(key: string, entry: ImageCacheEntry): void {
    this.cache.set(key, entry);
    this.cacheSize += entry.size;

    // Evict if necessary
    while (this.cacheSize > this.config.maxCacheSize && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey)!;
      this.cache.delete(lruKey);
      this.cacheSize -= entry.size;

      // Clean up ImageBitmap
      if (entry.image instanceof ImageBitmap) {
        entry.image.close();
      }
    }
  }

  observeImage(img: HTMLImageElement): void {
    if (this.observer && img.dataset.src) {
      this.observer.observe(img);
    }
  }

  unobserveImage(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(img);
    }
  }

  preloadImages(urls: string[], priority = 1): void {
    urls.forEach(url => {
      this.loadImage(url, 1, priority);
    });
  }

  getCacheStats() {
    const stats = {
      cacheSize: this.cacheSize,
      cacheEntries: this.cache.size,
      cacheSizeMB: (this.cacheSize / 1024 / 1024).toFixed(2),
      formats: {
        webp: this.supported.webp,
        avif: this.supported.avif,
        imageBitmap: this.supported.imageBitmap
      },
      topAccessed: Array.from(this.cache.entries())
        .sort((a, b) => b[1].accessCount - a[1].accessCount)
        .slice(0, 5)
        .map(([key, entry]) => ({
          key,
          accessCount: entry.accessCount,
          format: entry.format,
          sizeMB: (entry.size / 1024 / 1024).toFixed(2)
        }))
    };

    return stats;
  }

  clearCache(): void {
    // Clean up ImageBitmaps
    for (const entry of this.cache.values()) {
      if (entry.image instanceof ImageBitmap) {
        entry.image.close();
      }
    }

    this.cache.clear();
    this.cacheSize = 0;
  }

  destroy(): void {
    this.clearCache();
    this.loadingQueue = [];
    this.activeLoads.clear();
    
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Progressive image component helper
export class ProgressiveImage {
  private placeholder?: string;
  private src: string;
  private element: HTMLImageElement;
  private optimizer: ImageOptimizer;

  constructor(
    element: HTMLImageElement,
    src: string,
    optimizer: ImageOptimizer,
    placeholder?: string
  ) {
    this.element = element;
    this.src = src;
    this.optimizer = optimizer;
    this.placeholder = placeholder;

    this.init();
  }

  private async init(): Promise<void> {
    // Show placeholder
    if (this.placeholder) {
      this.element.src = this.placeholder;
      this.element.style.filter = 'blur(5px)';
      this.element.style.transition = 'filter 0.3s';
    }

    // Load progressive versions
    const resolutions = [0.1, 0.25, 0.5, 1];
    
    for (const resolution of resolutions) {
      const image = await this.optimizer.loadImage(this.src, resolution);
      
      if (image && image instanceof HTMLImageElement) {
        this.element.src = image.src;
        
        if (resolution === 1) {
          this.element.style.filter = '';
        } else {
          this.element.style.filter = `blur(${5 * (1 - resolution)}px)`;
        }
      }
    }
  }
}

// Global instance
export const imageOptimizer = new ImageOptimizer();