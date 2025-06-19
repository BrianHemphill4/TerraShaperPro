'use client';

import { fabric } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

import styles from './DesignCanvas.module.css';

type DesignCanvasProps = {
  onReady?: (canvas: fabric.Canvas) => void;
  onElementsChange?: (elements: any[]) => void;
};

type DrawingMode = 'select' | 'polygon' | 'polyline';

const DesignCanvas = ({ onReady, onElementsChange }: DesignCanvasProps) => {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [tempLine, setTempLine] = useState<fabric.Polyline | null>(null);

  const notifyElementsChange = useCallback(() => {
    if (canvas && onElementsChange) {
      const elements = canvas
        .getObjects()
        .filter((obj: any) => obj.id && !obj.evented === false) // Filter out grid lines
        .map((obj: any) => ({
          id: obj.id,
          type: obj.type,
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          angle: obj.angle,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          plantId: obj.plantId,
          plantName: obj.plantName,
          points: obj.points,
          fill: obj.fill,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
        }));
      onElementsChange(elements);
    }
  }, [canvas, onElementsChange]);

  useEffect(() => {
    if (!canvasEl.current || !containerRef.current) return;

    const fabricCanvas = new fabric.Canvas(canvasEl.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: '#f8f9fa',
      selection: true,
    });

    // Add grid
    const gridSize = 20;
    for (let i = 0; i < fabricCanvas.width! / gridSize; i++) {
      const line = new fabric.Line([i * gridSize, 0, i * gridSize, fabricCanvas.height!], {
        stroke: '#e5e7eb',
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(line);
    }
    for (let i = 0; i < fabricCanvas.height! / gridSize; i++) {
      const line = new fabric.Line([0, i * gridSize, fabricCanvas.width!, i * gridSize], {
        stroke: '#e5e7eb',
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(line);
    }

    setCanvas(fabricCanvas);

    if (onReady) {
      onReady(fabricCanvas);
    }

    // Handle window resizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        fabricCanvas.setWidth(width).setHeight(height).renderAll();
      }
    });
    resizeObserver.observe(containerRef.current);

    // Handle drop events
    const canvasElement = canvasEl.current;
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const plantData = e.dataTransfer?.getData('plant');
      if (plantData) {
        const plant = JSON.parse(plantData);
        const rect = canvasElement!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create a plant representation
        if (plant.imageUrl) {
          fabric.Image.fromURL(plant.imageUrl, (img) => {
            img.set({
              left: x - 25,
              top: y - 25,
              width: 50,
              height: 50,
              originX: 'left',
              originY: 'top',
              id: `plant-${Date.now()}`,
              plantId: plant.id,
              plantName: plant.commonName,
            } as any);
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
            notifyElementsChange();
          });
        } else {
          // Create a circle placeholder if no image
          const circle = new fabric.Circle({
            left: x - 25,
            top: y - 25,
            radius: 25,
            fill: '#10b981',
            stroke: '#059669',
            strokeWidth: 2,
            id: `plant-${Date.now()}`,
            plantId: plant.id,
            plantName: plant.commonName,
          } as any);

          const text = new fabric.Text(plant.commonName.charAt(0), {
            left: x - 8,
            top: y - 10,
            fontSize: 20,
            fill: 'white',
            selectable: false,
            evented: false,
          });

          const group = new fabric.Group([circle, text], {
            left: x - 25,
            top: y - 25,
            id: `plant-${Date.now()}`,
            plantId: plant.id,
            plantName: plant.commonName,
          } as any);

          fabricCanvas.add(group);
          fabricCanvas.setActiveObject(group);
          fabricCanvas.renderAll();
          notifyElementsChange();
        }
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    };

    canvasElement.addEventListener('drop', handleDrop);
    canvasElement.addEventListener('dragover', handleDragOver);

    // Handle object changes
    fabricCanvas.on('object:modified', notifyElementsChange);
    fabricCanvas.on('object:removed', notifyElementsChange);

    return () => {
      resizeObserver.disconnect();
      canvasElement?.removeEventListener('drop', handleDrop);
      canvasElement?.removeEventListener('dragover', handleDragOver);
      fabricCanvas.dispose();
    };
  }, [onReady, notifyElementsChange]);

  // Drawing mode handlers
  useEffect(() => {
    if (!canvas) return;

    canvas.selection = drawingMode === 'select';
    canvas.defaultCursor = drawingMode === 'select' ? 'default' : 'crosshair';

    const handleMouseDown = (e: fabric.IEvent) => {
      if (drawingMode === 'select') return;

      const pointer = canvas.getPointer(e.e);
      const point = { x: pointer.x, y: pointer.y };

      if (drawingMode === 'polygon' || drawingMode === 'polyline') {
        if (!isDrawing) {
          setIsDrawing(true);
          setCurrentPoints([point]);

          const line = new fabric.Polyline([point], {
            fill: drawingMode === 'polygon' ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
            stroke: '#10b981',
            strokeWidth: 2,
            selectable: false,
            evented: false,
          });
          setTempLine(line);
          canvas.add(line);
        } else {
          setCurrentPoints([...currentPoints, point]);

          if (tempLine) {
            (tempLine as any).points = [...currentPoints, point];
            canvas.renderAll();
          }
        }
      }
    };

    const handleMouseMove = (e: fabric.IEvent) => {
      if (!isDrawing || !tempLine) return;

      const pointer = canvas.getPointer(e.e);
      const points = [...currentPoints, { x: pointer.x, y: pointer.y }];
      (tempLine as any).points = points;
      canvas.renderAll();
    };

    const handleMouseDblClick = () => {
      if (!isDrawing || !tempLine || currentPoints.length < 2) return;

      canvas.remove(tempLine);

      const shape =
        drawingMode === 'polygon'
          ? new fabric.Polygon(currentPoints, {
              fill: 'rgba(16, 185, 129, 0.3)',
              stroke: '#10b981',
              strokeWidth: 2,
              id: `${drawingMode}-${Date.now()}`,
            } as any)
          : new fabric.Polyline(currentPoints, {
              fill: 'transparent',
              stroke: '#10b981',
              strokeWidth: 2,
              id: `${drawingMode}-${Date.now()}`,
            } as any);

      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      notifyElementsChange();

      // Reset drawing state
      setIsDrawing(false);
      setCurrentPoints([]);
      setTempLine(null);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:dblclick', handleMouseDblClick);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:dblclick', handleMouseDblClick);
    };
  }, [canvas, drawingMode, isDrawing, currentPoints, tempLine, notifyElementsChange]);

  const handleModeChange = (mode: DrawingMode) => {
    setDrawingMode(mode);

    // Cancel any ongoing drawing
    if (isDrawing && tempLine && canvas) {
      canvas.remove(tempLine);
      setIsDrawing(false);
      setCurrentPoints([]);
      setTempLine(null);
    }
  };

  const handleDelete = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      notifyElementsChange();
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.toolButton} ${drawingMode === 'select' ? styles.active : ''}`}
          onClick={() => handleModeChange('select')}
          title="Select"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${drawingMode === 'polygon' ? styles.active : ''}`}
          onClick={() => handleModeChange('polygon')}
          title="Draw Polygon (double-click to finish)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon
              points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className={`${styles.toolButton} ${drawingMode === 'polyline' ? styles.active : ''}`}
          onClick={() => handleModeChange('polyline')}
          title="Draw Polyline (double-click to finish)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline
              points="22 12 18 12 15 21 9 3 6 12 2 12"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.separator}></div>
        <button
          type="button"
          className={styles.toolButton}
          onClick={handleDelete}
          title="Delete selected"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline
              points="3 6 5 6 21 6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <canvas ref={canvasEl} />
      {isDrawing && <div className={styles.hint}>Click to add points, double-click to finish</div>}
    </div>
  );
};

export default DesignCanvas;
