import type { NextWebVitalsMetric } from 'next/app';
import { unstable_cache } from 'next/cache';

import { browserLogger } from './logger';
import { ApiMetrics } from './metrics';

// Cache configuration
export const CACHE_TAGS = {
  PROJECTS: 'projects',
  PLANTS: 'plants',
  BILLING: 'billing',
  TEAM: 'team',
  USER: 'user',
} as const;

export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Simple cache function without React dependency
export const getCachedProjects = async (_userId: string) => {
  // This would be replaced with actual API call
  return [];
};

export const getCachedPlants = async (_filters?: Record<string, any>) => {
  // This would be replaced with actual API call
  return [];
};

// Next.js unstable_cache for data fetching
export const getCachedProjectStats = unstable_cache(
  async (_projectId: string) => {
    // This would be replaced with actual API call
    return {};
  },
  ['project-stats'],
  {
    revalidate: CACHE_DURATIONS.MEDIUM,
    tags: [CACHE_TAGS.PROJECTS],
  }
);

export const getCachedBillingData = unstable_cache(
  async (_userId: string) => {
    // This would be replaced with actual API call
    return {};
  },
  ['billing-data'],
  {
    revalidate: CACHE_DURATIONS.LONG,
    tags: [CACHE_TAGS.BILLING],
  }
);

// Client-side caching utilities
class ClientCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl = CACHE_DURATIONS.MEDIUM * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const clientCache = new ClientCache();

// Cleanup expired cache entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    clientCache.cleanup();
  }, 300000);
}

// Image optimization utilities
export const getOptimizedImageUrl = (src: string, width: number, height?: number, quality = 75) => {
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  });

  if (height) {
    params.set('h', height.toString());
  }

  return `/_next/image?${params.toString()}`;
};

// Preload critical resources
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (srcs: string[]): Promise<void> => {
  await Promise.all(srcs.map(preloadImage));
};

// Font preloading
export const preloadFont = (href: string, type = 'font/woff2') => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = 'font';
  link.type = type;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

// Critical CSS inlining
export const inlineCriticalCSS = (css: string) => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure function execution time
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();

    this.recordMetric(name, end - start);
    return result;
  }

  // Measure async function execution time
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();

    this.recordMetric(name, end - start);
    return result;
  }

  // Record a metric
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const values = this.metrics.get(name)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get metric statistics
  getMetricStats(name: string) {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: sum / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  // Get all metrics
  getAllMetrics() {
    const result: Record<string, any> = {};
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    return result;
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Bundle analysis helpers
export const analyzeBundle = () => {
  if (typeof window === 'undefined') return;

  // Check for large dependencies
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  browserLogger.info('Bundle Analysis', {
    scripts: scripts.length,
    stylesheets: stylesheets.length,
  });

  // Performance navigation timing
  if ('performance' in window && 'navigation' in performance) {
    const nav = performance.navigation;
    browserLogger.info('Navigation metrics', {
      type: nav.type,
      redirectCount: nav.redirectCount,
    });
  }

  // Performance timing
  if ('performance' in window && 'timing' in performance) {
    const timing = performance.timing;
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    const firstPaint = timing.responseStart - timing.navigationStart;

    browserLogger.info('Performance timing', {
      pageLoadTime,
      domContentLoaded,
      firstPaint,
      unit: 'ms',
    });
  }
};

// Lazy loading intersection observer
export const createLazyLoadObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined') return null;

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  const memory = (performance as any).memory;
  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  };
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    browserLogger.info('Service Worker registered', {
      scope: registration.scope,
      active: registration.active?.state,
    });
    return registration;
  } catch (error) {
    browserLogger.error('Service Worker registration failed', error);
  }
};

function logPerformanceEvent(name: string, data?: Record<string, any>) {
  ApiMetrics.getInstance().recordCustom(name, 1, 'count', data);
}

function logPerformanceError(error: Error, context?: Record<string, any>) {
  ApiMetrics.getInstance().recordCustom('performance.error', 1, 'count', {
    error: error.message,
    ...context,
  });
}

// Replace console.log statements with metric logging
function reportWebVitals(metric: NextWebVitalsMetric) {
  logPerformanceEvent(`web-vitals.${metric.name}`, {
    value: metric.value,
    id: metric.id,
    label: metric.label || 'none',
  });
}

function reportResourceTiming(entry: PerformanceResourceTiming) {
  logPerformanceEvent('resource.timing', {
    name: entry.name,
    duration: entry.duration,
    initiatorType: entry.initiatorType,
    size: entry.transferSize?.toString() || '0',
  });
}

function reportNavigationTiming(entry: PerformanceNavigationTiming) {
  logPerformanceEvent('navigation.timing', {
    type: entry.type,
    duration: entry.duration,
    redirectCount: entry.redirectCount?.toString() || '0',
  });
}
