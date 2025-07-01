'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { AreaObject } from '@/lib/canvas/objects/AreaObject';
import { useCanvasToolStore } from '@/stores/canvas/useCanvasToolStore';
import { useMaterialStore } from '@/stores/canvas/useMaterialStore';

export interface AreaToolProps {
  canvas: fabric.Canvas | null;
  isActive: boolean;
  onAreaCreated?: (area: AreaObject) => void;
}

export function AreaTool({ canvas, isActive, onAreaCreated }: AreaToolProps) {
  const previewPolygonRef = useRef<fabric.Polygon | null>(null);
  const snapGuidesRef = useRef<fabric.Line[]>([]);
  
  const {
    drawingPoints,
    addDrawingPoint,
    clearDrawingPoints,
    setDrawing,
    isDrawing,
    snapPoint,
    getSnapGuides,
    areaTool: { minPoints, maxPoints, closeOnDoubleClick, showDimensions }
  } = useCanvasToolStore();
  
  const { getSelectedMaterial } = useMaterialStore();

  // Clear preview and guides when tool becomes inactive
  useEffect(() => {
    if (!isActive && canvas) {
      cleanup();
    }
  }, [isActive, canvas]);

  // Handle mouse events when tool is active
  useEffect(() => {
    if (!canvas || !isActive) return;

    const handleMouseDown = (e: fabric.IEvent) => {
      if (!e.pointer) return;

      const pointer = new fabric.Point(e.pointer.x, e.pointer.y);
      const snappedPoint = snapPoint(pointer, canvas.getObjects());

      if (!isDrawing) {
        // Start drawing
        setDrawing(true);
        addDrawingPoint(snappedPoint);
        updatePreview([snappedPoint]);
      } else {
        // Add point to existing drawing
        if (drawingPoints.length < maxPoints) {
          addDrawingPoint(snappedPoint);
          updatePreview([...drawingPoints, snappedPoint]);
        }
      }

      updateSnapGuides(snappedPoint);
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!e.pointer) return;

      const pointer = new fabric.Point(e.pointer.x, e.pointer.y);
      const snappedPoint = snapPoint(pointer, canvas.getObjects());

      if (isDrawing && drawingPoints.length > 0) {
        // Update preview with current mouse position
        updatePreview([...drawingPoints, snappedPoint]);
      }

      updateSnapGuides(snappedPoint);
    };

    const handleMouseUp = () => {
      // Clear snap guides after a short delay
      setTimeout(() => clearSnapGuides(), 100);
    };

    const handleDoubleClick = () => {
      if (closeOnDoubleClick && isDrawing && drawingPoints.length >= minPoints) {
        finishDrawing();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDrawing) return;

      switch (e.key) {
        case 'Enter':
          if (drawingPoints.length >= minPoints) {
            e.preventDefault();
            finishDrawing();
          }
          break;
        case 'Escape':
          e.preventDefault();
          cancelDrawing();
          break;
        case 'Backspace':
          if (drawingPoints.length > 0) {
            e.preventDefault();
            // Remove last point
            const newPoints = drawingPoints.slice(0, -1);
            useCanvasToolStore.getState().setDrawingPoints(newPoints);
            if (newPoints.length > 0) {
              updatePreview(newPoints);
            } else {
              clearPreview();
            }
          }
          break;
      }
    };

    // Add event listeners
    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:dblclick', handleDoubleClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:dblclick', handleDoubleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, isActive, isDrawing, drawingPoints, minPoints, maxPoints, closeOnDoubleClick]);

  const updatePreview = useCallback((points: fabric.Point[]) => {
    if (!canvas || points.length < 2) {
      clearPreview();
      return;
    }

    const material = getSelectedMaterial();
    const color = material ? material.color : '#3b82f6';

    // Remove existing preview
    if (previewPolygonRef.current) {
      canvas.remove(previewPolygonRef.current);
    }

    // Create new preview polygon
    const previewPolygon = new fabric.Polygon(points, {
      fill: color + '30', // 20% opacity
      stroke: color,
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      opacity: 0.7
    });

    previewPolygonRef.current = previewPolygon;
    canvas.add(previewPolygon);
    canvas.renderAll();
  }, [canvas, getSelectedMaterial]);

  const clearPreview = useCallback(() => {
    if (canvas && previewPolygonRef.current) {
      canvas.remove(previewPolygonRef.current);
      previewPolygonRef.current = null;
      canvas.renderAll();
    }
  }, [canvas]);

  const updateSnapGuides = useCallback((point: fabric.Point) => {
    if (!canvas) return;

    // Clear existing guides
    clearSnapGuides();

    // Get new snap guides
    const guides = getSnapGuides(point, canvas.getObjects());
    snapGuidesRef.current = guides;

    // Add guides to canvas
    guides.forEach(guide => {
      canvas.add(guide);
    });

    canvas.renderAll();
  }, [canvas, getSnapGuides]);

  const clearSnapGuides = useCallback(() => {
    if (!canvas) return;

    snapGuidesRef.current.forEach(guide => {
      canvas.remove(guide);
    });
    snapGuidesRef.current = [];
    canvas.renderAll();
  }, [canvas]);

  const finishDrawing = useCallback(() => {
    if (!canvas || drawingPoints.length < minPoints) return;

    const material = getSelectedMaterial();
    
    // Create the area object
    const areaObject = new AreaObject(drawingPoints, {
      material,
      showDimensions,
      metadata: {
        name: `Area ${Date.now()}`,
        tags: ['landscape-bed']
      }
    });

    canvas.add(areaObject);
    canvas.setActiveObject(areaObject);
    canvas.renderAll();

    // Notify parent component
    onAreaCreated?.(areaObject);

    // Clean up
    cleanup();
  }, [canvas, drawingPoints, minPoints, getSelectedMaterial, showDimensions, onAreaCreated]);

  const cancelDrawing = useCallback(() => {
    cleanup();
  }, []);

  const cleanup = useCallback(() => {
    clearPreview();
    clearSnapGuides();
    clearDrawingPoints();
    setDrawing(false);
  }, [clearPreview, clearSnapGuides, clearDrawingPoints, setDrawing]);

  // Status indicator component
  const StatusIndicator = () => {
    if (!isActive) return null;

    if (!isDrawing) {
      return (
        <div className="absolute bottom-4 left-4 bg-white/90 border rounded-lg p-3 shadow-sm">
          <div className="text-sm font-medium text-gray-900">Area Tool Active</div>
          <div className="text-xs text-gray-600 mt-1">
            Click to start drawing a landscape area
          </div>
        </div>
      );
    }

    return (
      <div className="absolute bottom-4 left-4 bg-white/90 border rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-900">
          Drawing Area ({drawingPoints.length}/{maxPoints} points)
        </div>
        <div className="text-xs text-gray-600 mt-1 space-y-1">
          <div>Click to add points • Enter to finish • Esc to cancel</div>
          {drawingPoints.length >= minPoints && (
            <div className="text-green-600">Ready to finish (min {minPoints} points)</div>
          )}
          {closeOnDoubleClick && drawingPoints.length >= minPoints && (
            <div>Double-click to finish</div>
          )}
        </div>
      </div>
    );
  };

  return <StatusIndicator />;
}

export default AreaTool;