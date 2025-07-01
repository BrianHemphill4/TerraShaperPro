'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useMaskStore } from '@/stores/useMaskStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { MaskLayer, type MaskLayerOptions } from '@/lib/canvas/MaskLayer';
import { CATEGORY_COLORS } from '@terrashaper/shared';
import { useAdvancedUndoRedo } from '@/hooks/useAdvancedUndoRedo';
// No need for uuid import

interface PolygonMaskToolProps {
  canvas: fabric.Canvas | null;
  isActive: boolean;
  onMaskCreated?: (mask: any) => void;
}

export const PolygonMaskTool = ({ canvas, isActive, onMaskCreated }: PolygonMaskToolProps) => {
  const { addMask, drawingCategory, setDrawing, isDrawing } = useMaskStore();
  const { getCurrentScene } = useSceneStore();
  const { executeCommand } = useAdvancedUndoRedo(canvas);
  
  const [isActiveLocal, setIsActiveLocal] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<fabric.Point[]>([]);
  const [previewLines, setPreviewLines] = useState<fabric.Line[]>([]);
  const [previewPolygon, setPreviewPolygon] = useState<fabric.Polygon | null>(null);
  const [tempPoints, setTempPoints] = useState<fabric.Circle[]>([]);
  
  const currentMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update canvas cursor when tool is active
  useEffect(() => {
    if (!canvas) return;

    if (isActive) {
      canvas.defaultCursor = 'crosshair';
      canvas.hoverCursor = 'crosshair';
      canvas.selection = false;
      setIsActiveLocal(true);
    } else {
      canvas.defaultCursor = 'default';
      canvas.hoverCursor = 'move';
      canvas.selection = true;
      setIsActiveLocal(false);
      cancelCurrentMask();
    }
  }, [canvas, isActive]);

  // Mouse event handlers
  useEffect(() => {
    if (!canvas || !isActive) return;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!e.pointer) return;

      const point = new fabric.Point(e.pointer.x, e.pointer.y);
      
      // Start new polygon or add point to existing
      if (!isDrawing) {
        setDrawing(true);
        setCurrentPoints([point]);
        createPointIndicator(point);
      } else {
        // Check if clicking close to first point to close polygon
        const firstPoint = currentPoints[0];
        if (firstPoint && point.distanceFrom(firstPoint) < 10 && currentPoints.length >= 3) {
          completeMask();
        } else {
          addPointToPolygon(point);
        }
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!e.pointer) return;
      
      currentMousePos.current = { x: e.pointer.x, y: e.pointer.y };
      
      if (isDrawing && currentPoints.length > 0) {
        updatePreview();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isDrawing && currentPoints.length >= 3) {
        e.preventDefault();
        completeMask();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelCurrentMask();
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, isActive, isDrawing, currentPoints]);

  const createPointIndicator = useCallback((point: fabric.Point) => {
    if (!canvas) return;

    const indicator = new fabric.Circle({
      left: point.x,
      top: point.y,
      radius: 3,
      fill: CATEGORY_COLORS[drawingCategory],
      selectable: false,
      evented: false,
      originX: 'center',
      originY: 'center',
    });

    canvas.add(indicator);
    setTempPoints(prev => [...prev, indicator]);
  }, [canvas, drawingCategory]);

  const addPointToPolygon = useCallback((point: fabric.Point) => {
    setCurrentPoints(prev => [...prev, point]);
    createPointIndicator(point);
    updatePreview();
  }, [createPointIndicator]);

  const updatePreview = useCallback(() => {
    if (!canvas || currentPoints.length === 0) return;

    // Clear existing preview
    previewLines.forEach(line => canvas.remove(line));
    if (previewPolygon) {
      canvas.remove(previewPolygon);
    }

    const newPreviewLines: fabric.Line[] = [];
    
    // Draw lines between existing points
    for (let i = 0; i < currentPoints.length - 1; i++) {
      const line = new fabric.Line([
        currentPoints[i].x, currentPoints[i].y,
        currentPoints[i + 1].x, currentPoints[i + 1].y
      ], {
        stroke: CATEGORY_COLORS[drawingCategory],
        strokeWidth: 2,
        selectable: false,
        evented: false,
        strokeDashArray: [5, 5],
      });
      
      canvas.add(line);
      newPreviewLines.push(line);
    }

    // Draw line from last point to current mouse position
    const lastPoint = currentPoints[currentPoints.length - 1];
    const mousePoint = new fabric.Point(currentMousePos.current.x, currentMousePos.current.y);
    
    const previewLine = new fabric.Line([
      lastPoint.x, lastPoint.y,
      mousePoint.x, mousePoint.y
    ], {
      stroke: CATEGORY_COLORS[drawingCategory],
      strokeWidth: 1,
      selectable: false,
      evented: false,
      strokeDashArray: [3, 3],
      opacity: 0.7,
    });
    
    canvas.add(previewLine);
    newPreviewLines.push(previewLine);

    // If we have enough points, show preview polygon
    if (currentPoints.length >= 3) {
      const previewPoints = [...currentPoints, mousePoint];
      const polygon = new fabric.Polygon(previewPoints, {
        fill: CATEGORY_COLORS[drawingCategory] + '20',
        stroke: 'transparent',
        selectable: false,
        evented: false,
        opacity: 0.5,
      });
      
      canvas.add(polygon);
      setPreviewPolygon(polygon);
    }

    setPreviewLines(newPreviewLines);
    canvas.renderAll();
  }, [canvas, currentPoints, drawingCategory, previewLines, previewPolygon]);

  const completeMask = useCallback(async () => {
    if (!canvas || currentPoints.length < 3) return;

    const currentScene = getCurrentScene();
    if (!currentScene) return;

    // Clean up preview elements
    cleanupPreview();

    // Create mask object
    const maskId = `mask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const maskOptions: MaskLayerOptions = {
      category: drawingCategory,
      deleted: false,
      createdAt: new Date(),
      authorId: 'current-user', // TODO: Get from auth
      maskId,
    };

    const maskLayer = new MaskLayer(currentPoints, maskOptions);
    
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
      description: `Create ${drawingCategory} mask`,
    };

    try {
      await executeCommand(command);
    } catch (error) {
      console.error('Failed to execute mask creation command:', error);
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
        coordinates: [currentPoints.map(p => [p.x, p.y])],
      },
      deleted: false,
      authorId: 'current-user',
      createdAt: new Date(),
    };

    addMask(maskData);
    onMaskCreated?.(maskData);

    // Reset state
    resetTool();
  }, [canvas, currentPoints, drawingCategory, getCurrentScene, executeCommand, addMask, onMaskCreated]);

  const cancelCurrentMask = useCallback(() => {
    cleanupPreview();
    resetTool();
  }, []);

  const cleanupPreview = useCallback(() => {
    if (!canvas) return;

    // Remove preview lines
    previewLines.forEach(line => canvas.remove(line));
    setPreviewLines([]);

    // Remove preview polygon
    if (previewPolygon) {
      canvas.remove(previewPolygon);
      setPreviewPolygon(null);
    }

    // Remove point indicators
    tempPoints.forEach(point => canvas.remove(point));
    setTempPoints([]);

    canvas.renderAll();
  }, [canvas, previewLines, previewPolygon, tempPoints]);

  const resetTool = useCallback(() => {
    setDrawing(false);
    setCurrentPoints([]);
    setPreviewLines([]);
    setPreviewPolygon(null);
    setTempPoints([]);
  }, [setDrawing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupPreview();
    };
  }, [cleanupPreview]);

  return null; // This is a tool component, no UI to render
};