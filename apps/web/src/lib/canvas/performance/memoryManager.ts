/**
 * Memory Management System
 * Monitors and manages memory usage for canvas operations
 */

export interface MemoryStats {
  used: number;
  limit: number;
  available: number;
  percentage: number;
  pressure: 'low' | 'medium' | 'high' | 'critical';
}

export interface MemoryConfig {
  warningThreshold: number;  // Percentage (0-100)
  criticalThreshold: number; // Percentage (0-100)
  gcThreshold: number;       // Percentage (0-100)
  maxTextureSize: number;    // Bytes
  maxCacheSize: number;      // Bytes
}

export class MemoryManager {
  private config: MemoryConfig;
  private caches: Map<string, WeakRef<object>> = new Map();
  private textureCache: Map<string, { size: number; lastUsed: number }> = new Map();
  private totalCacheSize: number = 0;
  private gcScheduled: boolean = false;
  private onMemoryPressure?: (stats: MemoryStats) => void;

  constructor(config?: Partial<MemoryConfig>) {
    this.config = {
      warningThreshold: 70,
      criticalThreshold: 85,
      gcThreshold: 90,
      maxTextureSize: 50 * 1024 * 1024, // 50MB
      maxCacheSize: 100 * 1024 * 1024,  // 100MB
      ...config
    };

    // Set up periodic memory check
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring(): void {
    setInterval(() => {
      const stats = this.getMemoryStats();
      
      if (stats.percentage >= this.config.gcThreshold && !this.gcScheduled) {
        this.scheduleGarbageCollection();
      }

      if (this.onMemoryPressure && stats.pressure !== 'low') {
        this.onMemoryPressure(stats);
      }
    }, 5000); // Check every 5 seconds
  }

  getMemoryStats(): MemoryStats {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const limit = memory.jsHeapSizeLimit;
      const available = limit - used;
      const percentage = (used / limit) * 100;

      let pressure: MemoryStats['pressure'] = 'low';
      if (percentage >= this.config.criticalThreshold) {
        pressure = 'critical';
      } else if (percentage >= this.config.warningThreshold) {
        pressure = 'high';
      } else if (percentage >= 50) {
        pressure = 'medium';
      }

      return { used, limit, available, percentage, pressure };
    }

    // Fallback for browsers without memory API
    return {
      used: 0,
      limit: 0,
      available: 0,
      percentage: 0,
      pressure: 'low'
    };
  }

  registerCache(name: string, cache: object): void {
    this.caches.set(name, new WeakRef(cache));
  }

  addTextureToCache(id: string, size: number): boolean {
    const stats = this.getMemoryStats();
    
    // Don't cache if memory pressure is high
    if (stats.pressure === 'critical') {
      return false;
    }

    // Don't cache if texture is too large
    if (size > this.config.maxTextureSize) {
      return false;
    }

    // Check if adding would exceed cache limit
    if (this.totalCacheSize + size > this.config.maxCacheSize) {
      this.evictOldestTextures(size);
    }

    this.textureCache.set(id, { size, lastUsed: Date.now() });
    this.totalCacheSize += size;
    return true;
  }

  updateTextureUsage(id: string): void {
    const texture = this.textureCache.get(id);
    if (texture) {
      texture.lastUsed = Date.now();
    }
  }

  private evictOldestTextures(neededSpace: number): void {
    const entries = Array.from(this.textureCache.entries())
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);

    let freedSpace = 0;
    for (const [id, { size }] of entries) {
      this.textureCache.delete(id);
      this.totalCacheSize -= size;
      freedSpace += size;

      if (freedSpace >= neededSpace) break;
    }
  }

  clearCache(cacheName?: string): void {
    if (cacheName) {
      const cacheRef = this.caches.get(cacheName);
      const cache = cacheRef?.deref();
      if (cache && 'clear' in cache && typeof cache.clear === 'function') {
        cache.clear();
      }
    } else {
      // Clear all registered caches
      this.caches.forEach((ref, name) => {
        const cache = ref.deref();
        if (cache && 'clear' in cache && typeof cache.clear === 'function') {
          cache.clear();
        }
      });
    }
  }

  clearTextureCache(): void {
    this.textureCache.clear();
    this.totalCacheSize = 0;
  }

  private scheduleGarbageCollection(): void {
    if (this.gcScheduled) return;
    
    this.gcScheduled = true;
    
    // Schedule GC in next idle callback
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.performGarbageCollection();
      }, { timeout: 1000 });
    } else {
      setTimeout(() => {
        this.performGarbageCollection();
      }, 100);
    }
  }

  private performGarbageCollection(): void {
    // Clear all caches
    this.clearCache();
    this.clearTextureCache();

    // Clean up detached DOM nodes
    this.cleanupDetachedNodes();

    // Clean up object pools
    this.cleanupObjectPools();

    this.gcScheduled = false;

    // Force browser GC if possible (non-standard)
    if ('gc' in globalThis && typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc();
    }
  }

  private cleanupDetachedNodes(): void {
    // Find and remove detached DOM nodes
    const allNodes = document.querySelectorAll('*');
    const detached: Element[] = [];

    allNodes.forEach(node => {
      if (!document.body.contains(node) && node.parentNode) {
        detached.push(node);
      }
    });

    detached.forEach(node => {
      node.remove();
    });
  }

  private cleanupObjectPools(): void {
    // Import and clean object pools
    import('./objectPool').then(({ pointPool, rectanglePool, transformPool }) => {
      // Only clear if memory pressure is high
      const stats = this.getMemoryStats();
      if (stats.pressure === 'critical') {
        pointPool.clear();
        rectanglePool.clear();
        transformPool.clear();
      }
    });
  }

  setMemoryPressureCallback(callback: (stats: MemoryStats) => void): void {
    this.onMemoryPressure = callback;
  }

  /**
   * Get memory usage for specific objects
   */
  estimateObjectSize(obj: unknown): number {
    if (obj === null || obj === undefined) return 0;

    const seen = new WeakSet();
    
    function sizeof(obj: unknown): number {
      if (obj === null || obj === undefined) return 0;
      
      const type = typeof obj;
      
      switch (type) {
        case 'boolean': return 4;
        case 'number': return 8;
        case 'string': return 2 * (obj as string).length;
        case 'object':
          if (seen.has(obj as object)) return 0;
          seen.add(obj as object);
          
          if (obj instanceof ArrayBuffer) {
            return obj.byteLength;
          }
          if (obj instanceof Uint8Array || obj instanceof Int8Array) {
            return obj.byteLength;
          }
          if (obj instanceof Uint16Array || obj instanceof Int16Array) {
            return obj.byteLength;
          }
          if (obj instanceof Uint32Array || obj instanceof Int32Array || obj instanceof Float32Array) {
            return obj.byteLength;
          }
          if (obj instanceof Float64Array) {
            return obj.byteLength;
          }
          if (Array.isArray(obj)) {
            return obj.reduce((sum, item) => sum + sizeof(item), 0);
          }
          
          // Regular object
          let size = 0;
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              size += sizeof(key) + sizeof((obj as any)[key]);
            }
          }
          return size;
          
        default:
          return 0;
      }
    }
    
    return sizeof(obj);
  }

  /**
   * Low memory mode utilities
   */
  enableLowMemoryMode(): void {
    // Reduce cache sizes
    this.config.maxTextureSize = 10 * 1024 * 1024; // 10MB
    this.config.maxCacheSize = 50 * 1024 * 1024;   // 50MB
    
    // Clear existing caches
    this.performGarbageCollection();
    
    // Notify other systems
    window.dispatchEvent(new CustomEvent('lowMemoryMode', { detail: true }));
  }

  disableLowMemoryMode(): void {
    // Restore normal cache sizes
    this.config.maxTextureSize = 50 * 1024 * 1024; // 50MB
    this.config.maxCacheSize = 100 * 1024 * 1024;  // 100MB
    
    // Notify other systems
    window.dispatchEvent(new CustomEvent('lowMemoryMode', { detail: false }));
  }
}

// Global memory manager instance
export const memoryManager = new MemoryManager();

// React hook for memory monitoring
export function useMemoryMonitor(
  onMemoryWarning?: (stats: MemoryStats) => void
): MemoryStats {
  const [stats, setStats] = React.useState<MemoryStats>(memoryManager.getMemoryStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      const newStats = memoryManager.getMemoryStats();
      setStats(newStats);
      
      if (onMemoryWarning && newStats.pressure !== 'low') {
        onMemoryWarning(newStats);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [onMemoryWarning]);

  return stats;
}

// Memory-aware image loader
export class MemoryAwareImageLoader {
  private loadingImages: Map<string, Promise<HTMLImageElement>> = new Map();

  async loadImage(
    src: string,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    }
  ): Promise<HTMLImageElement> {
    // Check memory before loading
    const stats = memoryManager.getMemoryStats();
    if (stats.pressure === 'critical') {
      throw new Error('Memory pressure too high to load image');
    }

    // Check if already loading
    const existing = this.loadingImages.get(src);
    if (existing) return existing;

    const promise = this.loadImageInternal(src, options);
    this.loadingImages.set(src, promise);

    try {
      const img = await promise;
      this.loadingImages.delete(src);
      return img;
    } catch (error) {
      this.loadingImages.delete(src);
      throw error;
    }
  }

  private async loadImageInternal(
    src: string,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    }
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Optionally resize if memory pressure is medium or high
        const stats = memoryManager.getMemoryStats();
        if (stats.pressure !== 'low' && options?.maxWidth && options?.maxHeight) {
          this.resizeImage(img, options.maxWidth, options.maxHeight, options.quality)
            .then(resolve)
            .catch(reject);
        } else {
          resolve(img);
        }
      };
      
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  private async resizeImage(
    img: HTMLImageElement,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }

          const newImg = new Image();
          newImg.onload = () => {
            URL.revokeObjectURL(newImg.src);
            resolve(newImg);
          };
          newImg.onerror = () => reject(new Error('Failed to load resized image'));
          newImg.src = URL.createObjectURL(blob);
        },
        'image/jpeg',
        quality
      );
    });
  }
}

// Re-export React for convenience
import React from 'react';