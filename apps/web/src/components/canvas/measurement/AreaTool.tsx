'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useMeasurementStore, useActiveScaleConfiguration, useMeasurementSettings } from '../../../stores/useMeasurementStore';
import { MeasurementUnit } from '../../../lib/measurement/types';
import { AreaObject } from '../../../lib/canvas/measurement/AreaObject';
import { CoordinateSystem } from '../../../lib/measurement/CoordinateSystem';
import { SnapManager } from '../../../lib/measurement/SnapManager';
import { GeometryUtils } from '../../../lib/measurement/GeometryCalculations';

interface AreaToolProps {
  canvas: fabric.Canvas | null;
  isActive: boolean;
  onMeasurementComplete?: (measurement: any) => void;
}

export const AreaTool = ({ canvas, isActive, onMeasurementComplete }: AreaToolProps) => {
  const { addAreaMeasurement, measurementMode } = useMeasurementStore();
  const scaleConfig = useActiveScaleConfiguration();
  const settings = useMeasurementSettings();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingHole, setIsDrawingHole] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [currentHolePoints, setCurrentHolePoints] = useState<{ x: number; y: number }[]>([]);
  const [holes, setHoles] = useState<{ x: number; y: number }[][]>([]);
  const [previewPolygon, setPreviewPolygon] = useState<fabric.Polygon | null>(null);
  const [previewHole, setPreviewHole] = useState<fabric.Polygon | null>(null);
  const [snapManager, setSnapManager] = useState<SnapManager | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<fabric.Circle | null>(null);
  const [showSnapIndicator, setShowSnapIndicator] = useState(false);
  
  const coordinateSystemRef = useRef<CoordinateSystem | null>(null);
  const currentMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize coordinate system and snap manager
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

    if (isActive && measurementMode === 'area') {
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
      
      // Clean up if switching away from area tool
      cleanupCurrentMeasurement();
    }
  }, [canvas, isActive, measurementMode]);

  const cleanupCurrentMeasurement = useCallback(() => {
    if (!canvas) return;

    // Remove preview polygon
    if (previewPolygon) {
      canvas.remove(previewPolygon);
      setPreviewPolygon(null);
    }

    // Remove preview hole
    if (previewHole) {
      canvas.remove(previewHole);
      setPreviewHole(null);
    }

    // Remove snap indicator
    if (snapIndicator) {
      canvas.remove(snapIndicator);
      setSnapIndicator(null);
    }

    setIsDrawing(false);
    setIsDrawingHole(false);
    setCurrentPoints([]);
    setCurrentHolePoints([]);
    setHoles([]);
    setShowSnapIndicator(false);
    canvas.renderAll();
  }, [canvas, previewPolygon, previewHole, snapIndicator]);

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

  const updatePreviewPolygon = useCallback((points: { x: number; y: number }[], isHole = false) => {
    if (!canvas || points.length < 2) return;

    const existingPreview = isHole ? previewHole : previewPolygon;
    const setPreview = isHole ? setPreviewHole : setPreviewPolygon;

    if (existingPreview) {
      canvas.remove(existingPreview);
    }

    // Include current mouse position as the last point for preview
    const previewPoints = [...points, currentMousePos.current];

    const polygon = new fabric.Polygon(previewPoints, {
      fill: isHole ? 'rgba(255, 255, 255, 0.8)' : `${settings.dimensionStyle.lineColor}20`,
      stroke: settings.dimensionStyle.lineColor,
      strokeWidth: settings.dimensionStyle.lineWidth,
      strokeDashArray: isHole ? [5, 5] : [3, 3],
      selectable: false,
      evented: false,
      opacity: 0.7
    });

    canvas.add(polygon);
    setPreview(polygon);
    canvas.renderAll();
  }, [canvas, settings.dimensionStyle, previewHole, previewPolygon]);

  const handleMouseDown = useCallback((e: fabric.IEvent) => {
    if (!canvas || !isActive || measurementMode !== 'area') return;

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

    if (isDrawingHole) {
      // Add point to current hole
      const newHolePoints = [...currentHolePoints, targetPoint];
      setCurrentHolePoints(newHolePoints);
      updatePreviewPolygon(newHolePoints, true);
    } else {
      // Add point to main polygon
      if (!isDrawing) {
        setIsDrawing(true);
      }
      
      const newPoints = [...currentPoints, targetPoint];
      setCurrentPoints(newPoints);
      updatePreviewPolygon(newPoints, false);
    }
  }, [canvas, isActive, measurementMode, isDrawing, isDrawingHole, currentPoints, currentHolePoints, snapManager, updateSnapIndicator, updatePreviewPolygon]);

  const handleMouseMove = useCallback((e: fabric.IEvent) => {
    if (!canvas || !isActive || measurementMode !== 'area') return;

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

    // Update preview polygon with current mouse position
    if (isDrawing && currentPoints.length > 0) {
      updatePreviewPolygon(currentPoints, false);
    } else if (isDrawingHole && currentHolePoints.length > 0) {
      updatePreviewPolygon(currentHolePoints, true);
    }
  }, [canvas, isActive, measurementMode, isDrawing, isDrawingHole, currentPoints, currentHolePoints, snapManager, showSnapIndicator, snapIndicator, updateSnapIndicator, updatePreviewPolygon]);

  const handleDoubleClick = useCallback(() => {
    if (!canvas || !isActive) return;

    if (isDrawingHole && currentHolePoints.length >= 3) {
      // Complete hole
      setHoles(prev => [...prev, currentHolePoints]);
      setCurrentHolePoints([]);
      setIsDrawingHole(false);
      
      if (previewHole) {
        canvas.remove(previewHole);
        setPreviewHole(null);
      }
      
      canvas.renderAll();
    } else if (isDrawing && currentPoints.length >= 3) {
      // Complete main polygon
      finishMeasurement();
    }
  }, [canvas, isActive, isDrawing, isDrawingHole, currentPoints, currentHolePoints, previewHole]);

  const handleRightClick = useCallback((e: fabric.IEvent) => {
    if (!canvas || !isActive || measurementMode !== 'area') return;
    
    e.e.preventDefault();

    if (isDrawing && !isDrawingHole && currentPoints.length >= 3) {
      // Start drawing a hole
      setIsDrawingHole(true);
      setCurrentHolePoints([]);
    }
  }, [canvas, isActive, measurementMode, isDrawing, isDrawingHole, currentPoints]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || measurementMode !== 'area') return;

    if (e.key === 'Escape') {
      if (isDrawingHole) {
        // Cancel hole drawing
        setIsDrawingHole(false);
        setCurrentHolePoints([]);
        if (previewHole) {
          canvas?.remove(previewHole);
          setPreviewHole(null);
        }
      } else {
        // Cancel entire measurement
        cleanupCurrentMeasurement();
      }
    } else if (e.key === 'Enter') {
      if (isDrawingHole && currentHolePoints.length >= 3) {
        // Complete hole
        handleDoubleClick();
      } else if (isDrawing && currentPoints.length >= 3) {
        // Complete main polygon
        finishMeasurement();
      }
    } else if (e.key === 'h' && isDrawing && !isDrawingHole && currentPoints.length >= 3) {
      // Start hole with 'h' key
      setIsDrawingHole(true);
      setCurrentHolePoints([]);
    }
  }, [isActive, measurementMode, isDrawing, isDrawingHole, currentPoints, currentHolePoints, previewHole, canvas, cleanupCurrentMeasurement, handleDoubleClick]);

  const finishMeasurement = useCallback(() => {
    if (!canvas || !coordinateSystemRef.current || currentPoints.length < 3) return;

    try {
      // Calculate areas in canvas coordinates
      const canvasArea = GeometryUtils.calculatePolygonArea(currentPoints);
      const canvasPerimeter = GeometryUtils.calculatePolygonPerimeter(currentPoints);
      
      let canvasHolesArea = 0;
      holes.forEach(hole => {
        canvasHolesArea += GeometryUtils.calculatePolygonArea(hole);
      });

      // Convert to real-world measurements
      const coordSystem = coordinateSystemRef.current;
      const realWorldArea = coordSystem.convertAreaToRealWorld(canvasArea, settings.defaultUnit);
      const realWorldPerimeter = coordSystem.convertToRealWorld(canvasPerimeter, settings.defaultUnit);
      const realWorldHolesArea = coordSystem.convertAreaToRealWorld(canvasHolesArea, settings.defaultUnit);
      const netArea = Math.max(0, realWorldArea - realWorldHolesArea);

      // Create area object
      const areaObject = new AreaObject({
        outline: currentPoints,
        holes: holes,
        area: realWorldArea,
        perimeter: realWorldPerimeter,
        netArea: netArea,
        unit: settings.defaultUnit,
        precision: settings.precision,
        style: settings.dimensionStyle,
        showPerimeter: true,
        showHoleAreas: holes.length > 0
      });

      canvas.add(areaObject);

      // Create measurement record
      const measurement = {
        id: crypto.randomUUID(),
        area: realWorldArea,
        perimeter: realWorldPerimeter,
        holes: holes.map(hole => ({
          points: hole,
          area: coordSystem.convertAreaToRealWorld(GeometryUtils.calculatePolygonArea(hole), settings.defaultUnit),
          perimeter: coordSystem.convertToRealWorld(GeometryUtils.calculatePolygonPerimeter(hole), settings.defaultUnit)
        })),
        netArea: netArea,
        unit: settings.defaultUnit,
        precision: settings.precision,
        createdAt: new Date()
      };

      addAreaMeasurement(measurement);
      onMeasurementComplete?.(measurement);

      // Clean up
      cleanupCurrentMeasurement();

      canvas.renderAll();
    } catch (error) {
      console.error('Failed to create area measurement:', error);
      cleanupCurrentMeasurement();
    }
  }, [canvas, currentPoints, holes, settings, addAreaMeasurement, onMeasurementComplete, cleanupCurrentMeasurement]);

  // Set up event listeners
  useEffect(() => {
    if (!canvas) return;

    const handleMouseDownEvent = (e: fabric.IEvent) => handleMouseDown(e);
    const handleMouseMoveEvent = (e: fabric.IEvent) => handleMouseMove(e);
    const handleDoubleClickEvent = () => handleDoubleClick();
    const handleContextMenu = (e: fabric.IEvent) => handleRightClick(e);

    canvas.on('mouse:down', handleMouseDownEvent);
    canvas.on('mouse:move', handleMouseMoveEvent);
    canvas.on('mouse:dblclick', handleDoubleClickEvent);
    canvas.on('mouse:down', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.off('mouse:down', handleMouseDownEvent);
      canvas.off('mouse:move', handleMouseMoveEvent);
      canvas.off('mouse:dblclick', handleDoubleClickEvent);
      canvas.off('mouse:down', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, handleMouseDown, handleMouseMove, handleDoubleClick, handleRightClick, handleKeyDown]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupCurrentMeasurement();
    };
  }, [cleanupCurrentMeasurement]);

  // Status indicator component
  const StatusIndicator = () => {
    if (!isActive || measurementMode !== 'area') return null;

    let status = 'Click to start area measurement';
    let color = 'text-blue-600';

    if (isDrawingHole) {
      status = `Drawing hole - ${currentHolePoints.length} points (double-click to finish, Esc to cancel)`;
      color = 'text-orange-600';
    } else if (isDrawing) {
      if (currentPoints.length < 3) {
        status = `Drawing polygon - ${currentPoints.length} points (minimum 3 required)`;
        color = 'text-yellow-600';
      } else {
        status = `Drawing polygon - ${currentPoints.length} points (double-click to finish, right-click for hole)`;
        color = 'text-green-600';
      }
    }

    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-2 border">
        <div className={`text-sm font-medium ${color}`}>
          {status}
        </div>
        {holes.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {holes.length} hole{holes.length > 1 ? 's' : ''} added
          </div>
        )}
      </div>
    );
  };

  return <StatusIndicator />;
};

export default AreaTool;