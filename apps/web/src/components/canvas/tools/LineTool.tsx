'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { LineObject } from '@/lib/canvas/objects/LineObject';
import { useCanvasToolStore } from '@/stores/canvas/useCanvasToolStore';
import { useMaterialStore } from '@/stores/canvas/useMaterialStore';

export interface LineToolProps {
  canvas: fabric.Canvas | null;
  isActive: boolean;
  onLineCreated?: (line: LineObject) => void;
}

export function LineTool({ canvas, isActive, onLineCreated }: LineToolProps) {
  const previewLineRef = useRef<fabric.Line | null>(null);
  const snapGuidesRef = useRef<fabric.Line[]>([]);
  const [startPoint, setStartPoint] = useState<fabric.Point | null>(null);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  
  const {
    snapPoint,
    getSnapGuides,
    lineTool: { defaultStyle, showDimensions, snapToAngles, angleSnapTolerance }
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

      if (!isDrawingLine) {
        // Start drawing line
        setStartPoint(snappedPoint);
        setIsDrawingLine(true);
        updatePreview(snappedPoint, snappedPoint);
      } else {
        // Finish drawing line
        finishDrawing(snappedPoint);
      }

      updateSnapGuides(snappedPoint);
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!e.pointer) return;

      const pointer = new fabric.Point(e.pointer.x, e.pointer.y);
      let snappedPoint = snapPoint(pointer, canvas.getObjects());

      if (isDrawingLine && startPoint) {
        // Apply angle snapping if enabled
        if (snapToAngles) {
          snappedPoint = applyAngleSnapping(startPoint, snappedPoint);
        }
        
        updatePreview(startPoint, snappedPoint);
      }

      updateSnapGuides(snappedPoint);
    };

    const handleMouseUp = () => {
      // Clear snap guides after a short delay
      setTimeout(() => clearSnapGuides(), 100);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDrawingLine) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          cancelDrawing();
          break;
      }
    };

    // Add event listeners
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
  }, [canvas, isActive, isDrawingLine, startPoint, snapToAngles, angleSnapTolerance]);

  const applyAngleSnapping = useCallback((start: fabric.Point, end: fabric.Point): fabric.Point => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Common angles to snap to
    const snapAngles = [0, 15, 30, 45, 60, 90, 120, 135, 150, 180, -15, -30, -45, -60, -90, -120, -135, -150];
    
    let snappedAngle = angle;
    let minDifference = angleSnapTolerance;

    snapAngles.forEach(snapAngle => {
      const difference = Math.abs(angle - snapAngle);
      if (difference < minDifference) {
        minDifference = difference;
        snappedAngle = snapAngle;
      }
    });

    // Convert back to coordinates
    const radians = snappedAngle * (Math.PI / 180);
    return new fabric.Point(
      start.x + distance * Math.cos(radians),
      start.y + distance * Math.sin(radians)
    );
  }, [angleSnapTolerance]);

  const updatePreview = useCallback((start: fabric.Point, end: fabric.Point) => {
    if (!canvas) return;

    const material = getSelectedMaterial();
    const color = material ? material.color : defaultStyle.stroke;

    // Remove existing preview
    if (previewLineRef.current) {
      canvas.remove(previewLineRef.current);
    }

    // Create new preview line
    const previewLine = new fabric.Line([start.x, start.y, end.x, end.y], {
      stroke: color,
      strokeWidth: defaultStyle.strokeWidth,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      opacity: 0.7
    });

    previewLineRef.current = previewLine;
    canvas.add(previewLine);
    canvas.renderAll();
  }, [canvas, getSelectedMaterial, defaultStyle]);

  const clearPreview = useCallback(() => {
    if (canvas && previewLineRef.current) {
      canvas.remove(previewLineRef.current);
      previewLineRef.current = null;
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

  const finishDrawing = useCallback((endPoint: fabric.Point) => {
    if (!canvas || !startPoint) return;

    // Don't create zero-length lines
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length < 5) {
      cancelDrawing();
      return;
    }

    const material = getSelectedMaterial();
    
    // Create the line object
    const lineObject = new LineObject([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
      material,
      showDimensions,
      lineType: 'edge', // Default line type
      metadata: {
        name: `Line ${Date.now()}`,
        tags: ['edging']
      },
      ...defaultStyle
    });

    canvas.add(lineObject);
    canvas.setActiveObject(lineObject);
    canvas.renderAll();

    // Notify parent component
    onLineCreated?.(lineObject);

    // Clean up
    cleanup();
  }, [canvas, startPoint, getSelectedMaterial, showDimensions, defaultStyle, onLineCreated]);

  const cancelDrawing = useCallback(() => {
    cleanup();
  }, []);

  const cleanup = useCallback(() => {
    clearPreview();
    clearSnapGuides();
    setStartPoint(null);
    setIsDrawingLine(false);
  }, [clearPreview, clearSnapGuides]);

  // Get current line info for display
  const getCurrentLineInfo = useCallback(() => {
    if (!startPoint || !previewLineRef.current) return null;

    const line = previewLineRef.current;
    const dx = (line.x2 || 0) - (line.x1 || 0);
    const dy = (line.y2 || 0) - (line.y1 || 0);
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      length: length.toFixed(1),
      angle: angle.toFixed(1)
    };
  }, [startPoint]);

  // Status indicator component
  const StatusIndicator = () => {
    if (!isActive) return null;

    const lineInfo = getCurrentLineInfo();

    if (!isDrawingLine) {
      return (
        <div className="absolute bottom-4 left-4 bg-white/90 border rounded-lg p-3 shadow-sm">
          <div className="text-sm font-medium text-gray-900">Line Tool Active</div>
          <div className="text-xs text-gray-600 mt-1">
            Click to start drawing a line
          </div>
          {snapToAngles && (
            <div className="text-xs text-blue-600 mt-1">
              Angle snapping enabled ({angleSnapTolerance}°)
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="absolute bottom-4 left-4 bg-white/90 border rounded-lg p-3 shadow-sm">
        <div className="text-sm font-medium text-gray-900">Drawing Line</div>
        <div className="text-xs text-gray-600 mt-1 space-y-1">
          <div>Click to finish line • Esc to cancel</div>
          {lineInfo && (
            <>
              <div>Length: {lineInfo.length} units</div>
              <div>Angle: {lineInfo.angle}°</div>
            </>
          )}
          {snapToAngles && (
            <div className="text-blue-600">Snapping to common angles</div>
          )}
        </div>
      </div>
    );
  };

  return <StatusIndicator />;
}

export default LineTool;