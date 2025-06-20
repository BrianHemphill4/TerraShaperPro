'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';
import { metrics } from '@/lib/metrics';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Record the metric
    metrics.recordWebVitals(metric);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Web Vital: ${metric.name}`, {
        value: metric.value,
        rating: (metric as any).rating || 'N/A',
      });
    }
  });

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      metrics.recordCustomMetric(
        'page.visibility.change',
        document.hidden ? 0 : 1,
        'boolean',
        { hidden: document.hidden.toString() }
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Track memory usage (if available)
  useEffect(() => {
    if ('memory' in performance) {
      const trackMemory = () => {
        const memory = (performance as any).memory;
        metrics.recordCustomMetric(
          'browser.memory.used',
          memory.usedJSHeapSize / 1048576, // Convert to MB
          'mb'
        );
        metrics.recordCustomMetric(
          'browser.memory.total',
          memory.totalJSHeapSize / 1048576,
          'mb'
        );
      };

      // Track initially
      trackMemory();

      // Track periodically
      const interval = setInterval(trackMemory, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  // Track connection changes
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const trackConnection = () => {
        metrics.recordCustomMetric(
          'network.effective.type',
          1,
          'count',
          {
            effectiveType: connection.effectiveType || 'unknown',
            downlink: connection.downlink?.toString() || 'unknown',
            rtt: connection.rtt?.toString() || 'unknown',
          }
        );
      };

      trackConnection();
      connection.addEventListener('change', trackConnection);
      return () => {
        connection.removeEventListener('change', trackConnection);
      };
    }
  }, []);

  return null;
}