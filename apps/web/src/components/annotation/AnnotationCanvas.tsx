'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { cn } from '@/lib/utils';
import { useMaskStore } from '@/stores/useMaskStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { CATEGORY_COLORS, type AnnotationCategory } from '@terrashaper/shared';
import { MaskLayer } from '@/lib/canvas/MaskLayer';
import { AreaTool } from '@/components/canvas/tools/AreaTool';
import { LineTool } from '@/components/canvas/tools/LineTool';
import { SelectionTool } from '@/components/canvas/tools/SelectionTool';
import { DistanceTool } from '@/components/canvas/measurement/DistanceTool';
import { AreaTool as AreaMeasurementTool } from '@/components/canvas/measurement/AreaTool';
import { PolygonMaskTool } from '@/components/canvas/tools/PolygonMaskTool';
import { BrushMaskTool } from '@/components/canvas/tools/BrushMaskTool';
import { AreaObject } from '@/lib/canvas/objects/AreaObject';
import { LineObject } from '@/lib/canvas/objects/LineObject';
import { useClipboardStore } from '@/stores/canvas/useClipboardStore';
import { useSelectionStore } from '@/stores/canvas/useSelectionStore';
import type { ToolType } from './ToolPalette';

export type AnnotationCanvasProps = {
  className?: string;
  activeTool?: ToolType;
  onMaskCreated?: (mask: any) => void;
  onMaskSelected?: (maskIds: string[]) => void;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
};

export function AnnotationCanvas({
  className,
  activeTool = 'select',
  onMaskCreated,
  onMaskSelected,
  onCanvasReady
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [gridPattern, setGridPattern] = useState<fabric.Pattern | null>(null);

  const { getCurrentScene } = useSceneStore();
  const { 
    getMasksByScene, 
    addMask, 
    drawingCategory,
    setSelectedMasks,
    selectedMaskIds 
  } = useMaskStore();

  const currentScene = getCurrentScene();
  const masks = currentScene ? getMasksByScene(currentScene.id) : [];

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || isInitialized) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f8f9fa',
      selection: activeTool === 'select',
      preserveObjectStacking: true,
      renderOnAddRemove: true,
      skipTargetFind: activeTool !== 'select',
      hoverCursor: 'default',
      moveCursor: 'default'
    });

    // Set high DPI scaling for crisp rendering
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.setDimensions({
      width: 800,
      height: 600
    });
    canvas.setZoom(1);
    
    // Scale for high DPI displays
    const canvasElement = canvas.getElement();
    canvasElement.style.width = '800px';
    canvasElement.style.height = '600px';
    canvasElement.width = 800 * devicePixelRatio;
    canvasElement.height = 600 * devicePixelRatio;
    
    const ctx = canvas.getContext();
    ctx.scale(devicePixelRatio, devicePixelRatio);

    fabricCanvasRef.current = canvas;
    setIsInitialized(true);
    onCanvasReady?.(canvas);

    // Event handlers
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => {
      setSelectedMasks([]);
      onMaskSelected?.([]);
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      setIsInitialized(false);
    };
  }, []);

  // Handle object selection
  const handleSelection = useCallback((e: fabric.IEvent) => {
    const activeObjects = fabricCanvasRef.current?.getActiveObjects() || [];
    const maskIds = activeObjects
      .filter(obj => obj instanceof MaskLayer)
      .map(obj => (obj as MaskLayer).maskId);
    
    setSelectedMasks(maskIds);
    onMaskSelected?.(maskIds);
  }, [setSelectedMasks, onMaskSelected]);

  // Load scene image as background
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !currentScene?.imageUrl) return;

    fabric.Image.fromURL(currentScene.imageUrl, (img) => {
      if (!img || !canvas) return;

      // Calculate scale to fit canvas while maintaining aspect ratio
      const canvasWidth = canvas.width || 800;
      const canvasHeight = canvas.height || 600;
      const imgWidth = img.width || 1;
      const imgHeight = img.height || 1;
      
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY);

      img.set({
        scaleX: scale,
        scaleY: scale,
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        selectable: false,
        evented: false,
        excludeFromExport: false
      });

      // Set as background image
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    }, {
      crossOrigin: 'anonymous'
    });
  }, [currentScene]);

  // Create grid pattern
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const gridSize = 20; // 20px grid (roughly 20cm at scale)
    
    // Create grid pattern
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = gridSize;
    patternCanvas.height = gridSize;
    const patternCtx = patternCanvas.getContext('2d');
    
    if (patternCtx) {
      patternCtx.strokeStyle = '#e2e8f0';
      patternCtx.globalAlpha = 0.15;
      patternCtx.lineWidth = 1;
      
      // Draw grid lines
      patternCtx.beginPath();
      patternCtx.moveTo(0, 0);
      patternCtx.lineTo(gridSize, 0);
      patternCtx.moveTo(0, 0);
      patternCtx.lineTo(0, gridSize);
      patternCtx.stroke();
      
      const pattern = new fabric.Pattern({
        source: patternCanvas,
        repeat: 'repeat'
      });
      
      setGridPattern(pattern);
    }
  }, []);

  // Toggle grid visibility
  const toggleGrid = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !gridPattern) return;

    if (showGrid) {
      canvas.setOverlayImage(null, canvas.renderAll.bind(canvas));
    } else {
      canvas.setOverlayImage(gridPattern as any, canvas.renderAll.bind(canvas));
    }
    
    setShowGrid(!showGrid);
  }, [showGrid, gridPattern]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      // Don't handle shortcuts if user is typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { copyObjects, pasteObjects } = useClipboardStore.getState();
      const { selectedObjects } = useSelectionStore.getState();

      switch (e.key.toLowerCase()) {
        case 'g':
          if (!e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            toggleGrid();
          }
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const activeObjects = canvas.getActiveObjects();
            if (activeObjects.length > 0) {
              copyObjects(activeObjects, canvas);
            }
          }
          break;
        case 'v':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            pasteObjects(canvas);
          }
          break;
        case 'delete':
        case 'backspace':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            const activeObjects = canvas.getActiveObjects();
            activeObjects.forEach(obj => {
              if (obj instanceof MaskLayer) {
                const maskLayer = obj as MaskLayer;
                canvas.remove(obj);
                // TODO: Remove from mask store or mark as deleted
                // removeMask(maskLayer.maskId);
              } else {
                canvas.remove(obj);
              }
            });
            canvas.discardActiveObject();
            canvas.renderAll();
          }
          break;
        case 'escape':
          e.preventDefault();
          canvas.discardActiveObject();
          canvas.renderAll();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleGrid]);

  // Update canvas interaction mode based on active tool
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    switch (activeTool) {
      case 'select':
        canvas.selection = true;
        canvas.skipTargetFind = false;
        canvas.hoverCursor = 'move';
        canvas.moveCursor = 'move';
        canvas.defaultCursor = 'default';
        break;
      case 'area':
      case 'line':
      case 'mask-polygon':
      case 'mask-brush':
      case 'pen-freehand':
        canvas.selection = false;
        canvas.skipTargetFind = true;
        canvas.hoverCursor = 'crosshair';
        canvas.moveCursor = 'crosshair';
        canvas.defaultCursor = 'crosshair';
        break;
      case 'move':
        canvas.selection = false;
        canvas.skipTargetFind = true;
        canvas.hoverCursor = 'grab';
        canvas.moveCursor = 'grabbing';
        canvas.defaultCursor = 'grab';
        break;
    }

    canvas.renderAll();
  }, [activeTool]);

  // Render existing masks
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !currentScene) return;

    // Clear existing mask objects
    const objects = canvas.getObjects().filter(obj => obj instanceof MaskLayer);
    objects.forEach(obj => canvas.remove(obj));

    // Add masks as MaskLayer objects
    masks.forEach(mask => {
      if (mask.path.type === 'Polygon' && Array.isArray(mask.path.coordinates[0])) {
        const points = (mask.path.coordinates[0] as number[][]).map(([x, y]) => ({
          x,
          y
        }));

        const maskLayer = new MaskLayer(points, {
          category: mask.category as AnnotationCategory,
          maskId: mask.id,
          deleted: mask.deleted,
          createdAt: mask.createdAt,
          authorId: mask.authorId
        });

        canvas.add(maskLayer);
      }
    });

    canvas.renderAll();
  }, [masks, currentScene]);

  // Update selection state when selectedMaskIds changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objectsToSelect = canvas.getObjects().filter(obj => 
      obj instanceof MaskLayer && selectedMaskIds.includes((obj as MaskLayer).maskId)
    );

    canvas.discardActiveObject();
    
    if (objectsToSelect.length > 0) {
      if (objectsToSelect.length === 1) {
        canvas.setActiveObject(objectsToSelect[0]);
      } else {
        const selection = new fabric.ActiveSelection(objectsToSelect, {
          canvas
        });
        canvas.setActiveObject(selection);
      }
    }

    canvas.renderAll();
  }, [selectedMaskIds]);

  if (!isInitialized) {
    return (
      <div className={cn(
        'flex items-center justify-center w-full h-full bg-muted',
        className
      )}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Canvas */}
      <canvas 
        ref={canvasRef}
        className="border border-border rounded-lg shadow-sm"
      />
      
      {/* Canvas controls */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          type="button"
          onClick={toggleGrid}
          className={cn(
            'px-2 py-1 text-xs rounded bg-background border shadow-sm',
            'hover:bg-accent transition-colors',
            showGrid && 'bg-primary text-primary-foreground'
          )}
          title="Toggle grid overlay (G)"
        >
          Grid
        </button>
      </div>

      {/* Tool indicator */}
      <div className="absolute bottom-2 left-2 px-2 py-1 text-xs bg-background border rounded shadow-sm">
        <span className="text-muted-foreground">Tool:</span>{' '}
        <span className="font-medium capitalize">{activeTool.replace('-', ' ')}</span>
        {drawingCategory && (
          <>
            <span className="text-muted-foreground mx-2">•</span>
            <span 
              className="inline-block w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: CATEGORY_COLORS[drawingCategory] }}
            />
            <span className="font-medium">{drawingCategory}</span>
          </>
        )}
      </div>

      {/* Canvas Tools */}
      <SelectionTool
        canvas={fabricCanvasRef.current}
        isActive={activeTool === 'select'}
        onSelectionChange={(objects) => {
          console.log('Selection changed:', objects);
        }}
      />
      
      <AreaTool 
        canvas={fabricCanvasRef.current}
        isActive={activeTool === 'area'}
        onAreaCreated={(area) => {
          console.log('Area created:', area);
          // TODO: Add to store or notify parent
        }}
      />
      
      <LineTool 
        canvas={fabricCanvasRef.current}
        isActive={activeTool === 'line'}
        onLineCreated={(line) => {
          console.log('Line created:', line);
          // TODO: Add to store or notify parent
        }}
      />
      
      <DistanceTool
        canvas={fabricCanvasRef.current}
        isActive={activeTool === 'distance'}
        onMeasurementComplete={(measurement) => {
          console.log('Distance measurement created:', measurement);
          // Measurement is automatically added to store by the tool
        }}
      />
      
      <AreaMeasurementTool
        canvas={fabricCanvasRef.current}
        isActive={activeTool === 'area-measure'}
        onMeasurementComplete={(measurement) => {
          console.log('Area measurement created:', measurement);
          // Measurement is automatically added to store by the tool
        }}
      />
      
      <PolygonMaskTool
        canvas={fabricCanvasRef.current}
        isActive={activeTool === 'mask-polygon'}
        onMaskCreated={(mask) => {
          console.log('Polygon mask created:', mask);
          onMaskCreated?.(mask);
        }}
      />
      
      <BrushMaskTool
        canvas={fabricCanvasRef.current}
        isActive={activeTool === 'mask-brush'}
        onMaskCreated={(mask) => {
          console.log('Brush mask created:', mask);
          onMaskCreated?.(mask);
        }}
      />

      {/* Instructions overlay */}
      {activeTool !== 'select' && (
        <div className="absolute bottom-2 right-2 max-w-xs p-2 text-xs bg-background/90 border rounded shadow-sm">
          <div className="space-y-1">
            {activeTool === 'area' && (
              <>
                <p>Click to create landscape areas</p>
                <p className="text-muted-foreground">Enter to finish, Esc to cancel, G for grid</p>
              </>
            )}
            {activeTool === 'line' && (
              <>
                <p>Click to draw lines and edges</p>
                <p className="text-muted-foreground">Snap to angles enabled, Esc to cancel</p>
              </>
            )}
            {activeTool === 'mask-polygon' && (
              <>
                <p>Click to place polygon points</p>
                <p className="text-muted-foreground">Press Enter to complete, Esc to cancel</p>
              </>
            )}
            {activeTool === 'mask-brush' && (
              <>
                <p>Click and drag to paint mask</p>
                <p className="text-muted-foreground">[ ] to resize brush, Esc to cancel</p>
              </>
            )}
            {activeTool === 'pen-freehand' && (
              <>
                <p>Draw freehand curves</p>
                <p className="text-muted-foreground">Automatic Bézier smoothing</p>
              </>
            )}
            {activeTool === 'move' && (
              <>
                <p>Pan and zoom canvas</p>
                <p className="text-muted-foreground">Drag to pan, scroll to zoom</p>
              </>
            )}
            {activeTool === 'distance' && (
              <>
                <p>Click points to measure distance</p>
                <p className="text-muted-foreground">Enter to finish, Esc to cancel, snap enabled</p>
              </>
            )}
            {activeTool === 'area-measure' && (
              <>
                <p>Click to create measurement area</p>
                <p className="text-muted-foreground">Enter to finish, Esc to cancel, shows area & perimeter</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}