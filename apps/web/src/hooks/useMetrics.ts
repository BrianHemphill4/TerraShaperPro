import type { Transaction } from '@sentry/types';
import { useCallback, useEffect, useRef } from 'react';

import { metrics } from '@/lib/metrics';

export type UseMetricsOptions = {
  componentName?: string;
  trackRender?: boolean;
  trackInteractions?: boolean;
}

export function useMetrics(options: UseMetricsOptions = {}) {
  const { componentName, trackRender = true, trackInteractions = false } = options;
  const renderStartRef = useRef<number>();
  const transactionRef = useRef<Transaction>();

  // Track component render time
  useEffect(() => {
    if (trackRender && componentName) {
      if (!renderStartRef.current) {
        renderStartRef.current = performance.now();
      } else {
        const renderTime = performance.now() - renderStartRef.current;
        metrics.recordMetric({
          name: `component.render.${componentName}`,
          value: renderTime,
          unit: 'ms',
          tags: {
            component: componentName,
          },
        });
      }
    }
  });

  // Start a transaction
  const startTransaction = useCallback((name: string, op?: string) => {
    transactionRef.current = metrics.startTransaction(name, op);
    return transactionRef.current;
  }, []);

  // Finish the current transaction
  const finishTransaction = useCallback(() => {
    if (transactionRef.current) {
      metrics.finishTransaction(transactionRef.current);
      transactionRef.current = undefined;
    }
  }, []);

  // Track an interaction
  const trackInteraction = useCallback((action: string, metadata?: Record<string, string>) => {
    if (trackInteractions && componentName) {
      metrics.recordMetric({
        name: `interaction.${componentName}.${action}`,
        value: 1,
        unit: 'count',
        tags: {
          component: componentName,
          action,
          ...metadata,
        },
      });
    }
  }, [componentName, trackInteractions]);

  // Track API call
  const trackApiCall = useCallback(async <T,>(
    endpoint: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    const start = performance.now();
    let status = 200;
    
    try {
      const result = await fn();
      return result;
    } catch (error) {
      status = error instanceof Error && 'status' in error ? (error as any).status : 500;
      throw error;
    } finally {
      const duration = performance.now() - start;
      metrics.recordApiCall(endpoint, duration, status);
    }
  }, []);

  // Track canvas operation
  const trackCanvasOperation = useCallback(<T,>(
    operation: string,
    fn: () => T
  ): T => {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      metrics.recordCanvasMetric(operation, duration);
    }
  }, []);

  // Track custom metric
  const trackMetric = useCallback((
    name: string,
    value: number,
    unit: string = 'count',
    tags?: Record<string, string>
  ) => {
    metrics.recordCustomMetric(name, value, unit, tags);
  }, []);

  // Track timing
  const trackTiming = useCallback(<T,>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T => {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      metrics.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        tags,
      });
    }
  }, []);

  // Clean up transaction on unmount
  useEffect(() => {
    return () => {
      if (transactionRef.current) {
        finishTransaction();
      }
    };
  }, [finishTransaction]);

  return {
    startTransaction,
    finishTransaction,
    trackInteraction,
    trackApiCall,
    trackCanvasOperation,
    trackMetric,
    trackTiming,
  };
}