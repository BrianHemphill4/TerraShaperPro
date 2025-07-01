import { MemoryError } from '@/lib/error/errorTypes';
import { handleError } from '@/lib/error/errorHandlers';
import { metricsCollector } from './metricsCollector';

interface MemoryThresholds {
  warning: number; // MB
  critical: number; // MB
}

interface MemorySnapshot {
  timestamp: Date;
  used: number; // MB
  total: number; // MB
  limit: number; // MB
  percentage: number;
}

interface MemoryMonitorConfig {
  checkInterval?: number; // ms
  thresholds?: MemoryThresholds;
  enableAutoCleanup?: boolean;
  onWarning?: (snapshot: MemorySnapshot) => void;
  onCritical?: (snapshot: MemorySnapshot) => void;
}

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private config: MemoryMonitorConfig;
  private checkInterval?: NodeJS.Timeout;
  private snapshots: MemorySnapshot[] = [];
  private isMonitoring = false;
  private cleanupCallbacks: Array<() => Promise<void>> = [];
  private lastWarningTime = 0;
  private lastCriticalTime = 0;

  static getInstance(): MemoryMonitor {
    if (!this.instance) {
      this.instance = new MemoryMonitor();
    }
    return this.instance;
  }

  constructor(config: MemoryMonitorConfig = {}) {
    this.config = {
      checkInterval: 10000, // 10 seconds
      thresholds: {
        warning: 500, // 500 MB
        critical: 750 // 750 MB
      },
      enableAutoCleanup: true,
      ...config
    };
  }

  // Start monitoring memory
  start(): void {
    if (this.isMonitoring) return;

    if (!this.isMemoryAPIAvailable()) {
      console.warn('Memory API not available in this browser');
      return;
    }

    this.isMonitoring = true;
    this.scheduleCheck();
  }

  // Stop monitoring
  stop(): void {
    if (this.checkInterval) {
      clearTimeout(this.checkInterval);
      this.checkInterval = undefined;
    }
    this.isMonitoring = false;
  }

  // Register cleanup callback
  registerCleanupCallback(callback: () => Promise<void>): void {
    this.cleanupCallbacks.push(callback);
  }

  // Get current memory usage
  getCurrentMemory(): MemorySnapshot | null {
    if (!this.isMemoryAPIAvailable()) return null;

    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize / 1048576; // Convert to MB
    const total = memory.totalJSHeapSize / 1048576;
    const limit = memory.jsHeapSizeLimit / 1048576;

    return {
      timestamp: new Date(),
      used: Math.round(used),
      total: Math.round(total),
      limit: Math.round(limit),
      percentage: Math.round((used / limit) * 100)
    };
  }

  // Get memory history
  getHistory(duration?: number): MemorySnapshot[] {
    if (!duration) return [...this.snapshots];

    const cutoff = Date.now() - duration;
    return this.snapshots.filter(s => s.timestamp.getTime() >= cutoff);
  }

  // Get memory statistics
  getStatistics(): Record<string, any> {
    if (this.snapshots.length === 0) {
      return {
        current: this.getCurrentMemory(),
        history: []
      };
    }

    const values = this.snapshots.map(s => s.used);
    const percentages = this.snapshots.map(s => s.percentage);

    return {
      current: this.getCurrentMemory(),
      history: {
        samples: this.snapshots.length,
        avgUsed: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        maxUsed: Math.max(...values),
        minUsed: Math.min(...values),
        avgPercentage: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
        trend: this.calculateTrend()
      }
    };
  }

  // Force garbage collection (if available)
  async forceGarbageCollection(): Promise<void> {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      console.log('Garbage collection triggered');
    } else {
      console.warn('Garbage collection not available');
    }
  }

  // Private methods
  private isMemoryAPIAvailable(): boolean {
    return 'memory' in performance && 
           typeof (performance as any).memory === 'object';
  }

  private scheduleCheck(): void {
    if (!this.isMonitoring) return;

    this.checkInterval = setTimeout(() => {
      this.checkMemory();
      this.scheduleCheck();
    }, this.config.checkInterval!);
  }

  private async checkMemory(): Promise<void> {
    const snapshot = this.getCurrentMemory();
    if (!snapshot) return;

    // Store snapshot
    this.snapshots.push(snapshot);
    
    // Keep only last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots = this.snapshots.slice(-100);
    }

    // Record metrics
    metricsCollector.gauge('memory.used', snapshot.used, 'MB');
    metricsCollector.gauge('memory.percentage', snapshot.percentage, '%');

    // Check thresholds
    if (snapshot.used >= this.config.thresholds!.critical) {
      await this.handleCriticalMemory(snapshot);
    } else if (snapshot.used >= this.config.thresholds!.warning) {
      await this.handleWarningMemory(snapshot);
    }
  }

  private async handleWarningMemory(snapshot: MemorySnapshot): Promise<void> {
    // Debounce warnings (max once per minute)
    const now = Date.now();
    if (now - this.lastWarningTime < 60000) return;
    this.lastWarningTime = now;

    console.warn(`Memory usage warning: ${snapshot.used}MB (${snapshot.percentage}%)`);
    
    // Call custom handler
    this.config.onWarning?.(snapshot);

    // Record metric
    metricsCollector.increment('memory.warning');

    // Try light cleanup
    if (this.config.enableAutoCleanup) {
      await this.performLightCleanup();
    }
  }

  private async handleCriticalMemory(snapshot: MemorySnapshot): Promise<void> {
    // Debounce critical alerts (max once per 5 minutes)
    const now = Date.now();
    if (now - this.lastCriticalTime < 300000) return;
    this.lastCriticalTime = now;

    console.error(`Critical memory usage: ${snapshot.used}MB (${snapshot.percentage}%)`);
    
    // Call custom handler
    this.config.onCritical?.(snapshot);

    // Record metric
    metricsCollector.increment('memory.critical');

    // Report error
    const error = new MemoryError('Critical memory usage detected', {
      context: {
        snapshot,
        threshold: this.config.thresholds!.critical,
        freeMemory: async () => this.performAggressiveCleanup()
      },
      userMessage: 'The application is running low on memory. Some features may be disabled to prevent crashes.'
    });

    handleError(error);

    // Try aggressive cleanup
    if (this.config.enableAutoCleanup) {
      await this.performAggressiveCleanup();
    }
  }

  private async performLightCleanup(): Promise<void> {
    console.log('Performing light memory cleanup...');

    try {
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          await caches.delete(name);
        }
      }

      // Run custom cleanup callbacks (first half)
      const lightCallbacks = this.cleanupCallbacks.slice(0, Math.floor(this.cleanupCallbacks.length / 2));
      
      for (const callback of lightCallbacks) {
        try {
          await callback();
        } catch (error) {
          console.error('Cleanup callback failed:', error);
        }
      }

      // Suggest garbage collection
      await this.forceGarbageCollection();

      metricsCollector.increment('memory.cleanup.light');
    } catch (error) {
      console.error('Light cleanup failed:', error);
    }
  }

  private async performAggressiveCleanup(): Promise<void> {
    console.log('Performing aggressive memory cleanup...');

    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear localStorage if too large
      try {
        const storageSize = new Blob(Object.values(localStorage)).size;
        if (storageSize > 5 * 1024 * 1024) { // 5MB
          // Keep only essential items
          const essentialKeys = ['auth', 'user', 'preferences'];
          const items: Record<string, string> = {};
          
          essentialKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) items[key] = value;
          });

          localStorage.clear();
          
          Object.entries(items).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
        }
      } catch (error) {
        console.error('localStorage cleanup failed:', error);
      }

      // Run all cleanup callbacks
      for (const callback of this.cleanupCallbacks) {
        try {
          await callback();
        } catch (error) {
          console.error('Cleanup callback failed:', error);
        }
      }

      // Clear image caches
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (img.src && !img.src.includes('data:')) {
          img.src = '';
        }
      });

      // Force garbage collection
      await this.forceGarbageCollection();

      metricsCollector.increment('memory.cleanup.aggressive');
    } catch (error) {
      console.error('Aggressive cleanup failed:', error);
    }
  }

  private calculateTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.snapshots.length < 5) return 'stable';

    const recent = this.snapshots.slice(-5);
    const avgRecent = recent.reduce((sum, s) => sum + s.used, 0) / recent.length;
    
    const older = this.snapshots.slice(-10, -5);
    if (older.length === 0) return 'stable';
    
    const avgOlder = older.reduce((sum, s) => sum + s.used, 0) / older.length;

    const diff = avgRecent - avgOlder;
    const threshold = avgOlder * 0.1; // 10% change threshold

    if (diff > threshold) return 'increasing';
    if (diff < -threshold) return 'decreasing';
    return 'stable';
  }

  // Cleanup
  destroy(): void {
    this.stop();
    this.snapshots = [];
    this.cleanupCallbacks = [];
  }
}

// Export singleton instance
export const memoryMonitor = MemoryMonitor.getInstance();

// Convenience functions
export function startMemoryMonitoring(config?: MemoryMonitorConfig): void {
  if (config) {
    Object.assign(memoryMonitor, { config });
  }
  memoryMonitor.start();
}

export function registerMemoryCleanup(callback: () => Promise<void>): void {
  memoryMonitor.registerCleanupCallback(callback);
}