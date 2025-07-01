import { useEffect, useRef, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsed: number;
  memoryLimit: number;
  renderTime: number;
  updateTime: number;
  drawCalls: number;
  objectCount: number;
  visibleObjectCount: number;
}

export interface PerformanceThresholds {
  minFPS?: number;
  maxFrameTime?: number;
  maxMemoryUsage?: number;
  maxRenderTime?: number;
}

export interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  sampleInterval?: number;
  thresholds?: PerformanceThresholds;
  onPerformanceIssue?: (metric: keyof PerformanceMetrics, value: number) => void;
}

export function usePerformanceMonitor(options: UsePerformanceMonitorOptions = {}) {
  const {
    enabled = true,
    sampleInterval = 1000,
    thresholds = {
      minFPS: 30,
      maxFrameTime: 33,
      maxMemoryUsage: 200 * 1024 * 1024, // 200MB
      maxRenderTime: 16
    },
    onPerformanceIssue
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsed: 0,
    memoryLimit: 0,
    renderTime: 0,
    updateTime: 0,
    drawCalls: 0,
    objectCount: 0,
    visibleObjectCount: 0
  });

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);
  const updateTimesRef = useRef<number[]>([]);
  const drawCallsRef = useRef<number>(0);
  const rafIdRef = useRef<number>();

  // Memory tracking
  const checkMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return { used: 0, limit: 0 };
  }, []);

  // Frame time tracking
  const measureFrame = useCallback((timestamp: number) => {
    if (!enabled) return;

    if (lastFrameTimeRef.current) {
      const frameTime = timestamp - lastFrameTimeRef.current;
      frameTimesRef.current.push(frameTime);

      // Keep only recent samples
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }
    }
    lastFrameTimeRef.current = timestamp;

    rafIdRef.current = requestAnimationFrame(measureFrame);
  }, [enabled]);

  // Start/stop frame monitoring
  useEffect(() => {
    if (enabled) {
      rafIdRef.current = requestAnimationFrame(measureFrame);
    } else if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled, measureFrame]);

  // Calculate metrics at intervals
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      const frameTimes = frameTimesRef.current;
      const renderTimes = renderTimesRef.current;
      const updateTimes = updateTimesRef.current;

      // Calculate FPS and frame time
      let fps = 0;
      let avgFrameTime = 0;
      if (frameTimes.length > 0) {
        avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        fps = 1000 / avgFrameTime;
      }

      // Calculate render and update times
      const avgRenderTime = renderTimes.length > 0
        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
        : 0;

      const avgUpdateTime = updateTimes.length > 0
        ? updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length
        : 0;

      // Get memory info
      const memory = checkMemory();

      // Create new metrics
      const newMetrics: PerformanceMetrics = {
        fps: Math.round(fps),
        frameTime: avgFrameTime,
        memoryUsed: memory.used,
        memoryLimit: memory.limit,
        renderTime: avgRenderTime,
        updateTime: avgUpdateTime,
        drawCalls: drawCallsRef.current,
        objectCount: 0, // These should be set by the canvas
        visibleObjectCount: 0 // These should be set by the canvas
      };

      setMetrics(newMetrics);

      // Check thresholds
      if (onPerformanceIssue) {
        if (thresholds.minFPS && newMetrics.fps < thresholds.minFPS && newMetrics.fps > 0) {
          onPerformanceIssue('fps', newMetrics.fps);
        }
        if (thresholds.maxFrameTime && newMetrics.frameTime > thresholds.maxFrameTime) {
          onPerformanceIssue('frameTime', newMetrics.frameTime);
        }
        if (thresholds.maxMemoryUsage && newMetrics.memoryUsed > thresholds.maxMemoryUsage) {
          onPerformanceIssue('memoryUsed', newMetrics.memoryUsed);
        }
        if (thresholds.maxRenderTime && newMetrics.renderTime > thresholds.maxRenderTime) {
          onPerformanceIssue('renderTime', newMetrics.renderTime);
        }
      }

      // Reset counters
      drawCallsRef.current = 0;
      renderTimesRef.current = [];
      updateTimesRef.current = [];
    }, sampleInterval);

    return () => clearInterval(intervalId);
  }, [enabled, sampleInterval, thresholds, onPerformanceIssue, checkMemory]);

  // Performance measurement helpers
  const startRender = useCallback(() => {
    return performance.now();
  }, []);

  const endRender = useCallback((startTime: number) => {
    const renderTime = performance.now() - startTime;
    renderTimesRef.current.push(renderTime);
    
    // Keep only recent samples
    if (renderTimesRef.current.length > 30) {
      renderTimesRef.current.shift();
    }
  }, []);

  const startUpdate = useCallback(() => {
    return performance.now();
  }, []);

  const endUpdate = useCallback((startTime: number) => {
    const updateTime = performance.now() - startTime;
    updateTimesRef.current.push(updateTime);
    
    // Keep only recent samples
    if (updateTimesRef.current.length > 30) {
      updateTimesRef.current.shift();
    }
  }, []);

  const incrementDrawCalls = useCallback((count: number = 1) => {
    drawCallsRef.current += count;
  }, []);

  const updateObjectCounts = useCallback((total: number, visible: number) => {
    setMetrics(prev => ({
      ...prev,
      objectCount: total,
      visibleObjectCount: visible
    }));
  }, []);

  return {
    metrics,
    startRender,
    endRender,
    startUpdate,
    endUpdate,
    incrementDrawCalls,
    updateObjectCounts
  };
}

// Performance monitor component for visual debugging
export interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  expanded?: boolean;
}

export function PerformanceMonitor({ 
  metrics, 
  position = 'top-right',
  expanded = false 
}: PerformanceMonitorProps) {
  const positionStyles = {
    'top-left': { top: 10, left: 10 },
    'top-right': { top: 10, right: 10 },
    'bottom-left': { bottom: 10, left: 10 },
    'bottom-right': { bottom: 10, right: 10 }
  };

  const formatMemory = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return '#4ade80'; // green
    if (fps >= 30) return '#fbbf24'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...positionStyles[position],
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        minWidth: expanded ? '200px' : '100px'
      }}
    >
      <div style={{ marginBottom: '5px' }}>
        <span style={{ color: getFPSColor(metrics.fps) }}>
          {metrics.fps} FPS
        </span>
      </div>
      
      {expanded && (
        <>
          <div>Frame: {metrics.frameTime.toFixed(1)}ms</div>
          <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
          <div>Update: {metrics.updateTime.toFixed(1)}ms</div>
          <div>Draws: {metrics.drawCalls}</div>
          <div>
            Objects: {metrics.visibleObjectCount}/{metrics.objectCount}
          </div>
          {metrics.memoryUsed > 0 && (
            <div>
              Memory: {formatMemory(metrics.memoryUsed)}
              {metrics.memoryLimit > 0 && 
                ` / ${formatMemory(metrics.memoryLimit)}`
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}