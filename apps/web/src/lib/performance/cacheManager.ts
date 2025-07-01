import { memoryManager, Cacheable } from './memoryManager';
import { performanceMonitor } from './performanceMonitor';

interface CacheEntry<T> {
  value: T;
  size: number;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  ttl?: number;
}

interface CacheConfig {
  maxSize: number;
  maxEntries: number;
  ttl?: number;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
  onEvict?: (key: string, value: any) => void;
  calculateSize?: (value: any) => number;
}

export class CacheManager<T = any> implements Cacheable {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private config: CacheConfig;
  private currentSize = 0;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    sets: 0
  };

  constructor(name: string, config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 1000,
      evictionPolicy: 'lru',
      calculateSize: (value) => {
        if (typeof value === 'string') return value.length * 2;
        if (value instanceof ArrayBuffer) return value.byteLength;
        if (value instanceof Blob) return value.size;
        return JSON.stringify(value).length * 2;
      },
      ...config
    };

    // Register with memory manager
    memoryManager.registerCache(name, this);
  }

  set(key: string, value: T, ttl?: number): void {
    const size = this.config.calculateSize!(value);
    
    // Check if we need to evict before adding
    if (this.currentSize + size > this.config.maxSize || 
        this.cache.size >= this.config.maxEntries) {
      this.evict();
    }

    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    const entry: CacheEntry<T> = {
      value,
      size,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      ttl: ttl || this.config.ttl
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.currentSize += size;
    this.stats.sets++;

    // Track memory allocation
    memoryManager.trackAllocation(`cache-${key}`, size);
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      performanceMonitor.updateCacheHitRate(
        this.stats.hits / (this.stats.hits + this.stats.misses)
      );
      return undefined;
    }

    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }

    // Update access info
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    // Update access order for LRU
    if (this.config.evictionPolicy === 'lru') {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.accessOrder.push(key);
    }

    this.stats.hits++;
    performanceMonitor.updateCacheHitRate(
      this.stats.hits / (this.stats.hits + this.stats.misses)
    );
    
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check TTL
    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.currentSize -= entry.size;
    
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }

    // Track memory deallocation
    memoryManager.trackDeallocation(`cache-${key}`, entry.size);

    return true;
  }

  private evict(): void {
    let evicted = 0;
    const targetSize = this.config.maxSize * 0.9; // Free 10%

    while ((this.currentSize > targetSize || this.cache.size >= this.config.maxEntries) && 
           this.cache.size > 0) {
      const keyToEvict = this.selectEvictionCandidate();
      
      if (!keyToEvict) break;

      const entry = this.cache.get(keyToEvict);
      if (entry && this.config.onEvict) {
        this.config.onEvict(keyToEvict, entry.value);
      }

      this.delete(keyToEvict);
      evicted++;
      this.stats.evictions++;
    }

    if (evicted > 0) {
      performanceMonitor.recordMetric({
        name: 'cache-eviction',
        value: evicted,
        unit: 'entries',
        timestamp: new Date(),
        tags: { policy: this.config.evictionPolicy }
      });
    }
  }

  private selectEvictionCandidate(): string | undefined {
    switch (this.config.evictionPolicy) {
      case 'lru':
        return this.accessOrder[0];
        
      case 'lfu':
        let minAccess = Infinity;
        let candidate: string | undefined;
        
        for (const [key, entry] of this.cache.entries()) {
          if (entry.accessCount < minAccess) {
            minAccess = entry.accessCount;
            candidate = key;
          }
        }
        return candidate;
        
      case 'fifo':
        let oldest = Infinity;
        let oldestKey: string | undefined;
        
        for (const [key, entry] of this.cache.entries()) {
          if (entry.timestamp < oldest) {
            oldest = entry.timestamp;
            oldestKey = key;
          }
        }
        return oldestKey;
        
      case 'ttl':
        // Evict expired entries first
        for (const [key, entry] of this.cache.entries()) {
          if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
            return key;
          }
        }
        // Fall back to LRU
        return this.accessOrder[0];
        
      default:
        return this.accessOrder[0];
    }
  }

  // Cacheable interface implementation
  getSize(): number {
    return this.currentSize;
  }

  clear(): void {
    // Call onEvict for all entries
    if (this.config.onEvict) {
      for (const [key, entry] of this.cache.entries()) {
        this.config.onEvict(key, entry.value);
      }
    }

    // Track memory deallocation
    for (const [key, entry] of this.cache.entries()) {
      memoryManager.trackDeallocation(`cache-${key}`, entry.size);
    }

    this.cache.clear();
    this.accessOrder = [];
    this.currentSize = 0;
  }

  evictLRU(): number {
    const sizeBefore = this.currentSize;
    this.evict();
    return sizeBefore - this.currentSize;
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? this.stats.hits / (this.stats.hits + this.stats.misses)
      : 0;

    return {
      entries: this.cache.size,
      size: this.currentSize,
      maxSize: this.config.maxSize,
      maxEntries: this.config.maxEntries,
      hitRate,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      sets: this.stats.sets,
      utilizationPercent: (this.currentSize / this.config.maxSize) * 100
    };
  }

  // Additional utility methods
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): T[] {
    return Array.from(this.cache.values()).map(entry => entry.value);
  }

  entries(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
  }

  forEach(callback: (value: T, key: string) => void): void {
    this.cache.forEach((entry, key) => callback(entry.value, key));
  }

  prune(): number {
    let pruned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl && now - entry.timestamp > entry.ttl) {
        this.delete(key);
        pruned++;
      }
    }

    return pruned;
  }

  setEvictionPolicy(policy: CacheConfig['evictionPolicy']): void {
    this.config.evictionPolicy = policy;
  }

  resize(maxSize: number, maxEntries: number): void {
    this.config.maxSize = maxSize;
    this.config.maxEntries = maxEntries;
    
    // Evict if necessary
    while ((this.currentSize > maxSize || this.cache.size > maxEntries) && 
           this.cache.size > 0) {
      this.evict();
    }
  }
}

// Specialized cache implementations
export class ImageCache extends CacheManager<HTMLImageElement | ImageBitmap> {
  constructor() {
    super('images', {
      maxSize: 100 * 1024 * 1024, // 100MB
      calculateSize: (img) => {
        if (img instanceof HTMLImageElement) {
          return img.naturalWidth * img.naturalHeight * 4;
        } else if (img instanceof ImageBitmap) {
          return img.width * img.height * 4;
        }
        return 0;
      },
      onEvict: (key, img) => {
        if (img instanceof ImageBitmap) {
          img.close();
        }
      }
    });
  }
}

export class DataCache extends CacheManager<any> {
  constructor() {
    super('data', {
      maxSize: 50 * 1024 * 1024, // 50MB
      ttl: 5 * 60 * 1000, // 5 minutes
      evictionPolicy: 'lru'
    });
  }
}

export class RenderCache extends CacheManager<ImageData> {
  constructor() {
    super('render', {
      maxSize: 200 * 1024 * 1024, // 200MB
      calculateSize: (imageData) => imageData.data.byteLength,
      evictionPolicy: 'lfu'
    });
  }
}

// Multi-level cache
export class MultiLevelCache<T> {
  private l1Cache: CacheManager<T>;
  private l2Cache: CacheManager<T>;
  private l3Cache?: CacheManager<T>;

  constructor(config: {
    l1: Partial<CacheConfig>;
    l2: Partial<CacheConfig>;
    l3?: Partial<CacheConfig>;
  }) {
    this.l1Cache = new CacheManager('l1', config.l1);
    this.l2Cache = new CacheManager('l2', config.l2);
    
    if (config.l3) {
      this.l3Cache = new CacheManager('l3', config.l3);
    }
  }

  async get(key: string): Promise<T | undefined> {
    // Check L1
    let value = this.l1Cache.get(key);
    if (value !== undefined) return value;

    // Check L2
    value = this.l2Cache.get(key);
    if (value !== undefined) {
      // Promote to L1
      this.l1Cache.set(key, value);
      return value;
    }

    // Check L3
    if (this.l3Cache) {
      value = this.l3Cache.get(key);
      if (value !== undefined) {
        // Promote to L2 and L1
        this.l2Cache.set(key, value);
        this.l1Cache.set(key, value);
        return value;
      }
    }

    return undefined;
  }

  set(key: string, value: T, level: 1 | 2 | 3 = 1): void {
    switch (level) {
      case 1:
        this.l1Cache.set(key, value);
        break;
      case 2:
        this.l2Cache.set(key, value);
        break;
      case 3:
        if (this.l3Cache) {
          this.l3Cache.set(key, value);
        }
        break;
    }
  }

  clear(): void {
    this.l1Cache.clear();
    this.l2Cache.clear();
    this.l3Cache?.clear();
  }

  getStats() {
    return {
      l1: this.l1Cache.getStats(),
      l2: this.l2Cache.getStats(),
      l3: this.l3Cache?.getStats()
    };
  }
}

// Global cache instances
export const imageCache = new ImageCache();
export const dataCache = new DataCache();
export const renderCache = new RenderCache();