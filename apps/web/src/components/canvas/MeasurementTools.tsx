'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useState } from 'react';

import styles from './MeasurementTools.module.css';

type MeasurementToolsProps = {
  canvas: fabric.Canvas | null;
  unit?: 'ft' | 'm';
  scale?: number; // pixels per unit
};

type MeasurementMode = 'none' | 'distance' | 'area';

const MeasurementTools = ({ canvas, unit = 'ft', scale: initialScale = 20 }: MeasurementToolsProps) => {
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>('none');
  const [scale, setScale] = useState(initialScale);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationLine, setCalibrationLine] = useState<fabric.Line | null>(null);
  const [measurementLine, setMeasurementLine] = useState<fabric.Line | null>(null);
  const [measurementText, setMeasurementText] = useState<fabric.Text | null>(null);
  const [measurementPoints, setMeasurementPoints] = useState<{ x: number; y: number }[]>([]);
  const [tempPolygon, setTempPolygon] = useState<fabric.Polygon | null>(null);

  const calculateDistance = useCallback((p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const formatMeasurement = useCallback((pixels: number) => {
    const units = pixels / scale;
    return `${units.toFixed(2)} ${unit}`;
  }, [scale, unit]);

  const calculatePolygonArea = useCallback((points: { x: number; y: number }[]) => {
    if (points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Convert from pixels² to units²
    return area / (scale * scale);
  }, [scale]);

  const clearMeasurements = useCallback(() => {
    if (canvas) {
      if (measurementLine) {
        canvas.remove(measurementLine);
        setMeasurementLine(null);
      }
      if (measurementText) {
        canvas.remove(measurementText);
        setMeasurementText(null);
      }
      if (tempPolygon) {
        canvas.remove(tempPolygon);
        setTempPolygon(null);
      }
      canvas.getObjects().forEach((obj) => {
        if ((obj as any).isMeasurement) {
          canvas.remove(obj);
        }
      });
      canvas.renderAll();
    }
    setMeasurementPoints([]);
  }, [canvas, measurementLine, measurementText, tempPolygon]);

  const handleScaleCalibration = useCallback(() => {
    setIsCalibrating(true);
    setMeasurementMode('none');
    clearMeasurements();
  }, [clearMeasurements]);

  const handleMeasurementMode = useCallback((mode: MeasurementMode) => {
    setMeasurementMode(mode);
    setIsCalibrating(false);
    clearMeasurements();
    
    if (canvas) {
      canvas.defaultCursor = mode === 'none' ? 'default' : 'crosshair';
      canvas.selection = mode === 'none';
    }
  }, [canvas, clearMeasurements]);

  useEffect(() => {
    if (!canvas) return;

    const handleMouseDown = (e: fabric.IEvent) => {
      const pointer = canvas.getPointer(e.e);
      
      if (isCalibrating) {
        if (!calibrationLine) {
          const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: '#ef4444',
            strokeWidth: 2,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
            isMeasurement: true,
          } as any);
          canvas.add(line);
          setCalibrationLine(line);
        } else {
          // Finish calibration
          const distance = calculateDistance(
            { x: calibrationLine.x1!, y: calibrationLine.y1! },
            { x: calibrationLine.x2!, y: calibrationLine.y2! }
          );
          
          // For now, using a hardcoded scale of 1ft = 20px
          // TODO: Replace with proper dialog component
          const realDistance = 1;
          setScale(distance);
          if (realDistance > 0) {
            setScale(distance / realDistance);
          }
          
          canvas.remove(calibrationLine);
          setCalibrationLine(null);
          setIsCalibrating(false);
        }
      } else if (measurementMode === 'distance') {
        if (!measurementLine) {
          const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: '#3b82f6',
            strokeWidth: 2,
            selectable: false,
            evented: false,
            isMeasurement: true,
          } as any);
          
          const text = new fabric.Text(`0.00 ${  unit}`, {
            left: pointer.x,
            top: pointer.y - 20,
            fontSize: 14,
            fill: '#3b82f6',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 5,
            selectable: false,
            evented: false,
            isMeasurement: true,
          } as any);
          
          canvas.add(line);
          canvas.add(text);
          setMeasurementLine(line);
          setMeasurementText(text);
        } else {
          // Add dimension lines
          const startPoint = { x: measurementLine.x1!, y: measurementLine.y1! };
          const endPoint = { x: measurementLine.x2!, y: measurementLine.y2! };
          
          // Create arrow heads
          const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
          const arrowLength = 10;
          
          const arrow1 = new fabric.Polyline([
            { x: startPoint.x, y: startPoint.y },
            { x: startPoint.x + arrowLength * Math.cos(angle + Math.PI / 6), y: startPoint.y + arrowLength * Math.sin(angle + Math.PI / 6) },
            { x: startPoint.x, y: startPoint.y },
            { x: startPoint.x + arrowLength * Math.cos(angle - Math.PI / 6), y: startPoint.y + arrowLength * Math.sin(angle - Math.PI / 6) },
          ], {
            stroke: '#3b82f6',
            strokeWidth: 2,
            fill: 'transparent',
            selectable: false,
            evented: false,
            isMeasurement: true,
          } as any);
          
          const arrow2 = new fabric.Polyline([
            { x: endPoint.x, y: endPoint.y },
            { x: endPoint.x - arrowLength * Math.cos(angle + Math.PI / 6), y: endPoint.y - arrowLength * Math.sin(angle + Math.PI / 6) },
            { x: endPoint.x, y: endPoint.y },
            { x: endPoint.x - arrowLength * Math.cos(angle - Math.PI / 6), y: endPoint.y - arrowLength * Math.sin(angle - Math.PI / 6) },
          ], {
            stroke: '#3b82f6',
            strokeWidth: 2,
            fill: 'transparent',
            selectable: false,
            evented: false,
            isMeasurement: true,
          } as any);
          
          canvas.add(arrow1);
          canvas.add(arrow2);
          
          setMeasurementLine(null);
          setMeasurementText(null);
        }
      } else if (measurementMode === 'area') {
        const newPoint = { x: pointer.x, y: pointer.y };
        const newPoints = [...measurementPoints, newPoint];
        setMeasurementPoints(newPoints);
        
        if (newPoints.length >= 2) {
          if (tempPolygon) {
            canvas.remove(tempPolygon);
          }
          
          const polygon = new fabric.Polygon(newPoints, {
            fill: 'rgba(59, 130, 246, 0.2)',
            stroke: '#3b82f6',
            strokeWidth: 2,
            selectable: false,
            evented: false,
            isMeasurement: true,
          } as any);
          
          canvas.add(polygon);
          setTempPolygon(polygon);
        }
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      const pointer = canvas.getPointer(e.e);
      
      if (calibrationLine && isCalibrating) {
        calibrationLine.set({ x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
      } else if (measurementLine && measurementText) {
        measurementLine.set({ x2: pointer.x, y2: pointer.y });
        
        const distance = calculateDistance(
          { x: measurementLine.x1!, y: measurementLine.y1! },
          { x: pointer.x, y: pointer.y }
        );
        
        measurementText.set({
          text: formatMeasurement(distance),
          left: (measurementLine.x1! + pointer.x) / 2,
          top: (measurementLine.y1! + pointer.y) / 2 - 20,
        });
        
        canvas.renderAll();
      } else if (measurementMode === 'area' && tempPolygon && measurementPoints.length >= 1) {
        const points = [...measurementPoints, { x: pointer.x, y: pointer.y }];
        (tempPolygon as any).points = points;
        canvas.renderAll();
      }
    };

    const handleMouseDblClick = () => {
      if (measurementMode === 'area' && measurementPoints.length >= 3) {
        const area = calculatePolygonArea(measurementPoints);
        const centerX = measurementPoints.reduce((sum, p) => sum + p.x, 0) / measurementPoints.length;
        const centerY = measurementPoints.reduce((sum, p) => sum + p.y, 0) / measurementPoints.length;
        
        const text = new fabric.Text(`${area.toFixed(2)} ${unit}²`, {
          left: centerX,
          top: centerY,
          fontSize: 16,
          fill: '#3b82f6',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 5,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          isMeasurement: true,
        } as any);
        
        canvas.add(text);
        setMeasurementPoints([]);
        setTempPolygon(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleMeasurementMode('none');
        if (calibrationLine) {
          canvas.remove(calibrationLine);
          setCalibrationLine(null);
          setIsCalibrating(false);
        }
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:dblclick', handleMouseDblClick);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:dblclick', handleMouseDblClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvas, isCalibrating, calibrationLine, measurementMode, measurementLine, measurementText, measurementPoints, tempPolygon, calculateDistance, formatMeasurement, calculatePolygonArea, scale, unit, handleMeasurementMode]);

  return (
    <div className={styles.measurementTools}>
      <div className={styles.scaleInfo}>
        Scale: 1 {unit} = {scale.toFixed(1)} px
      </div>
      <button
        type="button"
        className={styles.toolButton}
        onClick={handleScaleCalibration}
        title="Calibrate scale"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 21H3M5 21V7L12 3L19 7V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="9 21 9 13 15 13 15 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Calibrate
      </button>
      <button
        type="button"
        className={`${styles.toolButton} ${measurementMode === 'distance' ? styles.active : ''}`}
        onClick={() => handleMeasurementMode('distance')}
        title="Measure distance"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" />
          <polyline points="3 12 6 9 3 12 6 15" strokeWidth="2" />
          <polyline points="21 12 18 9 21 12 18 15" strokeWidth="2" />
        </svg>
        Distance
      </button>
      <button
        type="button"
        className={`${styles.toolButton} ${measurementMode === 'area' ? styles.active : ''}`}
        onClick={() => handleMeasurementMode('area')}
        title="Measure area"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
          <line x1="3" y1="9" x2="21" y2="9" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="3" y1="15" x2="21" y2="15" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="9" y1="3" x2="9" y2="21" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="15" y1="3" x2="15" y2="21" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
        Area
      </button>
      <button
        type="button"
        className={styles.toolButton}
        onClick={clearMeasurements}
        title="Clear measurements"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Clear
      </button>
    </div>
  );
};

export default MeasurementTools;