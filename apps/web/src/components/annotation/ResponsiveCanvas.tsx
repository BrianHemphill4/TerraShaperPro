'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { ResponsiveCanvasAdapter } from '@/lib/canvas/responsiveCanvasAdapter';
import { TouchGestureManager } from '@/lib/canvas/touchGestureManager';
import { MobileToolManager } from '@/lib/canvas/mobileAnnotationTools';
import { deviceDetector } from '@/lib/deviceCapabilities';
import { useResponsiveStore } from '@/stores/useResponsiveStore';
import { cn } from '@/lib/utils';

interface ResponsiveCanvasProps {
  imageUrl?: string;
  annotations?: any[];
  selectedTool?: string;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onSelectionChange?: (selected: fabric.Object | null) => void;
  onAnnotationAdd?: (annotation: fabric.Object) => void;
  onAnnotationUpdate?: (annotation: fabric.Object) => void;
  onAnnotationDelete?: (annotation: fabric.Object) => void;
  className?: string;
}

export function ResponsiveCanvas({
  imageUrl,
  annotations = [],
  selectedTool = 'select',
  onCanvasReady,
  onSelectionChange,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  className
}: ResponsiveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const responsiveAdapterRef = useRef<ResponsiveCanvasAdapter | null>(null);
  const gestureManagerRef = useRef<TouchGestureManager | null>(null);
  const toolManagerRef = useRef<MobileToolManager | null>(null);
  
  const { deviceType, isTouch, performanceMode } = useResponsiveStore();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Get optimized settings based on device
    const canvasSettings = deviceDetector.getCanvasSettings();
    
    // Create fabric canvas with optimized settings
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      ...canvasSettings,
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
      backgroundColor: '#f5f5f5'
    });

    // Setup responsive adapter
    responsiveAdapterRef.current = new ResponsiveCanvasAdapter({
      canvas: fabricCanvas,
      container: containerRef.current,
      constraints: {
        minZoom: 0.1,
        maxZoom: canvasSettings.maxZoom,
        panBounds: {
          left: -1000,
          top: -1000,
          right: 1000,
          bottom: 1000
        }
      },
      maintainAspectRatio: true,
      centerOnResize: true,
      mobileOptimizations: isTouch
    });

    // Setup touch gestures if on touch device
    if (isTouch) {
      gestureManagerRef.current = new TouchGestureManager(fabricCanvas, {
        onPinchZoom: (scale, center) => {
          const zoom = fabricCanvas.getZoom() * scale;
          fabricCanvas.zoomToPoint(new fabric.Point(center.x, center.y), zoom);
        },
        onTwoFingerPan: (delta) => {
          const vpt = fabricCanvas.viewportTransform!;
          vpt[4] += delta.x;
          vpt[5] += delta.y;
          fabricCanvas.setViewportTransform(vpt);
          fabricCanvas.renderAll();
        },
        onDoubleTap: (point) => {
          // Zoom in on double tap
          const zoom = fabricCanvas.getZoom() * 1.5;
          fabricCanvas.zoomToPoint(new fabric.Point(point.x, point.y), zoom);
        },
        onLongPress: (point) => {
          // Show context menu or select object
          const target = fabricCanvas.findTarget(new MouseEvent('click') as any, false);
          if (target) {
            fabricCanvas.setActiveObject(target);
            fabricCanvas.renderAll();
          }
        }
      });

      // Enable mobile-specific features
      responsiveAdapterRef.current.enablePinchZoom();
      responsiveAdapterRef.current.enableMobilePan();
      
      // Setup mobile tool manager
      toolManagerRef.current = new MobileToolManager(fabricCanvas);
    }

    // Setup event handlers
    fabricCanvas.on('selection:created', (e) => {
      onSelectionChange?.(e.selected?.[0] || null);
    });

    fabricCanvas.on('selection:updated', (e) => {
      onSelectionChange?.(e.selected?.[0] || null);
    });

    fabricCanvas.on('selection:cleared', () => {
      onSelectionChange?.(null);
    });

    fabricCanvas.on('object:added', (e) => {
      if (!e.target.data?.isBackground) {
        onAnnotationAdd?.(e.target);
      }
    });

    fabricCanvas.on('object:modified', (e) => {
      onAnnotationUpdate?.(e.target);
    });

    fabricCanvas.on('object:removed', (e) => {
      onAnnotationDelete?.(e.target);
    });

    setCanvas(fabricCanvas);
    onCanvasReady?.(fabricCanvas);
    setIsLoading(false);

    // Cleanup
    return () => {
      responsiveAdapterRef.current?.destroy();
      gestureManagerRef.current?.destroy();
      toolManagerRef.current?.destroy();
      fabricCanvas.dispose();
    };
  }, []);

  // Load background image
  useEffect(() => {
    if (!canvas || !imageUrl) return;

    setIsLoading(true);
    
    fabric.Image.fromURL(imageUrl, (img) => {
      // Scale image to fit canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const scale = Math.min(
        canvasWidth / img.width!,
        canvasHeight / img.height!
      );

      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
        data: { isBackground: true }
      });

      // Center image
      img.center();

      // Add to canvas
      canvas.setBackgroundImage(img, () => {
        canvas.renderAll();
        setIsLoading(false);
        
        // Fit to viewport after image loads
        responsiveAdapterRef.current?.fitToViewport();
      });
    });
  }, [canvas, imageUrl]);

  // Load annotations
  useEffect(() => {
    if (!canvas || annotations.length === 0) return;

    annotations.forEach(annotation => {
      fabric.util.enlivenObjects([annotation], (objects) => {
        objects.forEach(obj => {
          canvas.add(obj);
        });
        canvas.renderAll();
      });
    });
  }, [canvas, annotations]);

  // Update selected tool
  useEffect(() => {
    if (!canvas) return;

    if (isTouch && toolManagerRef.current) {
      toolManagerRef.current.setTool(selectedTool);
    } else {
      // Desktop tool handling
      switch (selectedTool) {
        case 'select':
          canvas.isDrawingMode = false;
          canvas.selection = true;
          break;
        case 'brush':
          canvas.isDrawingMode = true;
          canvas.freeDrawingBrush.width = 5;
          canvas.freeDrawingBrush.color = '#007bff';
          break;
        default:
          canvas.isDrawingMode = false;
          canvas.selection = false;
      }
    }
  }, [canvas, selectedTool, isTouch]);

  // Performance optimizations based on mode
  useEffect(() => {
    if (!canvas) return;

    switch (performanceMode) {
      case 'low':
        canvas.renderOnAddRemove = false;
        canvas.stateful = false;
        canvas.enableRetinaScaling = false;
        break;
      case 'medium':
        canvas.renderOnAddRemove = true;
        canvas.stateful = false;
        canvas.enableRetinaScaling = false;
        break;
      case 'high':
        canvas.renderOnAddRemove = true;
        canvas.stateful = true;
        canvas.enableRetinaScaling = true;
        break;
    }
  }, [canvas, performanceMode]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-hidden bg-gray-100',
        className
      )}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-sm text-gray-600">Loading canvas...</p>
          </div>
        </div>
      )}

      {/* Canvas element */}
      <canvas 
        ref={canvasRef}
        className={cn(
          'absolute inset-0',
          isTouch && 'touch-none' // Disable browser touch handling
        )}
      />

      {/* Touch gesture indicators */}
      {isTouch && deviceType === 'mobile' && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
          <div className="bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            Pinch to zoom • Two fingers to pan
          </div>
        </div>
      )}

      {/* Performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {deviceType} • {performanceMode} performance
        </div>
      )}
    </div>
  );
}