/**
 * Example implementation of a performance-optimized canvas
 * Demonstrates how to use all performance optimization features together
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  ViewportCuller,
  CanvasRenderOptimizer,
  LODManager,
  usePerformanceMonitor,
  PerformanceMonitor,
  memoryManager,
  useMemoryMonitor,
  pointPool,
  rectanglePool,
  withPooledObject,
  PerformancePresets,
  type Cullable,
  type LODObject
} from './index';

interface CanvasObject extends Cullable, LODObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isVisible: boolean;
}

interface PerformanceOptimizedCanvasProps {
  width: number;
  height: number;
  objects: CanvasObject[];
  showPerformanceMonitor?: boolean;
  performancePreset?: 'high' | 'balanced' | 'low' | 'mobile';
}

export function PerformanceOptimizedCanvas({
  width,
  height,
  objects,
  showPerformanceMonitor = true,
  performancePreset = 'balanced'
}: PerformanceOptimizedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportCullerRef = useRef<ViewportCuller>();
  const renderOptimizerRef = useRef<CanvasRenderOptimizer>();
  const lodManagerRef = useRef<LODManager>();
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });

  // Performance monitoring
  const {
    metrics,
    startRender,
    endRender,
    startUpdate,
    endUpdate,
    incrementDrawCalls,
    updateObjectCounts
  } = usePerformanceMonitor({
    enabled: true,
    onPerformanceIssue: (metric, value) => {
      console.warn(`Performance issue: ${metric} = ${value}`);
      
      // Auto-switch to lower quality if needed
      if (metric === 'fps' && value < 30) {
        lodManagerRef.current?.setPerformanceMode(true);
      }
    }
  });

  // Memory monitoring
  const memoryStats = useMemoryMonitor((stats) => {
    if (stats.pressure === 'critical') {
      console.warn('Critical memory pressure detected');
      memoryManager.enableLowMemoryMode();
    }
  });

  // Initialize performance systems
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });
    if (!ctx) return;

    const preset = PerformancePresets[performancePreset];

    // Initialize viewport culler
    viewportCullerRef.current = new ViewportCuller(
      { x: 0, y: 0, width, height, scale: 1 },
      preset.viewport.cullPadding
    );

    // Initialize render optimizer
    renderOptimizerRef.current = new CanvasRenderOptimizer(
      canvas,
      (ctx, region) => renderScene(ctx, region),
      preset.dirtyRect
    );

    // Initialize LOD manager
    lodManagerRef.current = new LODManager(width, height, preset.lod);

    // Register memory caches
    memoryManager.registerCache('viewport', viewportCullerRef.current);
    memoryManager.registerCache('lod', lodManagerRef.current);

    return () => {
      viewportCullerRef.current?.clear();
      lodManagerRef.current?.clear();
    };
  }, [width, height, performancePreset]);

  // Add objects to systems
  useEffect(() => {
    objects.forEach(obj => {
      viewportCullerRef.current?.addObject(obj);
      lodManagerRef.current?.addObject(obj);
    });

    return () => {
      objects.forEach(obj => {
        viewportCullerRef.current?.removeObject(obj.id);
        lodManagerRef.current?.removeObject(obj.id);
      });
    };
  }, [objects]);

  // Render function
  const renderScene = useCallback((ctx: CanvasRenderingContext2D, region: { x: number; y: number; width: number; height: number }) => {
    const renderStart = startRender();

    // Get visible objects
    const visibleObjects = viewportCullerRef.current?.getVisibleObjects() || [];
    
    // Update performance metrics
    updateObjectCounts(objects.length, visibleObjects.length);

    // Render each visible object with appropriate LOD
    visibleObjects.forEach(obj => {
      if (lodManagerRef.current) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        lodManagerRef.current.renderObject(obj.id, ctx);
        ctx.restore();
        incrementDrawCalls();
      }
    });

    endRender(renderStart);
  }, [objects, startRender, endRender, incrementDrawCalls, updateObjectCounts]);

  // Handle viewport changes
  const updateViewport = useCallback((dx: number, dy: number, dScale: number) => {
    const updateStart = startUpdate();

    const newViewport = {
      x: viewport.x + dx,
      y: viewport.y + dy,
      scale: Math.max(0.1, Math.min(5, viewport.scale + dScale))
    };

    setViewport(newViewport);
    
    // Update systems
    viewportCullerRef.current?.updateViewport({
      ...newViewport,
      width,
      height
    });
    
    lodManagerRef.current?.updateZoom(newViewport.scale);

    // Mark entire canvas dirty for now (could be optimized)
    renderOptimizerRef.current?.forceFullRedraw();

    endUpdate(updateStart);
  }, [viewport, width, height, startUpdate, endUpdate]);

  // Mouse/touch handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isPanning = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      updateViewport(-dx / viewport.scale, -dy / viewport.scale, 0);
    };

    const handleMouseUp = () => {
      isPanning = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleDelta = e.deltaY > 0 ? -0.1 : 0.1;
      updateViewport(0, 0, scaleDelta);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [viewport, updateViewport]);

  // Animation loop
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      renderOptimizerRef.current?.render();
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          cursor: 'grab',
          backgroundColor: '#f0f0f0'
        }}
      />
      
      {showPerformanceMonitor && (
        <PerformanceMonitor
          metrics={metrics}
          position="top-right"
          expanded={true}
        />
      )}
      
      {memoryStats.pressure !== 'low' && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '5px 10px',
            backgroundColor: memoryStats.pressure === 'critical' ? '#ef4444' : '#fbbf24',
            color: 'white',
            borderRadius: 5,
            fontSize: 12,
            fontFamily: 'monospace'
          }}
        >
          Memory: {memoryStats.pressure} ({Math.round(memoryStats.percentage)}%)
        </div>
      )}
    </div>
  );
}

// Example object factory
export function createOptimizedCanvasObject(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): CanvasObject {
  return {
    id,
    x,
    y,
    width,
    height,
    color,
    isVisible: true,
    
    getBounds() {
      return { x: this.x, y: this.y, width: this.width, height: this.height };
    },
    
    renderHighDetail(ctx: CanvasRenderingContext2D) {
      // High detail - rounded corners, shadow
      ctx.fillStyle = this.color;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      const radius = Math.min(this.width, this.height) * 0.1;
      ctx.beginPath();
      ctx.roundRect(0, 0, this.width, this.height, radius);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
    },
    
    renderMediumDetail(ctx: CanvasRenderingContext2D) {
      // Medium detail - simple fill
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, this.width, this.height);
    },
    
    renderLowDetail(ctx: CanvasRenderingContext2D) {
      // Low detail - just outline
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, this.width, this.height);
    }
  };
}