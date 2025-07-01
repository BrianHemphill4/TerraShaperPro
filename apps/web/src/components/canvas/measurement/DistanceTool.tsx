'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useMeasurementStore, useActiveScaleConfiguration, useMeasurementSettings } from '../../../stores/useMeasurementStore';
import { LineSegment, MeasurementUnit } from '../../../lib/measurement/types';
import { DistanceObject } from '../../../lib/canvas/measurement/DistanceObject';
import { CoordinateSystem } from '../../../lib/measurement/CoordinateSystem';
import { SnapManager } from '../../../lib/measurement/SnapManager';
import { GeometryUtils } from '../../../lib/measurement/GeometryCalculations';
import { UnitConverter } from '../../../lib/measurement/UnitConverter';

interface DistanceToolProps {
  canvas: fabric.Canvas | null;
  isActive: boolean;
  onMeasurementComplete?: (measurement: any) => void;
}

export const DistanceTool = ({ canvas, isActive, onMeasurementComplete }: DistanceToolProps) => {
  const { addDistanceMeasurement, measurementMode } = useMeasurementStore();
  const scaleConfig = useActiveScaleConfiguration();
  const settings = useMeasurementSettings();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentSegments, setCurrentSegments] = useState<LineSegment[]>([]);
  const [previewLine, setPreviewLine] = useState<fabric.Line | null>(null);
  const [snapManager, setSnapManager] = useState<SnapManager | null>(null);
  const [tempLines, setTempLines] = useState<fabric.Line[]>([]);
  const [showSnapIndicator, setShowSnapIndicator] = useState(false);
  const [snapIndicator, setSnapIndicator] = useState<fabric.Circle | null>(null);
  
  const coordinateSystemRef = useRef<CoordinateSystem | null>(null);
  const currentMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize coordinate system and snap manager when scale config changes
  useEffect(() => {
    if (scaleConfig) {
      coordinateSystemRef.current = new CoordinateSystem(scaleConfig);
    }
    
    if (canvas && settings.snapSettings) {
      const manager = new SnapManager(canvas, settings.snapSettings);
      setSnapManager(manager);
    }
  }, [canvas, scaleConfig, settings.snapSettings]);

  // Update canvas cursor and selection when tool is active
  useEffect(() => {
    if (!canvas) return;

    if (isActive && measurementMode === 'distance') {
      canvas.defaultCursor = 'crosshair';
      canvas.selection = false;
      canvas.forEachObject(obj => {
        obj.selectable = false;
      });
    } else {
      canvas.defaultCursor = 'default';
      canvas.selection = true;
      canvas.forEachObject(obj => {
        obj.selectable = true;
      });
      
      // Clean up if switching away from distance tool
      cleanupCurrentMeasurement();
    }
  }, [canvas, isActive, measurementMode]);

  const cleanupCurrentMeasurement = useCallback(() => {
    if (!canvas) return;

    // Remove preview line
    if (previewLine) {
      canvas.remove(previewLine);
      setPreviewLine(null);
    }

    // Remove temporary lines
    tempLines.forEach(line => canvas.remove(line));
    setTempLines([]);

    // Remove snap indicator
    if (snapIndicator) {
      canvas.remove(snapIndicator);
      setSnapIndicator(null);
    }

    setIsDrawing(false);
    setCurrentSegments([]);
    setShowSnapIndicator(false);
    canvas.renderAll();
  }, [canvas, previewLine, tempLines, snapIndicator]);

  const createSegment = useCallback((
    start: { x: number; y: number }, 
    end: { x: number; y: number }
  ): LineSegment => {
    if (!coordinateSystemRef.current) {
      throw new Error('No scale configuration available');
    }

    const canvasDistance = GeometryUtils.calculateDistance(start, end);
    const realWorldDistance = coordinateSystemRef.current.convertToRealWorld(canvasDistance, settings.defaultUnit);

    return {
      start,
      end,
      distance: realWorldDistance,
      unit: settings.defaultUnit
    };
  }, [settings.defaultUnit]);

  const updateSnapIndicator = useCallback((point: { x: number; y: number }, snapType: string) => {
    if (!canvas) return;

    if (snapIndicator) {
      canvas.remove(snapIndicator);
    }

    const indicator = new fabric.Circle({
      left: point.x,
      top: point.y,
      radius: 4,
      fill: 'transparent',
      stroke: '#ff6b6b',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      opacity: 0.8
    });

    canvas.add(indicator);
    setSnapIndicator(indicator);
    canvas.renderAll();
  }, [canvas, snapIndicator]);

  const handleMouseDown = useCallback((e: fabric.IEvent) => {
    if (!canvas || !isActive || measurementMode !== 'distance') return;

    const pointer = canvas.getPointer(e.e);
    let targetPoint = pointer;

    // Apply snapping
    if (snapManager) {
      const snapResult = snapManager.findSnapPoint(pointer);
      if (snapResult.snapType !== 'none') {
        targetPoint = snapResult.point;
        updateSnapIndicator(targetPoint, snapResult.snapType);
      }
    }

    if (!isDrawing) {
      // Start new measurement
      setIsDrawing(true);
      setCurrentSegments([]);
      
      // Create preview line
      const line = new fabric.Line([targetPoint.x, targetPoint.y, targetPoint.x, targetPoint.y], {
        stroke: settings.dimensionStyle.lineColor,
        strokeWidth: settings.dimensionStyle.lineWidth,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false,
        opacity: 0.7
      });

      canvas.add(line);
      setPreviewLine(line);
    } else {
      // Add segment to current measurement
      if (previewLine) {
        const startPoint = { x: previewLine.x1 || 0, y: previewLine.y1 || 0 };
        const segment = createSegment(startPoint, targetPoint);
        
        // Create permanent line for this segment
        const permanentLine = new fabric.Line([
          startPoint.x, startPoint.y,
          targetPoint.x, targetPoint.y
        ], {
          stroke: settings.dimensionStyle.lineColor,
          strokeWidth: settings.dimensionStyle.lineWidth,
          selectable: false,
          evented: false
        });

        canvas.add(permanentLine);
        setTempLines(prev => [...prev, permanentLine]);

        // Update segments
        const newSegments = [...currentSegments, segment];
        setCurrentSegments(newSegments);

        // Start new preview line from current endpoint
        previewLine.set({
          x1: targetPoint.x,
          y1: targetPoint.y,
          x2: targetPoint.x,
          y2: targetPoint.y
        });
      }
    }

    canvas.renderAll();
  }, [canvas, isActive, measurementMode, isDrawing, snapManager, previewLine, currentSegments, createSegment, settings, updateSnapIndicator]);

  const handleMouseMove = useCallback((e: fabric.IEvent) => {
    if (!canvas || !isActive || measurementMode !== 'distance') return;

    const pointer = canvas.getPointer(e.e);
    currentMousePos.current = pointer;
    let targetPoint = pointer;

    // Apply snapping
    if (snapManager) {
      const snapResult = snapManager.findSnapPoint(pointer);
      if (snapResult.snapType !== 'none') {
        targetPoint = snapResult.point;
        if (!showSnapIndicator) {
          updateSnapIndicator(targetPoint, snapResult.snapType);
          setShowSnapIndicator(true);
        } else if (snapIndicator) {
          snapIndicator.set({ left: targetPoint.x, top: targetPoint.y });
        }
      } else {
        if (showSnapIndicator && snapIndicator) {
          canvas.remove(snapIndicator);
          setSnapIndicator(null);
          setShowSnapIndicator(false);
        }
      }
    }

    // Update preview line
    if (isDrawing && previewLine) {
      previewLine.set({ x2: targetPoint.x, y2: targetPoint.y });
      canvas.renderAll();
    }
  }, [canvas, isActive, measurementMode, isDrawing, previewLine, snapManager, showSnapIndicator, snapIndicator, updateSnapIndicator]);

  const handleDoubleClick = useCallback(() => {
    if (!canvas || !isActive || !isDrawing || currentSegments.length === 0) return;

    finishMeasurement();
  }, [canvas, isActive, isDrawing, currentSegments]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || measurementMode !== 'distance') return;

    if (e.key === 'Escape') {
      cleanupCurrentMeasurement();
    } else if (e.key === 'Enter' && isDrawing && currentSegments.length > 0) {
      finishMeasurement();
    }
  }, [isActive, measurementMode, isDrawing, currentSegments, cleanupCurrentMeasurement]);

  const finishMeasurement = useCallback(() => {
    if (!canvas || !coordinateSystemRef.current || currentSegments.length === 0) return;

    try {
      // Calculate total distance
      const totalDistance = currentSegments.reduce((sum, segment) => sum + segment.distance, 0);

      // Create distance object
      const distanceObject = new DistanceObject({
        segments: currentSegments,
        totalDistance,
        unit: settings.defaultUnit,
        precision: settings.precision,
        style: settings.dimensionStyle,
        showRunningDimensions: currentSegments.length > 1
      });

      canvas.add(distanceObject);

      // Create measurement record
      const measurement = {
        id: crypto.randomUUID(),
        segments: currentSegments,
        totalDistance,
        unit: settings.defaultUnit,
        precision: settings.precision,
        createdAt: new Date()
      };

      addDistanceMeasurement(measurement);
      onMeasurementComplete?.(measurement);

      // Clean up
      cleanupCurrentMeasurement();

      canvas.renderAll();
    } catch (error) {
      console.error('Failed to create distance measurement:', error);
      cleanupCurrentMeasurement();
    }
  }, [canvas, currentSegments, settings, addDistanceMeasurement, onMeasurementComplete, cleanupCurrentMeasurement]);

  // Set up event listeners
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDownEvent = (e: fabric.IEvent) => handleMouseDown(e);
    const handleMouseMoveEvent = (e: fabric.IEvent) => handleMouseMove(e);
    const handleDoubleClickEvent = () => handleDoubleClick();

    canvas.on('mouse:down', handleMouseDownEvent);
    canvas.on('mouse:move', handleMouseMoveEvent);
    canvas.on('mouse:dblclick', handleDoubleClickEvent);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.off('mouse:down', handleMouseDownEvent);
      canvas.off('mouse:move', handleMouseMoveEvent);
      canvas.off('mouse:dblclick', handleDoubleClickEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, handleMouseDown, handleMouseMove, handleDoubleClick, handleKeyDown]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupCurrentMeasurement();
    };
  }, [cleanupCurrentMeasurement]);

  // Don't render anything - this is a tool component
  return null;
};

export default DistanceTool;