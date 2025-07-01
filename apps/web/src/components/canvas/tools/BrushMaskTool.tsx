'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useMaskStore } from '@/stores/useMaskStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { MaskLayer, type MaskLayerOptions } from '@/lib/canvas/MaskLayer';
import { CATEGORY_COLORS } from '@terrashaper/shared';
import { useAdvancedUndoRedo } from '@/hooks/useAdvancedUndoRedo';
// No need for uuid import

interface BrushMaskToolProps {
  canvas: fabric.Canvas | null;
  isActive: boolean;
  onMaskCreated?: (mask: any) => void;
}

export const BrushMaskTool = ({ canvas, isActive, onMaskCreated }: BrushMaskToolProps) => {
  const { addMask, drawingCategory, setDrawing, isDrawing } = useMaskStore();
  const { getCurrentScene } = useSceneStore();
  const { executeCommand } = useAdvancedUndoRedo(canvas);
  
  const [isActiveLocal, setIsActiveLocal] = useState(false);
  const [brushPath, setBrushPath] = useState<fabric.Point[]>([]);
  const [currentBrush, setCurrentBrush] = useState<fabric.Path | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isPressed, setIsPressed] = useState(false);
  
  const brushPreview = useRef<fabric.Circle | null>(null);
  const pathString = useRef<string>('');

  // Update canvas when tool is active
  useEffect(() => {
    if (!canvas) return;

    if (isActive) {
      canvas.defaultCursor = 'none'; // Hide cursor, we'll show brush preview
      canvas.hoverCursor = 'none';
      canvas.selection = false;
      canvas.isDrawingMode = false; // We handle drawing manually
      setIsActiveLocal(true);
      
      // Create brush preview circle
      createBrushPreview();
    } else {
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      canvas.selection = true;
      canvas.isDrawingMode = false;
      setIsActiveLocal(false);
      
      // Remove brush preview
      removeBrushPreview();
      cancelCurrentBrush();
    }
  }, [canvas, isActive]);

  // Handle mouse events for brush drawing
  useEffect(() => {
    if (!canvas || !isActive) return;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!e.pointer) return;
      
      setIsPressed(true);
      setDrawing(true);
      
      const point = new fabric.Point(e.pointer.x, e.pointer.y);
      setBrushPath([point]);
      pathString.current = `M ${point.x} ${point.y}`;
      
      // Start new brush stroke
      startBrushStroke(point);
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!e.pointer) return;
      
      // Update brush preview position
      updateBrushPreview(e.pointer);
      
      if (isPressed && isDrawing) {
        const point = new fabric.Point(e.pointer.x, e.pointer.y);
        addPointToBrush(point);
      }
    };

    const handleMouseUp = () => {
      if (isPressed && isDrawing) {
        setIsPressed(false);
        completeBrushStroke();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelCurrentBrush();
      }
      
      // Brush size controls
      if (e.key === '[' && brushSize > 5) {
        setBrushSize(prev => Math.max(5, prev - 5));
        updateBrushPreview();
      } else if (e.key === ']' && brushSize < 100) {
        setBrushSize(prev => Math.min(100, prev + 5));
        updateBrushPreview();
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, isActive, isPressed, isDrawing, brushSize]);

  const createBrushPreview = useCallback(() => {
    if (!canvas) return;

    const preview = new fabric.Circle({
      radius: brushSize / 2,
      fill: 'transparent',
      stroke: CATEGORY_COLORS[drawingCategory],
      strokeWidth: 2,
      selectable: false,
      evented: false,
      opacity: 0.7,
      strokeDashArray: [3, 3],
    });

    brushPreview.current = preview;
    canvas.add(preview);
  }, [canvas, brushSize, drawingCategory]);

  const removeBrushPreview = useCallback(() => {
    if (!canvas || !brushPreview.current) return;

    canvas.remove(brushPreview.current);
    brushPreview.current = null;
  }, [canvas]);

  const updateBrushPreview = useCallback((pointer?: { x: number; y: number }) => {
    if (!canvas || !brushPreview.current) return;

    if (pointer) {
      brushPreview.current.set({
        left: pointer.x,
        top: pointer.y,
        radius: brushSize / 2,
      });
    } else {
      brushPreview.current.set({
        radius: brushSize / 2,
      });
    }

    canvas.renderAll();
  }, [canvas, brushSize]);

  const startBrushStroke = useCallback((startPoint: fabric.Point) => {
    // Initialize brush stroke
    pathString.current = `M ${startPoint.x} ${startPoint.y}`;
  }, []);

  const addPointToBrush = useCallback((point: fabric.Point) => {
    setBrushPath(prev => {
      const newPath = [...prev, point];
      
      // Add to path string for smooth curves
      if (newPath.length === 2) {
        pathString.current += ` L ${point.x} ${point.y}`;
      } else if (newPath.length > 2) {
        // Use quadratic curves for smoother lines
        const prevPoint = newPath[newPath.length - 2];
        const controlX = (prevPoint.x + point.x) / 2;
        const controlY = (prevPoint.y + point.y) / 2;
        pathString.current += ` Q ${prevPoint.x} ${prevPoint.y} ${controlX} ${controlY}`;
      }
      
      updateCurrentBrush();
      return newPath;
    });
  }, []);

  const updateCurrentBrush = useCallback(() => {
    if (!canvas || brushPath.length === 0) return;

    // Remove existing current brush
    if (currentBrush) {
      canvas.remove(currentBrush);
    }

    // Create new brush path
    const path = new fabric.Path(pathString.current, {
      fill: 'transparent',
      stroke: CATEGORY_COLORS[drawingCategory],
      strokeWidth: brushSize,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      selectable: false,
      evented: false,
      opacity: 0.7,
    });

    canvas.add(path);
    setCurrentBrush(path);
    canvas.renderAll();
  }, [canvas, brushPath, currentBrush, drawingCategory, brushSize]);

  const completeBrushStroke = useCallback(async () => {
    if (!canvas || brushPath.length < 2) {
      cancelCurrentBrush();
      return;
    }

    const currentScene = getCurrentScene();
    if (!currentScene) return;

    // Convert brush path to polygon for mask storage
    const simplifiedPath = simplifyPath(brushPath);
    const maskPolygon = createPolygonFromBrush(simplifiedPath);

    if (maskPolygon.length < 3) {
      cancelCurrentBrush();
      return;
    }

    // Remove current brush preview
    if (currentBrush) {
      canvas.remove(currentBrush);
    }

    // Create mask layer
    const maskId = `mask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const maskOptions: MaskLayerOptions = {
      category: drawingCategory,
      deleted: false,
      createdAt: new Date(),
      authorId: 'current-user', // TODO: Get from auth
      maskId,
    };

    const maskLayer = new MaskLayer(maskPolygon, maskOptions);
    
    // Add to canvas
    canvas.add(maskLayer);
    canvas.renderAll();

    // Create command for undo/redo
    const command = {
      type: 'object_add' as const,
      execute: async () => {
        canvas.add(maskLayer);
        canvas.renderAll();
      },
      undo: async () => {
        canvas.remove(maskLayer);
        canvas.renderAll();
      },
      description: `Create ${drawingCategory} brush mask`,
    };

    try {
      await executeCommand(command);
    } catch (error) {
      console.error('Failed to execute brush mask creation command:', error);
      // Add directly if command fails
      canvas.add(maskLayer);
    }

    // Add to store
    const maskData = {
      id: maskId,
      sceneId: currentScene.id,
      category: drawingCategory,
      path: {
        type: 'Polygon' as const,
        coordinates: [maskPolygon.map(p => [p.x, p.y])],
      },
      deleted: false,
      authorId: 'current-user',
      createdAt: new Date(),
    };

    addMask(maskData);
    onMaskCreated?.(maskData);

    // Reset state
    resetTool();
  }, [canvas, brushPath, currentBrush, drawingCategory, getCurrentScene, executeCommand, addMask, onMaskCreated]);

  const cancelCurrentBrush = useCallback(() => {
    if (!canvas) return;

    // Remove current brush
    if (currentBrush) {
      canvas.remove(currentBrush);
      setCurrentBrush(null);
    }

    resetTool();
    canvas.renderAll();
  }, [canvas, currentBrush]);

  const resetTool = useCallback(() => {
    setDrawing(false);
    setBrushPath([]);
    setCurrentBrush(null);
    setIsPressed(false);
    pathString.current = '';
  }, [setDrawing]);

  // Simplify path to reduce points while maintaining shape
  const simplifyPath = useCallback((points: fabric.Point[]): fabric.Point[] => {
    if (points.length <= 2) return points;

    const simplified: fabric.Point[] = [points[0]];
    const tolerance = 5; // Pixels

    for (let i = 1; i < points.length - 1; i++) {
      const prev = simplified[simplified.length - 1];
      const current = points[i];
      const distance = prev.distanceFrom(current);

      if (distance > tolerance) {
        simplified.push(current);
      }
    }

    simplified.push(points[points.length - 1]);
    return simplified;
  }, []);

  // Create a polygon outline from brush path for mask storage
  const createPolygonFromBrush = useCallback((points: fabric.Point[]): fabric.Point[] => {
    if (points.length < 2) return [];

    const halfBrush = brushSize / 2;
    const polygon: fabric.Point[] = [];

    // Create top edge of brush stroke
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      let normal: fabric.Point;

      if (i === 0) {
        // First point
        const next = points[i + 1];
        const direction = new fabric.Point(next.x - point.x, next.y - point.y);
        normal = new fabric.Point(-direction.y, direction.x);
      } else if (i === points.length - 1) {
        // Last point
        const prev = points[i - 1];
        const direction = new fabric.Point(point.x - prev.x, point.y - prev.y);
        normal = new fabric.Point(-direction.y, direction.x);
      } else {
        // Middle points
        const prev = points[i - 1];
        const next = points[i + 1];
        const direction = new fabric.Point(next.x - prev.x, next.y - prev.y);
        normal = new fabric.Point(-direction.y, direction.x);
      }

      // Normalize
      const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      if (length > 0) {
        normal.x = (normal.x / length) * halfBrush;
        normal.y = (normal.y / length) * halfBrush;
      }

      polygon.push(new fabric.Point(point.x + normal.x, point.y + normal.y));
    }

    // Create bottom edge (reverse order)
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      let normal: fabric.Point;

      if (i === 0) {
        const next = points[i + 1];
        const direction = new fabric.Point(next.x - point.x, next.y - point.y);
        normal = new fabric.Point(direction.y, -direction.x);
      } else if (i === points.length - 1) {
        const prev = points[i - 1];
        const direction = new fabric.Point(point.x - prev.x, point.y - prev.y);
        normal = new fabric.Point(direction.y, -direction.x);
      } else {
        const prev = points[i - 1];
        const next = points[i + 1];
        const direction = new fabric.Point(next.x - prev.x, next.y - prev.y);
        normal = new fabric.Point(direction.y, -direction.x);
      }

      // Normalize
      const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      if (length > 0) {
        normal.x = (normal.x / length) * halfBrush;
        normal.y = (normal.y / length) * halfBrush;
      }

      polygon.push(new fabric.Point(point.x + normal.x, point.y + normal.y));
    }

    return polygon;
  }, [brushSize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      removeBrushPreview();
      cancelCurrentBrush();
    };
  }, [removeBrushPreview, cancelCurrentBrush]);

  return null; // This is a tool component, no UI to render
};