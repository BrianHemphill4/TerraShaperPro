import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

// Performance monitoring hook
export function usePerformanceMonitor() {
  const metricsRef = useRef<Map<string, number[]>>(new Map());

  const recordMetric = useCallback((name: string, value: number) => {
    const metrics = metricsRef.current;
    if (!metrics.has(name)) {
      metrics.set(name, []);
    }

    const values = metrics.get(name)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }, []);

  const measure = useCallback(
    <T>(name: string, fn: () => T): T => {
      const start = performance.now();
      const result = fn();
      const end = performance.now();

      recordMetric(name, end - start);
      return result;
    },
    [recordMetric]
  );

  const measureAsync = useCallback(
    async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      const start = performance.now();
      const result = await fn();
      const end = performance.now();

      recordMetric(name, end - start);
      return result;
    },
    [recordMetric]
  );

  const getMetrics = useCallback(() => {
    const result: Record<string, any> = {};

    for (const [name, values] of metricsRef.current) {
      if (values.length === 0) continue;

      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);

      result[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: sum / values.length,
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    }

    return result;
  }, []);

  return {
    recordMetric,
    measure,
    measureAsync,
    getMetrics,
  };
}

// Lazy loading hook with intersection observer
export function useLazyLoad(threshold = 0.1, rootMargin = '50px') {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || isLoaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, isLoaded]);

  return { ref, isVisible, isLoaded };
}

// Image preloading hook
export function useImagePreload(srcs: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (srcs.length === 0) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const loaded = new Set<string>();

    const preloadImage = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          if (mounted) {
            loaded.add(src);
            setLoadedImages(new Set(loaded));
          }
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    };

    Promise.all(srcs.map(preloadImage))
      .then(() => {
        if (mounted) {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.warn('Failed to preload images:', error);
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [srcs]);

  return { loadedImages, isLoading };
}

// Client-side caching hook
export function useClientCache<T>(key: string, ttl = 300000) {
  // 5 minutes default
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cache = useRef<Map<string, { data: T; timestamp: number; ttl: number }>>(new Map());

  const get = useCallback((): T | null => {
    const item = cache.current.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      cache.current.delete(key);
      return null;
    }

    return item.data;
  }, [key]);

  const set = useCallback(
    (newData: T, customTtl?: number) => {
      cache.current.set(key, {
        data: newData,
        timestamp: Date.now(),
        ttl: customTtl || ttl,
      });
      setData(newData);
    },
    [key, ttl]
  );

  const invalidate = useCallback(() => {
    cache.current.delete(key);
    setData(null);
  }, [key]);

  const fetchWithCache = useCallback(
    async <R>(fetchFn: () => Promise<R>, customTtl?: number): Promise<R> => {
      const cached = get() as R | null;
      if (cached) return cached;

      setIsLoading(true);
      try {
        const result = await fetchFn();
        set(result as unknown as T, customTtl);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [get, set]
  );

  useEffect(() => {
    const cached = get();
    if (cached) {
      setData(cached);
    }
  }, [get]);

  return {
    data,
    isLoading,
    set,
    get,
    invalidate,
    fetchWithCache,
  };
}

// Debounced value hook for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttled callback hook
export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const lastCall = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      }
    },
    [callback, delay]
  ) as T;
}

// Memory usage monitoring hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usedPercentage: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('performance' in window && 'memory' in (performance as any)) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Bundle analysis hook
export function useBundleAnalysis() {
  const [bundleInfo, setBundleInfo] = useState<{
    scriptCount: number;
    stylesheetCount: number;
    loadTime: number;
    domContentLoaded: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scripts = document.querySelectorAll('script[src]').length;
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;

    let loadTime = 0;
    let domContentLoaded = 0;

    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      loadTime = timing.loadEventEnd - timing.navigationStart;
      domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    }

    setBundleInfo({
      scriptCount: scripts,
      stylesheetCount: stylesheets,
      loadTime,
      domContentLoaded,
    });
  }, []);

  return bundleInfo;
}

// Dynamic component loader with error boundary
export function useDynamicComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    importFn()
      .then((module) => {
        if (mounted) {
          setComponent(() => module.default);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [importFn]);

  const DynamicComponent = dynamic(importFn, {
    loading: fallback ? () => React.createElement(fallback) : undefined,
    ssr: false,
  });

  return {
    Component: Component || DynamicComponent,
    loading,
    error,
  };
}
