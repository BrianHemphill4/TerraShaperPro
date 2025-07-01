import { performanceMonitor } from './performanceMonitor';

export type MemoryPressure = 'low' | 'medium' | 'high' | 'critical';

export interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  percentage: number;
  pressure: MemoryPressure;
  allocations: number;
  deallocations: number;
}

export interface Cacheable {
  getSize(): number;
  clear(): void;
  evictLRU?(): number;
  getStats?(): { entries: number; size: number };
}

export interface MemoryConfig {
  lowThreshold: number;  // percentage
  mediumThreshold: number;
  highThreshold: number;
  criticalThreshold: number;
  gcInterval: number;  // ms
  monitoringInterval: number;  // ms
  enableAutoGC: boolean;
  enableMetrics: boolean;
}

export class MemoryManager {
  private static instance: MemoryManager;
  private config: MemoryConfig;
  private caches = new Map<string, Cacheable>();
  private memoryStats: MemoryStats;
  private listeners = new Set<(stats: MemoryStats) => void>();
  private gcTimer?: NodeJS.Timeout;
  private monitorTimer?: NodeJS.Timeout;
  private lowMemoryMode = false;
  private lastGCTime = 0;
  private allocationTracking = new Map<string, number>();

  static getInstance(): MemoryManager {
    if (!this.instance) {
      this.instance = new MemoryManager();
    }
    return this.instance;
  }

  constructor(config?: Partial<MemoryConfig>) {
    this.config = {
      lowThreshold: 50,
      mediumThreshold: 70,
      highThreshold: 85,
      criticalThreshold: 95,
      gcInterval: 30000,  // 30 seconds
      monitoringInterval: 1000,  // 1 second
      enableAutoGC: true,
      enableMetrics: true,
      ...config
    };

    this.memoryStats = this.initializeStats();
    this.startMonitoring();
  }

  private initializeStats(): MemoryStats {
    return {
      used: 0,
      total: 0,
      limit: 0,
      percentage: 0,
      pressure: 'low',
      allocations: 0,
      deallocations: 0
    };
  }

  private startMonitoring(): void {
    // Memory monitoring
    this.monitorTimer = setInterval(() => {
      this.updateMemoryStats();
      this.checkMemoryPressure();
      this.notifyListeners();
    }, this.config.monitoringInterval);

    // Garbage collection
    if (this.config.enableAutoGC) {
      this.gcTimer = setInterval(() => {
        this.performGarbageCollection();
      }, this.config.gcInterval);
    }

    // Initial update
    this.updateMemoryStats();
  }

  private updateMemoryStats(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      this.memoryStats.used = memory.usedJSHeapSize;
      this.memoryStats.total = memory.totalJSHeapSize;
      this.memoryStats.limit = memory.jsHeapSizeLimit;
      this.memoryStats.percentage = (this.memoryStats.used / this.memoryStats.limit) * 100;

      // Update pressure level
      const percentage = this.memoryStats.percentage;
      if (percentage >= this.config.criticalThreshold) {
        this.memoryStats.pressure = 'critical';
      } else if (percentage >= this.config.highThreshold) {
        this.memoryStats.pressure = 'high';
      } else if (percentage >= this.config.mediumThreshold) {
        this.memoryStats.pressure = 'medium';
      } else {
        this.memoryStats.pressure = 'low';
      }

      if (this.config.enableMetrics) {
        performanceMonitor.recordMetric({
          name: 'memory-pressure',
          value: percentage,
          unit: 'percentage',
          timestamp: new Date(),
          tags: { pressure: this.memoryStats.pressure }
        });
      }
    }
  }

  private checkMemoryPressure(): void {
    const previousPressure = this.memoryStats.pressure;
    
    // Handle pressure changes
    if (this.memoryStats.pressure !== previousPressure) {
      this.handlePressureChange(this.memoryStats.pressure, previousPressure);
    }

    // Emergency GC for critical pressure
    if (this.memoryStats.pressure === 'critical') {
      this.emergencyGarbageCollection();
    }
  }

  private handlePressureChange(newPressure: MemoryPressure, oldPressure: MemoryPressure): void {
    console.log(`Memory pressure changed from ${oldPressure} to ${newPressure}`);

    switch (newPressure) {
      case 'critical':
        this.enableLowMemoryMode();
        this.aggressiveCacheEviction();
        break;
      case 'high':
        this.enableLowMemoryMode();
        this.moderateCacheEviction();
        break;
      case 'medium':
        this.lightCacheEviction();
        break;
      case 'low':
        this.disableLowMemoryMode();
        break;
    }
  }

  enableLowMemoryMode(): void {
    if (!this.lowMemoryMode) {
      this.lowMemoryMode = true;
      console.log('Low memory mode enabled');
      
      // Notify all caches to reduce quality/size
      this.caches.forEach(cache => {
        if ('enableLowMemoryMode' in cache && typeof cache.enableLowMemoryMode === 'function') {
          cache.enableLowMemoryMode();
        }
      });
    }
  }

  disableLowMemoryMode(): void {
    if (this.lowMemoryMode) {
      this.lowMemoryMode = false;
      console.log('Low memory mode disabled');
      
      // Notify all caches to restore quality
      this.caches.forEach(cache => {
        if ('disableLowMemoryMode' in cache && typeof cache.disableLowMemoryMode === 'function') {
          cache.disableLowMemoryMode();
        }
      });
    }
  }

  private performGarbageCollection(): void {
    const now = performance.now();
    if (now - this.lastGCTime < 5000) return; // Min 5s between GCs

    const startTime = now;
    let totalEvicted = 0;

    // Collect from all caches
    this.caches.forEach((cache, name) => {
      const before = cache.getSize();
      
      if (cache.evictLRU) {
        const evicted = cache.evictLRU();
        totalEvicted += evicted;
      }

      const after = cache.getSize();
      const freed = before - after;

      if (freed > 0 && this.config.enableMetrics) {
        performanceMonitor.recordMetric({
          name: 'memory-gc',
          value: freed,
          unit: 'bytes',
          timestamp: new Date(),
          tags: { cache: name }
        });
      }
    });

    // Force browser GC if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }

    this.lastGCTime = now;
    const gcTime = performance.now() - startTime;

    if (this.config.enableMetrics) {
      performanceMonitor.recordMetric({
        name: 'gc-duration',
        value: gcTime,
        unit: 'ms',
        timestamp: new Date(),
        tags: { 
          evicted: totalEvicted.toString(),
          pressure: this.memoryStats.pressure 
        }
      });
    }
  }

  private emergencyGarbageCollection(): void {
    console.warn('Emergency garbage collection triggered');
    
    // Clear all caches
    this.caches.forEach(cache => {
      cache.clear();
    });

    // Force immediate GC
    this.performGarbageCollection();
    
    // Clear allocation tracking
    this.allocationTracking.clear();
  }

  private aggressiveCacheEviction(): void {
    this.caches.forEach(cache => {
      if (cache.evictLRU) {
        // Evict 50% of cache
        const stats = cache.getStats?.();
        const target = stats ? Math.floor(stats.entries * 0.5) : 10;
        
        for (let i = 0; i < target; i++) {
          cache.evictLRU();
        }
      }
    });
  }

  private moderateCacheEviction(): void {
    this.caches.forEach(cache => {
      if (cache.evictLRU) {
        // Evict 25% of cache
        const stats = cache.getStats?.();
        const target = stats ? Math.floor(stats.entries * 0.25) : 5;
        
        for (let i = 0; i < target; i++) {
          cache.evictLRU();
        }
      }
    });
  }

  private lightCacheEviction(): void {
    this.caches.forEach(cache => {
      if (cache.evictLRU) {
        // Evict 10% of cache
        const stats = cache.getStats?.();
        const target = stats ? Math.floor(stats.entries * 0.1) : 2;
        
        for (let i = 0; i < target; i++) {
          cache.evictLRU();
        }
      }
    });
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.memoryStats));
  }

  // Public API
  registerCache(name: string, cache: Cacheable): void {
    this.caches.set(name, cache);
  }

  unregisterCache(name: string): void {
    this.caches.delete(name);
  }

  trackAllocation(tag: string, size: number): void {
    const current = this.allocationTracking.get(tag) || 0;
    this.allocationTracking.set(tag, current + size);
    this.memoryStats.allocations++;
  }

  trackDeallocation(tag: string, size: number): void {
    const current = this.allocationTracking.get(tag) || 0;
    this.allocationTracking.set(tag, Math.max(0, current - size));
    this.memoryStats.deallocations++;
  }

  getAllocationReport(): Record<string, number> {
    const report: Record<string, number> = {};
    
    this.allocationTracking.forEach((size, tag) => {
      if (size > 0) {
        report[tag] = size;
      }
    });

    return report;
  }

  subscribe(listener: (stats: MemoryStats) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current stats
    listener(this.memoryStats);
    
    return () => this.listeners.delete(listener);
  }

  getStats(): MemoryStats {
    return { ...this.memoryStats };
  }

  getCacheStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    this.caches.forEach((cache, name) => {
      if (cache.getStats) {
        stats[name] = cache.getStats();
      } else {
        stats[name] = { size: cache.getSize() };
      }
    });

    return stats;
  }

  isLowMemoryMode(): boolean {
    return this.lowMemoryMode;
  }

  forceGarbageCollection(): void {
    this.performGarbageCollection();
  }

  setConfig(config: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  destroy(): void {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
    if (this.gcTimer) {
      clearInterval(this.gcTimer);
    }
    
    this.listeners.clear();
    this.caches.clear();
    this.allocationTracking.clear();
  }
}

// React hook for memory monitoring
export function useMemoryMonitor(
  callback?: (stats: MemoryStats) => void
): MemoryStats {
  const [stats, setStats] = React.useState<MemoryStats>(
    memoryManager.getStats()
  );

  React.useEffect(() => {
    const unsubscribe = memoryManager.subscribe(newStats => {
      setStats(newStats);
      callback?.(newStats);
    });

    return unsubscribe;
  }, [callback]);

  return stats;
}

// Global instance
export const memoryManager = MemoryManager.getInstance();